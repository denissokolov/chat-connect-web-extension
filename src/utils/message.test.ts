import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DateTime } from 'luxon'

import {
  FunctionName,
  MessageContentType,
  MessageRole,
  type ProviderMessageResponse,
  type FillInputArguments,
  type ClickButtonArguments,
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

  it('should pass through non-FillInput content unchanged', () => {
    const clickButtonArguments: ClickButtonArguments = {
      id: 'btn-1',
      button_selector: '#submit',
      button_text: 'Submit',
    }

    const mockResponse: ProviderMessageResponse = {
      id: mockResponseId,
      content: [
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: 'Please click submit',
        },
        {
          id: 'click-1',
          type: MessageContentType.FunctionCall,
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
      type: MessageContentType.FunctionCall,
      name: FunctionName.ClickButton,
      arguments: clickButtonArguments,
    })
  })

  it('should batch consecutive FillInput function calls', () => {
    const fillInputArgs1: FillInputArguments[] = [
      {
        id: 'field-1',
        input_type: 'text',
        input_value: 'John',
        input_selector: '#firstName',
        label_value: 'First Name',
      },
    ]

    const fillInputArgs2: FillInputArguments[] = [
      {
        id: 'field-2',
        input_type: 'text',
        input_value: 'Doe',
        input_selector: '#lastName',
        label_value: 'Last Name',
      },
    ]

    const mockResponse: ProviderMessageResponse = {
      id: mockResponseId,
      content: [
        {
          id: 'fill-1',
          type: MessageContentType.FunctionCall,
          name: FunctionName.FillInput,
          arguments: fillInputArgs1,
        },
        {
          id: 'fill-2',
          type: MessageContentType.FunctionCall,
          name: FunctionName.FillInput,
          arguments: fillInputArgs2,
        },
      ],
    }

    const result = createAssistantMessage(mockResponse, mockThreadId)

    expect(result.content).toHaveLength(1)
    expect(result.content[0]).toEqual({
      id: 'fill-1',
      type: MessageContentType.FunctionCall,
      name: FunctionName.FillInput,
      arguments: [
        {
          id: 'field-1',
          input_type: 'text',
          input_value: 'John',
          input_selector: '#firstName',
          label_value: 'First Name',
        },
        {
          id: 'field-2',
          input_type: 'text',
          input_value: 'Doe',
          input_selector: '#lastName',
          label_value: 'Last Name',
        },
      ],
    })
  })

  it('should batch multiple consecutive FillInput calls with multiple arguments each', () => {
    const fillInputArgs1: FillInputArguments[] = [
      {
        id: 'field-1',
        input_type: 'text',
        input_value: 'John',
        input_selector: '#firstName',
        label_value: 'First Name',
      },
      {
        id: 'field-2',
        input_type: 'text',
        input_value: 'Doe',
        input_selector: '#lastName',
        label_value: 'Last Name',
      },
    ]

    const fillInputArgs2: FillInputArguments[] = [
      {
        id: 'field-3',
        input_type: 'email',
        input_value: 'john.doe@example.com',
        input_selector: '#email',
        label_value: 'Email',
      },
    ]

    const mockResponse: ProviderMessageResponse = {
      id: mockResponseId,
      content: [
        {
          id: 'fill-1',
          type: MessageContentType.FunctionCall,
          name: FunctionName.FillInput,
          arguments: fillInputArgs1,
        },
        {
          id: 'fill-2',
          type: MessageContentType.FunctionCall,
          name: FunctionName.FillInput,
          arguments: fillInputArgs2,
        },
      ],
    }

    const result = createAssistantMessage(mockResponse, mockThreadId)

    expect(result.content).toHaveLength(1)
    expect(result.content[0]).toEqual({
      id: 'fill-1',
      type: MessageContentType.FunctionCall,
      name: FunctionName.FillInput,
      arguments: [
        {
          id: 'field-1',
          input_type: 'text',
          input_value: 'John',
          input_selector: '#firstName',
          label_value: 'First Name',
        },
        {
          id: 'field-2',
          input_type: 'text',
          input_value: 'Doe',
          input_selector: '#lastName',
          label_value: 'Last Name',
        },
        {
          id: 'field-3',
          input_type: 'email',
          input_value: 'john.doe@example.com',
          input_selector: '#email',
          label_value: 'Email',
        },
      ],
    })
  })

  it('should not batch non-consecutive FillInput calls', () => {
    const fillInputArgs1: FillInputArguments[] = [
      {
        id: 'field-1',
        input_type: 'text',
        input_value: 'John',
        input_selector: '#firstName',
        label_value: 'First Name',
      },
    ]

    const fillInputArgs2: FillInputArguments[] = [
      {
        id: 'field-2',
        input_type: 'text',
        input_value: 'Doe',
        input_selector: '#lastName',
        label_value: 'Last Name',
      },
    ]

    const clickButtonArguments: ClickButtonArguments = {
      id: 'btn-1',
      button_selector: '#submit',
      button_text: 'Submit',
    }

    const mockResponse: ProviderMessageResponse = {
      id: mockResponseId,
      content: [
        {
          id: 'fill-1',
          type: MessageContentType.FunctionCall,
          name: FunctionName.FillInput,
          arguments: fillInputArgs1,
        },
        {
          id: 'click-1',
          type: MessageContentType.FunctionCall,
          name: FunctionName.ClickButton,
          arguments: clickButtonArguments,
        },
        {
          id: 'fill-2',
          type: MessageContentType.FunctionCall,
          name: FunctionName.FillInput,
          arguments: fillInputArgs2,
        },
      ],
    }

    const result = createAssistantMessage(mockResponse, mockThreadId)

    expect(result.content).toHaveLength(3)
    expect(result.content[0]).toEqual({
      id: 'fill-1',
      type: MessageContentType.FunctionCall,
      name: FunctionName.FillInput,
      arguments: fillInputArgs1,
    })
    expect(result.content[1]).toEqual({
      id: 'click-1',
      type: MessageContentType.FunctionCall,
      name: FunctionName.ClickButton,
      arguments: clickButtonArguments,
    })
    expect(result.content[2]).toEqual({
      id: 'fill-2',
      type: MessageContentType.FunctionCall,
      name: FunctionName.FillInput,
      arguments: fillInputArgs2,
    })
  })

  it('should handle mixed content with FillInput batching in between', () => {
    const fillInputArgs1: FillInputArguments[] = [
      {
        id: 'field-1',
        input_type: 'text',
        input_value: 'John',
        input_selector: '#firstName',
        label_value: 'First Name',
      },
    ]

    const fillInputArgs2: FillInputArguments[] = [
      {
        id: 'field-2',
        input_type: 'text',
        input_value: 'Doe',
        input_selector: '#lastName',
        label_value: 'Last Name',
      },
    ]

    const clickButtonArguments: ClickButtonArguments = {
      id: 'btn-1',
      button_selector: '#submit',
      button_text: 'Submit',
    }

    const mockResponse: ProviderMessageResponse = {
      id: mockResponseId,
      content: [
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: 'Please fill the form',
        },
        {
          id: 'fill-1',
          type: MessageContentType.FunctionCall,
          name: FunctionName.FillInput,
          arguments: fillInputArgs1,
        },
        {
          id: 'fill-2',
          type: MessageContentType.FunctionCall,
          name: FunctionName.FillInput,
          arguments: fillInputArgs2,
        },
        {
          id: 'text-2',
          type: MessageContentType.OutputText,
          text: 'Now click submit',
        },
        {
          id: 'click-1',
          type: MessageContentType.FunctionCall,
          name: FunctionName.ClickButton,
          arguments: clickButtonArguments,
        },
      ],
    }

    const result = createAssistantMessage(mockResponse, mockThreadId)

    expect(result.content).toHaveLength(4)
    expect(result.content[0]).toEqual({
      id: 'text-1',
      type: MessageContentType.OutputText,
      text: 'Please fill the form',
    })
    expect(result.content[1]).toEqual({
      id: 'fill-1',
      type: MessageContentType.FunctionCall,
      name: FunctionName.FillInput,
      arguments: [
        {
          id: 'field-1',
          input_type: 'text',
          input_value: 'John',
          input_selector: '#firstName',
          label_value: 'First Name',
        },
        {
          id: 'field-2',
          input_type: 'text',
          input_value: 'Doe',
          input_selector: '#lastName',
          label_value: 'Last Name',
        },
      ],
    })
    expect(result.content[2]).toEqual({
      id: 'text-2',
      type: MessageContentType.OutputText,
      text: 'Now click submit',
    })
    expect(result.content[3]).toEqual({
      id: 'click-1',
      type: MessageContentType.FunctionCall,
      name: FunctionName.ClickButton,
      arguments: clickButtonArguments,
    })
  })

  it('should handle empty content array', () => {
    const mockResponse: ProviderMessageResponse = {
      id: mockResponseId,
      content: [],
    }

    const result = createAssistantMessage(mockResponse, mockThreadId)

    expect(result.content).toEqual([])
    expect(result.id).toBe(mockResponseId)
    expect(result.role).toBe(MessageRole.Assistant)
    expect(result.threadId).toBe(mockThreadId)
    expect(result.createdAt).toBe(mockDateTime.toISO())
  })

  it('should handle single FillInput call without batching', () => {
    const fillInputArgs: FillInputArguments[] = [
      {
        id: 'field-1',
        input_type: 'text',
        input_value: 'John',
        input_selector: '#firstName',
        label_value: 'First Name',
      },
    ]

    const mockResponse: ProviderMessageResponse = {
      id: mockResponseId,
      content: [
        {
          id: 'fill-1',
          type: MessageContentType.FunctionCall,
          name: FunctionName.FillInput,
          arguments: fillInputArgs,
        },
      ],
    }

    const result = createAssistantMessage(mockResponse, mockThreadId)

    expect(result.content).toHaveLength(1)
    expect(result.content[0]).toEqual({
      id: 'fill-1',
      type: MessageContentType.FunctionCall,
      name: FunctionName.FillInput,
      arguments: fillInputArgs,
    })
  })

  it('should use current timestamp for createdAt', () => {
    const customDateTime = DateTime.fromISO('2024-12-25T10:30:00Z')
    vi.setSystemTime(customDateTime.toJSDate())

    const mockResponse: ProviderMessageResponse = {
      id: mockResponseId,
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
    const fillInputArgs1: FillInputArguments[] = [
      {
        id: 'field-1',
        input_type: 'text',
        input_value: 'John',
        input_selector: '#firstName',
        label_value: 'First Name',
      },
    ]

    const fillInputArgs2: FillInputArguments[] = [
      {
        id: 'field-2',
        input_type: 'text',
        input_value: 'Doe',
        input_selector: '#lastName',
        label_value: 'Last Name',
      },
    ]

    const fillInputArgs3: FillInputArguments[] = [
      {
        id: 'field-3',
        input_type: 'email',
        input_value: 'john.doe@example.com',
        input_selector: '#email',
        label_value: 'Email',
      },
    ]

    const fillInputArgs4: FillInputArguments[] = [
      {
        id: 'field-4',
        input_type: 'tel',
        input_value: '123-456-7890',
        input_selector: '#phone',
        label_value: 'Phone',
      },
    ]

    const clickButtonArguments: ClickButtonArguments = {
      id: 'btn-1',
      button_selector: '#submit',
      button_text: 'Submit',
    }

    const mockResponse: ProviderMessageResponse = {
      id: mockResponseId,
      content: [
        {
          id: 'fill-1',
          type: MessageContentType.FunctionCall,
          name: FunctionName.FillInput,
          arguments: fillInputArgs1,
        },
        {
          id: 'fill-2',
          type: MessageContentType.FunctionCall,
          name: FunctionName.FillInput,
          arguments: fillInputArgs2,
        },
        {
          id: 'text-1',
          type: MessageContentType.OutputText,
          text: 'Form partially filled',
        },
        {
          id: 'fill-3',
          type: MessageContentType.FunctionCall,
          name: FunctionName.FillInput,
          arguments: fillInputArgs3,
        },
        {
          id: 'fill-4',
          type: MessageContentType.FunctionCall,
          name: FunctionName.FillInput,
          arguments: fillInputArgs4,
        },
        {
          id: 'click-1',
          type: MessageContentType.FunctionCall,
          name: FunctionName.ClickButton,
          arguments: clickButtonArguments,
        },
      ],
    }

    const result = createAssistantMessage(mockResponse, mockThreadId)

    expect(result.content).toHaveLength(4)

    // First batched group: fill-1 and fill-2
    expect(result.content[0]).toEqual({
      id: 'fill-1',
      type: MessageContentType.FunctionCall,
      name: FunctionName.FillInput,
      arguments: [
        {
          id: 'field-1',
          input_type: 'text',
          input_value: 'John',
          input_selector: '#firstName',
          label_value: 'First Name',
        },
        {
          id: 'field-2',
          input_type: 'text',
          input_value: 'Doe',
          input_selector: '#lastName',
          label_value: 'Last Name',
        },
      ],
    })

    // Text message breaks the batching
    expect(result.content[1]).toEqual({
      id: 'text-1',
      type: MessageContentType.OutputText,
      text: 'Form partially filled',
    })

    // Second batched group: fill-3 and fill-4
    expect(result.content[2]).toEqual({
      id: 'fill-3',
      type: MessageContentType.FunctionCall,
      name: FunctionName.FillInput,
      arguments: [
        {
          id: 'field-3',
          input_type: 'email',
          input_value: 'john.doe@example.com',
          input_selector: '#email',
          label_value: 'Email',
        },
        {
          id: 'field-4',
          input_type: 'tel',
          input_value: '123-456-7890',
          input_selector: '#phone',
          label_value: 'Phone',
        },
      ],
    })

    // Click button remains separate
    expect(result.content[3]).toEqual({
      id: 'click-1',
      type: MessageContentType.FunctionCall,
      name: FunctionName.ClickButton,
      arguments: clickButtonArguments,
    })
  })
})
