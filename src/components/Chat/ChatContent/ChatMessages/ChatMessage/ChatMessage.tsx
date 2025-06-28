import { memo } from 'react'
import { AlertCircle } from 'lucide-react'
import Markdown from 'markdown-to-jsx'

import { MessageRole } from '@/types/types'

interface ChatMessageProps {
  role: MessageRole
  content: string
  progress?: boolean
  error?: string
}

function ChatMessage({ role, content, progress, error }: ChatMessageProps) {
  return (
    <>
      <div className={`flex gap-3 ${role === MessageRole.User ? 'justify-end' : 'justify-start'}`}>
        {error && <AlertCircle className="w-4 h-4 text-red-500 mt-3" />}
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
          <div
            className={`max-w-full rounded-lg ${role === MessageRole.User ? 'p-3 bg-muted' : ''}`}
          >
            {role === MessageRole.Assistant ? (
              <Markdown className="text-sm prose">{content}</Markdown>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{content}</p>
            )}
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-2 mt-2">
          <p className="text-sm text-red-500 wrap-anywhere">{error}</p>
        </div>
      )}
    </>
  )
}

export default memo(ChatMessage)
