import { type Message, MessageRole, type ProviderMessageResponse } from '@/types/types'
import { DateTime } from 'luxon'

export const createAssistantMessage = (
  response: ProviderMessageResponse,
  threadId: string,
): Message => {
  return {
    id: response.id,
    role: MessageRole.Assistant,
    content: response.content,
    createdAt: DateTime.now().toISO(),
    threadId,
  }
}
