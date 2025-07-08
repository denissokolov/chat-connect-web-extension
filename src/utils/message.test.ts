import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DateTime } from 'luxon'

import {
  FunctionName,
  MessageContentType,
  MessageRole,
  type ProviderMessageResponse,
  type ClickButtonArguments,
  type MessageContent,
  type Message,
  FunctionStatus,
} from '@/types/types'

import { createAssistantMessage, getFirstTextLine } from './message'

describe('message utils', () => {
  describe('createAssistantMessage', () => {
    const mockThreadId = 'test-thread-id'
    const mockResponseId = 'test-response-id'
    const mockDateTime = DateTime.fromISO('2024-01-01T12:00:00Z')

    beforeEach(() => {
      vi.clearAllMocks()
      vi.setSystemTime(mockDateTime.toJSDate())
    })

    it('should create a basic message with correct structure', () => {
      const mockResponse: ProviderMessageResponse = {
        id: mockResponseId,
        hasTools: false,
        content: [
          {
            id: 'text-1',
            type: MessageContentType.OutputText,
            text: 'Hello world',
          },
        ],
      }

      const result = createAssistantMessage(mockResponse, mockThreadId)

      expect(result).toEqual({
        id: mockResponseId,
        role: MessageRole.Assistant,
        content: [
          {
            id: 'text-1',
            type: MessageContentType.OutputText,
            text: 'Hello world',
          },
        ],
        createdAt: mockDateTime.toISO(),
        threadId: mockThreadId,
      })
    })

    it('should create a message with a function call', () => {
      const clickButtonArguments: ClickButtonArguments = {
        button_selector: '#submit',
        button_text: 'Submit',
      }

      const mockResponse: ProviderMessageResponse = {
        id: mockResponseId,
        hasTools: false,
        content: [
          {
            id: 'text-1',
            type: MessageContentType.OutputText,
            text: 'Please click submit',
          },
          {
            id: 'click-1',
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Idle,
            name: FunctionName.ClickButton,
            arguments: clickButtonArguments,
          },
        ],
      }

      const result = createAssistantMessage(mockResponse, mockThreadId)

      expect(result.content).toHaveLength(2)
      expect(result.content[0]).toEqual({
        id: 'text-1',
        type: MessageContentType.OutputText,
        text: 'Please click submit',
      })
      expect(result.content[1]).toEqual({
        id: 'click-1',
        status: FunctionStatus.Idle,
        type: MessageContentType.FunctionCall,
        name: FunctionName.ClickButton,
        arguments: clickButtonArguments,
      })
    })

    it('should handle empty content array', () => {
      const mockResponse: ProviderMessageResponse = {
        id: mockResponseId,
        hasTools: false,
        content: [],
      }

      const result = createAssistantMessage(mockResponse, mockThreadId)

      expect(result.content).toEqual([])
      expect(result.id).toBe(mockResponseId)
      expect(result.role).toBe(MessageRole.Assistant)
      expect(result.threadId).toBe(mockThreadId)
      expect(result.createdAt).toBe(mockDateTime.toISO())
    })

    it('should use current timestamp for createdAt', () => {
      const customDateTime = DateTime.fromISO('2024-12-25T10:30:00Z')
      vi.setSystemTime(customDateTime.toJSDate())

      const mockResponse: ProviderMessageResponse = {
        id: mockResponseId,
        hasTools: false,
        content: [
          {
            id: 'text-1',
            type: MessageContentType.OutputText,
            text: 'Test message',
          },
        ],
      }

      const result = createAssistantMessage(mockResponse, mockThreadId)

      expect(result.createdAt).toBe(customDateTime.toISO())
    })

    it('should preserve original message ID and threadId', () => {
      const customResponseId = 'custom-response-123'
      const customThreadId = 'custom-thread-456'

      const mockResponse: ProviderMessageResponse = {
        id: customResponseId,
        hasTools: false,
        content: [
          {
            id: 'text-1',
            type: MessageContentType.OutputText,
            text: 'Test message',
          },
        ],
      }

      const result = createAssistantMessage(mockResponse, customThreadId)

      expect(result.id).toBe(customResponseId)
      expect(result.threadId).toBe(customThreadId)
      expect(result.role).toBe(MessageRole.Assistant)
    })

    it('should handle complex batching scenario with multiple groups', () => {
      const clickButtonArguments: ClickButtonArguments = {
        button_selector: '#submit',
        button_text: 'Submit',
      }

      const mockResponse: ProviderMessageResponse = {
        id: mockResponseId,
        hasTools: false,
        content: [
          {
            id: 'fill-1',
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Idle,
            name: FunctionName.FillInput,
            arguments: {
              input_type: 'text',
              input_value: 'John',
              input_selector: '#firstName',
              label_value: 'First Name',
            },
          },
          {
            id: 'fill-2',
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Idle,
            name: FunctionName.FillInput,
            arguments: {
              input_type: 'text',
              input_value: 'Doe',
              input_selector: '#lastName',
              label_value: 'Last Name',
            },
          },
          {
            id: 'text-1',
            type: MessageContentType.OutputText,
            text: 'Form partially filled',
          },
          {
            id: 'fill-3',
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Idle,
            name: FunctionName.FillInput,
            arguments: {
              input_type: 'email',
              input_value: 'john.doe@example.com',
              input_selector: '#email',
              label_value: 'Email',
            },
          },
          {
            id: 'fill-4',
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Idle,
            name: FunctionName.FillInput,
            arguments: {
              input_type: 'tel',
              input_value: '123-456-7890',
              input_selector: '#phone',
              label_value: 'Phone',
            },
          },
          {
            id: 'click-1',
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Idle,
            name: FunctionName.ClickButton,
            arguments: clickButtonArguments,
          },
        ],
      }

      const result = createAssistantMessage(mockResponse, mockThreadId)

      expect(result.content).toHaveLength(6)

      expect(result.content[0]).toEqual({
        id: 'fill-1',
        type: MessageContentType.FunctionCall,
        name: FunctionName.FillInput,
        status: FunctionStatus.Idle,
        arguments: {
          input_type: 'text',
          input_value: 'John',
          input_selector: '#firstName',
          label_value: 'First Name',
        },
      })

      expect(result.content[1]).toEqual({
        id: 'fill-2',
        type: MessageContentType.FunctionCall,
        name: FunctionName.FillInput,
        status: FunctionStatus.Idle,
        arguments: {
          input_type: 'text',
          input_value: 'Doe',
          input_selector: '#lastName',
          label_value: 'Last Name',
        },
      })

      expect(result.content[2]).toEqual({
        id: 'text-1',
        type: MessageContentType.OutputText,
        text: 'Form partially filled',
      })

      expect(result.content[3]).toEqual({
        id: 'fill-3',
        type: MessageContentType.FunctionCall,
        name: FunctionName.FillInput,
        status: FunctionStatus.Idle,
        arguments: {
          input_type: 'email',
          input_value: 'john.doe@example.com',
          input_selector: '#email',
          label_value: 'Email',
        },
      })

      expect(result.content[4]).toEqual({
        id: 'fill-4',
        type: MessageContentType.FunctionCall,
        name: FunctionName.FillInput,
        status: FunctionStatus.Idle,
        arguments: {
          input_type: 'tel',
          input_value: '123-456-7890',
          input_selector: '#phone',
          label_value: 'Phone',
        },
      })

      expect(result.content[5]).toEqual({
        id: 'click-1',
        type: MessageContentType.FunctionCall,
        name: FunctionName.ClickButton,
        status: FunctionStatus.Idle,
        arguments: clickButtonArguments,
      })
    })
  })

  describe('getFirstTextLine', () => {
    const mockThreadId = 'test-thread-id'
    const mockMessageId = 'test-message-id'
    const mockDateTime = DateTime.fromISO('2024-01-01T12:00:00Z')

    const createMockMessage = (content: MessageContent[]): Message => ({
      id: mockMessageId,
      role: MessageRole.Assistant,
      content,
      createdAt: mockDateTime.toISO()!,
      threadId: mockThreadId,
    })

    it('should return first line of text when it fits within max length', () => {
      const message = createMockMessage([
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: 'This is a short line',
        },
      ])

      const result = getFirstTextLine(message, 150)

      expect(result).toBe('This is a short line')
    })

    it('should return first line of multi-line text when it fits within max length', () => {
      const message = createMockMessage([
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: 'This is the first line\nThis is the second line\nThis is the third line',
        },
      ])

      const result = getFirstTextLine(message, 150)

      expect(result).toBe('This is the first line')
    })

    it('should truncate first line when it exceeds max length', () => {
      const longText =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
      const message = createMockMessage([
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: longText,
        },
      ])

      const result = getFirstTextLine(message, 150)

      expect(result).toBe(`${longText.slice(0, 150)}...`)
      expect(result?.length).toBe(153)
    })

    it('should truncate first line of multi-line text when it exceeds max length', () => {
      const longFirstLine =
        'This is a very long first line that definitely exceeds the default maximum length of 300 characters and should be truncated with ellipsis at the end to indicate that there is more content but it was cut off to keep the preview concise and readable for the user interface'
      const message = createMockMessage([
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: `${longFirstLine}\nThis is the second line\nThis is the third line`,
        },
      ])

      const result = getFirstTextLine(message, 150)

      expect(result).toBe(`${longFirstLine.slice(0, 150)}...`)
      expect(result?.length).toBe(153)
    })

    it('should return text exactly at max length without truncation', () => {
      const exactLengthText = 'a'.repeat(150)
      const message = createMockMessage([
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: exactLengthText,
        },
      ])

      const result = getFirstTextLine(message, 150)

      expect(result).toBe(exactLengthText)
      expect(result?.length).toBe(150)
    })

    it('should return undefined when message has no OutputText content', () => {
      const message = createMockMessage([
        {
          id: 'click-1',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Idle,
          name: FunctionName.ClickButton,
          arguments: {
            button_selector: '#submit',
            button_text: 'Submit',
          },
        },
      ])

      const result = getFirstTextLine(message, 150)

      expect(result).toBeUndefined()
    })

    it('should return undefined when message has empty content array', () => {
      const message = createMockMessage([])

      const result = getFirstTextLine(message, 150)

      expect(result).toBeUndefined()
    })

    it('should return undefined when OutputText content has empty text', () => {
      const message = createMockMessage([
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: '',
        },
      ])

      const result = getFirstTextLine(message, 150)

      expect(result).toBeUndefined()
    })

    it('should return first OutputText content when message has mixed content types', () => {
      const message = createMockMessage([
        {
          id: 'click-1',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Idle,
          name: FunctionName.ClickButton,
          arguments: {
            button_selector: '#submit',
            button_text: 'Submit',
          },
        },
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: 'This is the text content',
        },
        {
          id: 'fill-1',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Idle,
          name: FunctionName.FillInput,
          arguments: {
            input_type: 'text',
            input_value: 'John',
            input_selector: '#firstName',
            label_value: 'First Name',
          },
        },
      ])

      const result = getFirstTextLine(message, 150)

      expect(result).toBe('This is the text content')
    })

    it('should handle very short max length', () => {
      const message = createMockMessage([
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: 'Hello world',
        },
      ])

      const result = getFirstTextLine(message, 5)

      expect(result).toBe('Hello...')
      expect(result?.length).toBe(8) // 5 + 3 for "..."
    })

    it('should handle single character max length', () => {
      const message = createMockMessage([
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: 'Hello',
        },
      ])

      const result = getFirstTextLine(message, 1)

      expect(result).toBe('H...')
      expect(result?.length).toBe(4) // 1 + 3 for "..."
    })

    it('should handle text with only newline characters', () => {
      const message = createMockMessage([
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: '\n\n\n',
        },
      ])

      const result = getFirstTextLine(message, 150)

      expect(result).toBe('')
    })

    it('should handle text starting with newline', () => {
      const message = createMockMessage([
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: '\nSecond line\nThird line',
        },
      ])

      const result = getFirstTextLine(message, 150)

      expect(result).toBe('')
    })

    it('should handle whitespace-only first line', () => {
      const message = createMockMessage([
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: '   \t  \nSecond line',
        },
      ])

      const result = getFirstTextLine(message, 150)

      expect(result).toBe('   \t  ')
    })
  })
})
