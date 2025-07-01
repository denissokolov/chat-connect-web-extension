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
    expect(message.content.length).toBe(1)

    expect(message.content[0].id).toBe(`${mockMultipleOutputsResponse.output[0].id}-0`)
    expect(message.content[0].type).toBe('output_text')
    if (
      message.content[0].type === 'output_text' &&
      mockMultipleOutputsResponse.output[0].type === 'message' &&
      mockMultipleOutputsResponse.output[0].content[0].type === 'output_text'
    ) {
      expect(message.content[0].text).toBe(mockMultipleOutputsResponse.output[0].content[0].text)
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
