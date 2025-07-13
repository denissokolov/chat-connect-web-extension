import { MessageContentType, type Message } from '@/types/types'
import {
  AIProvider,
  type ProviderMessageEvent,
  ProviderMessageEventType,
} from '@/types/provider.types'

import type { IAssistant } from './IAssistant'

export class MockAssistant implements IAssistant {
  constructor(_apiKey: string) {}

  private progress: boolean = false

  getProvider(): AIProvider {
    return AIProvider.Mock
  }

  async sendMessage({
    message,
    eventHandler,
  }: {
    message: Message
    eventHandler: (event: ProviderMessageEvent) => void
  }): Promise<void> {
    this.progress = true

    eventHandler({
      type: ProviderMessageEventType.Created,
      messageId: 'mock-message-id',
      threadId: message.threadId,
    })

    // Simulate API delay
    await new Promise(resolve => {
      setTimeout(resolve, 200)
    })

    if (!this.progress) {
      return
    }

    eventHandler({
      type: ProviderMessageEventType.OutputTextDelta,
      messageId: 'mock-message-id',
      threadId: message.threadId,
      contentId: '1',
      textDelta: 'Hello, how can I help you today?',
    })

    eventHandler({
      type: ProviderMessageEventType.Completed,
      messageId: 'mock-message-id',
      threadId: message.threadId,
      userMessageId: message.id,
    })

    this.progress = false
  }

  sendFunctionCallResponse({
    message,
    eventHandler,
  }: {
    message: Message
    eventHandler: (event: ProviderMessageEvent) => void
  }): Promise<void> {
    eventHandler({
      type: ProviderMessageEventType.Fallback,
      messageId: 'mock-message-id',
      threadId: message.threadId,
      userMessageId: message.id,
      content: [
        {
          id: '2',
          type: MessageContentType.OutputText,
          text: 'Completed',
        },
      ],
      hasTools: false,
    })

    return Promise.resolve()
  }

  cancelActiveRequest(): void {
    this.progress = false
  }
}
