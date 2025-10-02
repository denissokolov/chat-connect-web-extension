import { ArrowUp, Square, Zap, BookText } from 'lucide-react'
import { memo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import ContextDisplay from '@/components/Chat/ContextDisplay/ContextDisplay'
import useChatStore from '@/stores/useChatStore'
import ModelSelect from '@/components/Chat/ModelSelect/ModelSelect'

function ChatInput() {
  const [input, setInput] = useState('')
  const [promptPopoverOpen, setPromptPopoverOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const sendMessage = useChatStore(state => state.sendMessage)
  const stopMessage = useChatStore(state => state.stopMessage)

  const waitingForReply = useChatStore(state => state.waitingForReply)
  const waitingForTools = useChatStore(state => state.waitingForTools)
  const messagesReady = useChatStore(state => state.messages.ready)

  const autoExecuteTools = useChatStore(state => state.settings.data?.autoExecuteTools)
  const updateSettings = useChatStore(state => state.updateSettings)
  const prompts = useChatStore(state => state.settings.data?.prompts || [])

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

  const handlePromptSelect = (promptContent: string) => {
    setInput(promptContent)
    setPromptPopoverOpen(false)
    textareaRef.current?.focus()
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
          className="text-sm border-none bg-transparent outline-none focus-visible:ring-0 resize-none shadow-none pt-2 pb-3 max-h-40"
          autoFocus={true}
        />

        <div className="flex items-center my-1 ml-1 mr-2 gap-4">
          <ModelSelect />
          <div className="flex items-center gap-2 ml-auto">
            <TooltipProvider>
              {prompts.length > 0 && (
                <Popover open={promptPopoverOpen} onOpenChange={setPromptPopoverOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Select prompt template"
                          className="size-8"
                        >
                          <BookText className="size-4" />
                        </Button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{'Prompt templates'}</p>
                    </TooltipContent>
                  </Tooltip>
                  <PopoverContent className="w-80 p-2" align="end">
                    <div className="space-y-1">
                      <div className="text-sm font-medium px-2 py-1.5">Prompt Templates</div>
                      {prompts.map(prompt => (
                        <button
                          key={prompt.id}
                          onClick={() => handlePromptSelect(prompt.content)}
                          className="w-full text-left px-2 py-2 rounded-md hover:bg-accent transition-colors"
                        >
                          <div className="font-medium text-sm">{prompt.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {prompt.content}
                          </div>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    pressed={autoExecuteTools}
                    onPressedChange={() => updateSettings({ autoExecuteTools: !autoExecuteTools })}
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
    </div>
  )
}

export default memo(ChatInput)
