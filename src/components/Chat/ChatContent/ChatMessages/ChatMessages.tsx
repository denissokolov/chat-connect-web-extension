import useChatStore from '@/stores/useChatStore'

import ChatMessage from './ChatMessage/ChatMessage'
import { MessageRole } from '@/types/types'

export default function ChatMessages() {
  const messages = useChatStore(state => state.messages)
  const waitingForReply = useChatStore(state => state.waitingForReply)

  return (
    <div className="flex-1 pt-4 px-4 space-y-4 overflow-y-auto" tabIndex={0}>
      {messages.map(message => (
        <ChatMessage key={message.id} {...message} />
      ))}
      {waitingForReply && <ChatMessage role={MessageRole.Assistant} content="" progress />}
    </div>
  )
}
