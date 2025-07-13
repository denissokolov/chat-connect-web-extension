import {
  FunctionStatus,
  MessageContentType,
  type FunctionCallResult,
  type Message,
  type MessageContent,
} from '@/types/types'
import type { StoreMessages } from '@/stores/useChatStore.types'
import { getStringError } from '@/utils/error'
import { getFirstTextLine } from '@/utils/message'
import { DateTime } from 'luxon'
import repository from '@/services/repository'
import { logError } from '@/utils/log'

export function addMessage(messages: StoreMessages, message: Message): StoreMessages {
  return {
    ...messages,
    list: [...messages.list, message],
  }
}

export function addMessageContent(
  messages: StoreMessages,
  messageId: string,
  content: MessageContent,
): StoreMessages {
  return {
    ...messages,
    list: messages.list.map(msg =>
      msg.id === messageId ? { ...msg, content: [...msg.content, content] } : msg,
    ),
  }
}

export function appendMessageTextContent(
  messages: StoreMessages,
  messageId: string,
  contentId: string,
  textDelta: string,
): StoreMessages {
  return {
    ...messages,
    list: messages.list.map(msg => {
      if (msg.id !== messageId) {
        return msg
      }

      let exists = false
      const nextContent = msg.content.map(i => {
        if (i.id === contentId) {
          exists = true
          if (i.type === MessageContentType.OutputText) {
            return { ...i, text: i.text + textDelta }
          }
        }
        return i
      })

      if (!exists) {
        nextContent.push({
          type: MessageContentType.OutputText,
          text: textDelta,
          id: contentId,
        })
      }

      return { ...msg, content: nextContent }
    }),
  }
}

export function setMessageError(
  messages: StoreMessages,
  error: unknown,
  userMessageId: string,
  assistantMessageId?: string | undefined,
): StoreMessages {
  return {
    ...messages,
    list: messages.list.map(msg => {
      if (msg.id === assistantMessageId) {
        return {
          ...msg,
          hasError: true,
          error: getStringError(error),
        }
      }

      if (msg.id === userMessageId) {
        return {
          ...msg,
          hasError: true,
          // If there is an assistant message, the error is displayed on the assistant message
          error: assistantMessageId ? undefined : getStringError(error),
        }
      }

      return msg
    }),
  }
}

export function updateMessageFunctionResult(
  messages: StoreMessages,
  messageId: string,
  callId: string,
  result: FunctionCallResult,
): StoreMessages {
  const status = result.success ? FunctionStatus.Success : FunctionStatus.Error
  return {
    ...messages,
    list: messages.list.map(msg =>
      msg.id === messageId
        ? {
            ...msg,
            content: msg.content.map(content =>
              content.id === callId ? { ...content, status, result } : content,
            ),
          }
        : msg,
    ),
  }
}

export async function saveMessageToRepository(message: Message, first?: boolean): Promise<void> {
  try {
    if (first) {
      const threadTitle =
        getFirstTextLine(message, 150) || DateTime.now().toLocaleString(DateTime.DATETIME_MED)

      await repository.createThread({
        id: message.threadId,
        title: threadTitle,
        createdAt: message.createdAt,
        updatedAt: message.createdAt,
      })
    } else {
      await repository.updateThread({
        id: message.threadId,
        updatedAt: message.createdAt,
      })
    }

    await repository.createMessage(message)
  } catch (error) {
    logError('Saving message to repository failed', error)
  }
}

export async function updateMessageInRepository(message: Message): Promise<void> {
  try {
    await repository.updateMessage(message)
  } catch (error) {
    logError('Updating message in repository failed', error)
  }
}
