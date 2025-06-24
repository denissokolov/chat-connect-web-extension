import { memo } from 'react'
import { AlertCircle, MessageCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import browser from '@/services/browserService'
import useChatStore from '@/stores/useChatStore'

import ChatMessages from './ChatMessages/ChatMessages'

interface ChatContentProps {
  retryInitialization: () => unknown
}

function ChatContent({ retryInitialization }: ChatContentProps) {
  const { loading, error, ready, configured } = useChatStore(state => state.provider)
  const hasMessages = useChatStore(state => state.messages.length > 0)

  const centerClassName = 'flex-1 flex flex-col items-center justify-center text-center'
  if (loading) {
    return (
      <div className={centerClassName}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">{'Initializing chat...'}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={centerClassName}>
        <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
        <p className="text-sm text-destructive mb-4">{error}</p>
        <Button onClick={retryInitialization} size="sm">
          {'Retry'}
        </Button>
      </div>
    )
  }

  if (configured === false) {
    return (
      <div className={centerClassName}>
        <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
        <p className="text-sm text-destructive mb-4">{'Provider not configured'}</p>
        <Button onClick={browser.openExtensionSettings} size="sm">
          {'Open settings'}
        </Button>
      </div>
    )
  }

  if (!ready) {
    return null
  }

  if (!hasMessages) {
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
