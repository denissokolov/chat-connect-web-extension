import { useEffect, useRef } from 'react'

import type { Message } from '@/types/chat.types'
import ChatMessage from './ChatMessage/ChatMessage'

interface ChatContentProps {
  messages: Message[]
}

export default function ChatMessages({ messages }: ChatContentProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = (behavior: 'smooth' | 'instant' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    scrollToBottom('instant')
  }, [messages])

  return (
    <div className="flex-1 pt-4 px-4 space-y-4 overflow-y-auto">
      {messages.map(message => (
        <ChatMessage key={message.id} {...message} />
      ))}
      <div ref={messagesEndRef} className="h-4" />
    </div>
  )
}
