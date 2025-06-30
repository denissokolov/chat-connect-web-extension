import { memo, useCallback, useEffect } from 'react'

import ChatInput from './ChatInput/ChatInput'
import ChatContent from './ChatContent/ChatContent'
import ChatHistory from './ChatHistory/ChatHistory'
import ChatHeader from './ChatHeader/ChatHeader'
import useChatStore from '@/stores/useChatStore'

function Chat() {
  const setupProvider = useChatStore(state => state.setupProvider)
  const model = useChatStore(state => state.model)

  const currentView = useChatStore(state => state.currentView)
  const setCurrentView = useChatStore(state => state.setCurrentView)

  useEffect(() => {
    setupProvider(model)
  }, [setupProvider, model])

  const retryInitialization = useCallback(() => {
    setupProvider(model)
  }, [setupProvider, model])

  return (
    <div className="h-full flex-1 flex flex-col">
      <ChatHeader currentView={currentView} setCurrentView={setCurrentView} />
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
