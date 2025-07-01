import { memo } from 'react'
import { AlertCircle } from 'lucide-react'
import Markdown from 'markdown-to-jsx'

import { type MessageContent } from '@/types/types'

interface AssistantMessageProps {
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

function AssistantMessage({ content, progress, error }: AssistantMessageProps) {
  return (
    <>
      <div className="flex gap-3 justify-start mb-8">
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
          <div className="max-w-full rounded-lg leading-1">
            {content.map(item =>
              item.type === 'output_text' ? (
                <Markdown key={item.id} className="prose text-sm" options={markdownOptions}>
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

export default memo(AssistantMessage)
