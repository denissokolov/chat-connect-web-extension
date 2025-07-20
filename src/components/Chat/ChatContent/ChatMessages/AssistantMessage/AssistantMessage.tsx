import { memo } from 'react'

import { MessageContentType, type MessageContent } from '@/types/types'
import { FunctionName, type FunctionCallResult } from '@/types/tool.types'
import MarkdownMessage from '@/components/Chat/ChatContent/ChatMessages/MarkdownMessage/MarkdownMessage'
import FillInputMessage from './functions/FillInputMessage'
import ClickButtonMessage from './functions/ClickButtonMessage'
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
          if (item.name === FunctionName.FillInput) {
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
          }
          if (item.name === FunctionName.ClickButton) {
            return (
              <ClickButtonMessage
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
          }
          if (item.name === FunctionName.GetPageContent) {
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
