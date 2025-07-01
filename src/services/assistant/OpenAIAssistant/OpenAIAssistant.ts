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
      description: `Fill the given value into the input field on the page. At least one of 'input_name' or 'input_id' is required.`,
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
          input_name: {
            type: ['string', 'null'],
            description: 'The name attribute of the input to fill',
          },
          input_id: {
            type: ['string', 'null'],
            description: 'The id attribute of the input to fill',
          },
          label_value: {
            type: 'string',
            description:
              'The value of the label of the input to fill. Provide any relevant details if there is no label, e.g. the placeholder text.',
          },
        },
        required: ['input_type', 'input_value', 'input_name', 'input_id', 'label_value'],
        additionalProperties: false,
      },
    }
  }
}
