import { SendHorizontal } from 'lucide-react'
import { memo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import useChatStore from '@/stores/useChatStore'
import ChatContext from './ChatContext/ChatContext'
import ModelSelect from '@/components/Chat/ModelSelect/ModelSelect'

function ChatInput() {
  const [input, setInput] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const { sendMessage } = useChatStore()
  const { waitingForReply } = useChatStore()

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
    <div className="border-t pt-4 px-4 mb-4">
      <ChatContext />

      <form ref={formRef} onSubmit={handleSubmit}>
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
        />

        <div className="flex justify-between items-center mt-2">
          <ModelSelect />
          <Button
            type="submit"
            disabled={waitingForReply || !input.trim()}
            size="icon"
            title="Send"
          >
            <SendHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

export default memo(ChatInput)
