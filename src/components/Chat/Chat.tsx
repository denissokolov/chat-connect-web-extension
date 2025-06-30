import { memo, useCallback, useEffect } from 'react'
import { MessageSquarePlus, History, ArrowLeft } from 'lucide-react'

import ChatInput from './ChatInput/ChatInput'
import ChatContent from './ChatContent/ChatContent'
import ChatHistory from './ChatHistory/ChatHistory'
import useChatStore from '@/stores/useChatStore'
import { Button } from '@/components/ui/button'

function Chat() {
  const setupProvider = useChatStore(state => state.setupProvider)
  const model = useChatStore(state => state.model)
  const startNewThread = useChatStore(state => state.startNewThread)
  const currentView = useChatStore(state => state.currentView)
  const setCurrentView = useChatStore(state => state.setCurrentView)

  useEffect(() => {
    setupProvider(model)
  }, [setupProvider, model])

  const retryInitialization = useCallback(() => {
    setupProvider(model)
  }, [setupProvider, model])

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
    <div className="h-full flex-1 flex flex-col">
      <div className="flex justify-between items-center p-1 border-b">
        {currentView === 'history' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBackToChat}
            className="rounded-xl"
            aria-label="Back to chat"
          >
            <ArrowLeft />
          </Button>
        )}
        {currentView === 'chat' && <div />}

        <div className="flex gap-1">
          {currentView === 'chat' && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleShowHistory}
                className="rounded-xl"
                aria-label="Show chat history"
              >
                <History />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleStartNewThread}
                className="rounded-xl"
                aria-label="Start new chat thread"
              >
                <MessageSquarePlus />
              </Button>
            </>
          )}
        </div>
      </div>

      {currentView === 'chat' ? (
        <>
          <ChatContent retryInitialization={retryInitialization} />
          <ChatInput />
        </>
      ) : (
        <ChatHistory />
      )}
    </div>
  )
}

export default memo(Chat)
