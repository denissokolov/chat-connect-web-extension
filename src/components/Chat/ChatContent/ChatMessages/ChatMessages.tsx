import useChatStore from '@/stores/useChatStore'

import UserMessage from './UserMessage/UserMessage'
import AssistantMessage from './AssistantMessage/AssistantMessage'
import AssistantProgress from './AssistantProgress/AssistantProgress'
import { MessageRole } from '@/types/types'

export default function ChatMessages() {
  const messages = useChatStore(state => state.messages)
  const waitingForReply = useChatStore(state => state.waitingForReply)
  const autoExecuteTools = useChatStore(state => state.autoExecuteTools)

  const saveFunctionResult = useChatStore(state => state.saveFunctionResult)

  return (
    <div className="flex-1 py-4 px-4 space-y-4 overflow-y-auto" tabIndex={0}>
      {messages.list.map(message =>
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
          />
        ),
      )}
      {waitingForReply && <AssistantProgress />}
    </div>
  )
}
