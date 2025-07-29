import { describe, it, expect, vi, beforeEach } from 'vitest'

import {
  MessageContentType,
  MessageRole,
  type MessageContent,
  type Message,
} from '@/types/chat.types'
import { FunctionName, FunctionStatus, type FunctionCallResult } from '@/types/tool.types'
import type { StoreMessages } from '@/stores/useChatStore.types'

import {
  addMessage,
  addMessageContent,
  appendMessageTextContent,
  setMessageError,
  setMessageComplete,
  updateMessageFunctionResult,
  saveMessageToRepository,
  updateMessageInRepository,
} from './messageSlice.utils'

import repository from '@/services/repository'

vi.mock('@/services/repository', () => ({
  default: {
    createThread: vi.fn(),
    updateThread: vi.fn(),
    createMessage: vi.fn(),
    updateMessage: vi.fn(),
  },
}))

describe('messageSlice.utils', () => {
  const mockDate = '2024-01-01T12:00:00Z'

  const mockMessage: Message = {
    id: 'test-message-id',
    role: MessageRole.User,
    content: [{ type: MessageContentType.OutputText, text: 'Hello', id: 'content-1' }],
    createdAt: mockDate,
    threadId: 'test-thread-id',
    complete: true,
  }

  const mockAssistantMessage: Message = {
    id: 'assistant-message-id',
    role: MessageRole.Assistant,
    content: [{ type: MessageContentType.OutputText, text: 'Hi there', id: 'content-2' }],
    createdAt: mockDate,
    threadId: 'test-thread-id',
    complete: true,
  }

  const mockMessages: StoreMessages = {
    list: [mockMessage],
    loading: false,
    error: null,
    ready: true,
  }

  describe('addMessage', () => {
    it('should add message to empty list', () => {
      const emptyMessages: StoreMessages = {
        list: [],
        loading: false,
        error: null,
        ready: true,
      }

      const result = addMessage(emptyMessages, mockMessage)

      expect(result).toEqual({
        list: [mockMessage],
        loading: false,
        error: null,
        ready: true,
      })
    })

    it('should add message to existing list', () => {
      const result = addMessage(mockMessages, mockAssistantMessage)

      expect(result).toEqual({
        list: [mockMessage, mockAssistantMessage],
        loading: false,
        error: null,
        ready: true,
      })
    })

    it('should maintain immutability', () => {
      const result = addMessage(mockMessages, mockAssistantMessage)

      expect(result).not.toBe(mockMessages)
      expect(result.list).not.toBe(mockMessages.list)
      expect(result.list[0]).toBe(mockMessage)
    })
  })

  describe('addMessageContent', () => {
    it('should add content to existing message', () => {
      const newContent: MessageContent = {
        type: MessageContentType.OutputText,
        text: 'Additional content',
        id: 'content-3',
      }

      const result = addMessageContent(mockMessages, 'test-message-id', newContent)

      expect(result.list[0].content).toEqual([
        { type: MessageContentType.OutputText, text: 'Hello', id: 'content-1' },
        { type: MessageContentType.OutputText, text: 'Additional content', id: 'content-3' },
      ])
    })

    it('should not modify other messages', () => {
      const messagesWithMultiple: StoreMessages = {
        list: [mockMessage, mockAssistantMessage],
        loading: false,
        error: null,
        ready: true,
      }

      const newContent: MessageContent = {
        type: MessageContentType.OutputText,
        text: 'Additional content',
        id: 'content-3',
      }

      const result = addMessageContent(messagesWithMultiple, 'test-message-id', newContent)

      expect(result.list[0].content).toHaveLength(2)
      expect(result.list[1].content).toHaveLength(1)
      expect(result.list[1]).toBe(mockAssistantMessage)
    })

    it('should handle non-existent message ID', () => {
      const newContent: MessageContent = {
        type: MessageContentType.OutputText,
        text: 'Additional content',
        id: 'content-3',
      }

      const result = addMessageContent(mockMessages, 'non-existent-id', newContent)

      expect(result.list[0].content).toHaveLength(1)
      expect(result.list[0].content[0]).toEqual({
        type: MessageContentType.OutputText,
        text: 'Hello',
        id: 'content-1',
      })
    })

    it('should maintain immutability', () => {
      const newContent: MessageContent = {
        type: MessageContentType.OutputText,
        text: 'Additional content',
        id: 'content-3',
      }

      const result = addMessageContent(mockMessages, 'test-message-id', newContent)

      expect(result).not.toBe(mockMessages)
      expect(result.list).not.toBe(mockMessages.list)
      expect(result.list[0]).not.toBe(mockMessage)
      expect(result.list[0].content).not.toBe(mockMessage.content)
    })
  })

  describe('appendMessageTextContent', () => {
    it('should append text to existing content', () => {
      const result = appendMessageTextContent(
        mockMessages,
        'test-message-id',
        'content-1',
        ' World',
      )

      expect(result.list[0].content[0]).toEqual({
        type: MessageContentType.OutputText,
        text: 'Hello World',
        id: 'content-1',
      })
    })

    it('should create new content if contentId does not exist', () => {
      const result = appendMessageTextContent(
        mockMessages,
        'test-message-id',
        'new-content-id',
        'New text',
      )

      expect(result.list[0].content).toHaveLength(2)
      expect(result.list[0].content[1]).toEqual({
        type: MessageContentType.OutputText,
        text: 'New text',
        id: 'new-content-id',
      })
    })

    it('should not modify message if messageId does not exist', () => {
      const result = appendMessageTextContent(
        mockMessages,
        'non-existent-id',
        'content-1',
        ' World',
      )

      expect(result.list[0].content[0]).toEqual({
        type: MessageContentType.OutputText,
        text: 'Hello',
        id: 'content-1',
      })
    })

    it('should only append to OutputText content types', () => {
      const messageWithFunctionCall: Message = {
        id: 'function-message-id',
        role: MessageRole.Assistant,
        content: [
          {
            type: MessageContentType.FunctionCall,
            id: 'function-1',
            name: FunctionName.FillInput,
            status: FunctionStatus.Pending,
            arguments: {
              input_type: 'text',
              input_value: 'test',
              input_selector: 'input',
              label_value: 'test',
            },
          },
        ],
        createdAt: mockDate,
        threadId: 'test-thread-id',
        complete: true,
      }

      const messagesWithFunction: StoreMessages = {
        list: [messageWithFunctionCall],
        loading: false,
        error: null,
        ready: true,
      }

      const result = appendMessageTextContent(
        messagesWithFunction,
        'function-message-id',
        'function-1',
        'text',
      )

      expect(result.list[0].content[0]).toEqual({
        type: MessageContentType.FunctionCall,
        id: 'function-1',
        name: FunctionName.FillInput,
        status: FunctionStatus.Pending,
        arguments: {
          input_type: 'text',
          input_value: 'test',
          input_selector: 'input',
          label_value: 'test',
        },
      })
    })

    it('should handle multiple messages correctly', () => {
      const messagesWithMultiple: StoreMessages = {
        list: [mockMessage, mockAssistantMessage],
        loading: false,
        error: null,
        ready: true,
      }

      const result = appendMessageTextContent(
        messagesWithMultiple,
        'assistant-message-id',
        'content-2',
        '!',
      )

      expect(result.list[0].content[0]).toEqual({
        type: MessageContentType.OutputText,
        text: 'Hello',
        id: 'content-1',
      })
      expect(result.list[1].content[0]).toEqual({
        type: MessageContentType.OutputText,
        text: 'Hi there!',
        id: 'content-2',
      })
    })

    it('should maintain immutability', () => {
      const result = appendMessageTextContent(
        mockMessages,
        'test-message-id',
        'content-1',
        ' World',
      )

      expect(result).not.toBe(mockMessages)
      expect(result.list).not.toBe(mockMessages.list)
      expect(result.list[0]).not.toBe(mockMessage)
      expect(result.list[0].content).not.toBe(mockMessage.content)
      expect(result.list[0].content[0]).not.toBe(mockMessage.content[0])
    })
  })

  describe('setMessageError', () => {
    it('should set error on user message when no assistant message ID provided', () => {
      const error = new Error('Test error')
      const result = setMessageError(mockMessages, error, 'test-message-id')

      expect(result.list[0].error).toBe('Test error')
      expect(result.list[0].hasError).toBe(true)
    })

    it('should set error on assistant message when assistant message ID provided', () => {
      const messagesWithMultiple: StoreMessages = {
        list: [mockMessage, mockAssistantMessage],
        loading: false,
        error: null,
        ready: true,
      }

      const error = new Error('Test error')
      const result = setMessageError(
        messagesWithMultiple,
        error,
        'test-message-id',
        'assistant-message-id',
      )

      expect(result.list[0].error).toBeUndefined()
      expect(result.list[0].hasError).toBe(true)
      expect(result.list[1].error).toBe('Test error')
      expect(result.list[1].hasError).toBe(true)
    })

    it('should handle string error', () => {
      const error = 'String error'
      const result = setMessageError(mockMessages, error, 'test-message-id')

      expect(result.list[0].error).toBe('String error')
      expect(result.list[0].hasError).toBe(true)
    })

    it('should handle unknown error types', () => {
      const error = { message: 'Object error' }
      const result = setMessageError(mockMessages, error, 'test-message-id')

      expect(result.list[0].error).toBe('Unknown error')
      expect(result.list[0].hasError).toBe(true)
    })

    it('should handle null/undefined errors', () => {
      const result = setMessageError(mockMessages, null, 'test-message-id')

      expect(result.list[0].error).toBe('Unknown error')
      expect(result.list[0].hasError).toBe(true)
    })

    it('should handle undefined errors', () => {
      const result = setMessageError(mockMessages, undefined, 'test-message-id')

      expect(result.list[0].error).toBe('Unknown error')
      expect(result.list[0].hasError).toBe(true)
    })

    it('should not modify other messages', () => {
      const messagesWithMultiple: StoreMessages = {
        list: [mockMessage, mockAssistantMessage],
        loading: false,
        error: null,
        ready: true,
      }

      const error = new Error('Test error')
      const result = setMessageError(messagesWithMultiple, error, 'test-message-id')

      expect(result.list[0].error).toBe('Test error')
      expect(result.list[0].hasError).toBe(true)
      expect(result.list[1]).toBe(mockAssistantMessage)
      expect(result.list[1].error).toBeUndefined()
      expect(result.list[1].hasError).toBeUndefined()
    })

    it('should handle non-existent message ID', () => {
      const error = new Error('Test error')
      const result = setMessageError(mockMessages, error, 'non-existent-id')

      expect(result.list[0].error).toBeUndefined()
      expect(result.list[0].hasError).toBeUndefined()
    })

    it('should maintain immutability', () => {
      const error = new Error('Test error')
      const result = setMessageError(mockMessages, error, 'test-message-id')

      expect(result).not.toBe(mockMessages)
      expect(result.list).not.toBe(mockMessages.list)
      expect(result.list[0]).not.toBe(mockMessage)
    })
  })

  describe('updateMessageFunctionResult', () => {
    const mockMessageWithFunctionCall: Message = {
      id: 'function-message-id',
      role: MessageRole.Assistant,
      content: [
        {
          type: MessageContentType.FunctionCall,
          id: 'function-call-1',
          name: FunctionName.FillInput,
          status: FunctionStatus.Pending,
          arguments: {
            input_type: 'text',
            input_value: 'test',
            input_selector: 'input',
            label_value: 'test',
          },
        },
        {
          type: MessageContentType.OutputText,
          text: 'Some text',
          id: 'text-content-1',
        },
      ],
      createdAt: mockDate,
      threadId: 'test-thread-id',
      complete: true,
    }

    const mockMessagesWithFunctionCall: StoreMessages = {
      list: [mockMessageWithFunctionCall],
      loading: false,
      error: null,
      ready: true,
    }

    it('should update function result with success status', () => {
      const functionResult: FunctionCallResult = {
        success: true,
      }

      const result = updateMessageFunctionResult(
        mockMessagesWithFunctionCall,
        'function-message-id',
        'function-call-1',
        functionResult,
      )

      expect(result.list[0].content[0]).toEqual({
        type: MessageContentType.FunctionCall,
        id: 'function-call-1',
        name: FunctionName.FillInput,
        status: FunctionStatus.Success,
        result: functionResult,
        arguments: {
          input_type: 'text',
          input_value: 'test',
          input_selector: 'input',
          label_value: 'test',
        },
      })
    })

    it('should update function result with error status', () => {
      const functionResult: FunctionCallResult = {
        success: false,
        error: 'Function execution failed',
      }

      const result = updateMessageFunctionResult(
        mockMessagesWithFunctionCall,
        'function-message-id',
        'function-call-1',
        functionResult,
      )

      expect(result.list[0].content[0]).toEqual({
        type: MessageContentType.FunctionCall,
        id: 'function-call-1',
        name: FunctionName.FillInput,
        status: FunctionStatus.Error,
        result: functionResult,
        arguments: {
          input_type: 'text',
          input_value: 'test',
          input_selector: 'input',
          label_value: 'test',
        },
      })
    })

    it('should not modify other content items in the same message', () => {
      const functionResult: FunctionCallResult = {
        success: true,
      }

      const result = updateMessageFunctionResult(
        mockMessagesWithFunctionCall,
        'function-message-id',
        'function-call-1',
        functionResult,
      )

      expect(result.list[0].content[1]).toBe(mockMessageWithFunctionCall.content[1])
    })

    it('should not modify other messages', () => {
      const messagesWithMultiple: StoreMessages = {
        list: [mockMessage, mockMessageWithFunctionCall],
        loading: false,
        error: null,
        ready: true,
      }

      const functionResult: FunctionCallResult = {
        success: true,
      }

      const result = updateMessageFunctionResult(
        messagesWithMultiple,
        'function-message-id',
        'function-call-1',
        functionResult,
      )

      expect(result.list[0]).toBe(mockMessage)
      expect(result.list[1].content[0]).toEqual({
        type: MessageContentType.FunctionCall,
        id: 'function-call-1',
        name: FunctionName.FillInput,
        status: FunctionStatus.Success,
        result: functionResult,
        arguments: {
          input_type: 'text',
          input_value: 'test',
          input_selector: 'input',
          label_value: 'test',
        },
      })
    })

    it('should handle non-existent message ID', () => {
      const functionResult: FunctionCallResult = {
        success: true,
      }

      const result = updateMessageFunctionResult(
        mockMessagesWithFunctionCall,
        'non-existent-message-id',
        'function-call-1',
        functionResult,
      )

      expect(result.list[0].content[0]).toEqual({
        type: MessageContentType.FunctionCall,
        id: 'function-call-1',
        name: FunctionName.FillInput,
        status: FunctionStatus.Pending,
        arguments: {
          input_type: 'text',
          input_value: 'test',
          input_selector: 'input',
          label_value: 'test',
        },
      })
    })

    it('should handle non-existent call ID', () => {
      const functionResult: FunctionCallResult = {
        success: true,
      }

      const result = updateMessageFunctionResult(
        mockMessagesWithFunctionCall,
        'function-message-id',
        'non-existent-call-id',
        functionResult,
      )

      expect(result.list[0].content[0]).toEqual({
        type: MessageContentType.FunctionCall,
        id: 'function-call-1',
        name: FunctionName.FillInput,
        status: FunctionStatus.Pending,
        arguments: {
          input_type: 'text',
          input_value: 'test',
          input_selector: 'input',
          label_value: 'test',
        },
      })
    })

    it('should handle message with multiple function calls', () => {
      const messageWithMultipleFunctionCalls: Message = {
        id: 'multi-function-message-id',
        role: MessageRole.Assistant,
        content: [
          {
            type: MessageContentType.FunctionCall,
            id: 'function-call-1',
            name: FunctionName.FillInput,
            status: FunctionStatus.Pending,
            arguments: {
              input_type: 'text',
              input_value: 'test',
              input_selector: 'input',
              label_value: 'test',
            },
          },
          {
            type: MessageContentType.FunctionCall,
            id: 'function-call-2',
            name: FunctionName.ClickElement,
            status: FunctionStatus.Pending,
            arguments: {
              element_selector: 'button',
              element_text: 'Click me',
              element_type: 'button',
            },
          },
        ],
        createdAt: mockDate,
        threadId: 'test-thread-id',
        complete: true,
      }

      const messagesWithMultipleFunctionCalls: StoreMessages = {
        list: [messageWithMultipleFunctionCalls],
        loading: false,
        error: null,
        ready: true,
      }

      const functionResult: FunctionCallResult = {
        success: true,
      }

      const result = updateMessageFunctionResult(
        messagesWithMultipleFunctionCalls,
        'multi-function-message-id',
        'function-call-2',
        functionResult,
      )

      expect(result.list[0].content[0]).toEqual({
        type: MessageContentType.FunctionCall,
        id: 'function-call-1',
        name: FunctionName.FillInput,
        status: FunctionStatus.Pending,
        arguments: {
          input_type: 'text',
          input_value: 'test',
          input_selector: 'input',
          label_value: 'test',
        },
      })

      expect(result.list[0].content[1]).toEqual({
        type: MessageContentType.FunctionCall,
        id: 'function-call-2',
        name: FunctionName.ClickElement,
        status: FunctionStatus.Success,
        result: functionResult,
        arguments: {
          element_selector: 'button',
          element_text: 'Click me',
          element_type: 'button',
        },
      })
    })

    it('should maintain immutability', () => {
      const functionResult: FunctionCallResult = {
        success: true,
      }

      const result = updateMessageFunctionResult(
        mockMessagesWithFunctionCall,
        'function-message-id',
        'function-call-1',
        functionResult,
      )

      expect(result).not.toBe(mockMessagesWithFunctionCall)
      expect(result.list).not.toBe(mockMessagesWithFunctionCall.list)
      expect(result.list[0]).not.toBe(mockMessageWithFunctionCall)
      expect(result.list[0].content).not.toBe(mockMessageWithFunctionCall.content)
      expect(result.list[0].content[0]).not.toBe(mockMessageWithFunctionCall.content[0])
    })
  })

  describe('setMessageComplete', () => {
    it('should set message complete to true for existing message', () => {
      const incompleteMessage: Message = {
        ...mockMessage,
        complete: false,
      }

      const messagesWithIncompleteMessage: StoreMessages = {
        list: [incompleteMessage],
        loading: false,
        error: null,
        ready: true,
      }

      const result = setMessageComplete(messagesWithIncompleteMessage, 'test-message-id')

      expect(result.list[0].complete).toBe(true)
      expect(result.list[0]).toEqual({
        ...incompleteMessage,
        complete: true,
      })
    })

    it('should handle non-existent message ID', () => {
      const result = setMessageComplete(mockMessages, 'non-existent-id')

      expect(result.list[0].complete).toBe(true)
      expect(result.list[0]).toEqual(mockMessage)
    })

    it('should not modify other messages', () => {
      const incompleteMessage: Message = {
        ...mockMessage,
        id: 'incomplete-message-id',
        complete: false,
      }

      const messagesWithMultiple: StoreMessages = {
        list: [mockMessage, incompleteMessage],
        loading: false,
        error: null,
        ready: true,
      }

      const result = setMessageComplete(messagesWithMultiple, 'incomplete-message-id')

      expect(result.list[0].complete).toBe(true)
      expect(result.list[0]).toBe(mockMessage)
      expect(result.list[1].complete).toBe(true)
      expect(result.list[1]).toEqual({
        ...incompleteMessage,
        complete: true,
      })
    })

    it('should work with messages that are already complete', () => {
      const result = setMessageComplete(mockMessages, 'test-message-id')

      expect(result.list[0].complete).toBe(true)
      expect(result.list[0]).toEqual({
        ...mockMessage,
        complete: true,
      })
    })

    it('should maintain immutability', () => {
      const incompleteMessage: Message = {
        ...mockMessage,
        complete: false,
      }

      const messagesWithIncompleteMessage: StoreMessages = {
        list: [incompleteMessage],
        loading: false,
        error: null,
        ready: true,
      }

      const result = setMessageComplete(messagesWithIncompleteMessage, 'test-message-id')

      expect(result).not.toBe(messagesWithIncompleteMessage)
      expect(result.list).not.toBe(messagesWithIncompleteMessage.list)
      expect(result.list[0]).not.toBe(incompleteMessage)
    })

    it('should preserve other message properties', () => {
      const incompleteMessage: Message = {
        ...mockMessage,
        complete: false,
        hasError: true,
        error: 'Some error',
      }

      const messagesWithIncompleteMessage: StoreMessages = {
        list: [incompleteMessage],
        loading: false,
        error: null,
        ready: true,
      }

      const result = setMessageComplete(messagesWithIncompleteMessage, 'test-message-id')

      expect(result.list[0]).toEqual({
        ...incompleteMessage,
        complete: true,
      })
      expect(result.list[0].hasError).toBe(true)
      expect(result.list[0].error).toBe('Some error')
    })
  })

  describe('saveMessageToRepository', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should create thread and message for first message', async () => {
      const mockRepository = vi.mocked(repository)

      mockRepository.createThread.mockResolvedValue(undefined)
      mockRepository.createMessage.mockResolvedValue(undefined)

      await saveMessageToRepository(mockMessage, true)

      expect(mockRepository.createThread).toHaveBeenCalledWith({
        id: 'test-thread-id',
        title: 'Hello',
        createdAt: mockDate,
        updatedAt: mockDate,
      })
      expect(mockRepository.createMessage).toHaveBeenCalledWith({
        ...mockMessage,
        history: true,
      })
    })

    it('should use fallback title when getFirstTextLine returns empty', async () => {
      const mockRepository = vi.mocked(repository)

      mockRepository.createThread.mockResolvedValue(undefined)
      mockRepository.createMessage.mockResolvedValue(undefined)

      const message: Message = {
        ...mockMessage,
        content: [{ type: MessageContentType.OutputText, text: '\n\nLine 1', id: 'content-1' }],
      }

      await saveMessageToRepository(message, true)

      expect(mockRepository.createThread).toHaveBeenCalledWith({
        id: 'test-thread-id',
        title: expect.any(String),
        createdAt: mockDate,
        updatedAt: mockDate,
      })
      expect(mockRepository.createMessage).toHaveBeenCalledWith({
        ...message,
        history: true,
      })
    })

    it('should update thread and create message for subsequent messages', async () => {
      const mockRepository = vi.mocked(repository)

      mockRepository.updateThread.mockResolvedValue(undefined)
      mockRepository.createMessage.mockResolvedValue(undefined)

      await saveMessageToRepository(mockMessage, false)

      expect(mockRepository.updateThread).toHaveBeenCalledWith({
        id: 'test-thread-id',
        updatedAt: mockDate,
      })
      expect(mockRepository.createMessage).toHaveBeenCalledWith({
        ...mockMessage,
        history: true,
      })
      expect(mockRepository.createThread).not.toHaveBeenCalled()
    })

    it('should not throw error if createMessage fails', async () => {
      const mockRepository = vi.mocked(repository)

      const error = new Error('Repository error')
      mockRepository.createMessage.mockRejectedValue(error)

      await saveMessageToRepository(mockMessage, false)

      expect(mockRepository.createMessage).toHaveBeenCalledWith({
        ...mockMessage,
        history: true,
      })
    })

    it('should not throw error if createThread fails', async () => {
      const mockRepository = vi.mocked(repository)

      const error = new Error('Create thread error')
      mockRepository.createThread.mockRejectedValue(error)

      await saveMessageToRepository(mockMessage, true)

      expect(mockRepository.createThread).toHaveBeenCalledWith({
        id: 'test-thread-id',
        title: 'Hello',
        createdAt: mockDate,
        updatedAt: mockDate,
      })
    })
  })

  describe('updateMessageInRepository', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should update message in repository', async () => {
      const mockRepository = vi.mocked(repository)

      mockRepository.updateMessage.mockResolvedValue(undefined)

      await updateMessageInRepository(mockMessage)

      expect(mockRepository.updateMessage).toHaveBeenCalledWith(mockMessage)
    })

    it('should not throw error if updateMessage fails', async () => {
      const mockRepository = vi.mocked(repository)

      const error = new Error('Update message error')
      mockRepository.updateMessage.mockRejectedValue(error)

      await updateMessageInRepository(mockMessage)

      expect(mockRepository.updateMessage).toHaveBeenCalledWith(mockMessage)
    })
  })
})
