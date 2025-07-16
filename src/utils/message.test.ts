import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DateTime } from 'luxon'

import {
  FunctionName,
  MessageContentType,
  MessageRole,
  type ClickButtonArguments,
  type MessageContent,
  type Message,
  FunctionStatus,
} from '@/types/types'

import {
  createAssistantMessage,
  createEmptyAssistantMessage,
  getFirstTextLine,
  getMessageText,
  getLastAssistantMessageId,
  areMessageFunctionsComplete,
  splitMessagesIntoGroups,
} from './message'

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
      const mockContent: MessageContent[] = [
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: 'Hello world',
        },
      ]

      const result = createAssistantMessage(mockResponseId, mockThreadId, mockContent, true)

      expect(result).toEqual({
        id: mockResponseId,
        role: MessageRole.Assistant,
        content: mockContent,
        createdAt: mockDateTime.toISO(),
        threadId: mockThreadId,
        complete: true,
      })
    })

    it('should create a message with a function call', () => {
      const clickButtonArguments: ClickButtonArguments = {
        button_selector: '#submit',
        button_text: 'Submit',
      }

      const mockContent: MessageContent[] = [
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
      ]

      const result = createAssistantMessage(mockResponseId, mockThreadId, mockContent, true)

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
      const result = createAssistantMessage(mockResponseId, mockThreadId, [], true)

      expect(result.content).toEqual([])
      expect(result.id).toBe(mockResponseId)
      expect(result.role).toBe(MessageRole.Assistant)
      expect(result.threadId).toBe(mockThreadId)
      expect(result.createdAt).toBe(mockDateTime.toISO())
    })

    it('should use current timestamp for createdAt', () => {
      const customDateTime = DateTime.fromISO('2024-12-25T10:30:00Z')
      vi.setSystemTime(customDateTime.toJSDate())

      const mockContent: MessageContent[] = [
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: 'Test message',
        },
      ]

      const result = createAssistantMessage(mockResponseId, mockThreadId, mockContent, true)

      expect(result.createdAt).toBe(customDateTime.toISO())
    })

    it('should handle complex batching scenario with multiple groups', () => {
      const clickButtonArguments: ClickButtonArguments = {
        button_selector: '#submit',
        button_text: 'Submit',
      }

      const mockContent: MessageContent[] = [
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
      ]

      const result = createAssistantMessage(mockResponseId, mockThreadId, mockContent, true)

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

  describe('createEmptyAssistantMessage', () => {
    it('should create an empty message with correct structure', () => {
      const mockResponseId = 'test-response-id'
      const mockThreadId = 'test-thread-id'
      const mockDateTime = DateTime.fromISO('2024-01-01T12:00:00Z')
      vi.setSystemTime(mockDateTime.toJSDate())

      const result = createEmptyAssistantMessage(mockResponseId, mockThreadId)

      expect(result).toEqual({
        id: mockResponseId,
        role: MessageRole.Assistant,
        content: [],
        createdAt: mockDateTime.toISO(),
        threadId: mockThreadId,
        complete: false,
      })

      vi.useRealTimers()
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
      complete: true,
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

  describe('getMessageText', () => {
    const createMockMessage = (content: MessageContent[]): Message => ({
      id: 'test-message-id',
      role: MessageRole.Assistant,
      content,
      createdAt: DateTime.fromISO('2024-01-01T12:00:00Z').toISO()!,
      threadId: 'test-thread-id',
      complete: true,
    })

    it('should return text content from single OutputText message', () => {
      const message = createMockMessage([
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: 'Hello world',
        },
      ])

      const result = getMessageText(message)

      expect(result).toBe('Hello world')
    })

    it('should return combined text from multiple OutputText messages joined with newlines', () => {
      const message = createMockMessage([
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: 'First line',
        },
        {
          id: 'text-2',
          type: MessageContentType.OutputText,
          text: 'Second line',
        },
        {
          id: 'text-3',
          type: MessageContentType.OutputText,
          text: 'Third line',
        },
      ])

      const result = getMessageText(message)

      expect(result).toBe('First line\nSecond line\nThird line')
    })

    it('should ignore non-text content types and return only text content', () => {
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
          text: 'This is text content',
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

      const result = getMessageText(message)

      expect(result).toBe('\nThis is text content\n')
    })

    it('should return empty string when message has no text content', () => {
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

      const result = getMessageText(message)

      expect(result).toBe('')
    })

    it('should return empty string when message has empty content array', () => {
      const message = createMockMessage([])

      const result = getMessageText(message)

      expect(result).toBe('')
    })

    it('should handle empty text content', () => {
      const message = createMockMessage([
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: '',
        },
      ])

      const result = getMessageText(message)

      expect(result).toBe('')
    })

    it('should handle mix of empty and non-empty text content', () => {
      const message = createMockMessage([
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: 'First line',
        },
        {
          id: 'text-2',
          type: MessageContentType.OutputText,
          text: '',
        },
        {
          id: 'text-3',
          type: MessageContentType.OutputText,
          text: 'Third line',
        },
      ])

      const result = getMessageText(message)

      expect(result).toBe('First line\n\nThird line')
    })

    it('should preserve existing newlines in text content', () => {
      const message = createMockMessage([
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: 'Line 1\nLine 2\nLine 3',
        },
        {
          id: 'text-2',
          type: MessageContentType.OutputText,
          text: 'Block 2\nAnother line',
        },
      ])

      const result = getMessageText(message)

      expect(result).toBe('Line 1\nLine 2\nLine 3\nBlock 2\nAnother line')
    })

    it('should handle whitespace-only text content', () => {
      const message = createMockMessage([
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: '   \t  ',
        },
        {
          id: 'text-2',
          type: MessageContentType.OutputText,
          text: 'Normal text',
        },
      ])

      const result = getMessageText(message)

      expect(result).toBe('\nNormal text')
    })

    it('should handle complex mixed content scenario', () => {
      const message = createMockMessage([
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: 'Starting the form fill process',
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
          id: 'text-2',
          type: MessageContentType.OutputText,
          text: 'Form fields completed',
        },
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
          id: 'text-3',
          type: MessageContentType.OutputText,
          text: 'Process finished',
        },
      ])

      const result = getMessageText(message)

      expect(result).toBe(
        'Starting the form fill process\n\n\nForm fields completed\n\nProcess finished',
      )
    })
  })

  describe('getLastAssistantMessageId', () => {
    it('should return undefined when no history is provided', () => {
      const result = getLastAssistantMessageId([])
      expect(result).toBeUndefined()
    })

    it('should return undefined when history is empty', () => {
      const result = getLastAssistantMessageId([])
      expect(result).toBeUndefined()
    })

    it('should return undefined when history contains no assistant messages', () => {
      const history: ReadonlyArray<Message> = [
        {
          id: 'user-msg-1',
          role: MessageRole.User,
          content: [{ id: 'content-1', type: MessageContentType.OutputText, text: 'Hello' }],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
        {
          id: 'user-msg-2',
          role: MessageRole.User,
          content: [{ id: 'content-2', type: MessageContentType.OutputText, text: 'World' }],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
      ]

      const result = getLastAssistantMessageId(history)
      expect(result).toBeUndefined()
    })

    it('should return the ID of the only assistant message', () => {
      const history: ReadonlyArray<Message> = [
        {
          id: 'user-msg-1',
          role: MessageRole.User,
          content: [{ id: 'content-1', type: MessageContentType.OutputText, text: 'Hello' }],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
        {
          id: 'assistant-msg-1',
          role: MessageRole.Assistant,
          content: [{ id: 'content-2', type: MessageContentType.OutputText, text: 'Hi there!' }],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
      ]

      const result = getLastAssistantMessageId(history)
      expect(result).toBe('assistant-msg-1')
    })

    it('should return the ID of the most recent assistant message', () => {
      const history: ReadonlyArray<Message> = [
        {
          id: 'assistant-msg-1',
          role: MessageRole.Assistant,
          content: [
            { id: 'content-1', type: MessageContentType.OutputText, text: 'First response' },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
        {
          id: 'user-msg-1',
          role: MessageRole.User,
          content: [{ id: 'content-2', type: MessageContentType.OutputText, text: 'Follow up' }],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
        {
          id: 'assistant-msg-2',
          role: MessageRole.Assistant,
          content: [
            { id: 'content-3', type: MessageContentType.OutputText, text: 'Second response' },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
      ]

      const result = getLastAssistantMessageId(history)
      expect(result).toBe('assistant-msg-2')
    })

    it('should return the most recent assistant message when last message is user message', () => {
      const history: ReadonlyArray<Message> = [
        {
          id: 'assistant-msg-1',
          role: MessageRole.Assistant,
          content: [
            { id: 'content-1', type: MessageContentType.OutputText, text: 'Assistant response' },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
        {
          id: 'user-msg-1',
          role: MessageRole.User,
          content: [{ id: 'content-2', type: MessageContentType.OutputText, text: 'User message' }],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
      ]

      const result = getLastAssistantMessageId(history)
      expect(result).toBe('assistant-msg-1')
    })

    it('should return the most recent assistant message with mixed message types', () => {
      const history: ReadonlyArray<Message> = [
        {
          id: 'user-msg-1',
          role: MessageRole.User,
          content: [
            { id: 'content-1', type: MessageContentType.OutputText, text: 'First user message' },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
        {
          id: 'assistant-msg-1',
          role: MessageRole.Assistant,
          content: [
            {
              id: 'content-2',
              type: MessageContentType.OutputText,
              text: 'First assistant response',
            },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
        {
          id: 'user-msg-2',
          role: MessageRole.User,
          content: [
            { id: 'content-3', type: MessageContentType.OutputText, text: 'Second user message' },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
        {
          id: 'assistant-msg-2',
          role: MessageRole.Assistant,
          content: [
            {
              id: 'func-call-1',
              type: MessageContentType.FunctionCall,
              status: FunctionStatus.Success,
              name: FunctionName.FillInput,
              arguments: {
                input_type: 'input',
                input_value: 'test',
                input_selector: '#test',
                label_value: 'Test Input',
              },
            },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
        {
          id: 'user-msg-3',
          role: MessageRole.User,
          content: [
            { id: 'content-4', type: MessageContentType.OutputText, text: 'Third user message' },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
      ]

      const result = getLastAssistantMessageId(history)
      expect(result).toBe('assistant-msg-2')
    })

    it('should return undefined when all assistant messages are incomplete', () => {
      const history: ReadonlyArray<Message> = [
        {
          id: 'assistant-msg-1',
          role: MessageRole.Assistant,
          content: [
            { id: 'content-1', type: MessageContentType.OutputText, text: 'First response' },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: false,
        },
        {
          id: 'assistant-msg-2',
          role: MessageRole.Assistant,
          content: [
            { id: 'content-2', type: MessageContentType.OutputText, text: 'Second response' },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: false,
        },
      ]

      const result = getLastAssistantMessageId(history)
      expect(result).toBeUndefined()
    })

    it('should skip incomplete assistant messages and return the most recent complete one', () => {
      const history: ReadonlyArray<Message> = [
        {
          id: 'assistant-msg-1',
          role: MessageRole.Assistant,
          content: [
            { id: 'content-1', type: MessageContentType.OutputText, text: 'First response' },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
        {
          id: 'assistant-msg-2',
          role: MessageRole.Assistant,
          content: [
            { id: 'content-2', type: MessageContentType.OutputText, text: 'Second response' },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: false,
        },
        {
          id: 'assistant-msg-3',
          role: MessageRole.Assistant,
          content: [
            { id: 'content-3', type: MessageContentType.OutputText, text: 'Third response' },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: false,
        },
      ]

      const result = getLastAssistantMessageId(history)
      expect(result).toBe('assistant-msg-1')
    })

    it('should return the most recent complete assistant message when mixed with incomplete ones', () => {
      const history: ReadonlyArray<Message> = [
        {
          id: 'assistant-msg-1',
          role: MessageRole.Assistant,
          content: [
            { id: 'content-1', type: MessageContentType.OutputText, text: 'First response' },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: false,
        },
        {
          id: 'assistant-msg-2',
          role: MessageRole.Assistant,
          content: [
            { id: 'content-2', type: MessageContentType.OutputText, text: 'Second response' },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
        {
          id: 'assistant-msg-3',
          role: MessageRole.Assistant,
          content: [
            { id: 'content-3', type: MessageContentType.OutputText, text: 'Third response' },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: false,
        },
        {
          id: 'assistant-msg-4',
          role: MessageRole.Assistant,
          content: [
            { id: 'content-4', type: MessageContentType.OutputText, text: 'Fourth response' },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
      ]

      const result = getLastAssistantMessageId(history)
      expect(result).toBe('assistant-msg-4')
    })

    it('should ignore incomplete assistant messages even when they are the most recent', () => {
      const history: ReadonlyArray<Message> = [
        {
          id: 'assistant-msg-1',
          role: MessageRole.Assistant,
          content: [
            { id: 'content-1', type: MessageContentType.OutputText, text: 'Complete response' },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
        {
          id: 'user-msg-1',
          role: MessageRole.User,
          content: [{ id: 'content-2', type: MessageContentType.OutputText, text: 'User message' }],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
        {
          id: 'assistant-msg-2',
          role: MessageRole.Assistant,
          content: [
            { id: 'content-3', type: MessageContentType.OutputText, text: 'Incomplete response' },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: false,
        },
      ]

      const result = getLastAssistantMessageId(history)
      expect(result).toBe('assistant-msg-1')
    })

    it('should handle mixed message types with complete property filtering', () => {
      const history: ReadonlyArray<Message> = [
        {
          id: 'user-msg-1',
          role: MessageRole.User,
          content: [{ id: 'content-1', type: MessageContentType.OutputText, text: 'User message' }],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
        {
          id: 'assistant-msg-1',
          role: MessageRole.Assistant,
          content: [
            { id: 'content-2', type: MessageContentType.OutputText, text: 'Incomplete assistant' },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: false,
        },
        {
          id: 'assistant-msg-2',
          role: MessageRole.Assistant,
          content: [
            { id: 'content-3', type: MessageContentType.OutputText, text: 'Complete assistant' },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
        {
          id: 'user-msg-2',
          role: MessageRole.User,
          content: [{ id: 'content-4', type: MessageContentType.OutputText, text: 'Another user' }],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: true,
        },
        {
          id: 'assistant-msg-3',
          role: MessageRole.Assistant,
          content: [
            { id: 'content-5', type: MessageContentType.OutputText, text: 'Another incomplete' },
          ],
          createdAt: new Date().toISOString(),
          threadId: 'thread-1',
          complete: false,
        },
      ]

      const result = getLastAssistantMessageId(history)
      expect(result).toBe('assistant-msg-2')
    })
  })

  describe('areMessageFunctionsComplete', () => {
    const createMockMessage = (content: MessageContent[]): Message => ({
      id: 'test-message-id',
      role: MessageRole.Assistant,
      content,
      createdAt: new Date().toISOString(),
      threadId: 'test-thread-id',
      complete: true,
    })

    it('should return false when message has no function calls', () => {
      const message = createMockMessage([
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: 'Hello world',
        },
      ])

      const result = areMessageFunctionsComplete(message)
      expect(result).toBe(false)
    })

    it('should return false when message has empty content', () => {
      const message = createMockMessage([])

      const result = areMessageFunctionsComplete(message)
      expect(result).toBe(false)
    })

    it('should return true when all function calls have Success status', () => {
      const message = createMockMessage([
        {
          id: 'func-1',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Success,
          name: FunctionName.FillInput,
          arguments: {
            input_type: 'text',
            input_value: 'test',
            input_selector: '#test',
            label_value: 'Test',
          },
        },
        {
          id: 'func-2',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Success,
          name: FunctionName.ClickButton,
          arguments: {
            button_selector: '#submit',
            button_text: 'Submit',
          },
        },
      ])

      const result = areMessageFunctionsComplete(message)
      expect(result).toBe(true)
    })

    it('should return true when all function calls have Error status', () => {
      const message = createMockMessage([
        {
          id: 'func-1',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Error,
          name: FunctionName.FillInput,
          arguments: {
            input_type: 'text',
            input_value: 'test',
            input_selector: '#test',
            label_value: 'Test',
          },
        },
        {
          id: 'func-2',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Error,
          name: FunctionName.ClickButton,
          arguments: {
            button_selector: '#submit',
            button_text: 'Submit',
          },
        },
      ])

      const result = areMessageFunctionsComplete(message)
      expect(result).toBe(true)
    })

    it('should return true when function calls have mixed Success and Error statuses', () => {
      const message = createMockMessage([
        {
          id: 'func-1',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Success,
          name: FunctionName.FillInput,
          arguments: {
            input_type: 'text',
            input_value: 'test',
            input_selector: '#test',
            label_value: 'Test',
          },
        },
        {
          id: 'func-2',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Error,
          name: FunctionName.ClickButton,
          arguments: {
            button_selector: '#submit',
            button_text: 'Submit',
          },
        },
      ])

      const result = areMessageFunctionsComplete(message)
      expect(result).toBe(true)
    })

    it('should return false when any function call has Idle status', () => {
      const message = createMockMessage([
        {
          id: 'func-1',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Success,
          name: FunctionName.FillInput,
          arguments: {
            input_type: 'text',
            input_value: 'test',
            input_selector: '#test',
            label_value: 'Test',
          },
        },
        {
          id: 'func-2',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Idle,
          name: FunctionName.ClickButton,
          arguments: {
            button_selector: '#submit',
            button_text: 'Submit',
          },
        },
      ])

      const result = areMessageFunctionsComplete(message)
      expect(result).toBe(false)
    })

    it('should return false when any function call has Pending status', () => {
      const message = createMockMessage([
        {
          id: 'func-1',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Success,
          name: FunctionName.FillInput,
          arguments: {
            input_type: 'text',
            input_value: 'test',
            input_selector: '#test',
            label_value: 'Test',
          },
        },
        {
          id: 'func-2',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Pending,
          name: FunctionName.ClickButton,
          arguments: {
            button_selector: '#submit',
            button_text: 'Submit',
          },
        },
      ])

      const result = areMessageFunctionsComplete(message)
      expect(result).toBe(false)
    })

    it('should return false when single function call has Idle status', () => {
      const message = createMockMessage([
        {
          id: 'func-1',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Idle,
          name: FunctionName.FillInput,
          arguments: {
            input_type: 'text',
            input_value: 'test',
            input_selector: '#test',
            label_value: 'Test',
          },
        },
      ])

      const result = areMessageFunctionsComplete(message)
      expect(result).toBe(false)
    })

    it('should return false when single function call has Pending status', () => {
      const message = createMockMessage([
        {
          id: 'func-1',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Pending,
          name: FunctionName.FillInput,
          arguments: {
            input_type: 'text',
            input_value: 'test',
            input_selector: '#test',
            label_value: 'Test',
          },
        },
      ])

      const result = areMessageFunctionsComplete(message)
      expect(result).toBe(false)
    })

    it('should return true when single function call has Success status', () => {
      const message = createMockMessage([
        {
          id: 'func-1',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Success,
          name: FunctionName.FillInput,
          arguments: {
            input_type: 'text',
            input_value: 'test',
            input_selector: '#test',
            label_value: 'Test',
          },
        },
      ])

      const result = areMessageFunctionsComplete(message)
      expect(result).toBe(true)
    })

    it('should return true when single function call has Error status', () => {
      const message = createMockMessage([
        {
          id: 'func-1',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Error,
          name: FunctionName.FillInput,
          arguments: {
            input_type: 'text',
            input_value: 'test',
            input_selector: '#test',
            label_value: 'Test',
          },
        },
      ])

      const result = areMessageFunctionsComplete(message)
      expect(result).toBe(true)
    })

    it('should return true when message has mixed content with completed functions', () => {
      const message = createMockMessage([
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: 'Processing your request...',
        },
        {
          id: 'func-1',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Success,
          name: FunctionName.FillInput,
          arguments: {
            input_type: 'text',
            input_value: 'test',
            input_selector: '#test',
            label_value: 'Test',
          },
        },
        {
          id: 'text-2',
          type: MessageContentType.OutputText,
          text: 'Task completed successfully',
        },
        {
          id: 'func-2',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Error,
          name: FunctionName.ClickButton,
          arguments: {
            button_selector: '#submit',
            button_text: 'Submit',
          },
        },
      ])

      const result = areMessageFunctionsComplete(message)
      expect(result).toBe(true)
    })

    it('should return false when message has mixed content with incomplete functions', () => {
      const message = createMockMessage([
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: 'Processing your request...',
        },
        {
          id: 'func-1',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Success,
          name: FunctionName.FillInput,
          arguments: {
            input_type: 'text',
            input_value: 'test',
            input_selector: '#test',
            label_value: 'Test',
          },
        },
        {
          id: 'text-2',
          type: MessageContentType.OutputText,
          text: 'Still processing...',
        },
        {
          id: 'func-2',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Pending,
          name: FunctionName.ClickButton,
          arguments: {
            button_selector: '#submit',
            button_text: 'Submit',
          },
        },
      ])

      const result = areMessageFunctionsComplete(message)
      expect(result).toBe(false)
    })
  })

  describe('splitMessagesIntoGroups', () => {
    const createMockUserMessage = (id: string, text: string, history?: boolean): Message => ({
      id,
      role: MessageRole.User,
      content: [{ id: `${id}-content`, type: MessageContentType.OutputText, text }],
      createdAt: new Date().toISOString(),
      threadId: 'test-thread-id',
      complete: true,
      history,
    })

    const createMockAssistantMessage = (id: string, text: string): Message => ({
      id,
      role: MessageRole.Assistant,
      content: [{ id: `${id}-content`, type: MessageContentType.OutputText, text }],
      createdAt: new Date().toISOString(),
      threadId: 'test-thread-id',
      complete: true,
    })

    it('should return empty array when input is empty', () => {
      const result = splitMessagesIntoGroups([])
      expect(result).toEqual([])
    })

    it('should create single group with one user message', () => {
      const userMessage = createMockUserMessage('user-1', 'Hello')
      const messages = [userMessage]

      const result = splitMessagesIntoGroups(messages)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'user-1',
        messages: [userMessage],
        history: false,
      })
    })

    it('should create single group with user message and assistant response', () => {
      const userMessage = createMockUserMessage('user-1', 'Hello')
      const assistantMessage = createMockAssistantMessage('assistant-1', 'Hi there!')
      const messages = [userMessage, assistantMessage]

      const result = splitMessagesIntoGroups(messages)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'user-1',
        messages: [userMessage, assistantMessage],
        history: false,
      })
    })

    it('should create multiple groups for multiple user messages', () => {
      const userMessage1 = createMockUserMessage('user-1', 'First question')
      const assistantMessage1 = createMockAssistantMessage('assistant-1', 'First answer')
      const userMessage2 = createMockUserMessage('user-2', 'Second question')
      const assistantMessage2 = createMockAssistantMessage('assistant-2', 'Second answer')
      const messages = [userMessage1, assistantMessage1, userMessage2, assistantMessage2]

      const result = splitMessagesIntoGroups(messages)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: 'user-1',
        messages: [userMessage1, assistantMessage1],
        history: false,
      })
      expect(result[1]).toEqual({
        id: 'user-2',
        messages: [userMessage2, assistantMessage2],
        history: false,
      })
    })

    it('should handle user message with multiple assistant responses', () => {
      const userMessage = createMockUserMessage('user-1', 'Complex question')
      const assistantMessage1 = createMockAssistantMessage('assistant-1', 'First part of answer')
      const assistantMessage2 = createMockAssistantMessage('assistant-2', 'Second part of answer')
      const messages = [userMessage, assistantMessage1, assistantMessage2]

      const result = splitMessagesIntoGroups(messages)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'user-1',
        messages: [userMessage, assistantMessage1, assistantMessage2],
        history: false,
      })
    })

    it('should preserve history flag when set to true', () => {
      const userMessage = createMockUserMessage('user-1', 'Historical message', true)
      const assistantMessage = createMockAssistantMessage('assistant-1', 'Historical response')
      const messages = [userMessage, assistantMessage]

      const result = splitMessagesIntoGroups(messages)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'user-1',
        messages: [userMessage, assistantMessage],
        history: true,
      })
    })

    it('should preserve history flag when set to false', () => {
      const userMessage = createMockUserMessage('user-1', 'Current message', false)
      const assistantMessage = createMockAssistantMessage('assistant-1', 'Current response')
      const messages = [userMessage, assistantMessage]

      const result = splitMessagesIntoGroups(messages)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'user-1',
        messages: [userMessage, assistantMessage],
        history: false,
      })
    })

    it('should default history to false when not specified', () => {
      const userMessage = createMockUserMessage('user-1', 'Message without history flag')
      const assistantMessage = createMockAssistantMessage('assistant-1', 'Response')
      const messages = [userMessage, assistantMessage]

      const result = splitMessagesIntoGroups(messages)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'user-1',
        messages: [userMessage, assistantMessage],
        history: false,
      })
    })

    it('should handle mixed history flags across multiple groups', () => {
      const historicalUserMessage = createMockUserMessage('user-1', 'Historical question', true)
      const historicalAssistantMessage = createMockAssistantMessage(
        'assistant-1',
        'Historical answer',
      )
      const currentUserMessage = createMockUserMessage('user-2', 'Current question', false)
      const currentAssistantMessage = createMockAssistantMessage('assistant-2', 'Current answer')
      const messages = [
        historicalUserMessage,
        historicalAssistantMessage,
        currentUserMessage,
        currentAssistantMessage,
      ]

      const result = splitMessagesIntoGroups(messages)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: 'user-1',
        messages: [historicalUserMessage, historicalAssistantMessage],
        history: true,
      })
      expect(result[1]).toEqual({
        id: 'user-2',
        messages: [currentUserMessage, currentAssistantMessage],
        history: false,
      })
    })

    it('should handle consecutive user messages without assistant responses', () => {
      const userMessage1 = createMockUserMessage('user-1', 'First question')
      const userMessage2 = createMockUserMessage('user-2', 'Second question')
      const userMessage3 = createMockUserMessage('user-3', 'Third question')
      const messages = [userMessage1, userMessage2, userMessage3]

      const result = splitMessagesIntoGroups(messages)

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
        id: 'user-1',
        messages: [userMessage1],
        history: false,
      })
      expect(result[1]).toEqual({
        id: 'user-2',
        messages: [userMessage2],
        history: false,
      })
      expect(result[2]).toEqual({
        id: 'user-3',
        messages: [userMessage3],
        history: false,
      })
    })

    it('should handle assistant message at the beginning before any user message', () => {
      const assistantMessage = createMockAssistantMessage(
        'assistant-1',
        'Unexpected assistant message',
      )
      const userMessage = createMockUserMessage('user-1', 'User question after assistant')
      const messages = [assistantMessage, userMessage]

      const result = splitMessagesIntoGroups(messages)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: 'assistant-1',
        messages: [assistantMessage],
        history: false,
      })
      expect(result[1]).toEqual({
        id: 'user-1',
        messages: [userMessage],
        history: false,
      })
    })

    it('should handle complex conversation flow', () => {
      const userMessage1 = createMockUserMessage('user-1', 'First question', true)
      const assistantMessage1 = createMockAssistantMessage('assistant-1', 'First answer')
      const assistantMessage2 = createMockAssistantMessage('assistant-2', 'Additional context')
      const userMessage2 = createMockUserMessage('user-2', 'Follow-up question')
      const assistantMessage3 = createMockAssistantMessage('assistant-3', 'Follow-up answer')
      const userMessage3 = createMockUserMessage('user-3', 'Final question', false)
      const messages = [
        userMessage1,
        assistantMessage1,
        assistantMessage2,
        userMessage2,
        assistantMessage3,
        userMessage3,
      ]

      const result = splitMessagesIntoGroups(messages)

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
        id: 'user-1',
        messages: [userMessage1, assistantMessage1, assistantMessage2],
        history: true,
      })
      expect(result[1]).toEqual({
        id: 'user-2',
        messages: [userMessage2, assistantMessage3],
        history: false,
      })
      expect(result[2]).toEqual({
        id: 'user-3',
        messages: [userMessage3],
        history: false,
      })
    })

    it('should handle messages with function calls', () => {
      const userMessage = createMockUserMessage('user-1', 'Please fill the form')
      const assistantMessage: Message = {
        id: 'assistant-1',
        role: MessageRole.Assistant,
        content: [
          {
            id: 'text-1',
            type: MessageContentType.OutputText,
            text: 'I will fill the form for you',
          },
          {
            id: 'func-1',
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Success,
            name: FunctionName.FillInput,
            arguments: {
              input_type: 'text',
              input_value: 'test',
              input_selector: '#test',
              label_value: 'Test',
            },
          },
        ],
        createdAt: new Date().toISOString(),
        threadId: 'test-thread-id',
        complete: true,
      }
      const messages = [userMessage, assistantMessage]

      const result = splitMessagesIntoGroups(messages)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'user-1',
        messages: [userMessage, assistantMessage],
        history: false,
      })
    })
  })
})
