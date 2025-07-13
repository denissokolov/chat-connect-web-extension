import { describe, it, expect, vi } from 'vitest'

import { OpenAIAssistant } from './OpenAIAssistant'
import { mockMultipleOutputsResponse, mockSingleOutputResponse } from './OpenAIAssistant.mocks'
import {
  AIModel,
  ProviderMessageEventType,
  type ProviderMessageEvent,
} from '@/types/provider.types'
import { MessageContentType, FunctionStatus, FunctionName, MessageRole } from '@/types/types'

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
            name: 'click_button',
            arguments: '{"button_selector":"#submit","button_text":"Bestellen"}',
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
        },
        eventHandler,
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
          name: FunctionName.ClickButton,
          arguments: {
            button_selector: '#submit',
            button_text: 'Bestellen',
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
        },
        eventHandler,
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
        },
        eventHandler,
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
})
