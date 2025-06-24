import { memo, useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/ui'
import browser from '@/services/browserService'

function ChatContext() {
  const [pageTitle, setPageTitle] = useState<string | null>(null)
  useEffect(() => {
    const unsubscribe = browser.subscribeToPageTitle(setPageTitle)
    return () => unsubscribe()
  }, [])

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
