import OpenAI from 'openai'

import { AIModel, AIProvider, type Message, MessageRole } from '@/types/types'

import type { IAssistant, SendMessageParams } from './IAssistant'

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

  async sendMessage(params: SendMessageParams): Promise<Message> {
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
    })

    return {
      id: response.id,
      role: MessageRole.Assistant,
      timestamp: new Date(),
      content: response.output_text,
    }
  }

  async *sendMessageStream(params: SendMessageParams): AsyncIterable<string> {
    // Convert history to OpenAI chat format
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []

    // Add system message if instructions provided
    if (params.instructions) {
      messages.push({
        role: 'system',
        content: params.instructions,
      })
    }

    // Add conversation history
    if (params.history) {
      for (const msg of params.history) {
        messages.push({
          role: msg.role === MessageRole.User ? 'user' : 'assistant',
          content: msg.content,
        })
      }
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: params.text,
    })

    try {
      const stream = await this.client.chat.completions.create({
        model: this.mapModelToOpenAI(params.model),
        messages,
        stream: true,
      })

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          yield content
        }
      }
    } catch (error) {
      throw new Error(
        `Streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  private mapModelToOpenAI(model: AIModel): string {
    // Map our internal model enum to OpenAI model strings
    switch (model) {
      case AIModel.OpenAI_GPT_4o:
        return 'gpt-4o'
      case AIModel.OpenAI_ChatGPT_4o:
        return 'chatgpt-4o-latest'
      case AIModel.OpenAI_GPT_4_1:
        return 'gpt-4-turbo'
      case AIModel.OpenAI_GPT_4_1_mini:
        return 'gpt-4o-mini'
      case AIModel.OpenAI_o3_mini:
        return 'o3-mini'
      case AIModel.OpenAI_o3:
        return 'o3'
      case AIModel.OpenAI_o4_mini:
        return 'o4-mini'
      default:
        return 'gpt-4o'
    }
  }
}
