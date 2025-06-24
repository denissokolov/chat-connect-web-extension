import { memo, useCallback, useEffect } from 'react'

import ChatFooter from './ChatFooter/ChatFooter'
import ChatInput from './ChatInput/ChatInput'
import ChatContent from './ChatContent/ChatContent'
import { AIModel } from '@/types/types'
import useChatStore from '@/stores/useChatStore'

const DEFAULT_MODEL = AIModel.OpenAI_ChatGPT_4o

function Chat() {
  const setupProvider = useChatStore(state => state.setupProvider)

  useEffect(() => {
    setupProvider(DEFAULT_MODEL)
  }, [setupProvider])

  const retryInitialization = useCallback(() => {
    setupProvider(DEFAULT_MODEL)
  }, [setupProvider])

  return (
    <div className="h-full flex-1 flex flex-col">
      <ChatContent retryInitialization={retryInitialization} />
      <ChatInput />
      <ChatFooter />
    </div>
  )
}

export default memo(Chat)
