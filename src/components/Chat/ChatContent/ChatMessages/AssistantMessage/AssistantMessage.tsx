import { memo } from 'react'

import { MessageContentType, type MessageContent } from '@/types/types'
import MarkdownMessage from '@/components/Chat/ChatContent/ChatMessages/MarkdownMessage/MarkdownMessage'
import FunctionCallMessage from './FunctionCallMessage/FunctionCallMessage'

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
              item.type === MessageContentType.OutputText ? (
                <MarkdownMessage key={item.id} text={item.text} />
              ) : item.type === MessageContentType.FunctionCall ? (
                <FunctionCallMessage key={item.id} batch={item.batch} />
              ) : null,
            )}
          </div>
        ) : null}
      </div>
    </>
  )
}

export default memo(AssistantMessage)
