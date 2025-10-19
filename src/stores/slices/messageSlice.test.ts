import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { DateTime } from 'luxon'

import useChatStore from '@/stores/useChatStore'
import { type IAssistant } from '@/services/assistant'
import browser from '@/services/browser'
import repository from '@/services/repository'
import {
  MessageContentType,
  MessageRole,
  type FunctionCallContent,
  type Message,
  type MessageContent,
} from '@/types/chat.types'
import { type PageContext } from '@/types/browser.types'
import { FunctionStatus, FunctionName, type FunctionCallResult } from '@/types/tool.types'
import { AIModel, AIProvider, ProviderMessageEventType } from '@/types/provider.types'

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
    sendMessage: vi.fn().mockResolvedValue(undefined),
    sendFunctionCallResponse: vi.fn().mockResolvedValue(undefined),
    cancelActiveRequest: vi.fn(),
  }
  const mockPageContext: PageContext = {
    title: 'Test Page',
    url: 'https://example.com',
    favicon: 'test-favicon.ico',
  }
  const toolsMock = [
    expect.objectContaining({
      name: 'fill_input',
    }),
    expect.objectContaining({
      name: 'click_element',
    }),
    expect.objectContaining({
      name: 'get_page_content',
    }),
  ]

  beforeEach(() => {
    useChatStore.setState({
      ...useChatStore.getInitialState(),
      threadId: 'test-thread-id',
      settings: {
        ready: true,
        loading: false,
        error: null,
        data: {
          openAIToken: 'test-token',
          openAIServer: '',
          model: AIModel.OpenAI_GPT_5,
          autoExecuteTools: false,
        },
      },
      assistant: mockAssistant,
    })

    vi.clearAllMocks()
  })

  describe('sendMessage', () => {
    beforeEach(() => {
      useChatStore.setState({
        waitingForTools: false,
      })
    })

    it('should throw error when model is not selected', async () => {
      useChatStore.setState({
        settings: {
          ready: true,
          loading: false,
          error: null,
          data: null,
        },
      })

      const { sendMessage } = useChatStore.getState()

      await expect(sendMessage('Hello')).rejects.toThrow('Model not selected')
    })

    it('should throw error when settings data is null', async () => {
      useChatStore.setState({
        settings: {
          ready: true,
          loading: false,
          error: null,
          data: null,
        },
      })

      const { sendMessage } = useChatStore.getState()

      await expect(sendMessage('Hello')).rejects.toThrow('Model not selected')
    })

    it('should add user message and send to assistant successfully', async () => {
      const mockDate = DateTime.fromISO('2024-01-01T12:00:00Z')
      vi.setSystemTime(mockDate.toJSDate())
      ;(browser.getPageContext as Mock).mockResolvedValue(mockPageContext)

      // Mock assistant to simulate event flow
      ;(mockAssistant.sendMessage as Mock).mockImplementation(({ eventHandler }) => {
        // Simulate assistant response events
        eventHandler({
          type: ProviderMessageEventType.Created,
          messageId: 'assistant-msg-id',
          threadId: 'test-thread-id',
        })
        eventHandler({
          type: ProviderMessageEventType.OutputTextDelta,
          messageId: 'assistant-msg-id',
          threadId: 'test-thread-id',
          contentId: 'content-1',
          textDelta: 'Test response',
        })
        eventHandler({
          type: ProviderMessageEventType.Completed,
          messageId: 'assistant-msg-id',
          userMessageId: 'user-msg-id',
          threadId: 'test-thread-id',
        })
      })

      const { sendMessage } = useChatStore.getState()

      await sendMessage('Hello')

      const state = useChatStore.getState()
      expect(state.messages.list[0]).toEqual({
        id: expect.any(String),
        role: MessageRole.User,
        content: [{ type: MessageContentType.OutputText, text: 'Hello', id: expect.any(String) }],
        createdAt: mockDate.toISO(),
        threadId: 'test-thread-id',
        context: { title: 'Test Page', favicon: 'test-favicon.ico', url: 'https://example.com' },
        complete: true,
      })
      expect(state.messages.list[1]).toEqual({
        id: 'assistant-msg-id',
        role: MessageRole.Assistant,
        content: [{ type: MessageContentType.OutputText, text: 'Test response', id: 'content-1' }],
        createdAt: mockDate.toISO(),
        threadId: 'test-thread-id',
        complete: true,
      })

      expect(state.waitingForReply).toBe(false)
      expect(mockAssistant.sendMessage).toHaveBeenCalledWith({
        model: AIModel.OpenAI_GPT_5,
        message: expect.objectContaining({
          role: MessageRole.User,
          content: [{ type: MessageContentType.OutputText, text: 'Hello', id: expect.any(String) }],
          threadId: 'test-thread-id',
        }),
        eventHandler: expect.any(Function),
        instructions: expect.stringContaining('Test Page'),
        history: [],
        tools: toolsMock,
      })
    })

    it('should send message without page context when getPageContext returns null', async () => {
      ;(browser.getPageContext as Mock).mockResolvedValue(null)

      // Mock assistant to simulate event flow
      ;(mockAssistant.sendMessage as Mock).mockImplementation(({ eventHandler }) => {
        eventHandler({
          type: ProviderMessageEventType.Created,
          messageId: 'assistant-msg-id',
          threadId: 'test-thread-id',
        })
        eventHandler({
          type: ProviderMessageEventType.Completed,
          messageId: 'assistant-msg-id',
          userMessageId: 'user-msg-id',
          threadId: 'test-thread-id',
        })
      })

      const { sendMessage } = useChatStore.getState()

      await sendMessage('Hello')

      expect(mockAssistant.sendMessage).toHaveBeenCalledWith({
        model: AIModel.OpenAI_GPT_5,
        message: expect.objectContaining({
          role: MessageRole.User,
          content: [{ type: MessageContentType.OutputText, text: 'Hello', id: expect.any(String) }],
          threadId: 'test-thread-id',
        }),
        eventHandler: expect.any(Function),
        instructions: undefined,
        history: [],
        tools: toolsMock,
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
          complete: true,
        },
      ]

      useChatStore.setState({
        messages: { list: existingMessages, loading: false, error: null, ready: true },
      })
      ;(browser.getPageContext as Mock).mockResolvedValue(null)

      // Mock assistant to simulate event flow
      ;(mockAssistant.sendMessage as Mock).mockImplementation(({ eventHandler }) => {
        eventHandler({
          type: ProviderMessageEventType.Created,
          messageId: 'assistant-msg-id',
          threadId: 'test-thread-id',
        })
        eventHandler({
          type: ProviderMessageEventType.Completed,
          messageId: 'assistant-msg-id',
          userMessageId: 'user-msg-id',
          threadId: 'test-thread-id',
        })
      })

      const { sendMessage } = useChatStore.getState()

      await sendMessage('Hello')

      expect(mockAssistant.sendMessage).toHaveBeenCalledWith({
        model: AIModel.OpenAI_GPT_5,
        message: expect.objectContaining({
          role: MessageRole.User,
          content: [{ type: MessageContentType.OutputText, text: 'Hello', id: expect.any(String) }],
          threadId: 'test-thread-id',
        }),
        eventHandler: expect.any(Function),
        instructions: undefined,
        history: existingMessages,
        tools: toolsMock,
      })
    })

    it('should handle sendMessage error by adding error to user message', async () => {
      const error = new Error('Network error')
      ;(browser.getPageContext as Mock).mockResolvedValue(null)
      ;(mockAssistant.sendMessage as Mock).mockRejectedValue(error)

      const { sendMessage } = useChatStore.getState()

      await sendMessage('Hello')

      const state = useChatStore.getState()
      expect(state.messages.list).toHaveLength(1)
      expect(state.messages.list[0].error).toBe('Network error')
      expect(state.waitingForReply).toBe(false)
    })

    it('should set waitingForReply to true during message sending', async () => {
      let resolvePromise: () => void
      const promise = new Promise<void>(resolve => {
        resolvePromise = resolve
      })

      ;(browser.getPageContext as Mock).mockResolvedValue(null)
      ;(mockAssistant.sendMessage as Mock).mockImplementation(async ({ eventHandler }) => {
        await promise
        eventHandler({
          type: ProviderMessageEventType.Created,
          messageId: 'assistant-msg-id',
          threadId: 'test-thread-id',
        })
        eventHandler({
          type: ProviderMessageEventType.Completed,
          messageId: 'assistant-msg-id',
          userMessageId: 'user-msg-id',
          threadId: 'test-thread-id',
        })
      })

      const { sendMessage } = useChatStore.getState()

      const sendPromise = sendMessage('Hello')

      // Wait a tick for the async getCurrentPageInfo to complete
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(useChatStore.getState().waitingForReply).toBe(true)

      resolvePromise!()
      await sendPromise

      expect(useChatStore.getState().waitingForReply).toBe(false)
    })

    it('should handle empty message string', async () => {
      ;(browser.getPageContext as Mock).mockResolvedValue(null)

      // Mock assistant to simulate event flow
      ;(mockAssistant.sendMessage as Mock).mockImplementation(({ eventHandler }) => {
        eventHandler({
          type: ProviderMessageEventType.Created,
          messageId: 'assistant-msg-id',
          threadId: 'test-thread-id',
        })
        eventHandler({
          type: ProviderMessageEventType.Completed,
          messageId: 'assistant-msg-id',
          userMessageId: 'user-msg-id',
          threadId: 'test-thread-id',
        })
      })

      const { sendMessage } = useChatStore.getState()

      await sendMessage('')

      expect(mockAssistant.sendMessage).toHaveBeenCalledWith({
        model: AIModel.OpenAI_GPT_5,
        message: expect.objectContaining({
          role: MessageRole.User,
          content: [{ type: MessageContentType.OutputText, text: '', id: expect.any(String) }],
          threadId: 'test-thread-id',
        }),
        eventHandler: expect.any(Function),
        instructions: undefined,
        history: [],
        tools: toolsMock,
      })
    })

    it('should handle browser.getPageContext error gracefully', async () => {
      const error = new Error('Page context error')
      ;(browser.getPageContext as Mock).mockRejectedValue(error)

      const { sendMessage } = useChatStore.getState()

      await sendMessage('Hello')

      const state = useChatStore.getState()
      expect(state.messages.list).toHaveLength(1)
      expect(state.messages.list[0].error).toBe('Page context error')
      expect(state.waitingForReply).toBe(false)
      expect(mockAssistant.sendMessage).not.toHaveBeenCalled()
    })

    it('should create message in repository after successful send', async () => {
      ;(browser.getPageContext as Mock).mockResolvedValue(null)

      // Mock assistant to simulate event flow
      ;(mockAssistant.sendMessage as Mock).mockImplementation(({ eventHandler }) => {
        eventHandler({
          type: ProviderMessageEventType.Created,
          messageId: 'assistant-msg-id',
          threadId: 'test-thread-id',
        })
        eventHandler({
          type: ProviderMessageEventType.OutputTextDelta,
          messageId: 'assistant-msg-id',
          threadId: 'test-thread-id',
          contentId: 'content-1',
          textDelta: 'Test response',
        })
        eventHandler({
          type: ProviderMessageEventType.Completed,
          messageId: 'assistant-msg-id',
          userMessageId: 'user-msg-id',
          threadId: 'test-thread-id',
        })
      })

      const { sendMessage } = useChatStore.getState()

      await sendMessage('Hello')

      expect(repository.createMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          role: MessageRole.User,
          content: [{ type: MessageContentType.OutputText, text: 'Hello', id: expect.any(String) }],
          threadId: 'test-thread-id',
        }),
      )

      expect(repository.createMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'assistant-msg-id',
          role: MessageRole.Assistant,
          content: [
            { type: MessageContentType.OutputText, text: 'Test response', id: 'content-1' },
          ],
          threadId: 'test-thread-id',
        }),
      )
    })

    it('should create thread in repository for first message', async () => {
      const mockDate = DateTime.fromISO('2024-01-01T12:00:00Z')
      vi.setSystemTime(mockDate.toJSDate())

      useChatStore.setState({
        messages: { list: [], loading: false, error: null, ready: true },
      }) // Ensure empty messages
      ;(browser.getPageContext as Mock).mockResolvedValue(null)

      // Mock assistant to simulate event flow
      ;(mockAssistant.sendMessage as Mock).mockImplementation(({ eventHandler }) => {
        eventHandler({
          type: ProviderMessageEventType.Created,
          messageId: 'assistant-msg-id',
          threadId: 'test-thread-id',
        })
        eventHandler({
          type: ProviderMessageEventType.Completed,
          messageId: 'assistant-msg-id',
          userMessageId: 'user-msg-id',
          threadId: 'test-thread-id',
        })
      })

      const { sendMessage } = useChatStore.getState()

      await sendMessage('Hello')

      expect(repository.createThread).toHaveBeenCalledWith({
        id: 'test-thread-id',
        title: 'Hello',
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
          complete: true,
        },
      ]

      useChatStore.setState({
        messages: { list: existingMessages, loading: false, error: null, ready: true },
      })
      ;(browser.getPageContext as Mock).mockResolvedValue(null)

      // Mock assistant to simulate event flow
      ;(mockAssistant.sendMessage as Mock).mockImplementation(({ eventHandler }) => {
        eventHandler({
          type: ProviderMessageEventType.Created,
          messageId: 'assistant-msg-id',
          threadId: 'test-thread-id',
        })
        eventHandler({
          type: ProviderMessageEventType.Completed,
          messageId: 'assistant-msg-id',
          userMessageId: 'user-msg-id',
          threadId: 'test-thread-id',
        })
      })

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

      // Mock assistant to simulate event flow with tools
      ;(mockAssistant.sendMessage as Mock).mockImplementation(({ eventHandler }) => {
        eventHandler({
          type: ProviderMessageEventType.Fallback,
          messageId: 'assistant-msg-id',
          userMessageId: 'user-msg-id',
          threadId: 'test-thread-id',
          content: [{ type: MessageContentType.OutputText, text: 'Test response', id: '1' }],
          hasTools: true,
        })
      })

      const { sendMessage } = useChatStore.getState()

      await sendMessage('Hello')

      expect(useChatStore.getState().waitingForTools).toBe(true)
    })
  })

  describe('saveFunctionResult', () => {
    beforeEach(() => {
      // Settings and assistant are already set in the main beforeEach
    })

    it('should handle missing assistant gracefully when message is incomplete', async () => {
      useChatStore.setState({ assistant: null })

      const messageWithIncompleteCall: Message = {
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
        complete: false,
      }

      useChatStore.setState({
        messages: { list: [messageWithIncompleteCall], loading: false, error: null, ready: true },
      })

      const { saveFunctionResult } = useChatStore.getState()

      await saveFunctionResult('test-message-id', 'call-1', { success: true })

      const state = useChatStore.getState()
      const functionCall = state.messages.list[0].content[0] as {
        status: FunctionStatus
        result: FunctionCallResult
      }
      expect(functionCall.status).toBe(FunctionStatus.Success)
      expect(functionCall.result).toEqual({ success: true })
    })

    it('should handle missing model gracefully when message is incomplete', async () => {
      useChatStore.setState({
        settings: {
          ready: true,
          loading: false,
          error: null,
          data: null,
        },
      })

      const messageWithIncompleteCall: Message = {
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
        complete: false,
      }

      useChatStore.setState({
        messages: { list: [messageWithIncompleteCall], loading: false, error: null, ready: true },
      })

      const { saveFunctionResult } = useChatStore.getState()

      await saveFunctionResult('test-message-id', 'call-1', { success: true })

      const state = useChatStore.getState()
      const functionCall = state.messages.list[0].content[0] as {
        status: FunctionStatus
        result: FunctionCallResult
      }
      expect(functionCall.status).toBe(FunctionStatus.Success)
      expect(functionCall.result).toEqual({ success: true })
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
            name: FunctionName.ClickElement,
            arguments: {
              element_selector: '#button',
              element_text: 'Click Me',
              element_type: 'button',
            },
          },
        ],
        createdAt: DateTime.now().toISO(),
        complete: true,
      }

      useChatStore.setState({
        messages: { list: [messageWithMultipleCalls], loading: false, error: null, ready: true },
      })

      const { saveFunctionResult } = useChatStore.getState()

      await saveFunctionResult('test-message-id', 'call-1', { success: true })

      const state = useChatStore.getState()
      const functionCall0 = state.messages.list[0].content[0] as {
        status: FunctionStatus
        result: FunctionCallResult
      }
      const functionCall1 = state.messages.list[0].content[1] as { status: FunctionStatus }
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
        complete: true,
      }

      useChatStore.setState({
        messages: { list: [messageWithSingleCall], loading: false, error: null, ready: true },
      })

      // Mock assistant to simulate event flow
      ;(mockAssistant.sendFunctionCallResponse as Mock).mockImplementation(({ eventHandler }) => {
        eventHandler({
          type: ProviderMessageEventType.Created,
          messageId: 'response-id',
          threadId: 'test-thread-id',
        })
        eventHandler({
          type: ProviderMessageEventType.OutputTextDelta,
          messageId: 'response-id',
          threadId: 'test-thread-id',
          contentId: 'content-1',
          textDelta: 'Function completed',
        })
        eventHandler({
          type: ProviderMessageEventType.Completed,
          messageId: 'response-id',
          userMessageId: 'test-message-id',
          threadId: 'test-thread-id',
        })
      })

      const { saveFunctionResult } = useChatStore.getState()

      await saveFunctionResult('test-message-id', 'call-1', { success: true })

      const state = useChatStore.getState()
      expect(state.messages.list).toHaveLength(2)
      const functionCall = state.messages.list[0].content[0] as {
        status: FunctionStatus
        result: FunctionCallResult
      }
      expect(functionCall.status).toBe(FunctionStatus.Success)
      expect(functionCall.result).toEqual({ success: true })
      expect(state.messages.list[1]).toEqual({
        id: 'response-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [
          { type: MessageContentType.OutputText, text: 'Function completed', id: 'content-1' },
        ],
        createdAt: expect.any(String),
        complete: true,
      })
      expect(state.waitingForReply).toBe(false)
      expect(state.waitingForTools).toBe(false)
      expect(mockAssistant.sendFunctionCallResponse).toHaveBeenCalledWith({
        model: AIModel.OpenAI_GPT_5,
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
        eventHandler: expect.any(Function),
        tools: toolsMock,
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
        complete: true,
      }

      useChatStore.setState({
        messages: { list: [messageWithSingleCall], loading: false, error: null, ready: true },
      })

      // Mock assistant to simulate event flow
      ;(mockAssistant.sendFunctionCallResponse as Mock).mockImplementation(({ eventHandler }) => {
        eventHandler({
          type: ProviderMessageEventType.Created,
          messageId: 'response-id',
          threadId: 'test-thread-id',
        })
        eventHandler({
          type: ProviderMessageEventType.OutputTextDelta,
          messageId: 'response-id',
          threadId: 'test-thread-id',
          contentId: 'content-1',
          textDelta: 'Function failed',
        })
        eventHandler({
          type: ProviderMessageEventType.Completed,
          messageId: 'response-id',
          userMessageId: 'test-message-id',
          threadId: 'test-thread-id',
        })
      })

      const { saveFunctionResult } = useChatStore.getState()

      await saveFunctionResult('test-message-id', 'call-1', { success: false, error: 'Test error' })

      const state = useChatStore.getState()
      const functionCall = state.messages.list[0].content[0] as {
        status: FunctionStatus
        result: FunctionCallResult
      }
      expect(functionCall.status).toBe(FunctionStatus.Error)
      expect(functionCall.result).toEqual({ success: false, error: 'Test error' })
    })

    it('should return early when message with given ID is not found', async () => {
      useChatStore.setState({
        messages: { list: [], loading: false, error: null, ready: true },
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
        complete: true,
      }

      const error = new Error('Assistant error')

      useChatStore.setState({
        messages: { list: [messageWithSingleCall], loading: false, error: null, ready: true },
      })
      ;(mockAssistant.sendFunctionCallResponse as Mock).mockRejectedValue(error)

      const { saveFunctionResult } = useChatStore.getState()

      await saveFunctionResult('test-message-id', 'call-1', { success: true })

      const state = useChatStore.getState()
      expect(state.messages.list[0].error).toBe('Assistant error')
      expect(state.waitingForReply).toBe(false)
      expect(state.waitingForTools).toBe(false)
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
        complete: true,
      }

      useChatStore.setState({
        messages: { list: [messageWithSingleCall], loading: false, error: null, ready: true },
      })

      // Mock assistant to simulate event flow with tools
      ;(mockAssistant.sendFunctionCallResponse as Mock).mockImplementation(({ eventHandler }) => {
        eventHandler({
          type: ProviderMessageEventType.Fallback,
          messageId: 'response-id',
          userMessageId: 'test-message-id',
          threadId: 'test-thread-id',
          content: [{ type: MessageContentType.OutputText, text: 'Function completed', id: '1' }],
          hasTools: true,
        })
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
        complete: true,
      }

      useChatStore.setState({
        messages: { list: [messageWithSingleCall], loading: false, error: null, ready: true },
        threadId: 'test-thread-id',
      })

      // Mock assistant to simulate threadId change during execution
      ;(mockAssistant.sendFunctionCallResponse as Mock).mockImplementation(({ eventHandler }) => {
        // Simulate threadId change during execution
        useChatStore.setState({ threadId: 'different-thread-id' })

        // Events for different threadId should be ignored
        eventHandler({
          type: ProviderMessageEventType.Created,
          messageId: 'response-id',
          threadId: 'test-thread-id',
        })
        eventHandler({
          type: ProviderMessageEventType.Completed,
          messageId: 'response-id',
          userMessageId: 'test-message-id',
          threadId: 'test-thread-id',
        })
      })

      const { saveFunctionResult } = useChatStore.getState()

      await saveFunctionResult('test-message-id', 'call-1', { success: true })

      const state = useChatStore.getState()
      expect(state.messages.list).toHaveLength(1) // Should not add response message
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
        complete: true,
      }

      useChatStore.setState({
        messages: { list: [messageWithSingleCall], loading: false, error: null, ready: true },
      })

      // Mock assistant to simulate event flow
      ;(mockAssistant.sendFunctionCallResponse as Mock).mockImplementation(({ eventHandler }) => {
        eventHandler({
          type: ProviderMessageEventType.Created,
          messageId: 'response-id',
          threadId: 'test-thread-id',
        })
        eventHandler({
          type: ProviderMessageEventType.Completed,
          messageId: 'response-id',
          userMessageId: 'test-message-id',
          threadId: 'test-thread-id',
        })
      })

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
            name: FunctionName.ClickElement,
            arguments: {
              element_selector: '#button',
              element_text: 'Click Me',
              element_type: 'button',
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
        complete: true,
      }

      useChatStore.setState({
        messages: { list: [messageWithMultipleCalls], loading: false, error: null, ready: true },
      })

      // Mock assistant to simulate event flow
      ;(mockAssistant.sendFunctionCallResponse as Mock).mockImplementation(({ eventHandler }) => {
        eventHandler({
          type: ProviderMessageEventType.Created,
          messageId: 'response-id',
          threadId: 'test-thread-id',
        })
        eventHandler({
          type: ProviderMessageEventType.OutputTextDelta,
          messageId: 'response-id',
          threadId: 'test-thread-id',
          contentId: 'content-1',
          textDelta: 'All functions completed',
        })
        eventHandler({
          type: ProviderMessageEventType.Completed,
          messageId: 'response-id',
          userMessageId: 'test-message-id',
          threadId: 'test-thread-id',
        })
      })

      const { saveFunctionResult } = useChatStore.getState()

      await saveFunctionResult('test-message-id', 'call-2', { success: true })

      const state = useChatStore.getState()
      expect(state.messages.list).toHaveLength(2)
      const functionCall = state.messages.list[0].content[1] as {
        status: FunctionStatus
        result: FunctionCallResult
      }
      expect(functionCall.status).toBe(FunctionStatus.Success)
      expect(functionCall.result).toEqual({ success: true })
      expect(mockAssistant.sendFunctionCallResponse).toHaveBeenCalled()
    })
  })

  describe('sendFunctionResults', () => {
    beforeEach(() => {
      useChatStore.setState({
        threadId: 'test-thread-id',
      })
    })

    it('should throw error when assistant is not initialized', async () => {
      useChatStore.setState({ assistant: null })

      const mockMessage: Message = {
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
        ],
        createdAt: DateTime.now().toISO(),
        complete: true,
      }

      const { sendFunctionResults } = useChatStore.getState()

      await expect(sendFunctionResults(mockMessage)).rejects.toThrow('Assistant not initialized')
    })

    it('should throw error when model is not selected', async () => {
      useChatStore.setState({
        settings: {
          ready: true,
          loading: false,
          error: null,
          data: null,
        },
      })

      const mockMessage: Message = {
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
        ],
        createdAt: DateTime.now().toISO(),
        complete: true,
      }

      const { sendFunctionResults } = useChatStore.getState()

      await expect(sendFunctionResults(mockMessage)).rejects.toThrow('Assistant not initialized')
    })

    it('should send function results to assistant and handle response', async () => {
      const mockMessage: Message = {
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
        ],
        createdAt: DateTime.now().toISO(),
        complete: true,
      }

      // Mock assistant to simulate event flow
      ;(mockAssistant.sendFunctionCallResponse as Mock).mockImplementation(({ eventHandler }) => {
        eventHandler({
          type: ProviderMessageEventType.Created,
          messageId: 'response-id',
          threadId: 'test-thread-id',
        })
        eventHandler({
          type: ProviderMessageEventType.OutputTextDelta,
          messageId: 'response-id',
          threadId: 'test-thread-id',
          contentId: 'content-1',
          textDelta: 'Function completed successfully',
        })
        eventHandler({
          type: ProviderMessageEventType.Completed,
          messageId: 'response-id',
          userMessageId: 'test-message-id',
          threadId: 'test-thread-id',
        })
      })

      const { sendFunctionResults } = useChatStore.getState()

      await sendFunctionResults(mockMessage)

      const state = useChatStore.getState()
      expect(state.messages.list).toHaveLength(1)
      expect(state.messages.list[0]).toEqual({
        id: 'response-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [
          {
            type: MessageContentType.OutputText,
            text: 'Function completed successfully',
            id: 'content-1',
          },
        ],
        createdAt: expect.any(String),
        complete: true,
      })
      expect(state.waitingForReply).toBe(false)
      expect(state.waitingForTools).toBe(false)
      expect(mockAssistant.sendFunctionCallResponse).toHaveBeenCalledWith({
        model: AIModel.OpenAI_GPT_5,
        message: mockMessage,
        eventHandler: expect.any(Function),
        tools: toolsMock,
      })
    })

    it('should set waiting states correctly during function result sending', async () => {
      let resolvePromise: () => void
      const promise = new Promise<void>(resolve => {
        resolvePromise = resolve
      })

      const mockMessage: Message = {
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
        ],
        createdAt: DateTime.now().toISO(),
        complete: true,
      }

      ;(mockAssistant.sendFunctionCallResponse as Mock).mockImplementation(
        async ({ eventHandler }) => {
          await promise
          eventHandler({
            type: ProviderMessageEventType.Created,
            messageId: 'response-id',
            threadId: 'test-thread-id',
          })
          eventHandler({
            type: ProviderMessageEventType.Completed,
            messageId: 'response-id',
            userMessageId: 'test-message-id',
            threadId: 'test-thread-id',
          })
        },
      )

      const { sendFunctionResults } = useChatStore.getState()

      const sendPromise = sendFunctionResults(mockMessage)

      // Check that waiting states are set correctly
      expect(useChatStore.getState().waitingForReply).toBe(true)
      expect(useChatStore.getState().waitingForTools).toBe(false)

      resolvePromise!()
      await sendPromise

      expect(useChatStore.getState().waitingForReply).toBe(false)
    })

    it('should handle sendFunctionCallResponse error', async () => {
      const mockMessage: Message = {
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
        ],
        createdAt: DateTime.now().toISO(),
        complete: true,
      }

      const error = new Error('Function response error')
      ;(mockAssistant.sendFunctionCallResponse as Mock).mockRejectedValue(error)

      const { sendFunctionResults } = useChatStore.getState()

      await sendFunctionResults(mockMessage)

      // The error should be handled by handleMessageError
      expect(mockAssistant.sendFunctionCallResponse).toHaveBeenCalledWith({
        model: AIModel.OpenAI_GPT_5,
        message: mockMessage,
        eventHandler: expect.any(Function),
        tools: toolsMock,
      })
    })
  })

  describe('stopMessage', () => {
    beforeEach(() => {
      // Assistant is already set in the main beforeEach
    })

    it('should reset waiting states and cancel active request', () => {
      useChatStore.setState({
        waitingForReply: true,
        waitingForTools: true,
      })

      const { stopMessage } = useChatStore.getState()

      stopMessage()

      const state = useChatStore.getState()
      expect(state.waitingForReply).toBe(false)
      expect(state.waitingForTools).toBe(false)

      expect(mockAssistant.cancelActiveRequest).toHaveBeenCalled()
    })
  })

  describe('handleMessageError', () => {
    const mockMessage: Message = {
      id: 'user-message-id',
      threadId: 'test-thread-id',
      role: MessageRole.User,
      content: [{ type: MessageContentType.OutputText, text: 'Hello', id: 'content-1' }],
      createdAt: DateTime.now().toISO() || '',
      complete: true,
    }

    beforeEach(() => {
      useChatStore.setState({
        threadId: 'test-thread-id',
        messages: { list: [mockMessage], loading: false, error: null, ready: true },
        waitingForReply: true,
        waitingForTools: true,
      })
    })

    it('should handle error and reset waiting states', () => {
      const error = new Error('Test error')
      const { handleMessageError } = useChatStore.getState()

      handleMessageError('test-thread-id', error, 'user-message-id', undefined)

      const state = useChatStore.getState()
      expect(state.messages.list[0].error).toBe('Test error')
      expect(state.waitingForReply).toBe(false)
      expect(state.waitingForTools).toBe(false)
    })

    it('should handle error with assistant message ID', () => {
      const assistantMessage: Message = {
        id: 'assistant-message-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [{ type: MessageContentType.OutputText, text: 'Response', id: 'content-2' }],
        createdAt: DateTime.now().toISO(),
        complete: true,
      }

      useChatStore.setState({
        messages: {
          list: [mockMessage, assistantMessage],
          loading: false,
          error: null,
          ready: true,
        },
      })

      const error = new Error('Assistant error')
      const { handleMessageError } = useChatStore.getState()

      handleMessageError('test-thread-id', error, 'user-message-id', 'assistant-message-id')

      const state = useChatStore.getState()
      expect(state.messages.list[1].error).toBe('Assistant error')
      expect(state.waitingForReply).toBe(false)
      expect(state.waitingForTools).toBe(false)
    })

    it('should return early if threadId does not match', () => {
      const error = new Error('Test error')
      const { handleMessageError } = useChatStore.getState()

      handleMessageError('different-thread-id', error, 'user-message-id', undefined)

      const state = useChatStore.getState()
      expect(state.messages.list[0].error).toBeUndefined()
      expect(state.waitingForReply).toBe(true)
      expect(state.waitingForTools).toBe(true)
    })

    it('should handle string error', () => {
      const error = 'String error message'
      const { handleMessageError } = useChatStore.getState()

      handleMessageError('test-thread-id', error, 'user-message-id', undefined)

      const state = useChatStore.getState()
      expect(state.messages.list[0].error).toBe('String error message')
      expect(state.waitingForReply).toBe(false)
      expect(state.waitingForTools).toBe(false)
    })

    it('should handle unknown error types', () => {
      const error = { custom: 'error object' }
      const { handleMessageError } = useChatStore.getState()

      handleMessageError('test-thread-id', error, 'user-message-id', undefined)

      const state = useChatStore.getState()
      expect(state.messages.list[0].error).toBe('Unknown error')
      expect(state.waitingForReply).toBe(false)
      expect(state.waitingForTools).toBe(false)
    })
  })

  describe('handleMessageEvent', () => {
    beforeEach(() => {
      useChatStore.setState({
        threadId: 'test-thread-id',
        messages: { list: [], loading: false, error: null, ready: true },
        waitingForReply: false,
        waitingForTools: false,
      })
    })

    it('should return early if threadId does not match', () => {
      const { handleMessageEvent } = useChatStore.getState()

      handleMessageEvent({
        type: ProviderMessageEventType.Created,
        messageId: 'message-id',
        threadId: 'different-thread-id',
      })

      const state = useChatStore.getState()
      expect(state.messages.list).toHaveLength(0)
    })

    it('should handle Created event', () => {
      const mockDate = DateTime.fromISO('2024-01-01T12:00:00Z')
      vi.setSystemTime(mockDate.toJSDate())

      const { handleMessageEvent } = useChatStore.getState()

      handleMessageEvent({
        type: ProviderMessageEventType.Created,
        messageId: 'assistant-message-id',
        threadId: 'test-thread-id',
      })

      const state = useChatStore.getState()
      expect(state.messages.list).toHaveLength(1)
      expect(state.messages.list[0]).toEqual({
        id: 'assistant-message-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [],
        createdAt: mockDate.toISO(),
        complete: false,
      })
    })

    it('should handle OutputTextDelta event', () => {
      const mockDate = '2024-01-01T12:00:00Z'
      vi.setSystemTime(new Date(mockDate))

      const existingMessage: Message = {
        id: 'assistant-message-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [{ type: MessageContentType.OutputText, text: 'Hello', id: 'content-1' }],
        createdAt: mockDate,
        complete: true,
      }

      useChatStore.setState({
        messages: { list: [existingMessage], loading: false, error: null, ready: true },
      })

      const { handleMessageEvent } = useChatStore.getState()

      handleMessageEvent({
        type: ProviderMessageEventType.OutputTextDelta,
        messageId: 'assistant-message-id',
        threadId: 'test-thread-id',
        contentId: 'content-1',
        textDelta: ' World',
      })

      const state = useChatStore.getState()
      expect(state.messages.list[0].content[0]).toEqual({
        type: MessageContentType.OutputText,
        text: 'Hello World',
        id: 'content-1',
      })
    })

    it('should handle FunctionCallAdded event', () => {
      const mockDate = '2024-01-01T12:00:00Z'
      vi.setSystemTime(new Date(mockDate))

      const existingMessage: Message = {
        id: 'assistant-message-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [],
        createdAt: mockDate,
        complete: true,
      }

      useChatStore.setState({
        messages: { list: [existingMessage], loading: false, error: null, ready: true },
      })

      const functionCallContent: FunctionCallContent = {
        id: 'call-1',
        type: MessageContentType.FunctionCall,
        name: FunctionName.Placeholder,
      }

      const { handleMessageEvent } = useChatStore.getState()

      handleMessageEvent({
        type: ProviderMessageEventType.FunctionCallAdded,
        messageId: 'assistant-message-id',
        threadId: 'test-thread-id',
        content: functionCallContent,
      })

      const state = useChatStore.getState()
      expect(state.messages.list[0].content[0]).toEqual(functionCallContent)
      expect(state.waitingForTools).toBe(true)
    })

    it('should handle FunctionCallDone event', () => {
      const mockDate = '2024-01-01T12:00:00Z'
      vi.setSystemTime(new Date(mockDate))

      const existingMessage: Message = {
        id: 'assistant-message-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [
          {
            id: 'call-1',
            type: MessageContentType.FunctionCall,
            name: FunctionName.Placeholder,
          },
        ],
        createdAt: mockDate,
        complete: true,
      }

      useChatStore.setState({
        messages: { list: [existingMessage], loading: false, error: null, ready: true },
      })

      const functionCallContent: FunctionCallContent = {
        id: 'call-1',
        type: MessageContentType.FunctionCall,
        status: FunctionStatus.Idle,
        name: FunctionName.FillInput,
        arguments: {
          input_type: 'text',
          input_value: 'test',
          input_selector: '#input',
          label_value: 'Test Input',
        },
      }

      const { handleMessageEvent } = useChatStore.getState()

      handleMessageEvent({
        type: ProviderMessageEventType.FunctionCallDone,
        messageId: 'assistant-message-id',
        threadId: 'test-thread-id',
        content: functionCallContent,
      })

      const state = useChatStore.getState()
      expect(state.messages.list[0].content[0]).toEqual(functionCallContent)
      expect(state.waitingForTools).toBe(true)
    })

    it('should handle Completed event', async () => {
      const mockDate = '2024-01-01T12:00:00Z'
      vi.setSystemTime(new Date(mockDate))

      const existingMessage: Message = {
        id: 'assistant-message-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [{ type: MessageContentType.OutputText, text: 'Hello', id: 'content-1' }],
        createdAt: mockDate,
        complete: true,
      }

      useChatStore.setState({
        messages: { list: [existingMessage], loading: false, error: null, ready: true },
        waitingForReply: true,
      })

      const { handleMessageEvent } = useChatStore.getState()

      handleMessageEvent({
        type: ProviderMessageEventType.Completed,
        messageId: 'assistant-message-id',
        userMessageId: 'user-message-id',
        threadId: 'test-thread-id',
      })

      // Wait for async saveMessageToRepository to complete
      await new Promise(resolve => setTimeout(resolve, 0))

      const state = useChatStore.getState()
      expect(state.waitingForReply).toBe(false)
      expect(repository.createMessage).toHaveBeenCalledWith({
        ...existingMessage,
        history: true,
      })
    })

    it('should handle Completed event and call sendFunctionResults when message has completed functions', async () => {
      const mockDate = '2024-01-01T12:00:00Z'
      vi.setSystemTime(new Date(mockDate))

      const existingMessage: Message = {
        id: 'assistant-message-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: [
          {
            type: MessageContentType.FunctionCall,
            id: 'call-1',
            name: FunctionName.FillInput,
            status: FunctionStatus.Success,
            arguments: {
              input_type: 'text',
              input_value: 'test',
              input_selector: '#input',
              label_value: 'Test Input',
            },
            result: { success: true },
          },
        ],
        createdAt: mockDate,
        complete: true,
      }

      useChatStore.setState({
        messages: { list: [existingMessage], loading: false, error: null, ready: true },
        waitingForReply: true,
      })

      // Mock assistant to simulate event flow
      ;(mockAssistant.sendFunctionCallResponse as Mock).mockImplementation(({ eventHandler }) => {
        eventHandler({
          type: ProviderMessageEventType.Created,
          messageId: 'response-id',
          threadId: 'test-thread-id',
        })
        eventHandler({
          type: ProviderMessageEventType.Completed,
          messageId: 'response-id',
          userMessageId: 'assistant-message-id',
          threadId: 'test-thread-id',
        })
      })

      const { handleMessageEvent } = useChatStore.getState()

      handleMessageEvent({
        type: ProviderMessageEventType.Completed,
        messageId: 'assistant-message-id',
        userMessageId: 'user-message-id',
        threadId: 'test-thread-id',
      })

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0))

      const state = useChatStore.getState()
      expect(state.waitingForReply).toBe(false)
      expect(repository.createMessage).toHaveBeenCalledWith({
        ...existingMessage,
        history: true,
      })
      expect(mockAssistant.sendFunctionCallResponse).toHaveBeenCalledWith({
        model: AIModel.OpenAI_GPT_5,
        message: existingMessage,
        eventHandler: expect.any(Function),
        tools: toolsMock,
      })
    })

    it('should handle Completed event when message not found', () => {
      useChatStore.setState({
        messages: { list: [], loading: false, error: null, ready: true },
        waitingForReply: true,
      })

      const { handleMessageEvent } = useChatStore.getState()

      handleMessageEvent({
        type: ProviderMessageEventType.Completed,
        messageId: 'non-existent-message-id',
        userMessageId: 'user-message-id',
        threadId: 'test-thread-id',
      })

      const state = useChatStore.getState()
      expect(state.waitingForReply).toBe(false)
      expect(repository.createMessage).not.toHaveBeenCalled()
    })

    it('should handle Error event', () => {
      const mockHandleMessageError = vi.fn()
      useChatStore.setState({
        handleMessageError: mockHandleMessageError,
      })

      const { handleMessageEvent } = useChatStore.getState()

      handleMessageEvent({
        type: ProviderMessageEventType.Error,
        messageId: 'assistant-message-id',
        userMessageId: 'user-message-id',
        threadId: 'test-thread-id',
        error: 'Test error',
      })

      expect(mockHandleMessageError).toHaveBeenCalledWith(
        'test-thread-id',
        'Test error',
        'user-message-id',
        'assistant-message-id',
      )
    })

    it('should handle Fallback event without tools', async () => {
      const mockDate = DateTime.fromISO('2024-01-01T12:00:00Z')
      vi.setSystemTime(mockDate.toJSDate())

      const { handleMessageEvent } = useChatStore.getState()

      const fallbackContent: MessageContent[] = [
        { type: MessageContentType.OutputText, text: 'Fallback response', id: 'content-1' },
      ]

      handleMessageEvent({
        type: ProviderMessageEventType.Fallback,
        messageId: 'assistant-message-id',
        userMessageId: 'user-message-id',
        threadId: 'test-thread-id',
        content: fallbackContent,
        hasTools: false,
      })

      // Wait for async saveMessageToRepository to complete
      await new Promise(resolve => setTimeout(resolve, 0))

      const state = useChatStore.getState()
      expect(state.messages.list).toHaveLength(1)
      expect(state.messages.list[0]).toEqual({
        id: 'assistant-message-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: fallbackContent,
        createdAt: mockDate.toISO(),
        complete: true,
      })
      expect(state.waitingForReply).toBe(false)
      expect(state.waitingForTools).toBe(false)
      expect(repository.createMessage).toHaveBeenCalledWith({
        ...state.messages.list[0],
        history: true,
      })
    })

    it('should handle Fallback event with tools', async () => {
      const mockDate = DateTime.fromISO('2024-01-01T12:00:00Z')
      vi.setSystemTime(mockDate.toJSDate())

      const { handleMessageEvent } = useChatStore.getState()

      const fallbackContent: MessageContent[] = []

      handleMessageEvent({
        type: ProviderMessageEventType.Fallback,
        messageId: 'assistant-message-id',
        userMessageId: 'user-message-id',
        threadId: 'test-thread-id',
        content: fallbackContent,
        hasTools: true,
      })

      // Wait for async saveMessageToRepository to complete
      await new Promise(resolve => setTimeout(resolve, 0))

      const state = useChatStore.getState()
      expect(state.messages.list).toHaveLength(1)
      expect(state.messages.list[0]).toMatchObject({
        id: 'assistant-message-id',
        threadId: 'test-thread-id',
        role: MessageRole.Assistant,
        content: fallbackContent,
        createdAt: mockDate.toISO(),
        complete: true,
      })
      expect(state.waitingForReply).toBe(false)
      expect(state.waitingForTools).toBe(true)
      expect(repository.createMessage).toHaveBeenCalledWith({
        ...state.messages.list[0],
        history: true,
      })
    })
  })
})
