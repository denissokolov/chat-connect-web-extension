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
  sendMessage: (text: string, useStreaming?: boolean) => Promise<void>
  waitingForReply: boolean
  streamingMessageId: string | null
  clearHistory: () => void
  assistant: IAssistant | null
  model: AIModel
  setModel: (model: AIModel) => void
  provider: {
    ready: boolean
    loading: boolean
    configured: boolean | undefined
    error: string | null
  }
  setupProvider: (model: AIModel) => Promise<void>
  updateStreamingMessage: (id: string, content: string) => void
  finalizeStreamingMessage: (id: string) => void
}

const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  sendMessage: async (text: string, useStreaming = true) => {
    const { assistant, model, messages } = get()
    if (!assistant || !model) {
      throw new Error('Assistant not initialized')
    }

    // Add user message
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
      const params = {
        model: model,
        instructions: pageContext ? getBasicInstructions(pageContext) : undefined,
        text: text,
        history: messages,
      }

      // Check if streaming is supported and requested
      if (useStreaming && assistant.sendMessageStream) {
        // Create placeholder assistant message for streaming
        const assistantMessageId = crypto.randomUUID()
        set(state => ({
          messages: [
            ...state.messages,
            {
              id: assistantMessageId,
              role: MessageRole.Assistant,
              content: '',
              timestamp: new Date(),
              streaming: true,
            },
          ],
          waitingForReply: false,
          streamingMessageId: assistantMessageId,
        }))

        // Start streaming
        let fullContent = ''
        try {
          for await (const chunk of assistant.sendMessageStream(params)) {
            fullContent += chunk
            get().updateStreamingMessage(assistantMessageId, fullContent)
          }
          // Finalize streaming message
          get().finalizeStreamingMessage(assistantMessageId)
        } catch (streamError) {
          logError('Error during streaming', streamError)
          set(state => ({
            messages: state.messages.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, error: getStringError(streamError), streaming: false }
                : msg,
            ),
            streamingMessageId: null,
          }))
        }
      } else {
        // Fallback to non-streaming
        const response = await assistant.sendMessage(params)
        set(state => ({
          messages: [...state.messages, response],
          waitingForReply: false,
        }))
      }
    } catch (error) {
      logError('Error sending message', error)
      set(state => ({
        messages: state.messages.map((msg, index) =>
          index === state.messages.length - 1 ? { ...msg, error: getStringError(error) } : msg,
        ),
        waitingForReply: false,
        streamingMessageId: null,
      }))
    }
  },
  waitingForReply: false,
  streamingMessageId: null,
  clearHistory: () => set({ messages: [] }),
  assistant: null,
  model: AIModel.OpenAI_ChatGPT_4o,
  setModel: (model: AIModel) => set({ model }),
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
  updateStreamingMessage: (id: string, content: string) => {
    set(state => ({
      messages: state.messages.map(msg => (msg.id === id ? { ...msg, content } : msg)),
    }))
  },
  finalizeStreamingMessage: (id: string) => {
    set(state => ({
      messages: state.messages.map(msg => (msg.id === id ? { ...msg, streaming: false } : msg)),
      streamingMessageId: null,
    }))
  },
}))

export default useChatStore
