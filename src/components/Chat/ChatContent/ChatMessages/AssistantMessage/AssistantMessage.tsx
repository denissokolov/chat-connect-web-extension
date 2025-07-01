import { memo } from 'react'

import { type MessageContent } from '@/types/types'
import MarkdownMessage from '@/components/Chat/ChatContent/ChatMessages/MarkdownMessage/MarkdownMessage'

interface AssistantMessageProps {
  content?: MessageContent[]
  progress?: boolean
}

function AssistantMessage({ content, progress }: AssistantMessageProps) {
  return (
    <>
      <div className="flex gap-3 justify-start mb-8">
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
                <MarkdownMessage key={item.id} text={item.text} />
              ) : null,
            )}
          </div>
        ) : null}
      </div>
    </>
  )
}

export default memo(AssistantMessage)
