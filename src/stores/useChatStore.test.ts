import { DateTime } from 'luxon'
import { describe, it, expect, beforeEach, vi, type Mock, type MockedFunction } from 'vitest'

import {
  AIModel,
  AIProvider,
  MessageContentType,
  MessageRole,
  type Message,
  type PageContext,
} from '@/types/types'
import { MockAssistant, type IAssistant } from '@/services/assistant'
import browser from '@/services/browser'
import repository from '@/services/repository'

import useChatStore from './useChatStore'

vi.mock('@/services/assistant', () => ({
  MockAssistant: vi.fn(),
}))

vi.mock('@/services/browser', () => ({
  default: {
    getPageContext: vi.fn(),
    getCurrentPageInfo: vi.fn(),
    getSecureValue: vi.fn(),
  },
}))

vi.mock('@/services/repository', () => ({
  default: {
    init: vi.fn(),
    createMessage: vi.fn(),
    createThread: vi.fn(),
    updateThread: vi.fn(),
  },
}))

describe('useChatStore', () => {
  const mockAssistant: IAssistant = {
    getProvider: vi.fn().mockReturnValue(AIProvider.Mock),
    sendMessage: vi.fn(),
  }

  const mockPageContext: PageContext = {
    title: 'Test Page',
    url: 'https://example.com',
    html: '<html><body>Test content</body></html>',
    favicon: 'test-favicon.ico',
  }

  const mockMessage: Message = {
    threadId: 'test-thread-id',
    id: 'test-message-id',
    role: MessageRole.Assistant,
    content: [{ type: MessageContentType.OutputText, text: 'Test response', id: '1' }],
    createdAt: '2024-01-01T12:00:00Z',
  }

  beforeEach(() => {
    useChatStore.setState({
      messages: [],
      waitingForReply: false,
      assistant: null,
      model: AIModel.OpenAI_ChatGPT_4o,
      provider: {
        ready: false,
        loading: false,
        configured: undefined,
        error: null,
      },
      threadId: 'test-thread-id',
    })

    vi.clearAllMocks()

    // Clear repository mocks
    ;(repository.createMessage as Mock).mockClear()
    ;(repository.createThread as Mock).mockClear()
    ;(repository.updateThread as Mock).mockClear()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useChatStore.getState()

      expect(state.messages).toEqual([])
      expect(state.waitingForReply).toBe(false)
      expect(state.assistant).toBeNull()
      expect(state.model).toBe(AIModel.OpenAI_ChatGPT_4o)
      expect(state.provider).toEqual({
        ready: false,
        loading: false,
        configured: undefined,
        error: null,
      })
      expect(state.threadId).toBe('test-thread-id')
    })
  })

  describe('setModel', () => {
    it('should update the model', () => {
      const { setModel } = useChatStore.getState()

      setModel(AIModel.OpenAI_GPT_4o)

      expect(useChatStore.getState().model).toBe(AIModel.OpenAI_GPT_4o)
    })

    it('should update the model to different AI models', () => {
      const { setModel } = useChatStore.getState()

      setModel(AIModel.OpenAI_o3_mini)
      expect(useChatStore.getState().model).toBe(AIModel.OpenAI_o3_mini)

      setModel(AIModel.OpenAI_GPT_4_1)
      expect(useChatStore.getState().model).toBe(AIModel.OpenAI_GPT_4_1)
    })
  })

  describe('clearHistory', () => {
    it('should clear all messages', () => {
      useChatStore.setState({
        messages: [
          {
            id: '1',
            role: MessageRole.User,
            content: [{ type: MessageContentType.OutputText, text: 'Hello', id: '1' }],
            createdAt: DateTime.now().toISO(),
            threadId: 'test-thread-id',
          },
          {
            id: '2',
            role: MessageRole.Assistant,
            content: [{ type: MessageContentType.OutputText, text: 'Hi there', id: '2' }],
            createdAt: DateTime.now().toISO(),
            threadId: 'test-thread-id',
          },
        ],
      })

      const { clearHistory } = useChatStore.getState()
      clearHistory()

      expect(useChatStore.getState().messages).toEqual([])
    })

    it('should clear messages without affecting other state', () => {
      useChatStore.setState({
        messages: [mockMessage],
        waitingForReply: true,
        assistant: mockAssistant,
      })

      const { clearHistory } = useChatStore.getState()
      clearHistory()

      const state = useChatStore.getState()
      expect(state.messages).toEqual([])
      expect(state.waitingForReply).toBe(true)
      expect(state.assistant).toBe(mockAssistant)
    })
  })

  describe('sendMessage', () => {
    beforeEach(() => {
      useChatStore.setState({
        assistant: mockAssistant,
        model: AIModel.OpenAI_ChatGPT_4o,
      })
    })

    it('should throw error when assistant is not initialized', async () => {
      useChatStore.setState({ assistant: null })

      const { sendMessage } = useChatStore.getState()

      await expect(sendMessage('Hello')).rejects.toThrow('Assistant not initialized')
    })

    it('should throw error when model is not set', async () => {
      useChatStore.setState({
        assistant: mockAssistant,
        model: null as unknown as AIModel,
      })

      const { sendMessage } = useChatStore.getState()

      await expect(sendMessage('Hello')).rejects.toThrow('Assistant not initialized')
    })

    it('should add user message and send to assistant successfully', async () => {
      const mockDate = DateTime.fromISO('2024-01-01T12:00:00Z')
      vi.setSystemTime(mockDate.toJSDate())
      ;(browser.getPageContext as Mock).mockResolvedValue(mockPageContext)
      ;(mockAssistant.sendMessage as Mock).mockResolvedValue(mockMessage)

      const { sendMessage } = useChatStore.getState()

      await sendMessage('Hello')

      const state = useChatStore.getState()
      expect(state.messages).toHaveLength(2)
      expect(state.messages[0]).toEqual({
        id: expect.any(String),
        role: MessageRole.User,
        content: [{ type: MessageContentType.OutputText, text: 'Hello', id: expect.any(String) }],
        createdAt: mockDate.toISO(),
        threadId: 'test-thread-id',
        context: { title: 'Test Page', favicon: 'test-favicon.ico', url: 'https://example.com' },
      })
      expect(state.messages[1]).toEqual({
        id: expect.any(String),
        role: MessageRole.Assistant,
        content: [{ type: MessageContentType.OutputText, text: 'Test response', id: '1' }],
        createdAt: mockDate.toISO(),
        threadId: 'test-thread-id',
      })

      expect(state.waitingForReply).toBe(false)
      expect(mockAssistant.sendMessage).toHaveBeenCalledWith({
        model: AIModel.OpenAI_ChatGPT_4o,
        instructions: expect.stringContaining('Test Page'),
        text: 'Hello',
        history: [],
        signal: expect.any(AbortSignal),
      })
    })

    it('should send message without page context when getPageContext returns null', async () => {
      ;(browser.getPageContext as Mock).mockResolvedValue(null)
      ;(mockAssistant.sendMessage as Mock).mockResolvedValue(mockMessage)

      const { sendMessage } = useChatStore.getState()

      await sendMessage('Hello')

      expect(mockAssistant.sendMessage).toHaveBeenCalledWith({
        model: AIModel.OpenAI_ChatGPT_4o,
        instructions: undefined,
        text: 'Hello',
        history: [],
        signal: expect.any(AbortSignal),
      })
    })

    it('should include message history when sending', async () => {
      const existingMessages: Message[] = [
        {
          id: '1',
          role: MessageRole.User,
          content: [{ type: MessageContentType.OutputText, text: 'Previous message', id: '1' }],
          createdAt: DateTime.now().toISO(),
          threadId: 'test-thread-id',
        },
      ]

      useChatStore.setState({ messages: existingMessages })
      ;(browser.getPageContext as Mock).mockResolvedValue(null)
      ;(mockAssistant.sendMessage as Mock).mockResolvedValue(mockMessage)

      const { sendMessage } = useChatStore.getState()

      await sendMessage('Hello')

      expect(mockAssistant.sendMessage).toHaveBeenCalledWith({
        model: AIModel.OpenAI_ChatGPT_4o,
        instructions: undefined,
        text: 'Hello',
        history: existingMessages,
        signal: expect.any(AbortSignal),
      })
    })

    it('should handle sendMessage error by adding error to user message', async () => {
      const error = new Error('Network error')
      ;(browser.getPageContext as Mock).mockResolvedValue(null)
      ;(mockAssistant.sendMessage as Mock).mockRejectedValue(error)

      const { sendMessage } = useChatStore.getState()

      await sendMessage('Hello')

      const state = useChatStore.getState()
      expect(state.messages).toHaveLength(1)
      expect(state.messages[0].error).toBe('Network error')
      expect(state.waitingForReply).toBe(false)
    })

    it('should set waitingForReply to true during message sending', async () => {
      let resolvePromise: (value: Message) => void
      const promise = new Promise<Message>(resolve => {
        resolvePromise = resolve
      })

      ;(browser.getPageContext as Mock).mockResolvedValue(null)
      ;(mockAssistant.sendMessage as Mock).mockReturnValue(promise)

      const { sendMessage } = useChatStore.getState()

      const sendPromise = sendMessage('Hello')

      // Wait a tick for the async getCurrentPageInfo to complete
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(useChatStore.getState().waitingForReply).toBe(true)

      resolvePromise!(mockMessage)
      await sendPromise

      expect(useChatStore.getState().waitingForReply).toBe(false)
    })

    it('should handle empty message string', async () => {
      ;(browser.getPageContext as Mock).mockResolvedValue(null)
      ;(mockAssistant.sendMessage as Mock).mockResolvedValue(mockMessage)

      const { sendMessage } = useChatStore.getState()

      await sendMessage('')

      expect(mockAssistant.sendMessage).toHaveBeenCalledWith({
        model: AIModel.OpenAI_ChatGPT_4o,
        instructions: undefined,
        text: '',
        history: [],
        signal: expect.any(AbortSignal),
      })
    })

    it('should handle browser.getPageContext error gracefully', async () => {
      const error = new Error('Page context error')
      ;(browser.getPageContext as Mock).mockRejectedValue(error)
      ;(mockAssistant.sendMessage as Mock).mockResolvedValue(mockMessage)

      const { sendMessage } = useChatStore.getState()

      await sendMessage('Hello')

      const state = useChatStore.getState()
      expect(state.messages).toHaveLength(1)
      expect(state.messages[0].error).toBe('Page context error')
      expect(state.waitingForReply).toBe(false)
    })

    it('should create message in repository after successful send', async () => {
      ;(browser.getPageContext as Mock).mockResolvedValue(null)
      ;(mockAssistant.sendMessage as Mock).mockResolvedValue(mockMessage)

      const { sendMessage } = useChatStore.getState()

      await sendMessage('Hello')

      expect(repository.createMessage).toHaveBeenCalledWith({
        id: expect.any(String),
        role: MessageRole.Assistant,
        content: [{ type: MessageContentType.OutputText, text: 'Test response', id: '1' }],
        createdAt: expect.any(String),
        threadId: 'test-thread-id',
      })
    })

    it('should create thread in repository for first message', async () => {
      const mockDate = DateTime.fromISO('2024-01-01T12:00:00Z')
      vi.setSystemTime(mockDate.toJSDate())

      useChatStore.setState({ messages: [] }) // Ensure empty messages
      ;(browser.getPageContext as Mock).mockResolvedValue(null)
      ;(mockAssistant.sendMessage as Mock).mockResolvedValue(mockMessage)

      const { sendMessage } = useChatStore.getState()

      await sendMessage('Hello')

      expect(repository.createThread).toHaveBeenCalledWith({
        id: 'test-thread-id',
        createdAt: mockDate.toISO(),
        updatedAt: mockDate.toISO(),
      })
    })

    it('should update thread in repository for subsequent messages', async () => {
      const mockDate = DateTime.fromISO('2024-01-01T12:00:00Z')
      vi.setSystemTime(mockDate.toJSDate())

      const existingMessages: Message[] = [
        {
          id: '1',
          role: MessageRole.User,
          content: [{ type: MessageContentType.OutputText, text: 'Previous message', id: '1' }],
          createdAt: DateTime.now().toISO(),
          threadId: 'test-thread-id',
        },
      ]

      useChatStore.setState({ messages: existingMessages })
      ;(browser.getPageContext as Mock).mockResolvedValue(null)
      ;(mockAssistant.sendMessage as Mock).mockResolvedValue(mockMessage)

      const { sendMessage } = useChatStore.getState()

      await sendMessage('Hello')

      expect(repository.updateThread).toHaveBeenCalledWith({
        id: 'test-thread-id',
        updatedAt: mockDate.toISO(),
      })
      expect(repository.createThread).not.toHaveBeenCalled()
    })
  })

  describe('setupProvider', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

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
