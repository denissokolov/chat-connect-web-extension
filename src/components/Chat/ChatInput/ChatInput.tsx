import { ArrowUp, ChevronDown, ChevronUp, Square, Zap } from 'lucide-react'
import { memo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import ContextDisplay from '@/components/Chat/ContextDisplay/ContextDisplay'
import useChatStore from '@/stores/useChatStore'
import ModelSelect from '@/components/Chat/ModelSelect/ModelSelect'

function ChatInput() {
  const [input, setInput] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const sendMessage = useChatStore(state => state.sendMessage)
  const stopMessage = useChatStore(state => state.stopMessage)

  const waitingForReply = useChatStore(state => state.waitingForReply)
  const waitingForTools = useChatStore(state => state.waitingForTools)
  const messagesReady = useChatStore(state => state.messages.ready)

  const autoExecuteTools = useChatStore(state => state.autoExecuteTools)
  const setAutoExecuteTools = useChatStore(state => state.setAutoExecuteTools)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (waitingForReply || waitingForTools || !messagesReady || !input.trim()) {
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
      <div className="flex justify-between items-center m-2">
        <ContextDisplay live />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                aria-label={isMinimized ? "Expand chat input" : "Minimize chat input"}
                className="h-6 w-6"
              >
                {isMinimized ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isMinimized ? 'Expand' : 'Minimize'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {!isMinimized && (
        <form ref={formRef} onSubmit={handleSubmit}>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about page..."
            className="text-sm border-none bg-transparent outline-none focus-visible:ring-0 resize-none shadow-none pt-2 pb-3 max-h-40"
            autoFocus={true}
          />

          <div className="flex items-center my-1 ml-1 mr-2 gap-4">
            <ModelSelect />
            <div className="flex items-center gap-2 ml-auto">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle
                      pressed={autoExecuteTools}
                      onPressedChange={setAutoExecuteTools}
                      size="sm"
                      aria-label="Toggle auto-execute tools"
                    >
                      {autoExecuteTools ? (
                        <Zap className="size-4 fill-current" />
                      ) : (
                        <Zap className="size-4" />
                      )}
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{'Auto-run tools'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {waitingForReply || waitingForTools ? (
                <Button
                  type="button"
                  onClick={handleStop}
                  size="icon"
                  title="Stop"
                  aria-label="Stop generating response"
                  className="rounded-full"
                >
                  <Square className="size-4 fill-white" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!input.trim() || !messagesReady}
                  size="icon"
                  title="Send"
                  aria-label="Send message"
                  className="rounded-full"
                >
                  <ArrowUp className="size-5" />
                </Button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

export default memo(ChatInput)
