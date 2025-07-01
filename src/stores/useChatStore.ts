import { create } from 'zustand'
import { DateTime } from 'luxon'

import {
  AIModel,
  AIProvider,
  MessageContentType,
  MessageRole,
  type Message,
  type MessageContext,
} from '@/types/types'
import { OpenAIAssistant, MockAssistant, type IAssistant } from '@/services/assistant'
import { logError } from '@/utils/log'
import { getProviderByModel } from '@/utils/provider'
import { getTokenKey } from '@/utils/token'
import { getStringError } from '@/utils/error'
import { getBasicInstructions } from '@/utils/instructions'
import browser from '@/services/browser'
import repository from '@/services/repository'

type ChatView = 'chat' | 'history'

interface ChatStore {
  messages: Message[]
  sendMessage: (text: string) => Promise<void>
  stopMessage: () => void
  waitingForReply: boolean
  clearHistory: () => void
  assistant: IAssistant | null
  model: AIModel
  setModel: (model: AIModel) => void
  threadId: string
  startNewThread: () => void
  provider: {
    ready: boolean
    loading: boolean
    configured: boolean | undefined
    error: string | null
  }
  setupProvider: (model: AIModel) => Promise<void>
  currentAbortController: AbortController | null
  currentView: ChatView
  setCurrentView: (view: ChatView) => void
}

const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  sendMessage: async (text: string) => {
    const { assistant, model, messages, threadId } = get()
    if (!assistant || !model) {
      throw new Error('Assistant not initialized')
    }

    // Create abort controller for this request
    const abortController = new AbortController()

    // Get current page info for context
    const pageInfo = await browser.getCurrentPageInfo()
    const messageContext: MessageContext | undefined = pageInfo.title
      ? {
          title: pageInfo.title,
          favicon: pageInfo.favicon || undefined,
        }
      : undefined

    const newMessage: Message = {
      id: crypto.randomUUID(),
      role: MessageRole.User,
      content: [{ type: MessageContentType.OutputText, text, id: crypto.randomUUID() }],
      createdAt: DateTime.now().toISO(),
      threadId,
      context: messageContext,
    }
    set(state => ({
      messages: [...state.messages, newMessage],
      waitingForReply: true,
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

    try {
      const pageContext = await browser.getPageContext()

      const response = await assistant.sendMessage({
        threadId,
        model: model,
        instructions: pageContext ? getBasicInstructions(pageContext) : undefined,
        text: text,
        history: messages,
        signal: abortController.signal,
      })
      if (get().threadId !== threadId) {
        return
      }
      set(state => ({
        messages: [...state.messages, response],
        waitingForReply: false,
        currentAbortController: null,
      }))
      await repository.createMessage(response)
    } catch (error) {
      logError('Error sending message', error)
      if (get().threadId !== threadId) {
        return
      }

      // Check if error is due to abort
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
  stopMessage: () => {
    const { currentAbortController } = get()
    if (currentAbortController) {
      currentAbortController.abort()
      set({ currentAbortController: null, waitingForReply: false })
    }
  },
  waitingForReply: false,
  clearHistory: () => set({ messages: [] }),
  assistant: null,
  model: AIModel.OpenAI_GPT_4_1,
  setModel: (model: AIModel) => set({ model }),
  threadId: crypto.randomUUID(),
  startNewThread: () =>
    set({
      threadId: crypto.randomUUID(),
      messages: [],
      waitingForReply: false,
      currentAbortController: null,
      currentView: 'chat',
    }),
  currentAbortController: null,
  currentView: 'chat',
  setCurrentView: (view: ChatView) => set({ currentView: view }),
  provider: {
    ready: false,
    loading: false,
    configured: undefined,
    error: null,
  },
  setupProvider: async (model: AIModel) => {
    const provider = getProviderByModel(model)

    let assistant = get().assistant
    if (assistant?.getProvider() === provider) {
      return
    }

    set({ provider: { ready: false, loading: true, configured: undefined, error: null } })

    try {
      await repository.init()
    } catch (error) {
      logError('Error initializing repository', error)
      set({
        provider: { ready: false, loading: false, configured: false, error: getStringError(error) },
      })
      return
    }

    try {
      const apiKey = await browser.getSecureValue(getTokenKey(provider))
      if (!apiKey) {
        throw new Error('No API key found')
      }

      if (provider === AIProvider.OpenAI) {
        assistant = new OpenAIAssistant(apiKey)
      } else {
        assistant = new MockAssistant(apiKey)
      }
      set({
        provider: { ready: true, loading: false, configured: true, error: null },
        assistant,
        model,
      })
    } catch (error) {
      logError('Error setting up provider', error)
      set({
        provider: {
          ready: false,
          loading: false,
          configured: false,
          error: getStringError(error),
        },
      })
    }
  },
}))

export default useChatStore
