import { create } from 'zustand'
import { DateTime } from 'luxon'

import { AIModel, AIProvider, MessageRole, type Message } from '@/types/types'
import { OpenAIAssistant, MockAssistant, type IAssistant } from '@/services/assistant'
import { logError } from '@/utils/log'
import { getProviderByModel } from '@/utils/provider'
import { getTokenKey } from '@/utils/token'
import { getStringError } from '@/utils/error'
import { getBasicInstructions } from '@/utils/instructions'
import browser from '@/services/browser'
import repository from '@/services/repository'

interface ChatStore {
  messages: Message[]
  sendMessage: (text: string) => Promise<void>
  waitingForReply: boolean
  clearHistory: () => void
  assistant: IAssistant | null
  model: AIModel
  setModel: (model: AIModel) => void
  threadId: string
  setThreadId: (threadId: string) => void
  provider: {
    ready: boolean
    loading: boolean
    configured: boolean | undefined
    error: string | null
  }
  setupProvider: (model: AIModel) => Promise<void>
}

const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  sendMessage: async (text: string) => {
    const { assistant, model, messages, threadId } = get()
    if (!assistant || !model) {
      throw new Error('Assistant not initialized')
    }

    const newMessage = {
      id: crypto.randomUUID(),
      role: MessageRole.User,
      content: text,
      createdAt: DateTime.now().toISO(),
      threadId,
    }
    set(state => ({
      messages: [...state.messages, newMessage],
      waitingForReply: true,
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
      })
      set(state => ({
        messages: [...state.messages, response],
        waitingForReply: false,
      }))
      await repository.createMessage(response)
    } catch (error) {
      logError('Error sending message', error)
      set(state => ({
        messages: state.messages.map((msg, index) =>
          index === state.messages.length - 1 ? { ...msg, error: getStringError(error) } : msg,
        ),
        waitingForReply: false,
      }))
    }
  },
  waitingForReply: false,
  clearHistory: () => set({ messages: [] }),
  assistant: null,
  model: AIModel.OpenAI_ChatGPT_4o,
  setModel: (model: AIModel) => set({ model }),
  threadId: crypto.randomUUID(),
  setThreadId: (threadId: string) => set({ threadId }),
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
