import { memo, useCallback, useEffect } from 'react'

import ChatInput from './ChatInput/ChatInput'
import ChatContent from './ChatContent/ChatContent'
import useChatStore from '@/stores/useChatStore'
import ModelSelect from './ModelSelect/ModelSelect'

function Chat() {
  const setupProvider = useChatStore(state => state.setupProvider)
  const model = useChatStore(state => state.model)

  useEffect(() => {
    setupProvider(model)
  }, [setupProvider, model])

  const retryInitialization = useCallback(() => {
    setupProvider(model)
  }, [setupProvider, model])

  return (
    <div className="h-full flex-1 flex flex-col">
      <ModelSelect />
      <ChatContent retryInitialization={retryInitialization} />
      <ChatInput />
    </div>
  )
}

export default memo(Chat)
