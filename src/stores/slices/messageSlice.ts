import { type StateCreator } from 'zustand'
import { DateTime } from 'luxon'

import type { MessageSlice, ChatStore } from '@/stores/useChatStore.types'
import browser from '@/services/browser'
import repository from '@/services/repository'
import { logError } from '@/utils/log'
import { getStringError } from '@/utils/error'
import {
  MessageRole,
  MessageContentType,
  type Message,
  type PageContext,
  type FunctionCallResult,
  FunctionStatus,
} from '@/types/types'
import { getBasicInstructions } from '@/utils/instructions'
import { createAssistantMessage } from '@/utils/message'

export const createMessageSlice: StateCreator<ChatStore, [], [], MessageSlice> = (set, get) => ({
  messages: [],
  waitingForReply: false,
  waitingForTools: false,
  messageAbortController: null,
  stopMessage: () => {
    const { messageAbortController } = get()
    if (messageAbortController) {
      messageAbortController.abort()
    }
    set({ messageAbortController: null, waitingForReply: false, waitingForTools: false })
  },
  sendMessage: async (text: string) => {
    const { assistant, model, messages, threadId } = get()
    if (!assistant || !model) {
      throw new Error('Assistant not initialized')
    }

    let pageContext: PageContext | null = null
    let pageContextError: string | undefined = undefined
    try {
      pageContext = await browser.getPageContext()
    } catch (error) {
      logError('Error getting page context', error)
      pageContextError = getStringError(error)
    }

    const newMessage: Message = {
      id: crypto.randomUUID(),
      role: MessageRole.User,
      content: [{ type: MessageContentType.OutputText, text, id: crypto.randomUUID() }],
      createdAt: DateTime.now().toISO(),
      threadId,
      error: pageContextError,
      context: pageContext?.title
        ? {
            title: pageContext?.title,
            favicon: pageContext?.favicon || undefined,
            url: pageContext?.url || undefined,
          }
        : undefined,
    }

    const abortController = new AbortController()

    set(state => ({
      messages: [...state.messages, newMessage],
      waitingForReply: !pageContextError,
      messageAbortController: abortController,
    }))

    await repository.createMessage(newMessage)
    if (messages.length === 0) {
      await repository.createThread({
        id: threadId,
        createdAt: DateTime.now().toISO(),
        updatedAt: DateTime.now().toISO(),
      })
    } else {
      await repository.updateThread({
        id: threadId,
        updatedAt: DateTime.now().toISO(),
      })
    }

    if (pageContextError) {
      return
    }

    try {
      const response = await assistant.sendMessage({
        model: model,
        instructions: pageContext ? getBasicInstructions(pageContext) : undefined,
        text: text,
        history: messages,
        signal: abortController.signal,
      })
      if (get().threadId !== threadId) {
        return
      }

      const responseMessage = createAssistantMessage(response, threadId)
      set(state => ({
        messages: [...state.messages, responseMessage],
        waitingForReply: false,
        waitingForTools: response.hasTools,
        messageAbortController: null,
      }))
      await repository.createMessage(responseMessage)
    } catch (error) {
      get().handleMessageError(newMessage.id, threadId, error)
    }
  },
  saveFunctionResult: async (messageId: string, callId: string, result: FunctionCallResult) => {
    const { assistant, model, threadId, messages } = get()
    if (!assistant || !model) {
      throw new Error('Assistant not initialized')
    }

    const status = result.success ? FunctionStatus.Success : FunctionStatus.Error

    let completed = true
    let message: Message | undefined = undefined

    const updatedMessages = messages.map(msg => {
      if (msg.id === messageId) {
        const content = msg.content.map(i => {
          if (i.id === callId) {
            return { ...i, status, result }
          }

          if (
            i.type === MessageContentType.FunctionCall &&
            (i.status === FunctionStatus.Idle || i.status === FunctionStatus.Pending)
          ) {
            completed = false
          }

          return i
        })
        message = {
          ...msg,
          content,
        }
        return message
      }
      return msg
    })

    if (!message) {
      return
    }

    if (!completed) {
      set({ messages: updatedMessages })
      return
    }

    const abortController = new AbortController()
    set({
      messages: updatedMessages,
      waitingForReply: true,
      waitingForTools: false,
      messageAbortController: abortController,
    })

    await repository.updateMessage(message)

    try {
      const response = await assistant.sendFunctionCallResponse({
        model: model,
        message,
      })

      if (get().threadId !== threadId) {
        return
      }

      const responseMessage = createAssistantMessage(response, threadId)
      set(state => ({
        messages: [...state.messages, responseMessage],
        waitingForReply: false,
        waitingForTools: response.hasTools,
        messageAbortController: null,
      }))
      await repository.createMessage(responseMessage)
    } catch (error) {
      get().handleMessageError(messageId, threadId, error)
    }
  },
  handleMessageError: (messageId: string, threadId: string, error: unknown) => {
    logError('Error sending message', error)
    if (get().threadId !== threadId) {
      return
    }

    const isAborted =
      error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted'))

    set(state => ({
      messages: isAborted
        ? state.messages // Don't show error for cancelled requests
        : state.messages.map(msg =>
            msg.id === messageId ? { ...msg, error: getStringError(error) } : msg,
          ),
      waitingForReply: false,
      waitingForTools: false,
      messageAbortController: null,
    }))
  },
})
