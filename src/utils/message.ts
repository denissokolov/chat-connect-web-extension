import { FunctionStatus } from '@/types/tool.types'
import {
  type Message,
  type MessageContent,
  MessageContentType,
  type MessageGroup,
  MessageRole,
} from '@/types/chat.types'
import { type PageContext } from '@/types/browser.types'
import { DateTime } from 'luxon'

export function createAssistantMessage(
  messageId: string,
  threadId: string,
  content: MessageContent[],
  complete: boolean,
): Message {
  return {
    id: messageId,
    role: MessageRole.Assistant,
    content: content,
    createdAt: DateTime.now().toISO(),
    threadId,
    complete,
  }
}

export function createEmptyAssistantMessage(responseId: string, threadId: string): Message {
  return {
    id: responseId,
    role: MessageRole.Assistant,
    content: [],
    createdAt: DateTime.now().toISO(),
    threadId,
    complete: false,
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
    complete: true,
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
    if (message && message.role === MessageRole.Assistant && message.complete && !message.error) {
      return message.id
    }
  }
  return undefined
}

export function areMessageFunctionsComplete(message: Message): boolean {
  let hasFunction = false

  for (const content of message.content) {
    if (content.type === MessageContentType.FunctionCall) {
      hasFunction = true
      if (content.status !== FunctionStatus.Success && content.status !== FunctionStatus.Error) {
        return false
      }
    }
  }

  return hasFunction
}

export function splitMessagesIntoGroups(messages: ReadonlyArray<Message>): MessageGroup[] {
  const result: MessageGroup[] = []

  messages.forEach((message, index) => {
    if (message.role === MessageRole.User || index === 0) {
      result.push({ id: message.id, messages: [], history: message.history ?? false })
    }
    result[result.length - 1].messages.push(message)
  })

  return result
}
