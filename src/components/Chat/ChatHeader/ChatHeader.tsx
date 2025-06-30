import { ArrowLeft, MessageSquarePlus, History } from 'lucide-react'
import { memo, useCallback } from 'react'

import { Button } from '@/components/ui/button'
import useChatStore from '@/stores/useChatStore'

interface ChatHeaderProps {
  currentView: 'chat' | 'history'
  setCurrentView: (view: 'chat' | 'history') => void
}

function ChatHeader({ currentView, setCurrentView }: ChatHeaderProps) {
  const startNewThread = useChatStore(state => state.startNewThread)

  const handleStartNewThread = useCallback(() => {
    startNewThread()
  }, [startNewThread])

  const handleShowHistory = useCallback(() => {
    setCurrentView('history')
  }, [setCurrentView])

  const handleBackToChat = useCallback(() => {
    setCurrentView('chat')
  }, [setCurrentView])

  return (
    <div className="flex justify-between gap-1 items-center p-1 border-b border-[#EDF2FA]">
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
            onClick={handleShowHistory}
            className="rounded-xl"
            title="Show chat history"
          >
            <History />
          </Button>
          <p>{'New chat'}</p>
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
        </>
      )}
    </div>
  )
}

export default memo(ChatHeader)
