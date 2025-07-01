import { memo, useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/ui'
import { type MessageContext } from '@/types/types'
import browser from '@/services/browser'

interface ContextDisplayProps {
  // Static context mode (replaces MessageContextPill)
  context?: MessageContext

  // Live context mode (replaces ChatContext)
  live?: boolean

  className?: string
}

function ContextDisplay({ context, live = false, className }: ContextDisplayProps) {
  const [liveTitle, setLiveTitle] = useState<string | null>(null)
  const [liveFavicon, setLiveFavicon] = useState<string | null>(null)

  useEffect(() => {
    if (!live) return

    const unsubscribe = browser.subscribeToPageInfo((title, favicon) => {
      setLiveTitle(title)
      setLiveFavicon(favicon)
    })
    return () => unsubscribe()
  }, [live])

  // Determine which data to use
  const title = live ? liveTitle : context?.title
  const favicon = live ? liveFavicon : context?.favicon

  // Determine variant - for live mode, use outline when no title, otherwise secondary
  const variant = live ? (title ? 'secondary' : 'outline') : 'secondary'

  // Determine display text
  const displayText = title
    ? title.length > 30
      ? `${title.slice(0, 30)}...`
      : title
    : live
      ? 'No context'
      : ''

  return (
    <Badge
      variant={variant}
      className={cn(
        'bg-white flex items-center gap-1',
        live && !title && 'text-muted-foreground',
        className,
      )}
    >
      {favicon && (
        <img
          src={favicon}
          alt="Site favicon"
          className="w-4 h-4 flex-shrink-0"
          onError={e => {
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
      <span className="truncate">{displayText}</span>
    </Badge>
  )
}

export default memo(ContextDisplay)
