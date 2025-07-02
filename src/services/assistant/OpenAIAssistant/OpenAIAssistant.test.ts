import { describe, it, expect } from 'vitest'

import { OpenAIAssistant } from './OpenAIAssistant'
import { mockMultipleOutputsResponse, mockSingleOutputResponse } from './OpenAIAssistant.mocks'

describe('OpenAIAssistant', () => {
  it('should parse response with multiple outputs', () => {
    const assistant = new OpenAIAssistant('test')
    const message = assistant.parseResponse('resp_123', mockMultipleOutputsResponse)

    expect(message).toBeDefined()
    expect(message.id).toBe('resp_123')

    expect(message.content).toBeDefined()
    expect(message.content.length).toBe(4)

    expect(message.content[0].id).toBe(`${mockMultipleOutputsResponse.output[0].id}-0`)
    expect(message.content[0].type).toBe('output_text')
    if (
      message.content[0].type === 'output_text' &&
      mockMultipleOutputsResponse.output[0].type === 'message' &&
      mockMultipleOutputsResponse.output[0].content[0].type === 'output_text'
    ) {
      expect(message.content[0].text).toBe(mockMultipleOutputsResponse.output[0].content[0].text)
    }

    expect(message.content[1].id).toBeDefined()
    expect(message.content[1].type).toBe('function_call')
    if (
      message.content[1].type === 'function_call' &&
      message.content[1].name === 'fill_input' &&
      message.content[1].arguments.length === 1
    ) {
      expect(message.content[1].arguments[0].input_type).toBe('radio')
      expect(message.content[1].arguments[0].input_value).toBe('personal')
      expect(message.content[1].arguments[0].input_selector).toBe('typeofclient')
      expect(message.content[1].arguments[0].label_value).toBe('Particulier')
    } else {
      throw new Error('Invalid function call #1')
    }

    expect(message.content[2].id).toBeDefined()
    expect(message.content[2].type).toBe('function_call')
    if (
      message.content[2].type === 'function_call' &&
      message.content[2].name === 'fill_input' &&
      message.content[2].arguments.length === 1
    ) {
      expect(message.content[2].arguments[0].input_type).toBe('input')
      expect(message.content[2].arguments[0].input_value).toBe('Jan')
      expect(message.content[2].arguments[0].input_selector).toBe('#firstname')
      expect(message.content[2].arguments[0].label_value).toBe('Naam')
    } else {
      throw new Error('Invalid function call #2')
    }

    expect(message.content[3].id).toBe(mockMultipleOutputsResponse.output[3].id)
    expect(message.content[3].type).toBe('function_call')
    if (message.content[3].type === 'function_call' && message.content[3].name === 'click_button') {
      expect(message.content[3].arguments.button_selector).toBe('#submit')
      expect(message.content[3].arguments.button_text).toBe('Bestellen')
    } else {
      throw new Error('Invalid function call #3')
    }
  })

  it('should parse response with single output', () => {
    const assistant = new OpenAIAssistant('test')
    const message = assistant.parseResponse('resp_123', mockSingleOutputResponse)

    expect(message).toBeDefined()
    expect(message.id).toBe('resp_123')

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
