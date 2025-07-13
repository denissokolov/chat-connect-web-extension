import {
  FunctionStatus,
  type Message,
  type MessageContent,
  MessageContentType,
  MessageRole,
  type PageContext,
} from '@/types/types'
import { DateTime } from 'luxon'

export function createAssistantMessage(
  messageId: string,
  threadId: string,
  content: MessageContent[],
): Message {
  return {
    id: messageId,
    role: MessageRole.Assistant,
    content: content,
    createdAt: DateTime.now().toISO(),
    threadId,
  }
}

export function createEmptyAssistantMessage(responseId: string, threadId: string): Message {
  return {
    id: responseId,
    role: MessageRole.Assistant,
    content: [],
    createdAt: DateTime.now().toISO(),
    threadId,
  }
}

export function createUserMessage(
  threadId: string,
  text: string,
  pageContext: PageContext | null | undefined,
  error: string | undefined,
): Message {
  return {
    id: crypto.randomUUID(),
    role: MessageRole.User,
    content: [{ type: MessageContentType.OutputText, text, id: crypto.randomUUID() }],
    createdAt: DateTime.now().toISO(),
    threadId,
    error,
    context: pageContext?.title
      ? {
          title: pageContext?.title,
          favicon: pageContext?.favicon || undefined,
          url: pageContext?.url || undefined,
        }
      : undefined,
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

export function getMessageText(message: Message): string {
  return message.content
    .map(content => (content.type === MessageContentType.OutputText ? content.text.trim() : ''))
    .join('\n')
}

export function getLastAssistantMessageId(messages: ReadonlyArray<Message>): string | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i]
    if (message?.role === MessageRole.Assistant) {
      return message.id
    }
  }
  return undefined
}

export function isMessageFunctionsCompleted(message: Message): boolean {
  return message.content.every(
    content =>
      content.type !== MessageContentType.FunctionCall ||
      content.status === FunctionStatus.Success ||
      content.status === FunctionStatus.Error,
  )
}
