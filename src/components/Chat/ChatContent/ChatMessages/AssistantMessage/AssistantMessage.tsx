import { memo } from 'react'

import {
  FunctionName,
  MessageContentType,
  type FunctionCallResult,
  type MessageContent,
} from '@/types/types'
import MarkdownMessage from '@/components/Chat/ChatContent/ChatMessages/MarkdownMessage/MarkdownMessage'
import FillInputMessage from './functions/FillInputMessage'
import ClickButtonMessage from './functions/ClickButtonMessage'

interface AssistantMessageProps {
  messageId: string
  content: MessageContent[]
  saveFunctionResult: (
    messageId: string,
    callId: string,
    result: FunctionCallResult,
  ) => Promise<void>
}

function AssistantMessage({ messageId, content, saveFunctionResult }: AssistantMessageProps) {
  return (
    <div className="max-w-full leading-1 mb-8">
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
              />
            )
          }
        }

        return null
      })}
    </div>
  )
}

export default memo(AssistantMessage)
