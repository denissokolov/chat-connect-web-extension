import { describe, it, expect, vi } from 'vitest'

import { OpenAIAssistant } from './OpenAIAssistant'
import { mockMultipleOutputsResponse, mockSingleOutputResponse } from './OpenAIAssistant.mocks'
import { AIModel } from '@/types/types'

describe('OpenAIAssistant', () => {
  it('should parse response with multiple outputs', () => {
    const assistant = new OpenAIAssistant('test')
    const message = assistant.parseResponse(mockMultipleOutputsResponse)

    expect(message).toBeDefined()
    expect(message.id).toBe(mockMultipleOutputsResponse.id)

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
    const message = assistant.parseResponse(mockSingleOutputResponse)

    expect(message).toBeDefined()
    expect(message.id).toBe(mockSingleOutputResponse.id)

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

  it('should automatically send function call response', async () => {
    // Mock the OpenAI client
    const mockCreate = vi.fn()
    const assistant = new OpenAIAssistant('test')

    // Mock the client.responses.create method
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(assistant as any).client.responses.create = mockCreate

    // First call returns response with function calls
    // Second call returns response after function call execution
    const functionCallResponse = {
      ...mockSingleOutputResponse,
      id: 'resp_function_call_response',
      output: [
        {
          id: 'msg_function_call_response',
          type: 'message',
          status: 'completed',
          content: [
            {
              type: 'output_text',
              text: 'Function call executed successfully.',
              annotations: [],
              logprobs: [],
            },
          ],
          role: 'assistant',
        },
      ],
    }

    mockCreate
      .mockResolvedValueOnce(mockMultipleOutputsResponse)
      .mockResolvedValueOnce(functionCallResponse)

    const message = await assistant.sendMessage({
      model: AIModel.OpenAI_GPT_4_1,
      text: 'Fill the input field with the value "test"',
    })

    // Assert that the client was called twice (initial + function call response)
    expect(mockCreate).toHaveBeenCalledTimes(2)

    // Assert that the second call includes function call outputs
    expect(mockCreate).toHaveBeenNthCalledWith(2, {
      model: AIModel.OpenAI_GPT_4_1,
      input: [
        {
          type: 'function_call_output',
          call_id: 'call_V8DXgOfseNt66chXUplx7L2Z',
          output: 'success',
        },
        {
          type: 'function_call_output',
          call_id: 'call_LH7df6L6NqMKezUq1DN81PYb',
          output: 'success',
        },
        {
          type: 'function_call_output',
          call_id: 'call_112keBYEDQI5dgV01fLbW3aC',
          output: 'success',
        },
      ],
      previous_response_id: mockMultipleOutputsResponse.id,
      store: true,
      tools: expect.any(Array),
      instructions: expect.stringContaining("Don't say anything about the result"),
    })

    // Assert that the final response uses the function call response ID
    expect(message.id).toBe('resp_function_call_response')

    // Assert that content includes both original and function call responses
    expect(message.content).toHaveLength(5) // 4 from original + 1 from function call response
  })
})
