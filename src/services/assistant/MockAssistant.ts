import {
  AIModel,
  AIProvider,
  MessageContentType,
  type Message,
  type ProviderMessageResponse,
} from '@/types/types'

import type { IAssistant } from './IAssistant'

export class MockAssistant implements IAssistant {
  constructor(_apiKey: string) {}

  getProvider(): AIProvider {
    return AIProvider.Mock
  }

  async sendMessage({
    signal,
  }: {
    model: AIModel
    instructions?: string
    text: string
    history?: Message[]
    signal?: AbortSignal
  }): Promise<ProviderMessageResponse> {
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
      id: 'mock-message-id',
      hasTools: false,
      content: [
        {
          id: '1',
          type: MessageContentType.OutputText,
          text: 'Hello, how can I help you today?',
        },
      ],
    }
  }

  sendFunctionCallResponse(): Promise<ProviderMessageResponse> {
    return Promise.resolve({
      id: 'mock-message-id',
      hasTools: false,
      content: [
        {
          id: '2',
          type: MessageContentType.OutputText,
          text: 'Completed',
        },
      ],
    })
  }
}
