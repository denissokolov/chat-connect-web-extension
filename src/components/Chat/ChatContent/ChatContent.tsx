import { memo } from 'react'
import { AlertCircle, MessageCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import browser from '@/services/browser'
import useChatStore from '@/stores/useChatStore'

import ChatMessages from './ChatMessages/ChatMessages'

interface ChatContentProps {
  retryInitialization: () => unknown
}

function ChatContent({ retryInitialization }: ChatContentProps) {
  const settings = useChatStore(state => state.settings)
  const messages = useChatStore(state => state.messages)

  const centerClassName = 'flex-1 flex flex-col items-center justify-center text-center'
  if (settings.loading || messages.loading) {
    return (
      <div className={centerClassName}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">
          {messages.loading ? 'Loading messages...' : 'Initializing chat...'}
        </p>
      </div>
    )
  }

  if (messages.error || settings.error) {
    return (
      <div className={centerClassName}>
        <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
        <p className="text-sm text-destructive mb-4">{messages.error || settings.error}</p>
        {settings.error && (
          <>
            <Button onClick={retryInitialization} size="sm">
              {'Retry'}
            </Button>
            <Button
              variant="outline"
              onClick={browser.openExtensionSettings}
              size="sm"
              className="mt-2"
            >
              {'Open settings'}
            </Button>
          </>
        )}
      </div>
    )
  }

  if (!settings.ready || !messages.ready) {
    return null
  }

  if (messages.list.length === 0) {
    return (
      <div className={centerClassName}>
        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
        <p className="text-muted-foreground">{'Start a conversation by sending a message'}</p>
      </div>
    )
  }

  return <ChatMessages />
}

export default memo(ChatContent)
