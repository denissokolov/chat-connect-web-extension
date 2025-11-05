import { ArrowLeft, MessageSquarePlus, History, LucideSettings2 } from 'lucide-react'
import { memo, useCallback } from 'react'

import { Button } from '@/components/ui/button'
import useChatStore from '@/stores/useChatStore'
import { ChatView } from '@/types/chat.types'
import browser from '@/services/browser'

interface ChatHeaderProps {
  currentView: ChatView
  setCurrentView: (view: ChatView) => void
}

function ChatHeader({ currentView, setCurrentView }: ChatHeaderProps) {
  const startNewThread = useChatStore(state => state.startNewThread)

  const handleStartNewThread = useCallback(() => {
    startNewThread()
  }, [startNewThread])

  const handleShowHistory = useCallback(() => {
    setCurrentView(ChatView.History)
  }, [setCurrentView])

  const handleBackToChat = useCallback(() => {
    setCurrentView(ChatView.Chat)
  }, [setCurrentView])

  const handleShowSettings = useCallback(() => {
    browser.openExtensionSettings()
  }, [])

  return (
    <div className="flex justify-between gap-1 items-center p-1 border-b border-color-light">
      {currentView === 'history' && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleBackToChat}
            className="rounded-xl"
            aria-label="Back to chat"
          >
            <ArrowLeft />
          </Button>
          <p>{'Chat history'}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleStartNewThread}
            className="rounded-xl"
            aria-label="Start new chat thread"
          >
            <MessageSquarePlus />
          </Button>
        </>
      )}

      {currentView === 'chat' && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleShowSettings}
            className="rounded-xl"
            title="Show settings"
          >
            <LucideSettings2 />
          </Button>
          <p>{'New chat'}</p>
          <div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleShowHistory}
              className="rounded-xl"
              title="Show chat history"
            >
              <History />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleStartNewThread}
              className="rounded-xl"
              title="Start new chat"
            >
              <MessageSquarePlus />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default memo(ChatHeader)
