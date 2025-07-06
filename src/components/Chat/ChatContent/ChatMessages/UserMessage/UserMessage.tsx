import { memo } from 'react'
import { AlertCircle } from 'lucide-react'

import { type MessageContent, type MessageContext } from '@/types/types'
import ContextDisplay from '@/components/Chat/ContextDisplay/ContextDisplay'
import MarkdownMessage from '@/components/Chat/ChatContent/ChatMessages/MarkdownMessage/MarkdownMessage'

interface UserMessageProps {
  content?: MessageContent[]
  error?: string
  context?: MessageContext
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
        {error && <AlertCircle className="w-4 h-4 text-destructive" />}
        {content ? (
          <div className="max-w-full rounded-lg leading-1 p-3 bg-muted">
            {content.map(item =>
              item.type === 'output_text' ? (
                <MarkdownMessage key={item.id} text={item.text} className="text-foreground" />
              ) : null,
            )}
          </div>
        ) : null}
      </div>
      {error && (
        <div className="flex items-center gap-2 mt-2">
          <p className="text-sm text-destructive wrap-anywhere">{error}</p>
        </div>
      )}
    </>
  )
}

export default memo(UserMessage)
