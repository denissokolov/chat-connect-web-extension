import { Send } from 'lucide-react'
import { memo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePageContext } from '@/hooks/usePageContext'
import { Badge } from '@/components/ui/badge'

function ChatInput() {
  const [input, setInput] = useState('')
  const disabled = false

  const context = usePageContext()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (disabled || !input.trim()) {
      return
    }

    setInput('')
  }

  return (
    <div className="border-t pt-4 px-4">
      {context && (
        <Badge variant="secondary" className="mb-2">
          {context.title.length > 30 ? `${context.title.slice(0, 30)}...` : context.title}
        </Badge>
      )}
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={disabled}
          className="flex-1"
        />
        <Button type="submit" disabled={disabled || !input.trim()} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}

export default memo(ChatInput)
