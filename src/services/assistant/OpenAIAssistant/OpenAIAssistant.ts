import OpenAI from 'openai'
import type { Tool, Response } from 'openai/resources/responses/responses'
import { DateTime } from 'luxon'

import {
  AIModel,
  AIProvider,
  type Message,
  type MessageContent,
  MessageContentType,
  MessageRole,
} from '@/types/types'
import type { IAssistant } from '@/services/assistant'
import { logDebug } from '@/utils/log'

export class OpenAIAssistant implements IAssistant {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({
      dangerouslyAllowBrowser: true,
      apiKey,
    })
  }

  getProvider(): AIProvider {
    return AIProvider.OpenAI
  }

  async sendMessage(params: {
    threadId: string
    model: AIModel
    instructions?: string
    text: string
    history?: Message[]
  }): Promise<Message> {
    const previousResponseId =
      params.history && params.history.length > 0
        ? params.history[params.history.length - 1]?.id
        : undefined

    const response = await this.client.responses.create({
      model: params.model,
      instructions: params.instructions,
      input: params.text,
      previous_response_id: previousResponseId,
      store: true,
      tools: [this.getFillInputTool()],
    })

    logDebug('OpenAIAssistant.sendMessage.response', response)

    return this.parseResponse(response.id, response, params.threadId)
  }

  public parseResponse(responseId: string, response: Response, threadId: string): Message {
    return {
      id: responseId,
      role: MessageRole.Assistant,
      createdAt: DateTime.now().toISO(),
      content: response.output.reduce((acc, output) => {
        if (output.type === 'message') {
          output.content.forEach((content, index) => {
            if (content.type === 'output_text') {
              acc.push({
                id: `${output.id}-${index}`,
                type: MessageContentType.OutputText,
                text: content.text,
              })
            }
          })
        } else if (output.type === 'function_call') {
          acc.push({
            id: output.id ?? output.call_id,
            type: MessageContentType.FunctionCall,
            name: output.name,
            arguments: output.arguments,
          })
        }
        return acc
      }, [] as MessageContent[]),
      threadId,
    }
  }

  private getFillInputTool(): Tool {
    return {
      type: 'function',
      name: 'fill_input',
      description: 'Fill the input on the page with the given value',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          input_name: {
            type: 'string',
            description: 'The name attribute of the input to fill',
          },
          input_type: {
            type: 'string',
            enum: ['input', 'textarea', 'select', 'radio', 'checkbox'],
            description: 'The type of the input to fill',
          },
          value: {
            type: 'string',
            description: 'The value to fill in the input',
          },
        },
        required: ['input_name', 'input_type', 'value'],
        additionalProperties: false,
      },
    }
  }
}
