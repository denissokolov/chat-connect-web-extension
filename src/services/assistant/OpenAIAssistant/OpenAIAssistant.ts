import OpenAI from 'openai'

import {
  type Message,
  MessageContentType,
  FunctionName,
  FunctionStatus,
  type FunctionCallContent,
} from '@/types/types'
import type { IAssistant } from '@/services/assistant'
import { logDebug, logError, logWarning } from '@/utils/log'
import {
  AIProvider,
  AIModel,
  type ProviderMessageEvent,
  ProviderMessageEventType,
} from '@/types/provider.types'
import { getLastAssistantMessageId, getMessageText } from '@/utils/message'

export class OpenAIAssistant implements IAssistant {
  private client: OpenAI
  private responseId: string | undefined
  private progress: boolean = false

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
    message: Message
    history?: ReadonlyArray<Message>
    signal?: AbortSignal
    eventHandler: (event: ProviderMessageEvent) => void
  }): Promise<void> {
    this.progress = true

    const stream = await this.client.responses.create({
      model: params.model,
      instructions: params.instructions,
      input: getMessageText(params.message),
      previous_response_id: this.getPreviousResponseId(params.history),
      store: true,
      tools: [this.getFillInputTool(), this.getClickButtonTool()],
      stream: true,
    })

    await this.handleResponseStream(
      stream,
      params.eventHandler,
      params.message.threadId,
      params.message.id,
    )
  }

  public async sendFunctionCallResponse(params: {
    model: AIModel
    message: Message
    eventHandler: (event: ProviderMessageEvent) => void
  }): Promise<void> {
    this.progress = true

    const input = params.message.content.reduce((acc, content) => {
      if (content.type === MessageContentType.FunctionCall) {
        acc.push({
          type: 'function_call_output',
          call_id: content.id,
          output: JSON.stringify(content.result),
        })
      }
      return acc
    }, [] as OpenAI.Responses.ResponseInputItem.FunctionCallOutput[])

    const stream = await this.client.responses.create({
      model: params.model,
      input,
      previous_response_id: params.message.id,
      store: true,
      tools: [this.getFillInputTool(), this.getClickButtonTool()],
      stream: true,
    })

    await this.handleResponseStream(
      stream,
      params.eventHandler,
      params.message.threadId,
      params.message.id,
    )
  }

  private getResponseId(): string {
    if (!this.responseId) {
      throw new Error('Response ID is not set')
    }
    return this.responseId
  }

  cancelActiveRequest(): void {
    this.progress = false
  }

  private async handleResponseStream(
    stream: AsyncIterable<OpenAI.Responses.ResponseStreamEvent>,
    eventHandler: (event: ProviderMessageEvent) => void,
    threadId: string,
    userMessageId: string,
  ): Promise<void> {
    for await (const event of stream) {
      if (!this.progress) {
        // request is cancelled
        return
      }

      switch (event.type) {
        case 'response.created': {
          logDebug('OpenAIAssistant.sendMessage.response.created', event)
          this.responseId = event.response.id
          eventHandler({
            type: ProviderMessageEventType.Created,
            messageId: this.getResponseId(),
            threadId,
          })
          break
        }

        case 'response.output_text.delta':
          eventHandler({
            type: ProviderMessageEventType.OutputTextDelta,
            messageId: this.getResponseId(),
            threadId,
            contentId: this.getTextContentId(event.item_id, event.content_index),
            textDelta: event.delta,
          })
          break

        case 'response.output_item.done':
          if (event.item.type === 'function_call') {
            const content = this.getFunctionCallContent(event.item)
            if (content) {
              eventHandler({
                type: ProviderMessageEventType.FunctionCall,
                messageId: this.getResponseId(),
                threadId,
                content,
              })
            }
          }
          break

        case 'response.completed':
          logDebug('OpenAIAssistant.sendMessage.response.completed', event)
          eventHandler({
            type: ProviderMessageEventType.Completed,
            messageId: this.getResponseId(),
            userMessageId,
            threadId,
          })
          break

        case 'error':
          logError('OpenAIAssistant.sendMessage.response.error', event)
          eventHandler({
            type: ProviderMessageEventType.Error,
            messageId: this.getResponseId(),
            userMessageId,
            threadId,
            error: event.message,
          })
          break
      }
    }
  }

  private getTextContentId(outputId: string, contentIndex: number): string {
    return `${outputId}-${contentIndex}`
  }

  private getFunctionCallContent(
    output: OpenAI.Responses.ResponseFunctionToolCall,
  ): FunctionCallContent | null {
    const args = JSON.parse(output.arguments)

    if (output.name === FunctionName.FillInput) {
      return {
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
      }
    }

    if (output.name === FunctionName.ClickButton) {
      return {
        id: output.call_id,
        type: MessageContentType.FunctionCall,
        status: FunctionStatus.Idle,
        name: FunctionName.ClickButton,
        arguments: {
          button_selector: args.button_selector,
          button_text: args.button_text,
        },
      }
    }

    logWarning('Unsupported function call', output)
    return null
  }

  private getPreviousResponseId(history?: ReadonlyArray<Message>): string | undefined {
    return history ? getLastAssistantMessageId(history) : undefined
  }

  private getFillInputTool(): OpenAI.Responses.Tool {
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

  private getClickButtonTool(): OpenAI.Responses.Tool {
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
