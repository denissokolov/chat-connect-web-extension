import { memo } from 'react'
import { AlertCircle } from 'lucide-react'
import Markdown from 'markdown-to-jsx'

import { MessageRole, type MessageContent } from '@/types/types'
import { cn } from '@/utils/ui'

interface ChatMessageProps {
  role: MessageRole
  content?: MessageContent[]
  progress?: boolean
  error?: string
}

const markdownOptions = {
  overrides: {
    a: {
      props: {
        target: '_blank',
        rel: 'noopener noreferrer',
        className: 'underline hover:text-blue-600 transition-colors',
      },
    },
  },
}

function ChatMessage({ role, content, progress, error }: ChatMessageProps) {
  return (
    <>
      <div
        className={`flex gap-3 ${role === MessageRole.User ? 'justify-end' : 'justify-start mb-8'}`}
      >
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
        ) : content ? (
          <div
            className={cn(
              'max-w-full rounded-lg leading-1',
              role === MessageRole.User && 'p-3 bg-muted',
            )}
          >
            {content.map(item =>
              item.type === 'output_text' ? (
                <Markdown
                  key={item.id}
                  className={cn('prose text-sm', role === MessageRole.User && 'text-foreground')}
                  options={markdownOptions}
                >
                  {item.text}
                </Markdown>
              ) : null,
            )}
          </div>
        ) : null}
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
