import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { DateTime } from 'luxon'

import useChatStore from '@/stores/useChatStore'
import { type IAssistant } from '@/services/assistant'
import browser from '@/services/browser'
import repository from '@/services/repository'
import {
  AIModel,
  AIProvider,
  MessageContentType,
  MessageRole,
  FunctionStatus,
  FunctionName,
  type Message,
  type PageContext,
  type FunctionCallResult,
} from '@/types/types'

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
    updateMessage: vi.fn(),
  },
}))

describe('messageSlice', () => {
  const mockAssistant: IAssistant = {
    getProvider: vi.fn().mockReturnValue(AIProvider.Mock),
    sendMessage: vi.fn(),
    sendFunctionCallResponse: vi.fn(),
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
      ...useChatStore.getInitialState(),
      threadId: 'test-thread-id',
    })

    vi.clearAllMocks()
  })

  describe('sendMessage', () => {
    beforeEach(() => {
      useChatStore.setState({
        assistant: mockAssistant,
        model: AIModel.OpenAI_ChatGPT_4o,
        waitingForTools: false,
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

    it('should set waitingForTools to true when response has tools', async () => {
      ;(browser.getPageContext as Mock).mockResolvedValue(null)
      ;(mockAssistant.sendMessage as Mock).mockResolvedValue({
        ...mockMessage,
        hasTools: true,
      })

      const { sendMessage } = useChatStore.getState()

      await sendMessage('Hello')

      expect(useChatStore.getState().waitingForTools).toBe(true)
    })
  })

  describe('saveFunctionResult', () => {
    beforeEach(() => {
      useChatStore.setState({
        assistant: mockAssistant,
        model: AIModel.OpenAI_ChatGPT_4o,
      })
    })

    it('should throw error when assistant is not initialized', async () => {
      useChatStore.setState({ assistant: null })

      const { saveFunctionResult } = useChatStore.getState()

      await expect(saveFunctionResult('message-id', 'call-id', { success: true })).rejects.toThrow(
        'Assistant not initialized',
      )
    })

    it('should throw error when model is not set', async () => {
      useChatStore.setState({
        assistant: mockAssistant,
        model: null as unknown as AIModel,
      })

      const { saveFunctionResult } = useChatStore.getState()

      await expect(saveFunctionResult('message-id', 'call-id', { success: true })).rejects.toThrow(
        'Assistant not initialized',
      )
    })

    it('should update function call result and not call assistant when other calls are pending', async () => {
      const messageWithMultipleCalls: Message = {
        id: 'test-message-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [
          {
            id: 'call-1',
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Pending,
            name: FunctionName.FillInput,
            arguments: {
              input_type: 'text',
              input_value: 'test',
              input_selector: '#input',
              label_value: 'Test Input',
            },
          },
          {
            id: 'call-2',
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Idle,
            name: FunctionName.ClickButton,
            arguments: {
              button_selector: '#button',
              button_text: 'Click Me',
            },
          },
        ],
        createdAt: DateTime.now().toISO(),
      }

      useChatStore.setState({
        messages: [messageWithMultipleCalls],
      })

      const { saveFunctionResult } = useChatStore.getState()

      await saveFunctionResult('test-message-id', 'call-1', { success: true })

      const state = useChatStore.getState()
      const functionCall0 = state.messages[0].content[0] as {
        status: FunctionStatus
        result: FunctionCallResult
      }
      const functionCall1 = state.messages[0].content[1] as { status: FunctionStatus }
      expect(functionCall0.status).toBe(FunctionStatus.Success)
      expect(functionCall0.result).toEqual({ success: true })
      expect(functionCall1.status).toBe(FunctionStatus.Idle)
      expect(state.waitingForReply).toBe(false)
      expect(state.waitingForTools).toBe(false)
      expect(mockAssistant.sendFunctionCallResponse).not.toHaveBeenCalled()
    })

    it('should update function call result and call assistant when all calls are completed', async () => {
      const messageWithSingleCall: Message = {
        id: 'test-message-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [
          {
            id: 'call-1',
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Pending,
            name: FunctionName.FillInput,
            arguments: {
              input_type: 'text',
              input_value: 'test',
              input_selector: '#input',
              label_value: 'Test Input',
            },
          },
        ],
        createdAt: DateTime.now().toISO(),
      }

      const mockResponse: Message = {
        id: 'response-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [{ type: MessageContentType.OutputText, text: 'Function completed', id: '1' }],
        createdAt: DateTime.now().toISO(),
      }

      useChatStore.setState({
        messages: [messageWithSingleCall],
      })
      ;(mockAssistant.sendFunctionCallResponse as Mock).mockResolvedValue({
        ...mockResponse,
        hasTools: false,
      })

      const { saveFunctionResult } = useChatStore.getState()

      await saveFunctionResult('test-message-id', 'call-1', { success: true })

      const state = useChatStore.getState()
      expect(state.messages).toHaveLength(2)
      const functionCall = state.messages[0].content[0] as {
        status: FunctionStatus
        result: FunctionCallResult
      }
      expect(functionCall.status).toBe(FunctionStatus.Success)
      expect(functionCall.result).toEqual({ success: true })
      expect(state.messages[1]).toEqual({
        id: expect.any(String),
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [{ type: MessageContentType.OutputText, text: 'Function completed', id: '1' }],
        createdAt: expect.any(String),
      })
      expect(state.waitingForReply).toBe(false)
      expect(state.waitingForTools).toBe(false)
      expect(mockAssistant.sendFunctionCallResponse).toHaveBeenCalledWith({
        model: AIModel.OpenAI_ChatGPT_4o,
        message: {
          ...messageWithSingleCall,
          content: [
            {
              ...messageWithSingleCall.content[0],
              status: FunctionStatus.Success,
              result: { success: true },
            },
          ],
        },
      })
    })

    it('should set error status when function call result indicates failure', async () => {
      const messageWithSingleCall: Message = {
        id: 'test-message-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [
          {
            id: 'call-1',
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Pending,
            name: FunctionName.FillInput,
            arguments: {
              input_type: 'text',
              input_value: 'test',
              input_selector: '#input',
              label_value: 'Test Input',
            },
          },
        ],
        createdAt: DateTime.now().toISO(),
      }

      const mockResponse: Message = {
        id: 'response-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [{ type: MessageContentType.OutputText, text: 'Function failed', id: '1' }],
        createdAt: DateTime.now().toISO(),
      }

      useChatStore.setState({
        messages: [messageWithSingleCall],
      })
      ;(mockAssistant.sendFunctionCallResponse as Mock).mockResolvedValue(mockResponse)

      const { saveFunctionResult } = useChatStore.getState()

      await saveFunctionResult('test-message-id', 'call-1', { success: false, error: 'Test error' })

      const state = useChatStore.getState()
      const functionCall = state.messages[0].content[0] as {
        status: FunctionStatus
        result: FunctionCallResult
      }
      expect(functionCall.status).toBe(FunctionStatus.Error)
      expect(functionCall.result).toEqual({ success: false, error: 'Test error' })
    })

    it('should return early when message with given ID is not found', async () => {
      useChatStore.setState({
        messages: [],
      })

      const { saveFunctionResult } = useChatStore.getState()

      await saveFunctionResult('non-existent-id', 'call-1', { success: true })

      expect(mockAssistant.sendFunctionCallResponse).not.toHaveBeenCalled()
      expect(repository.updateMessage).not.toHaveBeenCalled()
    })

    it('should handle sendFunctionCallResponse error and add error to message', async () => {
      const messageWithSingleCall: Message = {
        id: 'test-message-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [
          {
            id: 'call-1',
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Pending,
            name: FunctionName.FillInput,
            arguments: {
              input_type: 'text',
              input_value: 'test',
              input_selector: '#input',
              label_value: 'Test Input',
            },
          },
        ],
        createdAt: DateTime.now().toISO(),
      }

      const error = new Error('Assistant error')

      useChatStore.setState({
        messages: [messageWithSingleCall],
      })
      ;(mockAssistant.sendFunctionCallResponse as Mock).mockRejectedValue(error)

      const { saveFunctionResult } = useChatStore.getState()

      await saveFunctionResult('test-message-id', 'call-1', { success: true })

      const state = useChatStore.getState()
      expect(state.messages[0].error).toBe('Assistant error')
      expect(state.waitingForReply).toBe(false)
      expect(state.waitingForTools).toBe(false)
      expect(state.messageAbortController).toBe(null)
    })

    it('should set waitingForTools to true when response has tools', async () => {
      const messageWithSingleCall: Message = {
        id: 'test-message-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [
          {
            id: 'call-1',
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Pending,
            name: FunctionName.FillInput,
            arguments: {
              input_type: 'text',
              input_value: 'test',
              input_selector: '#input',
              label_value: 'Test Input',
            },
          },
        ],
        createdAt: DateTime.now().toISO(),
      }

      const mockResponse: Message = {
        id: 'response-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [{ type: MessageContentType.OutputText, text: 'Function completed', id: '1' }],
        createdAt: DateTime.now().toISO(),
      }

      useChatStore.setState({
        messages: [messageWithSingleCall],
      })
      ;(mockAssistant.sendFunctionCallResponse as Mock).mockResolvedValue({
        ...mockResponse,
        hasTools: true,
      })

      const { saveFunctionResult } = useChatStore.getState()

      await saveFunctionResult('test-message-id', 'call-1', { success: true })

      const state = useChatStore.getState()
      expect(state.waitingForTools).toBe(true)
    })

    it('should not proceed if threadId has changed during execution', async () => {
      const messageWithSingleCall: Message = {
        id: 'test-message-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [
          {
            id: 'call-1',
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Pending,
            name: FunctionName.FillInput,
            arguments: {
              input_type: 'text',
              input_value: 'test',
              input_selector: '#input',
              label_value: 'Test Input',
            },
          },
        ],
        createdAt: DateTime.now().toISO(),
      }

      const mockResponse: Message = {
        id: 'response-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [{ type: MessageContentType.OutputText, text: 'Function completed', id: '1' }],
        createdAt: DateTime.now().toISO(),
      }

      useChatStore.setState({
        messages: [messageWithSingleCall],
        threadId: 'test-thread-id',
      })
      ;(mockAssistant.sendFunctionCallResponse as Mock).mockImplementation(() => {
        // Simulate threadId change during execution
        useChatStore.setState({ threadId: 'different-thread-id' })
        return Promise.resolve(mockResponse)
      })

      const { saveFunctionResult } = useChatStore.getState()

      await saveFunctionResult('test-message-id', 'call-1', { success: true })

      const state = useChatStore.getState()
      expect(state.messages).toHaveLength(1) // Should not add response message
    })

    it('should update message in repository when all calls are completed', async () => {
      const messageWithSingleCall: Message = {
        id: 'test-message-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [
          {
            id: 'call-1',
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Pending,
            name: FunctionName.FillInput,
            arguments: {
              input_type: 'text',
              input_value: 'test',
              input_selector: '#input',
              label_value: 'Test Input',
            },
          },
        ],
        createdAt: DateTime.now().toISO(),
      }

      const mockResponse: Message = {
        id: 'response-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [{ type: MessageContentType.OutputText, text: 'Function completed', id: '1' }],
        createdAt: DateTime.now().toISO(),
      }

      useChatStore.setState({
        messages: [messageWithSingleCall],
      })
      ;(mockAssistant.sendFunctionCallResponse as Mock).mockResolvedValue(mockResponse)

      const { saveFunctionResult } = useChatStore.getState()

      await saveFunctionResult('test-message-id', 'call-1', { success: true })

      expect(repository.updateMessage).toHaveBeenCalledWith({
        ...messageWithSingleCall,
        content: [
          {
            ...messageWithSingleCall.content[0],
            status: FunctionStatus.Success,
            result: { success: true },
          },
        ],
      })
    })

    it('should handle multiple function calls with mixed statuses correctly', async () => {
      const messageWithMultipleCalls: Message = {
        id: 'test-message-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [
          {
            id: 'call-1',
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Success,
            name: FunctionName.FillInput,
            arguments: {
              input_type: 'text',
              input_value: 'test',
              input_selector: '#input',
              label_value: 'Test Input',
            },
            result: { success: true },
          },
          {
            id: 'call-2',
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Pending,
            name: FunctionName.ClickButton,
            arguments: {
              button_selector: '#button',
              button_text: 'Click Me',
            },
          },
          {
            id: 'call-3',
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Error,
            name: FunctionName.FillInput,
            arguments: {
              input_type: 'text',
              input_value: 'test2',
              input_selector: '#input2',
              label_value: 'Test Input 2',
            },
            result: { success: false, error: 'Previous error' },
          },
        ],
        createdAt: DateTime.now().toISO(),
      }

      const mockResponse: Message = {
        id: 'response-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [
          { type: MessageContentType.OutputText, text: 'All functions completed', id: '1' },
        ],
        createdAt: DateTime.now().toISO(),
      }

      useChatStore.setState({
        messages: [messageWithMultipleCalls],
      })
      ;(mockAssistant.sendFunctionCallResponse as Mock).mockResolvedValue(mockResponse)

      const { saveFunctionResult } = useChatStore.getState()

      await saveFunctionResult('test-message-id', 'call-2', { success: true })

      const state = useChatStore.getState()
      expect(state.messages).toHaveLength(2)
      const functionCall = state.messages[0].content[1] as {
        status: FunctionStatus
        result: FunctionCallResult
      }
      expect(functionCall.status).toBe(FunctionStatus.Success)
      expect(functionCall.result).toEqual({ success: true })
      expect(mockAssistant.sendFunctionCallResponse).toHaveBeenCalled()
    })
  })
})
