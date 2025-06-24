import { create } from 'zustand'

import { AIModel, AIProvider, MessageRole, type Message } from '@/types/types'
import { OpenAIAssistant, MockAssistant, type IAssistant } from '@/services/assistant'
import { logError } from '@/utils/log'
import { getProviderByModel } from '@/utils/provider'
import { getTokenKey } from '@/utils/token'
import { getStringError } from '@/utils/error'
import { getBasicInstructions } from '@/utils/instructions'
import browser from '@/services/browser'

interface ChatStore {
  messages: Message[]
  sendMessage: (text: string) => Promise<void>
  waitingForReply: boolean
  clearHistory: () => void
  assistant: IAssistant | null
  model: AIModel | null
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
    const { assistant, model, messages } = get()
    if (!assistant || !model) {
      throw new Error('Assistant not initialized')
    }

    set(state => ({
      messages: [
        ...state.messages,
        {
          id: crypto.randomUUID(),
          role: MessageRole.User,
          content: text,
          timestamp: new Date(),
        },
      ],
      waitingForReply: true,
    }))

    try {
      const pageContext = await browser.getPageContext()

      const response = await assistant.sendMessage({
        model: model,
        instructions: pageContext ? getBasicInstructions(pageContext) : undefined,
        text: text,
        history: messages,
      })

      set(state => ({
        messages: [...state.messages, response],
        waitingForReply: false,
      }))
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
  model: null,
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

    const apiKey = await browser.getSecureValue(getTokenKey(provider))
    if (!apiKey) {
      set({
        provider: { ...get().provider, loading: false, configured: false },
      })
      return
    }

    try {
      if (provider === AIProvider.OpenAI) {
        assistant = new OpenAIAssistant(apiKey)
      } else {
        assistant = new MockAssistant()
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
          ...get().provider,
          loading: false,
          configured: false,
          error: getStringError(error),
        },
      })
    }
  },
}))

export default useChatStore
