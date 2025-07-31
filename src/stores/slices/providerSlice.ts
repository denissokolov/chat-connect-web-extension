import { type StateCreator } from 'zustand'

import type { ProviderSlice, ChatStore } from '@/stores/useChatStore.types'
import repository from '@/services/repository'
import { OpenAIAssistant, MockAssistant } from '@/services/assistant'
import browser from '@/services/browser'
import { getProviderByModel } from '@/utils/provider'
import { logError } from '@/utils/log'
import { getStringError } from '@/utils/error'
import { getTokenKey } from '@/utils/token'
import { AIProvider, AIModel } from '@/types/provider.types'

export const createProviderSlice: StateCreator<ChatStore, [], [], ProviderSlice> = (set, get) => ({
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
})
