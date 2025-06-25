import { AIProvider, MessageRole, type Message } from '@/types/types'

import type { IAssistant, SendMessageParams } from './IAssistant'

export class MockAssistant implements IAssistant {
  getProvider(): AIProvider {
    return AIProvider.Mock
  }

  sendMessage(params: SendMessageParams): Promise<Message> {
    return Promise.resolve({
      id: 'mock-assistant',
      role: MessageRole.Assistant,
      content: `Mock response to: "${params.text}"`,
      timestamp: new Date(),
    })
  }

  async *sendMessageStream(params: SendMessageParams): AsyncIterable<string> {
    const response = `Mock streaming response to: "${params.text}"`
    const words = response.split(' ')

    for (const word of words) {
      yield word + ' '
      // Simulate streaming delay
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
}
