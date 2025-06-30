import { memo } from 'react'
import { MessageSquare } from 'lucide-react'

function ChatHistory() {
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

export default memo(ChatHistory)
