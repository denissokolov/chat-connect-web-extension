import { describe, it, expect, beforeEach, vi, type Mock, type MockedFunction } from 'vitest'

import useChatStore from '@/stores/useChatStore'
import { AIProvider, AIModel } from '@/types/types'
import browser from '@/services/browser'
import { MockAssistant } from '@/services/assistant'

vi.mock('@/services/browser', () => ({
  default: {
    getPageContext: vi.fn(),
    getCurrentPageInfo: vi.fn(),
    getSecureValue: vi.fn(),
  },
}))

vi.mock('@/services/assistant', () => ({
  MockAssistant: vi.fn(),
}))

describe('providerSlice', () => {
  beforeEach(() => {
    useChatStore.setState(useChatStore.getInitialState())
    vi.clearAllMocks()
  })

  describe('setupProvider', () => {
    it('should skip setup if assistant already has the same provider', async () => {
      const existingAssistant = {
        getProvider: vi.fn().mockReturnValue(AIProvider.Mock),
        sendMessage: vi.fn(),
      }

      useChatStore.setState({ assistant: existingAssistant })

      const { setupProvider } = useChatStore.getState()

      await setupProvider(AIModel.OpenAI_ChatGPT_4o)

      expect(browser.getSecureValue).not.toHaveBeenCalled()
      expect(useChatStore.getState().assistant).toBe(existingAssistant)
    })

    it('should set provider as not configured when API key is missing', async () => {
      ;(browser.getSecureValue as Mock).mockResolvedValue(null)

      const { setupProvider } = useChatStore.getState()

      await setupProvider(AIModel.OpenAI_ChatGPT_4o)

      const state = useChatStore.getState()
      expect(state.provider).toEqual({
        ready: false,
        loading: false,
        configured: false,
        error: 'No API key found',
      })
      expect(browser.getSecureValue).toHaveBeenCalledWith('token_mock')
    })

    it('should setup mock assistant successfully', async () => {
      ;(browser.getSecureValue as Mock).mockResolvedValue('test-api-key')

      const { setupProvider } = useChatStore.getState()

      await setupProvider(AIModel.OpenAI_ChatGPT_4o)

      const state = useChatStore.getState()
      expect(state.provider.configured).toBe(true)
      expect(state.provider.ready).toBe(true)
      expect(state.provider.loading).toBe(false)
      expect(state.provider.error).toBeNull()
      expect(state.model).toBe(AIModel.OpenAI_ChatGPT_4o)
      expect(MockAssistant).toHaveBeenCalledWith('test-api-key')
      expect(state.assistant).toBeTruthy()
    })

    it('should handle setup errors', async () => {
      const error = new Error('Setup failed')
      ;(browser.getSecureValue as Mock).mockResolvedValue('test-api-key')
      ;(MockAssistant as unknown as MockedFunction<() => unknown>).mockImplementation(() => {
        throw error
      })

      const { setupProvider } = useChatStore.getState()

      await setupProvider(AIModel.OpenAI_ChatGPT_4o)

      const state = useChatStore.getState()
      expect(state.provider).toEqual({
        ready: false,
        loading: false,
        configured: false,
        error: 'Setup failed',
      })
    })

    it('should set loading state during setup', async () => {
      let resolvePromise: (value: string | null) => void
      const promise = new Promise<string | null>(resolve => {
        resolvePromise = resolve
      })

      ;(browser.getSecureValue as Mock).mockReturnValue(promise)

      const { setupProvider } = useChatStore.getState()

      const setupPromise = setupProvider(AIModel.OpenAI_ChatGPT_4o)

      expect(useChatStore.getState().provider.loading).toBe(true)
      expect(useChatStore.getState().provider.ready).toBe(false)

      resolvePromise!('test-api-key')
      await setupPromise

      expect(useChatStore.getState().provider.loading).toBe(false)
    })

    it('should handle browser.getSecureValue error', async () => {
      ;(browser.getSecureValue as Mock).mockImplementationOnce(() => {
        throw new Error('Browser error')
      })

      const { setupProvider } = useChatStore.getState()

      try {
        await setupProvider(AIModel.OpenAI_ChatGPT_4o)
      } catch (error) {
        expect(error).toBeNull()
      }

      const state = useChatStore.getState()
      expect(state.provider).toEqual({
        ready: false,
        loading: false,
        configured: false,
        error: 'Browser error',
      })
    })
  })
})
