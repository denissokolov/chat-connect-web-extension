import { memo, useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/ui'
import browser from '@/services/browser'

function ChatContext() {
  const [pageTitle, setPageTitle] = useState<string | null>(null)
  const [pageFavicon, setPageFavicon] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = browser.subscribeToPageInfo((title, favicon) => {
      setPageTitle(title)
      setPageFavicon(favicon)
    })
    return () => unsubscribe()
  }, [])

  return (
    <Badge
      variant={pageTitle ? 'secondary' : 'outline'}
      className={cn('mb-2 flex items-center gap-2', !pageTitle && 'text-muted-foreground')}
    >
      {pageFavicon && (
        <img
          src={pageFavicon}
          alt="Site favicon"
          className="w-4 h-4 flex-shrink-0"
          onError={e => {
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
      <span className="truncate">
        {pageTitle
          ? pageTitle.length > 30
            ? `${pageTitle.slice(0, 30)}...`
            : pageTitle
          : 'No context'}
      </span>
    </Badge>
  )
}

export default memo(ChatContext)
