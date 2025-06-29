import { ArrowUp } from 'lucide-react'
import { memo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import useChatStore from '@/stores/useChatStore'
import ChatContext from './ChatContext/ChatContext'
import ModelSelect from '@/components/Chat/ModelSelect/ModelSelect'

function ChatInput() {
  const [input, setInput] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const sendMessage = useChatStore(state => state.sendMessage)
  const waitingForReply = useChatStore(state => state.waitingForReply)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (waitingForReply || !input.trim()) {
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

  return (
    <div className="rounded-t-xl bg-slate-100">
      <div className="flex justify-start m-2">
        <ChatContext />
      </div>

      <form ref={formRef} onSubmit={handleSubmit}>
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about page..."
          className="border-none outline-none focus-visible:ring-0 resize-none shadow-none pt-2 pb-3"
        />

        <div className="flex justify-between items-center m-2">
          <ModelSelect />
          <Button
            type="submit"
            disabled={waitingForReply || !input.trim()}
            size="icon"
            title="Send"
            className="rounded-full disabled:bg-white disabled:text-gray-600 disabled:border hover:bg-blue-600 bg-blue-500"
          >
            <ArrowUp className="size-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}

export default memo(ChatInput)
