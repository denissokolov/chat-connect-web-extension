import { memo, useEffect } from 'react'

import ChatInput from './ChatInput/ChatInput'
import ChatContent from './ChatContent/ChatContent'
import ChatHistory from './ChatHistory/ChatHistory'
import ChatHeader from './ChatHeader/ChatHeader'
import useChatStore from '@/stores/useChatStore'
import { Button } from '@/components/ui/button'
import browser from '@/services/browser'
import { AlertCircle } from 'lucide-react'

function Chat() {
  const initSettings = useChatStore(state => state.initSettings)
  const loadSettings = useChatStore(state => state.loadSettings)
  const settings = useChatStore(state => state.settings)

  const currentView = useChatStore(state => state.currentView)
  const setCurrentView = useChatStore(state => state.setCurrentView)

  useEffect(() => {
    initSettings()
  }, [initSettings])

  if (
    settings.ready &&
    settings.data &&
    settings.data.openAIToken.length === 0 &&
    settings.data.openAIServer.length === 0
  ) {
    return (
      <div className="h-full flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <AlertCircle className="w-12 h-12 mx-auto opacity-50 text-muted-foreground" />
          <p className="text-muted-foreground text-center text-base px-4 whitespace-pre-line">
            {'To start using the extension,\nplease set your API keys in\u00A0the\u00A0settings.'}
          </p>
          <Button variant="outline" onClick={() => browser.openExtensionSettings()}>
            {'Open settings'}
          </Button>
        </div>
      </div>
    )
  }

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
