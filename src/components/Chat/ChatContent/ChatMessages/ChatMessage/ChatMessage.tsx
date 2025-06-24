import { User, Bot } from 'lucide-react'

import { MessageRole } from '@/types/types'

interface ChatMessageProps {
  role: MessageRole
  content: string
  timestamp?: Date
  progress?: boolean
}

function ChatMessage({ role, content, timestamp, progress }: ChatMessageProps) {
  return (
    <div className={`flex gap-3 ${role === MessageRole.User ? 'justify-end' : 'justify-start'}`}>
      {role === MessageRole.Assistant && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}

      {progress ? (
        <div className="bg-muted rounded-lg p-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>
      ) : (
        <div
          className={`max-w-[70%] rounded-lg p-3 ${
            role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{content}</p>
          {timestamp && <p className="text-xs opacity-70 mt-1">{timestamp.toLocaleTimeString()}</p>}
        </div>
      )}

      {role === MessageRole.User && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
    </div>
  )
}

export default ChatMessage
