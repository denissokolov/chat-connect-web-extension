import { ArrowUp, X } from 'lucide-react'
import { memo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import ContextDisplay from '@/components/Chat/ContextDisplay/ContextDisplay'
import useChatStore from '@/stores/useChatStore'
import ModelSelect from '@/components/Chat/ModelSelect/ModelSelect'
import AutoExecute from './AutoExecute/AutoExecute'

function ChatInput() {
  const [input, setInput] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const sendMessage = useChatStore(state => state.sendMessage)
  const stopMessage = useChatStore(state => state.stopMessage)
  const waitingForReply = useChatStore(state => state.waitingForReply)
  const waitingForTools = useChatStore(state => state.waitingForTools)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (waitingForReply || waitingForTools || !input.trim()) {
      return
    }

    setInput('')
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  const handleStop = () => {
    stopMessage()
  }

  return (
    <div className="rounded-t-xl bg-card">
      <div className="flex justify-start m-2">
        <ContextDisplay live />
      </div>

      <form ref={formRef} onSubmit={handleSubmit}>
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about page..."
          className="text-sm border-none bg-transparent outline-none focus-visible:ring-0 resize-none shadow-none pt-2 pb-3"
        />

        <div className="flex items-center m-2 gap-4">
          <ModelSelect />
          <AutoExecute />
          {waitingForReply || waitingForTools ? (
            <Button
              type="button"
              onClick={handleStop}
              size="icon"
              title="Stop"
              aria-label="Stop generating response"
              className="rounded-full ml-auto"
            >
              <X className="size-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!input.trim()}
              size="icon"
              title="Send"
              aria-label="Send message"
              className="rounded-full ml-auto"
            >
              <ArrowUp className="size-5" />
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default memo(ChatInput)
