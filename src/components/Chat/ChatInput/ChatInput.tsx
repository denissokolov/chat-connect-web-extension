import { Send } from 'lucide-react'
import { memo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import useChatStore from '@/stores/useChatStore'
import ChatContext from './ChatContext/ChatContext'

function ChatInput() {
  const [input, setInput] = useState('')

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

  return (
    <div className="border-t pt-4 px-4 mb-4">
      <ChatContext />
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button type="submit" disabled={waitingForReply || !input.trim()} size="icon" title="Send">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}

export default memo(ChatInput)
