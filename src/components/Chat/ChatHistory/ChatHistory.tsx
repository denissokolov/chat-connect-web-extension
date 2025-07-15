import { memo } from 'react'
import { AlertCircle, MessageSquare } from 'lucide-react'

import useChatStore from '@/stores/useChatStore'

function ChatHistory() {
  const threads = useChatStore(state => state.threads)
  const onThreadSelect = useChatStore(state => state.selectThread)

  if (threads.loading) {
    return (
      <div className="h-full flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">{'Loading threads...'}</p>
        </div>
      </div>
    )
  }

  if (threads.error) {
    return (
      <div className="h-full flex-1 flex flex-col items-center justify-center p-8">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
        <p className="text-sm text-destructive">{threads.error}</p>
      </div>
    )
  }

  if (!threads.ready) {
    return null
  }

  if (threads.list.length === 0) {
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

  return (
    <div className="h-full flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {threads.list.map(thread => (
            <button
              key={thread.id}
              onClick={() => onThreadSelect(thread.id)}
              className="w-full text-left p-3 rounded-lg transition-colors hover:bg-muted/50 cursor-pointer"
            >
              <p className="text-sm font-medium text-foreground line-clamp-1">{thread.title}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default memo(ChatHistory)
