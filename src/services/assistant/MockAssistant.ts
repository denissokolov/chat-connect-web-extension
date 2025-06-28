import { DateTime } from 'luxon'

import { AIProvider, MessageRole, type Message } from '@/types/types'

import type { IAssistant } from './IAssistant'

export class MockAssistant implements IAssistant {
  constructor(_apiKey: string) {}

  getProvider(): AIProvider {
    return AIProvider.Mock
  }

  sendMessage({ threadId }: { threadId: string }): Promise<Message> {
    return Promise.resolve({
      threadId,
      id: 'mock-assistant',
      role: MessageRole.Assistant,
      content: 'Hello, how can I help you today?',
      createdAt: DateTime.now().toISO(),
    })
  }
}
