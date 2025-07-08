import {
  type Message,
  MessageContentType,
  MessageRole,
  type ProviderMessageResponse,
} from '@/types/types'
import { DateTime } from 'luxon'

export function createAssistantMessage(
  response: ProviderMessageResponse,
  threadId: string,
): Message {
  return {
    id: response.id,
    role: MessageRole.Assistant,
    content: response.content,
    createdAt: DateTime.now().toISO(),
    threadId,
  }
}

export function getFirstTextLine(message: Message, maxLength: number): string | undefined {
  const text = message.content.find(content => content.type === MessageContentType.OutputText)?.text
  if (!text) {
    return undefined
  }

  const firstLine = text.split('\n')[0]

  if (firstLine.length <= maxLength) {
    return firstLine
  }

  return `${firstLine.slice(0, maxLength)}...`
}
