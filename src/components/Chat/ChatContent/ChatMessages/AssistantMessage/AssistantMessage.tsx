import { memo } from 'react'

import { FunctionName, MessageContentType, type MessageContent } from '@/types/types'
import MarkdownMessage from '@/components/Chat/ChatContent/ChatMessages/MarkdownMessage/MarkdownMessage'
import FillInputMessage from './functions/FillInputMessage'
import ClickButtonMessage from './functions/ClickButtonMessage'

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
            {content.map(item => {
              if (item.type === MessageContentType.OutputText) {
                return <MarkdownMessage key={item.id} text={item.text} />
              }

              if (item.type === MessageContentType.FunctionCall) {
                if (item.name === FunctionName.FillInput) {
                  return <FillInputMessage key={item.id} args={item.arguments} />
                }
                if (item.name === FunctionName.ClickButton) {
                  return <ClickButtonMessage key={item.id} args={item.arguments} />
                }
              }

              return null
            })}
          </div>
        ) : null}
      </div>
    </>
  )
}

export default memo(AssistantMessage)
