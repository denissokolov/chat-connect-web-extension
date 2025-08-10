import { memo, useMemo } from 'react'

import {
  MessageContentType,
  type MessageContent,
  type FunctionCallContent,
} from '@/types/chat.types'
import { FunctionName, type FunctionCallResult } from '@/types/tool.types'
import MarkdownMessage from '@/components/Chat/ChatContent/ChatMessages/MarkdownMessage/MarkdownMessage'
import AssistantProgress from '@/components/Chat/ChatContent/ChatMessages/AssistantProgress/AssistantProgress'
import FillInputGroup from './functions/FillInputGroup'
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
  // Group consecutive FillInput calls
  const groupedContent = useMemo(() => {
    const groups: Array<MessageContent | MessageContent[]> = []
    let currentFillGroup: MessageContent[] = []

    content.forEach(item => {
      if (item.type === MessageContentType.FunctionCall && item.name === FunctionName.FillInput) {
        currentFillGroup.push(item)
      } else {
        if (currentFillGroup.length > 0) {
          // Always add as array to use FillInputGroup
          groups.push([...currentFillGroup])
          currentFillGroup = []
        }
        groups.push(item)
      }
    })

    // Don't forget the last group if it exists
    if (currentFillGroup.length > 0) {
      groups.push([...currentFillGroup])
    }

    return groups
  }, [content])

  return (
    <div className="max-w-full leading-1">
      {groupedContent.map((item, index) => {
        // Handle grouped FillInput calls
        if (Array.isArray(item)) {
          const fillItems = item
            .filter(
              (fillItem): fillItem is FunctionCallContent & { name: FunctionName.FillInput } =>
                fillItem.type === MessageContentType.FunctionCall &&
                fillItem.name === FunctionName.FillInput,
            )
            .map(fillItem => ({
              id: fillItem.id,
              args: fillItem.arguments,
              status: fillItem.status,
              error: fillItem.result?.error,
            }))

          return (
            <FillInputGroup
              key={`group-${index}`}
              items={fillItems}
              messageId={messageId}
              saveResult={saveFunctionResult}
              autoExecute={autoExecuteTools}
            />
          )
        }

        // Handle individual items
        if (item.type === MessageContentType.OutputText) {
          return <MarkdownMessage key={item.id} text={item.text} />
        }

        if (item.type === MessageContentType.FunctionCall) {
          switch (item.name) {
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
