import { type StateCreator } from 'zustand'

import type { MessageSlice, ChatStore } from '@/stores/useChatStore.types'
import browser from '@/services/browser'
import { logError } from '@/utils/log'
import { getStringError } from '@/utils/error'
import { type PageContext } from '@/types/browser.types'
import { type Message } from '@/types/chat.types'
import { getBasicInstructions } from '@/utils/instructions'
import {
  createAssistantMessage,
  createEmptyAssistantMessage,
  createUserMessage,
  areMessageFunctionsComplete,
} from '@/utils/message'
import { emptyMessages } from '@/utils/empty'
import { ProviderMessageEventType, type ProviderMessageEvent } from '@/types/provider.types'
import {
  addMessage,
  appendMessageTextContent,
  saveMessageToRepository,
  setMessageComplete,
  setMessageError,
  addOrUpdateMessageContent,
  updateMessageFunctionResult,
  updateMessageInRepository,
} from './messageSlice.utils'
import type { FunctionCallResult } from '@/types/tool.types'
import { getAvailableTools } from '@/utils/tools'

export const createMessageSlice: StateCreator<ChatStore, [], [], MessageSlice> = (set, get) => ({
  messages: {
    list: emptyMessages,
    loading: false,
    error: null,
    ready: true,
  },
  waitingForReply: false,
  waitingForTools: false,
  stopMessage: () => {
    const { assistant } = get()
    if (assistant) {
      assistant.cancelActiveRequest()
    }
    set({ waitingForReply: false, waitingForTools: false })
  },
  sendMessage: async (text: string) => {
    const { assistant, model, messages, threadId, handleMessageEvent } = get()
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

    const newMessage = createUserMessage(threadId, text, pageContext, pageContextError)

    set(state => ({
      messages: addMessage(state.messages, newMessage),
      waitingForReply: !pageContextError,
    }))

    if (pageContextError) {
      return
    }

    await saveMessageToRepository(newMessage, messages.list.length === 0)

    try {
      await assistant.sendMessage({
        model: model,
        message: newMessage,
        eventHandler: handleMessageEvent,
        instructions: pageContext ? getBasicInstructions(pageContext) : undefined,
        history: messages.list,
        tools: getAvailableTools(),
      })
    } catch (error) {
      get().handleMessageError(threadId, error, newMessage.id)
    }
  },
  saveFunctionResult: async (messageId: string, callId: string, result: FunctionCallResult) => {
    const { messages, sendFunctionResults } = get()

    const updatedMessages = updateMessageFunctionResult(messages, messageId, callId, result)

    const message = updatedMessages.list.find(msg => msg.id === messageId)
    if (!message) {
      return
    }

    set({ messages: updatedMessages })

    if (message.complete && areMessageFunctionsComplete(message)) {
      await updateMessageInRepository(message)
      await sendFunctionResults(message)
    }
  },
  sendFunctionResults: async (message: Message) => {
    const { assistant, model, threadId, handleMessageEvent } = get()
    if (!assistant || !model) {
      throw new Error('Assistant not initialized')
    }

    set({ waitingForReply: true, waitingForTools: false })

    try {
      await assistant.sendFunctionCallResponse({
        model: model,
        message,
        eventHandler: handleMessageEvent,
        tools: getAvailableTools(),
      })
    } catch (error) {
      get().handleMessageError(threadId, error, message.id)
    }
  },
  handleMessageError: (
    threadId: string,
    error: unknown,
    userMessageId: string,
    assistantMessageId: string | undefined,
  ) => {
    logError('Error sending message', error)
    if (get().threadId !== threadId) {
      return
    }

    set(state => ({
      messages: setMessageError(state.messages, error, userMessageId, assistantMessageId),
      waitingForReply: false,
      waitingForTools: false,
    }))
  },
  handleMessageEvent: (event: ProviderMessageEvent) => {
    const { threadId, messages, handleMessageError, sendFunctionResults } = get()

    if (event.threadId !== threadId) {
      return
    }

    switch (event.type) {
      case ProviderMessageEventType.Created: {
        const responseMessage = createEmptyAssistantMessage(event.messageId, event.threadId)
        set(state => ({
          messages: addMessage(state.messages, responseMessage),
        }))
        break
      }

      case ProviderMessageEventType.OutputTextDelta:
        set(state => ({
          messages: appendMessageTextContent(
            state.messages,
            event.messageId,
            event.contentId,
            event.textDelta,
          ),
        }))
        break

      case ProviderMessageEventType.FunctionCallAdded:
      case ProviderMessageEventType.FunctionCallDone:
        set(state => ({
          messages: addOrUpdateMessageContent(state.messages, event.messageId, event.content),
          waitingForTools: true,
        }))
        break

      case ProviderMessageEventType.Completed: {
        set(state => ({
          messages: setMessageComplete(state.messages, event.messageId),
          waitingForReply: false,
        }))

        const message = messages.list.find(msg => msg.id === event.messageId)
        if (message) {
          saveMessageToRepository(message)
          if (areMessageFunctionsComplete(message)) {
            sendFunctionResults(message)
          }
        }
        break
      }

      case ProviderMessageEventType.Error:
        handleMessageError(event.threadId, event.error, event.userMessageId, event.messageId)
        break

      case ProviderMessageEventType.Fallback: {
        const responseMessage = createAssistantMessage(
          event.messageId,
          event.threadId,
          event.content,
          true,
        )
        set(state => ({
          messages: addMessage(state.messages, responseMessage),
          waitingForReply: false,
          waitingForTools: event.hasTools,
        }))
        saveMessageToRepository(responseMessage)
        break
      }
    }
  },
})
