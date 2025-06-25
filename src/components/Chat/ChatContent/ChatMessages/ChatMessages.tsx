import { useEffect, useRef } from 'react'

import useChatStore from '@/stores/useChatStore'

import ChatMessage from './ChatMessage/ChatMessage'
import { MessageRole } from '@/types/types'

export default function ChatMessages() {
  const messages = useChatStore(state => state.messages)
  const waitingForReply = useChatStore(state => state.waitingForReply)
  const streamingMessageId = useChatStore(state => state.streamingMessageId)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = (behavior: 'smooth' | 'instant' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    // Auto-scroll when messages change, but NOT during streaming
    if (!streamingMessageId) {
      scrollToBottom('instant')
    }
  }, [messages, streamingMessageId])

  return (
    <div className="flex-1 pt-4 px-4 space-y-4 overflow-y-auto">
      {messages.map(message => (
        <ChatMessage
          key={message.id}
          role={message.role}
          content={message.content}
          timestamp={message.timestamp}
          streaming={message.streaming}
        />
      ))}
      {waitingForReply && <ChatMessage role={MessageRole.Assistant} content="" progress />}
      <div ref={messagesEndRef} className="h-4" />
    </div>
  )
}
