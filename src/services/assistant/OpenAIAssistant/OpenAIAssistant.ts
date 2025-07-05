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

    const functionCallResponse = await this.sendFunctionCallResponse(params.model, response)

    return this.parseResponse(response, functionCallResponse)
  }

  private async sendFunctionCallResponse(
    model: AIModel,
    response: Response,
  ): Promise<Response | null> {
    const functionCalls = response.output
      .filter(output => output.type === 'function_call')
      .map<ResponseInputItem.FunctionCallOutput>(output => ({
        type: 'function_call_output',
        call_id: output.call_id,
        output: 'success',
      }))

    if (functionCalls.length > 0) {
      const functionCallResponse = await this.client.responses.create({
        model,
        input: functionCalls,
        previous_response_id: response.id,
        store: true,
        tools: [this.getFillInputTool(), this.getClickButtonTool()],
        instructions:
          "Important: Don't say anything about the result of the function call. We don't know has the user clicked the button or filled the input.",
      })
      logDebug('OpenAIAssistant.sendMessage.functionCallResponse', functionCallResponse)
      return functionCallResponse
    }
    return null
  }

  private getPreviousResponseId(history?: Message[]): string | undefined {
    return history && history.length > 0 ? history[history.length - 1]?.id : undefined
  }

  public parseResponse(
    response: Response,
    functionCallResponse?: Response | null,
  ): ProviderMessageResponse {
    const combinedOutput = functionCallResponse
      ? [...response.output, ...functionCallResponse.output]
      : response.output

    return {
      id: functionCallResponse?.id || response.id,
      content: combinedOutput.reduce((acc, output) => {
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
          const args = JSON.parse(output.arguments)
          if (output.name === FunctionName.FillInput) {
            acc.push({
              id: output.call_id,
              type: MessageContentType.FunctionCall,
              name: FunctionName.FillInput,
              arguments: [
                {
                  id: output.call_id,
                  input_type: args.input_type,
                  input_value: args.input_value,
                  input_selector: args.input_selector,
                  label_value: args.label_value,
                },
              ],
            })
          } else if (output.name === FunctionName.ClickButton) {
            acc.push({
              id: output.id || output.call_id,
              type: MessageContentType.FunctionCall,
              name: FunctionName.ClickButton,
              arguments: {
                id: output.call_id,
                button_selector: args.button_selector,
                button_text: args.button_text,
              },
            })
          }
        }
        return acc
      }, [] as MessageContent[]),
    }
  }

  private getFillInputTool(): Tool {
    return {
      type: 'function',
      name: 'fill_input',
      description:
        "Fill the given value into the input field on the page. This function will be called by user manually, you don't need to know the result.",
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
      description:
        "Click the button on the page. This function will be called by user manually, you don't need to know the result.",
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
              'The text of the button to click. Provide any relevant details if there is no text, e.g. the button la.',
          },
        },
        required: ['button_selector', 'button_text'],
        additionalProperties: false,
      },
    }
  }
}
