import OpenAI from 'openai'
import type { Tool, Response, ResponseInputItem } from 'openai/resources/responses/responses'

import {
  AIModel,
  AIProvider,
  type Message,
  MessageContentType,
  type MessageContent,
  type ProviderMessageResponse,
  FunctionName,
  FunctionStatus,
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
    model: AIModel
    instructions?: string
    text: string
    history?: Message[]
    signal?: AbortSignal
  }): Promise<ProviderMessageResponse> {
    const response = await this.client.responses.create(
      {
        model: params.model,
        instructions: params.instructions,
        input: params.text,
        previous_response_id: this.getPreviousResponseId(params.history),
        store: true,
        tools: [this.getFillInputTool(), this.getClickButtonTool()],
      },
      {
        signal: params.signal,
      },
    )

    logDebug('OpenAIAssistant.sendMessage.response', response)

    return this.parseResponse(response)
  }

  public async sendFunctionCallResponse(params: {
    model: AIModel
    message: Message
  }): Promise<ProviderMessageResponse> {
    const input = params.message.content.reduce((acc, content) => {
      if (content.type === MessageContentType.FunctionCall) {
        acc.push({
          type: 'function_call_output',
          call_id: content.id,
          output: JSON.stringify(content.result),
        })
      }
      return acc
    }, [] as ResponseInputItem.FunctionCallOutput[])

    const response = await this.client.responses.create({
      model: params.model,
      input,
      previous_response_id: params.message.id,
      store: true,
      tools: [this.getFillInputTool(), this.getClickButtonTool()],
    })

    logDebug('OpenAIAssistant.sendMessage.functionCallResponse', response)

    return this.parseResponse(response)
  }

  private getPreviousResponseId(history?: Message[]): string | undefined {
    return history && history.length > 0 ? history[history.length - 1]?.id : undefined
  }

  public parseResponse(response: Response): ProviderMessageResponse {
    let hasTools = false
    const result = response.output.reduce((acc, output) => {
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
        hasTools = true
        const args = JSON.parse(output.arguments)
        if (output.name === FunctionName.FillInput) {
          acc.push({
            id: output.call_id,
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Idle,
            name: FunctionName.FillInput,
            arguments: {
              input_type: args.input_type,
              input_value: args.input_value,
              input_selector: args.input_selector,
              label_value: args.label_value,
            },
          })
        } else if (output.name === FunctionName.ClickButton) {
          acc.push({
            id: output.call_id,
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Idle,
            name: FunctionName.ClickButton,
            arguments: {
              button_selector: args.button_selector,
              button_text: args.button_text,
            },
          })
        }
      }
      return acc
    }, [] as MessageContent[])

    return {
      id: response.id,
      content: result,
      hasTools,
    }
  }

  private getFillInputTool(): Tool {
    return {
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
        required: ['input_type', 'input_value', 'input_selector', 'label_value'],
        additionalProperties: false,
      },
    }
  }

  private getClickButtonTool(): Tool {
    return {
      type: 'function',
      name: 'click_button',
      description: 'Click the button on the page.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          button_selector: {
            type: 'string',
            description:
              'The selector of the button to click. It will be used as document.querySelector(button_selector).',
          },
          button_text: {
            type: 'string',
            description:
              'The text of the button to click. Provide any relevant details if there is no text, e.g. the button label.',
          },
        },
        required: ['button_selector', 'button_text'],
        additionalProperties: false,
      },
    }
  }
}
