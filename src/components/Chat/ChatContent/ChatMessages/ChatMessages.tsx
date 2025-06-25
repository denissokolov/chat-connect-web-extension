import { useEffect, useRef } from 'react'

import useChatStore from '@/stores/useChatStore'

import ChatMessage from './ChatMessage/ChatMessage'
import { MessageRole } from '@/types/types'

export default function ChatMessages() {
  const messages = useChatStore(state => state.messages)
  const waitingForReply = useChatStore(state => state.waitingForReply)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = (behavior: 'smooth' | 'instant' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    scrollToBottom('instant')
  }, [messages])

  return (
    <div className="flex-1 pt-4 px-4 space-y-4 overflow-y-auto" tabIndex={0}>
      {messages.map(message => (
        <ChatMessage key={message.id} {...message} />
      ))}
      {waitingForReply && <ChatMessage role={MessageRole.Assistant} content="" progress />}
      <div ref={messagesEndRef} className="h-4" />
    </div>
  )
}
