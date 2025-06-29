import { memo, useCallback, useEffect } from 'react'

import ChatInput from './ChatInput/ChatInput'
import ChatContent from './ChatContent/ChatContent'
import useChatStore from '@/stores/useChatStore'
import { Button } from '@/components/ui/button'

function Chat() {
  const setupProvider = useChatStore(state => state.setupProvider)
  const model = useChatStore(state => state.model)
  const startNewThread = useChatStore(state => state.startNewThread)

  useEffect(() => {
    setupProvider(model)
  }, [setupProvider, model])

  const retryInitialization = useCallback(() => {
    setupProvider(model)
  }, [setupProvider, model])

  const handleStartNewThread = useCallback(() => {
    startNewThread()
  }, [startNewThread])

  return (
    <div className="h-full flex-1 flex flex-col">
      <div className="flex justify-end p-2 border-b">
        <Button type="button" variant="ghost" size="sm" onClick={handleStartNewThread}>
          {'New thread'}
        </Button>
      </div>
      <ChatContent retryInitialization={retryInitialization} />
      <ChatInput />
    </div>
  )
}

export default memo(Chat)
