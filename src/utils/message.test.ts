import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DateTime } from 'luxon'

import {
  FunctionName,
  MessageContentType,
  MessageRole,
  type ProviderMessageResponse,
  type ClickButtonArguments,
  FunctionStatus,
} from '@/types/types'

import { createAssistantMessage } from './message'

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
