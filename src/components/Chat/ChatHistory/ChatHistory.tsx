import { memo } from 'react'
import { MessageSquare } from 'lucide-react'
import { DateTime } from 'luxon'
import type { Thread, Message } from '@/types/types'

interface ChatHistoryProps {
  threads?: Thread[]
  getThreadMessages?: (threadId: string) => Message[]
  onThreadSelect?: (threadId: string) => void
  selectedThreadId?: string
}

function ChatHistory({
  threads = [],
  getThreadMessages,
  onThreadSelect,
  selectedThreadId,
}: ChatHistoryProps) {
  // Show empty state if no threads
  if (threads.length === 0) {
    return (
      <div className="h-full flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">{'No chats yet'}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {'Your chat history will appear here once you start conversations.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Sort threads by updatedAt (most recent first)
  const sortedThreads = [...threads].sort(
    (a, b) => DateTime.fromISO(b.updatedAt).toMillis() - DateTime.fromISO(a.updatedAt).toMillis(),
  )

  return (
    <div className="h-full flex-1 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-foreground">{'Chat History'}</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {sortedThreads.map(thread => {
            const messages = getThreadMessages?.(thread.id) || []
            const firstUserMessage = messages.find(msg => msg.role === 'user')
            const preview =
              firstUserMessage?.content
                .map(item => (item.type === 'output_text' ? item.text : ''))
                .join(' ') || 'New conversation'
            const isSelected = selectedThreadId === thread.id

            return (
              <button
                key={thread.id}
                onClick={() => onThreadSelect?.(thread.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors hover:bg-muted/50 ${
                  isSelected ? 'bg-muted' : ''
                }`}
              >
                <p className="text-sm font-medium text-foreground line-clamp-1">{preview}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default memo(ChatHistory)
