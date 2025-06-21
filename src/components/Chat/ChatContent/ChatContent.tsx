import { memo, useEffect, useRef } from 'react'
import { AlertCircle, MessageCircle } from 'lucide-react'

import type { Message } from '@/types/chat.types'
import { Button } from '@/components/ui/button'

import ChatMessage from './ChatMessage/ChatMessage'

interface ChatContentProps {
  messages: Message[]
  loading: boolean
  error: string | null
  retry: () => void
}

function ChatContent({ messages, loading, error, retry }: ChatContentProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = (behavior: 'smooth' | 'instant' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    scrollToBottom('instant')
  }, [messages])

  if (loading || error || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">{'Initializing chat...'}</p>
          </>
        ) : error ? (
          <>
            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
            <p className="text-sm text-destructive mb-4">{error}</p>
            <Button onClick={retry} size="sm">
              {'Retry'}
            </Button>
          </>
        ) : (
          messages.length === 0 && (
            <>
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">{'Start a conversation by sending a message'}</p>
            </>
          )
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      {messages.map(message => (
        <ChatMessage key={message.id} {...message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default memo(ChatContent)
