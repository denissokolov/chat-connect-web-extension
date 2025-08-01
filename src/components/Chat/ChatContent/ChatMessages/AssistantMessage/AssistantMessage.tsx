import { memo } from 'react'

import { MessageContentType, type MessageContent } from '@/types/chat.types'
import { FunctionName, type FunctionCallResult } from '@/types/tool.types'
import MarkdownMessage from '@/components/Chat/ChatContent/ChatMessages/MarkdownMessage/MarkdownMessage'
import AssistantProgress from '@/components/Chat/ChatContent/ChatMessages/AssistantProgress/AssistantProgress'
import FillInputMessage from './functions/FillInputMessage'
import ClickElementMessage from './functions/ClickElementMessage'
import GetPageContentMessage from './functions/GetPageContentMessage'

interface AssistantMessageProps {
  messageId: string
  content: MessageContent[]
  saveFunctionResult: (
    messageId: string,
    callId: string,
    result: FunctionCallResult,
  ) => Promise<void>
  autoExecuteTools: boolean
  error?: string
}

function AssistantMessage({
  messageId,
  content,
  saveFunctionResult,
  autoExecuteTools,
  error,
}: AssistantMessageProps) {
  return (
    <div className="max-w-full leading-1">
      {content.map(item => {
        if (item.type === MessageContentType.OutputText) {
          return <MarkdownMessage key={item.id} text={item.text} />
        }

        if (item.type === MessageContentType.FunctionCall) {
          switch (item.name) {
            case FunctionName.FillInput:
              return (
                <FillInputMessage
                  key={item.id}
                  args={item.arguments}
                  messageId={messageId}
                  callId={item.id}
                  status={item.status}
                  error={item.result?.error}
                  saveResult={saveFunctionResult}
                  autoExecute={autoExecuteTools}
                />
              )
            case FunctionName.ClickElement:
              return (
                <ClickElementMessage
                  key={item.id}
                  args={item.arguments}
                  messageId={messageId}
                  callId={item.id}
                  status={item.status}
                  error={item.result?.error}
                  saveResult={saveFunctionResult}
                  autoExecute={autoExecuteTools}
                />
              )
            case FunctionName.GetPageContent:
              return (
                <GetPageContentMessage
                  key={item.id}
                  args={item.arguments}
                  messageId={messageId}
                  callId={item.id}
                  status={item.status}
                  error={item.result?.error}
                  saveResult={saveFunctionResult}
                />
              )
            case FunctionName.Placeholder:
              return <AssistantProgress key={item.id} />
          }
        }

        return null
      })}
      {error && (
        <div className="flex items-center gap-2 mt-2 justify-center">
          <p className="text-sm text-destructive wrap-anywhere">{error}</p>
        </div>
      )}
    </div>
  )
}

export default memo(AssistantMessage)
