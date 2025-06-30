import { DateTime } from 'luxon'

import { AIModel, AIProvider, MessageContentType, MessageRole, type Message } from '@/types/types'

import type { IAssistant } from './IAssistant'

export class MockAssistant implements IAssistant {
  constructor(_apiKey: string) {}

  getProvider(): AIProvider {
    return AIProvider.Mock
  }

  async sendMessage({
    threadId,
    signal,
  }: {
    threadId: string
    model: AIModel
    instructions?: string
    text: string
    history?: Message[]
    signal?: AbortSignal
  }): Promise<Message> {
    // Simulate API delay
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, 1000)

      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeout)
          reject(new Error('Request aborted'))
        })
      }
    })

    return {
      threadId,
      id: 'mock-assistant',
      role: MessageRole.Assistant,
      content: [
        { type: MessageContentType.OutputText, text: 'Hello, how can I help you today?', id: '1' },
      ],
      createdAt: DateTime.now().toISO(),
    }
  }
}
