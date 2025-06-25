import { MessageRole } from '@/types/types'
import Markdown from 'markdown-to-jsx'

interface ChatMessageProps {
  role: MessageRole
  content: string
  timestamp?: Date
  progress?: boolean
  streaming?: boolean
}

function ChatMessage({ role, content, progress, streaming }: ChatMessageProps) {
  return (
    <div className={`flex gap-3 ${role === MessageRole.User ? 'justify-end' : 'justify-start'}`}>
      {progress ? (
        <div className="rounded-lg p-3">
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
        <div className={`max-w-full rounded-lg ${role === MessageRole.User ? 'p-3 bg-muted' : ''}`}>
          {role === MessageRole.Assistant ? (
            <div className="relative">
              <Markdown className="text-sm prose">{content}</Markdown>
              {streaming && (
                <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1 align-text-bottom">
                  {'|'}
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default ChatMessage
