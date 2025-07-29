import { describe, it, expect, vi, beforeEach } from 'vitest'

import { OpenAIAssistant } from './OpenAIAssistant'
import { mockMultipleOutputsResponse, mockSingleOutputResponse } from './OpenAIAssistant.mocks'
import {
  AIModel,
  ProviderMessageEventType,
  type ProviderMessageEvent,
} from '@/types/provider.types'
import { MessageContentType, MessageRole } from '@/types/chat.types'
import { type AssistantTool, FunctionStatus, FunctionName } from '@/types/tool.types'

vi.mock('openai', () => ({
  default: class MockOpenAI {
    responses = {
      create: vi.fn(),
    }
  },
}))

describe('OpenAIAssistant', () => {
  describe('streaming response handling', () => {
    it('should handle response stream with multiple outputs', async () => {
      const events: ProviderMessageEvent[] = []
      const eventHandler = (event: ProviderMessageEvent) => {
        events.push(event)
      }

      // Mock streaming events based on the mock response
      const mockStream = [
        {
          type: 'response.created',
          response: { id: mockMultipleOutputsResponse.id },
        },
        {
          type: 'response.output_text.delta',
          item_id: mockMultipleOutputsResponse.output[0].id,
          content_index: 0,
          delta: 'Hello',
        },
        {
          type: 'response.output_text.delta',
          item_id: mockMultipleOutputsResponse.output[0].id,
          content_index: 0,
          delta: ' world!',
        },
        {
          type: 'response.output_item.done',
          item: {
            type: 'function_call',
            call_id: 'call_V8DXgOfseNt66chXUplx7L2Z',
            name: 'fill_input',
            arguments:
              '{"input_type":"radio","input_value":"personal","input_selector":"typeofclient","label_value":"Particulier"}',
          },
        },
        {
          type: 'response.output_item.done',
          item: {
            type: 'function_call',
            call_id: 'call_LH7df6L6NqMKezUq1DN81PYb',
            name: 'fill_input',
            arguments:
              '{"input_type":"input","input_value":"Jan","input_selector":"#firstname","label_value":"Naam"}',
          },
        },
        {
          type: 'response.output_item.done',
          item: {
            type: 'function_call',
            call_id: 'call_112keBYEDQI5dgV01fLbW3aC',
            name: 'click_element',
            arguments: '{"element_selector":"#submit","element_text":"Bestellen"}',
          },
        },
        {
          type: 'response.completed',
        },
      ]

      const assistant = new OpenAIAssistant('test-api-key')

      // Mock the client.responses.create method to return our mock stream
      const mockCreate = vi.fn().mockResolvedValue({
        async *[Symbol.asyncIterator]() {
          for (const event of mockStream) {
            yield event
          }
        },
      })

      // @ts-expect-error - accessing private property for testing
      assistant.client.responses.create = mockCreate

      await assistant.sendMessage({
        model: AIModel.OpenAI_GPT_4o,
        message: {
          id: 'test-message-id',
          threadId: 'test-thread-id',
          role: MessageRole.User,
          content: [
            { id: 'test-content-id', type: MessageContentType.OutputText, text: 'Test message' },
          ],
          createdAt: new Date().toISOString(),
          complete: true,
        },
        eventHandler,
        tools: [],
      })

      expect(events).toHaveLength(7)

      // Check response created event
      expect(events[0]).toEqual({
        type: ProviderMessageEventType.Created,
        messageId: mockMultipleOutputsResponse.id,
        threadId: 'test-thread-id',
      })

      // Check text delta events
      expect(events[1]).toEqual({
        type: ProviderMessageEventType.OutputTextDelta,
        messageId: mockMultipleOutputsResponse.id,
        threadId: 'test-thread-id',
        contentId: `${mockMultipleOutputsResponse.output[0].id}-0`,
        textDelta: 'Hello',
      })

      expect(events[2]).toEqual({
        type: ProviderMessageEventType.OutputTextDelta,
        messageId: mockMultipleOutputsResponse.id,
        threadId: 'test-thread-id',
        contentId: `${mockMultipleOutputsResponse.output[0].id}-0`,
        textDelta: ' world!',
      })

      // Check function call events
      expect(events[3]).toEqual({
        type: ProviderMessageEventType.FunctionCall,
        messageId: mockMultipleOutputsResponse.id,
        threadId: 'test-thread-id',
        content: {
          id: 'call_V8DXgOfseNt66chXUplx7L2Z',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Idle,
          name: FunctionName.FillInput,
          arguments: {
            input_type: 'radio',
            input_value: 'personal',
            input_selector: 'typeofclient',
            label_value: 'Particulier',
          },
        },
      })

      expect(events[4]).toEqual({
        type: ProviderMessageEventType.FunctionCall,
        messageId: mockMultipleOutputsResponse.id,
        threadId: 'test-thread-id',
        content: {
          id: 'call_LH7df6L6NqMKezUq1DN81PYb',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Idle,
          name: FunctionName.FillInput,
          arguments: {
            input_type: 'input',
            input_value: 'Jan',
            input_selector: '#firstname',
            label_value: 'Naam',
          },
        },
      })

      expect(events[5]).toEqual({
        type: ProviderMessageEventType.FunctionCall,
        messageId: mockMultipleOutputsResponse.id,
        threadId: 'test-thread-id',
        content: {
          id: 'call_112keBYEDQI5dgV01fLbW3aC',
          type: MessageContentType.FunctionCall,
          status: FunctionStatus.Idle,
          name: FunctionName.ClickElement,
          arguments: {
            element_selector: '#submit',
            element_text: 'Bestellen',
          },
        },
      })

      // Check completion event
      expect(events[6]).toEqual({
        type: ProviderMessageEventType.Completed,
        messageId: mockMultipleOutputsResponse.id,
        userMessageId: 'test-message-id',
        threadId: 'test-thread-id',
      })
    })

    it('should handle response stream with single output', async () => {
      const events: ProviderMessageEvent[] = []
      const eventHandler = (event: ProviderMessageEvent) => {
        events.push(event)
      }

      // Mock streaming events for single output
      const mockStream = [
        {
          type: 'response.created',
          response: { id: mockSingleOutputResponse.id },
        },
        {
          type: 'response.output_text.delta',
          item_id: mockSingleOutputResponse.output[0].id,
          content_index: 0,
          delta: 'Hello, world!',
        },
        {
          type: 'response.completed',
        },
      ]

      const assistant = new OpenAIAssistant('test-api-key')

      // Mock the client.responses.create method
      const mockCreate = vi.fn().mockResolvedValue({
        async *[Symbol.asyncIterator]() {
          for (const event of mockStream) {
            yield event
          }
        },
      })

      // @ts-expect-error - accessing private property for testing
      assistant.client.responses.create = mockCreate

      await assistant.sendMessage({
        model: AIModel.OpenAI_GPT_4o,
        message: {
          id: 'test-message-id',
          threadId: 'test-thread-id',
          role: MessageRole.User,
          content: [
            { id: 'test-content-id-2', type: MessageContentType.OutputText, text: 'Test message' },
          ],
          createdAt: new Date().toISOString(),
          complete: true,
        },
        eventHandler,
        tools: [],
      })

      expect(events).toHaveLength(3)

      // Check response created event
      expect(events[0]).toEqual({
        type: ProviderMessageEventType.Created,
        messageId: mockSingleOutputResponse.id,
        threadId: 'test-thread-id',
      })

      // Check text delta event
      expect(events[1]).toEqual({
        type: ProviderMessageEventType.OutputTextDelta,
        messageId: mockSingleOutputResponse.id,
        threadId: 'test-thread-id',
        contentId: `${mockSingleOutputResponse.output[0].id}-0`,
        textDelta: 'Hello, world!',
      })

      // Check completion event
      expect(events[2]).toEqual({
        type: ProviderMessageEventType.Completed,
        messageId: mockSingleOutputResponse.id,
        userMessageId: 'test-message-id',
        threadId: 'test-thread-id',
      })
    })

    it('should handle error events', async () => {
      const events: ProviderMessageEvent[] = []
      const eventHandler = (event: ProviderMessageEvent) => {
        events.push(event)
      }

      const mockStream = [
        {
          type: 'response.created',
          response: { id: 'test-response-id' },
        },
        {
          type: 'error',
          message: 'Something went wrong',
        },
      ]

      const assistant = new OpenAIAssistant('test-api-key')

      const mockCreate = vi.fn().mockResolvedValue({
        async *[Symbol.asyncIterator]() {
          for (const event of mockStream) {
            yield event
          }
        },
      })

      // @ts-expect-error - accessing private property for testing
      assistant.client.responses.create = mockCreate

      await assistant.sendMessage({
        model: AIModel.OpenAI_GPT_4o,
        message: {
          id: 'test-message-id',
          threadId: 'test-thread-id',
          role: MessageRole.User,
          content: [
            { id: 'test-content-id-3', type: MessageContentType.OutputText, text: 'Test message' },
          ],
          createdAt: new Date().toISOString(),
          complete: true,
        },
        eventHandler,
        tools: [],
      })

      expect(events).toHaveLength(2)

      expect(events[0]).toEqual({
        type: ProviderMessageEventType.Created,
        messageId: 'test-response-id',
        threadId: 'test-thread-id',
      })

      expect(events[1]).toEqual({
        type: ProviderMessageEventType.Error,
        messageId: 'test-response-id',
        userMessageId: 'test-message-id',
        threadId: 'test-thread-id',
        error: 'Something went wrong',
      })
    })
  })

  describe('getProvider', () => {
    it('should return OpenAI provider', () => {
      const assistant = new OpenAIAssistant('test-api-key')
      expect(assistant.getProvider()).toBe('openai')
    })
  })

  describe('mapTools', () => {
    let assistant: OpenAIAssistant

    beforeEach(() => {
      assistant = new OpenAIAssistant('test-api-key')
    })

    it('should return undefined when tools is empty array', () => {
      const result = assistant.mapTools([])
      expect(result).toBeUndefined()
    })

    it('should transform single tool correctly', () => {
      const mockTool: AssistantTool = {
        name: FunctionName.FillInput,
        description: 'Fill an input field',
        parameters: [
          {
            name: 'input_type',
            description: 'Type of input',
            enum: ['input', 'textarea'],
            required: true,
          },
          {
            name: 'input_value',
            description: 'Value to fill',
            required: true,
          },
          {
            name: 'optional_param',
            description: 'Optional parameter',
            required: false,
          },
        ],
      }

      const result = assistant.mapTools([mockTool])

      expect(result).toBeDefined()
      expect(result).toHaveLength(1)
      expect(result![0]).toEqual({
        type: 'function',
        name: 'fill_input',
        description: 'Fill an input field',
        strict: true,
        parameters: {
          type: 'object',
          properties: {
            input_type: {
              type: 'string',
              description: 'Type of input',
              enum: ['input', 'textarea'],
            },
            input_value: {
              type: 'string',
              description: 'Value to fill',
              enum: undefined,
            },
            optional_param: {
              type: 'string',
              description: 'Optional parameter',
              enum: undefined,
            },
          },
          required: ['input_type', 'input_value'],
          additionalProperties: false,
        },
      })
    })

    it('should transform multiple tools correctly', () => {
      const mockTools: AssistantTool[] = [
        {
          name: FunctionName.FillInput,
          description: 'Fill an input field',
          parameters: [
            {
              name: 'input_type',
              description: 'Type of input',
              required: true,
            },
          ],
        },
        {
          name: FunctionName.ClickElement,
          description: 'Click a button',
          parameters: [
            {
              name: 'element_selector',
              description: 'Button selector',
              required: true,
            },
            {
              name: 'element_text',
              description: 'Button text',
              required: false,
            },
          ],
        },
      ]

      const result = assistant.mapTools(mockTools)

      expect(result).toBeDefined()
      expect(result).toHaveLength(2)

      if (result) {
        expect(result[0].name).toBe('fill_input')
        expect(result[1].name).toBe('click_element')
        expect(result[0].parameters?.required).toEqual(['input_type'])
        expect(result[1].parameters?.required).toEqual(['element_selector'])
      }
    })

    it('should handle tool with no required parameters', () => {
      const mockTool: AssistantTool = {
        name: FunctionName.GetPageContent,
        description: 'Get page content',
        parameters: [
          {
            name: 'format',
            description: 'Content format',
            enum: ['html', 'text'],
            required: false,
          },
        ],
      }

      const result = assistant.mapTools([mockTool])

      expect(result).toBeDefined()
      expect(result).toHaveLength(1)

      if (result) {
        expect(result[0].parameters?.required).toEqual([])
        expect(result[0].parameters?.properties).toEqual({
          format: {
            type: 'string',
            description: 'Content format',
            enum: ['html', 'text'],
          },
        })
      }
    })

    it('should handle tool with no parameters', () => {
      const mockTool: AssistantTool = {
        name: FunctionName.GetPageContent,
        description: 'Get page content',
        parameters: [],
      }

      const result = assistant.mapTools([mockTool])

      expect(result).toBeDefined()
      expect(result).toHaveLength(1)

      if (result) {
        expect(result[0].parameters?.properties).toEqual({})
        expect(result[0].parameters?.required).toEqual([])
      }
    })

    it('should set all parameters as string type', () => {
      const mockTool: AssistantTool = {
        name: FunctionName.FillInput,
        description: 'Fill an input field',
        parameters: [
          {
            name: 'param1',
            description: 'First parameter',
            required: true,
          },
          {
            name: 'param2',
            description: 'Second parameter',
            enum: ['option1', 'option2'],
            required: false,
          },
        ],
      }

      const result = assistant.mapTools([mockTool])

      expect(result).toBeDefined()
      if (result) {
        const properties = result[0].parameters?.properties as Record<string, { type: string }>
        expect(properties.param1.type).toBe('string')
        expect(properties.param2.type).toBe('string')
      }
    })

    it('should set strict mode and additionalProperties false', () => {
      const mockTool: AssistantTool = {
        name: FunctionName.FillInput,
        description: 'Fill an input field',
        parameters: [
          {
            name: 'test_param',
            description: 'Test parameter',
            required: true,
          },
        ],
      }

      const result = assistant.mapTools([mockTool])

      expect(result).toBeDefined()
      if (result) {
        expect(result[0].strict).toBe(true)
        expect(result[0].parameters?.additionalProperties).toBe(false)
        expect(result[0].parameters?.type).toBe('object')
        expect(result[0].type).toBe('function')
      }
    })

    it('should map fillInput tool correctly', () => {
      const fillInputTool: AssistantTool = {
        name: FunctionName.FillInput,
        description: 'Fill the given value into the input field on the page.',
        parameters: [
          {
            name: 'input_type',
            description: 'The type of the input to fill',
            enum: ['input', 'textarea', 'select', 'radio', 'checkbox'],
            required: true,
          },
          {
            name: 'input_value',
            description: 'The value to fill in the input',
            required: true,
          },
          {
            name: 'input_selector',
            description:
              'The selector of the input to fill. It will be used as document.querySelector(input_selector).',
            required: true,
          },
          {
            name: 'label_value',
            description:
              'The value of the label of the input to fill. Provide any relevant details if there is no label, e.g. the placeholder text.',
          },
        ],
      }

      const result = assistant.mapTools([fillInputTool])

      expect(result).toBeDefined()
      if (result) {
        expect(result[0]).toEqual({
          type: 'function',
          name: 'fill_input',
          description: 'Fill the given value into the input field on the page.',
          strict: true,
          parameters: {
            type: 'object',
            properties: {
              input_type: {
                type: 'string',
                enum: ['input', 'textarea', 'select', 'radio', 'checkbox'],
                description: 'The type of the input to fill',
              },
              input_value: {
                type: 'string',
                description: 'The value to fill in the input',
              },
              input_selector: {
                type: 'string',
                description:
                  'The selector of the input to fill. It will be used as document.querySelector(input_selector).',
              },
              label_value: {
                type: 'string',
                description:
                  'The value of the label of the input to fill. Provide any relevant details if there is no label, e.g. the placeholder text.',
              },
            },
            required: ['input_type', 'input_value', 'input_selector'],
            additionalProperties: false,
          },
        })
      }
    })
  })
})
