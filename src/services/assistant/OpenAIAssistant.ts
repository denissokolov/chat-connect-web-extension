import OpenAI from 'openai'
import { DateTime } from 'luxon'

import { AIModel, AIProvider, type Message, MessageRole } from '@/types/types'

import type { IAssistant } from './IAssistant'

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
    })

    return {
      id: response.id,
      role: MessageRole.Assistant,
      createdAt: DateTime.now().toISO(),
      content: response.output_text,
      threadId: params.threadId,
    }
  }
}
