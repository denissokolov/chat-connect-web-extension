import {
  FunctionName,
  type Message,
  type MessageContent,
  MessageContentType,
  MessageRole,
  type ProviderMessageResponse,
} from '@/types/types'
import { DateTime } from 'luxon'

export const createAssistantMessage = (
  response: ProviderMessageResponse,
  threadId: string,
): Message => {
  const batchedContent: MessageContent[] = []

  let fillInputContent: MessageContent | null = null

  for (const item of response.content) {
    if (item.type === MessageContentType.FunctionCall && item.name === FunctionName.FillInput) {
      if (fillInputContent) {
        fillInputContent.arguments.push(...item.arguments)
      } else {
        batchedContent.push(item)
        fillInputContent = item
      }
    } else {
      batchedContent.push(item)
      fillInputContent = null
    }
  }

  return {
    id: response.id,
    role: MessageRole.Assistant,
    content: batchedContent,
    createdAt: DateTime.now().toISO(),
    threadId,
  }
}
