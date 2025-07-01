import useChatStore from '@/stores/useChatStore'

import UserMessage from './UserMessage/UserMessage'
import AssistantMessage from './AssistantMessage/AssistantMessage'
import { MessageRole } from '@/types/types'

export default function ChatMessages() {
  const messages = useChatStore(state => state.messages)
  const waitingForReply = useChatStore(state => state.waitingForReply)

  return (
    <div className="flex-1 py-4 px-4 space-y-4 overflow-y-auto" tabIndex={0}>
      {messages.map(message =>
        message.role === MessageRole.User ? (
          <UserMessage
            key={message.id}
            content={message.content}
            error={message.error}
            context={message.context}
          />
        ) : (
          <AssistantMessage key={message.id} content={message.content} />
        ),
      )}
      {waitingForReply && <AssistantMessage progress />}
    </div>
  )
}
