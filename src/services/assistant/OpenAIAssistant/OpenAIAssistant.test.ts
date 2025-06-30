import { describe, it, expect } from 'vitest'

import { OpenAIAssistant } from './OpenAIAssistant'
import { mockMultipleOutputsResponse, mockSingleOutputResponse } from './OpenAIAssistant.mocks'
import { MessageRole } from '@/types/types'

describe('OpenAIAssistant', () => {
  it('should parse response with multiple outputs', () => {
    const assistant = new OpenAIAssistant('test')
    const message = assistant.parseResponse('resp_123', mockMultipleOutputsResponse, 'thread_123')

    expect(message).toBeDefined()
    expect(message.id).toBe('resp_123')
    expect(message.role).toBe(MessageRole.Assistant)
    expect(message.createdAt).toBeDefined()
    expect(message.threadId).toBe('thread_123')
    expect(message.error).toBeUndefined()

    expect(message.content).toBeDefined()
    expect(message.content.length).toBe(5)

    expect(message.content[0].id).toBe(`${mockMultipleOutputsResponse.output[0].id}-0`)
    expect(message.content[0].type).toBe('output_text')
    if (
      message.content[0].type === 'output_text' &&
      mockMultipleOutputsResponse.output[0].type === 'message' &&
      mockMultipleOutputsResponse.output[0].content[0].type === 'output_text'
    ) {
      expect(message.content[0].text).toBe(mockMultipleOutputsResponse.output[0].content[0].text)
    }

    expect(message.content[1].id).toBe(mockMultipleOutputsResponse.output[1].id)
    expect(message.content[1].type).toBe('function_call')
    if (message.content[1].type === 'function_call') {
      expect(message.content[1].name).toBe('fill_input')
      expect(message.content[1].arguments).toBe(
        '{"input_name":"typeofclient","input_type":"radio","value":"business"}',
      )
    }

    expect(message.content[2].id).toBe(mockMultipleOutputsResponse.output[2].id)
    expect(message.content[2].type).toBe('function_call')
    if (message.content[2].type === 'function_call') {
      expect(message.content[2].name).toBe('fill_input')
      expect(message.content[2].arguments).toBe(
        '{"input_name":"companyname","input_type":"input","value":"ABC Consultants"}',
      )
    }

    expect(message.content[3].id).toBe(mockMultipleOutputsResponse.output[3].id)
    expect(message.content[3].type).toBe('function_call')
    if (message.content[3].type === 'function_call') {
      expect(message.content[3].name).toBe('fill_input')
      expect(message.content[3].arguments).toBe(
        '{"input_name":"firstname","input_type":"input","value":"Lucas"}',
      )
    }

    expect(message.content[4].id).toBe(mockMultipleOutputsResponse.output[4].id)
    expect(message.content[4].type).toBe('function_call')
    if (message.content[4].type === 'function_call') {
      expect(message.content[4].name).toBe('fill_input')
      expect(message.content[4].arguments).toBe(
        '{"input_name":"lastname","input_type":"input","value":"Vermeer"}',
      )
    }
  })

  it('should parse response with single output', () => {
    const assistant = new OpenAIAssistant('test')
    const message = assistant.parseResponse('resp_123', mockSingleOutputResponse, 'thread_123')

    expect(message).toBeDefined()
    expect(message.id).toBe('resp_123')
    expect(message.role).toBe(MessageRole.Assistant)
    expect(message.createdAt).toBeDefined()
    expect(message.threadId).toBe('thread_123')
    expect(message.error).toBeUndefined()

    expect(message.content).toBeDefined()
    expect(message.content.length).toBe(1)

    expect(message.content[0].id).toBe(`${mockSingleOutputResponse.output[0].id}-0`)
    expect(message.content[0].type).toBe('output_text')
    if (
      message.content[0].type === 'output_text' &&
      mockSingleOutputResponse.output[0].type === 'message' &&
      mockSingleOutputResponse.output[0].content[0].type === 'output_text'
    ) {
      expect(message.content[0].text).toBe(mockSingleOutputResponse.output[0].content[0].text)
    }
  })
})
