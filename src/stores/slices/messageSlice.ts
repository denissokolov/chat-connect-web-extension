import { type StateCreator } from 'zustand'
import { DateTime } from 'luxon'

import type { MessageSlice, ChatStore } from '@/stores/useChatStore.types'
import browser from '@/services/browser'
import repository from '@/services/repository'
import { logError } from '@/utils/log'
import { getStringError } from '@/utils/error'
import { MessageRole, MessageContentType, type Message, type PageContext } from '@/types/types'
import { getBasicInstructions } from '@/utils/instructions'
import { createAssistantMessage } from '@/utils/message'

export const createMessageSlice: StateCreator<ChatStore, [], [], MessageSlice> = (set, get) => ({
  messages: [],
  waitingForReply: false,
  messageAbortController: null,
  stopMessage: () => {
    const { messageAbortController } = get()
    if (messageAbortController) {
      messageAbortController.abort()
    }
    set({ messageAbortController: null, waitingForReply: false })
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
      currentAbortController: abortController,
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
        currentAbortController: null,
      }))
      await repository.createMessage(responseMessage)
    } catch (error) {
      logError('Error sending message', error)
      if (get().threadId !== threadId) {
        return
      }

      const isAborted =
        error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted'))

      set(state => ({
        messages: isAborted
          ? state.messages // Don't show error for cancelled requests
          : state.messages.map((msg, index) =>
              index === state.messages.length - 1 ? { ...msg, error: getStringError(error) } : msg,
            ),
        waitingForReply: false,
        currentAbortController: null,
      }))
    }
  },
})
