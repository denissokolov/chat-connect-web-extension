import { useEffect, useMemo, useRef } from 'react'

import useChatStore from '@/stores/useChatStore'
import { MessageRole } from '@/types/chat.types'
import { splitMessagesIntoGroups } from '@/utils/message'
import { cn } from '@/utils/ui'

import UserMessage from './UserMessage/UserMessage'
import AssistantMessage from './AssistantMessage/AssistantMessage'
import AssistantProgress from './AssistantProgress/AssistantProgress'

export default function ChatMessages() {
  const messages = useChatStore(state => state.messages.list)
  const groups = useMemo(() => splitMessagesIntoGroups(messages), [messages])

  const waitingForReply = useChatStore(state => state.waitingForReply)
  const autoExecuteTools = useChatStore(state => state.autoExecuteTools)

  const saveFunctionResult = useChatStore(state => state.saveFunctionResult)

  const lastGroupRef = useRef<HTMLDivElement | null>(null)
  const lastGroupIsFromHistory = groups[groups.length - 1]?.history
  useEffect(() => {
    if (lastGroupRef.current && groups.length > 1) {
      lastGroupRef.current.scrollIntoView({
        behavior: lastGroupIsFromHistory ? 'instant' : 'smooth',
      })
    }
  }, [groups.length, lastGroupIsFromHistory])

  return (
    <div className="flex-1 overflow-y-auto" tabIndex={0}>
      {groups.map((group, groupIndex) => {
        const isLastGroup = groupIndex === groups.length - 1
        const lastMessage = group.messages[group.messages.length - 1]
        return (
          <div
            key={group.id}
            className={cn(
              'pt-4 px-4',
              isLastGroup ? 'pb-20' : 'pb-4',
              isLastGroup && !lastGroupIsFromHistory && groups.length > 1
                ? 'min-h-full'
                : undefined,
            )}
            ref={isLastGroup ? lastGroupRef : undefined}
          >
            {group.messages.map(message =>
              message.role === MessageRole.User ? (
                <UserMessage
                  key={message.id}
                  content={message.content}
                  error={message.error}
                  hasError={message.hasError}
                  context={message.context}
                />
              ) : (
                <AssistantMessage
                  key={message.id}
                  messageId={message.id}
                  content={message.content}
                  saveFunctionResult={saveFunctionResult}
                  autoExecuteTools={autoExecuteTools}
                  error={message.error}
                />
              ),
            )}
            {isLastGroup &&
              waitingForReply &&
              (!lastMessage || lastMessage.complete || lastMessage.content.length === 0) && (
                <AssistantProgress />
              )}
          </div>
        )
      })}
    </div>
  )
}
