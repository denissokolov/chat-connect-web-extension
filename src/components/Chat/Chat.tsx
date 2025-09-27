import { memo, useEffect } from 'react'

import ChatInput from './ChatInput/ChatInput'
import ChatContent from './ChatContent/ChatContent'
import ChatHistory from './ChatHistory/ChatHistory'
import ChatHeader from './ChatHeader/ChatHeader'
import useChatStore from '@/stores/useChatStore'

function Chat() {
  const initSettings = useChatStore(state => state.initSettings)
  const loadSettings = useChatStore(state => state.loadSettings)

  const currentView = useChatStore(state => state.currentView)
  const setCurrentView = useChatStore(state => state.setCurrentView)

  useEffect(() => {
    initSettings()
  }, [initSettings])

  return (
    <div className="h-full flex-1 flex flex-col">
      <ChatHeader currentView={currentView} setCurrentView={setCurrentView} />
      {currentView === 'chat' ? (
        <>
          <ChatContent retryInitialization={loadSettings} />
          <ChatInput />
        </>
      ) : (
        <ChatHistory />
      )}
    </div>
  )
}

export default memo(Chat)
