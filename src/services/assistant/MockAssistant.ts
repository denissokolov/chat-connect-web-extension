import { AIProvider, MessageRole, type Message } from '@/types/types'

import type { IAssistant } from './IAssistant'

export class MockAssistant implements IAssistant {
  getProvider(): AIProvider {
    return AIProvider.Mock
  }

  sendMessage(): Promise<Message> {
    return Promise.resolve({
      id: 'mock-assistant',
      role: MessageRole.Assistant,
      content: 'Hello, how can I help you today?',
      timestamp: new Date(),
    })
  }
}
