import { memo, useCallback, useEffect } from 'react'
import { MessageSquarePlus } from 'lucide-react'

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
      <div className="flex justify-end p-1 border-b">
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
      </div>
      <ChatContent retryInitialization={retryInitialization} />
      <ChatInput />
    </div>
  )
}

export default memo(Chat)
