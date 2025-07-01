import { memo } from 'react'
import { AlertCircle } from 'lucide-react'
import Markdown from 'markdown-to-jsx'

import { type MessageContent, type MessageContext } from '@/types/types'
import ContextDisplay from '@/components/ui/context-display'

interface UserMessageProps {
  content?: MessageContent[]
  error?: string
  context?: MessageContext
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

function UserMessage({ content, error, context }: UserMessageProps) {
  return (
    <>
      {context && (
        <div className="flex justify-end mb-2">
          <ContextDisplay context={context} />
        </div>
      )}
      <div className="flex gap-3 justify-end items-center">
        {error && <AlertCircle className="w-4 h-4 text-red-500" />}
        {content ? (
          <div className="max-w-full rounded-lg leading-1 p-3 bg-muted">
            {content.map(item =>
              item.type === 'output_text' ? (
                <Markdown
                  key={item.id}
                  className="prose text-sm text-foreground"
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

export default memo(UserMessage)
