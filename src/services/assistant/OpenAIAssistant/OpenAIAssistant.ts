import OpenAI from 'openai'

import { type Message, MessageContentType, type FunctionCallContent } from '@/types/chat.types'
import type { IAssistant } from '@/services/assistant'
import { logDebug, logError, logWarning } from '@/utils/log'
import {
  AIProvider,
  AIModel,
  type ProviderMessageEvent,
  ProviderMessageEventType,
} from '@/types/provider.types'
import { getLastAssistantMessageId, getMessageText } from '@/utils/message'
import { FunctionName, FunctionStatus, type AssistantTool } from '@/types/tool.types'

export class OpenAIAssistant implements IAssistant {
  private client: OpenAI
  private responseId: string | undefined
  private progress: boolean = false

  constructor(apiKey: string, serverUrl: string) {
    this.client = new OpenAI({
      dangerouslyAllowBrowser: true,
      baseURL: serverUrl.length > 0 ? serverUrl : undefined,
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
    tools: AssistantTool[]
  }): Promise<void> {
    this.progress = true

    const stream = await this.client.responses.create({
      model: params.model,
      instructions: params.instructions,
      input: getMessageText(params.message),
      previous_response_id: this.getPreviousResponseId(params.history),
      store: true,
      tools: this.mapTools(params.tools),
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
    tools: AssistantTool[]
  }): Promise<void> {
    this.progress = true

    const input = params.message.content.reduce((acc, content) => {
      if (
        content.type === MessageContentType.FunctionCall &&
        content.name !== FunctionName.Placeholder
      ) {
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
      tools: this.mapTools(params.tools),
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

        case 'response.output_item.added':
          if (event.item.type === 'function_call') {
            eventHandler({
              type: ProviderMessageEventType.FunctionCallAdded,
              messageId: this.getResponseId(),
              threadId,
              content: {
                id: event.item.call_id,
                type: MessageContentType.FunctionCall,
                name: FunctionName.Placeholder,
              },
            })
          }
          break

        case 'response.output_item.done':
          if (event.item.type === 'function_call') {
            const content = this.getFunctionCallContent(event.item)
            if (content) {
              eventHandler({
                type: ProviderMessageEventType.FunctionCallDone,
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
            messageId: this.responseId, // undefined is ok
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

    if (output.name === FunctionName.ClickElement) {
      return {
        id: output.call_id,
        type: MessageContentType.FunctionCall,
        status: FunctionStatus.Idle,
        name: FunctionName.ClickElement,
        arguments: {
          element_selector: args.element_selector,
          element_text: args.element_text,
          element_type: args.element_type,
        },
      }
    }

    if (output.name === FunctionName.GetPageContent) {
      return {
        id: output.call_id,
        type: MessageContentType.FunctionCall,
        status: FunctionStatus.Idle,
        name: FunctionName.GetPageContent,
        arguments: {
          format: args.format,
        },
      }
    }

    logWarning('Unsupported function call', output)
    return null
  }

  private getPreviousResponseId(history?: ReadonlyArray<Message>): string | undefined {
    return history ? getLastAssistantMessageId(history) : undefined
  }

  public mapTools(tools: AssistantTool[]): OpenAI.Responses.FunctionTool[] | undefined {
    if (tools.length === 0) {
      return undefined
    }

    return tools.map(tool => ({
      type: 'function',
      name: tool.name,
      description: tool.description,
      strict: true,
      parameters: {
        type: 'object',
        properties: tool.parameters.reduce(
          (acc, param) => {
            acc[param.name] = {
              type: 'string',
              description: param.description,
              enum: param.enum,
            }
            return acc
          },
          {} as Record<string, unknown>,
        ),
        required: tool.parameters.filter(param => param.required).map(param => param.name),
        additionalProperties: false,
      },
    }))
  }
}
