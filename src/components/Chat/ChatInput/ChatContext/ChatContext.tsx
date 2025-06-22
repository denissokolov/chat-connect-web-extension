import { memo, useContext, useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { BrowserContext } from '@/services/Browser'
import { cn } from '@/utils/ui'

function ChatContext() {
  const browser = useContext(BrowserContext)

  const [pageTitle, setPageTitle] = useState<string | null>(null)
  useEffect(() => {
    const unsubscribe = browser.subscribeToPageTitle(setPageTitle)
    return () => unsubscribe()
  }, [browser])

  return (
    <Badge
      variant={pageTitle ? 'secondary' : 'outline'}
      className={cn('mb-2', !pageTitle && 'text-muted-foreground')}
    >
      {pageTitle
        ? pageTitle.length > 30
          ? `${pageTitle.slice(0, 30)}...`
          : pageTitle
        : 'No context'}
    </Badge>
  )
}

export default memo(ChatContext)
