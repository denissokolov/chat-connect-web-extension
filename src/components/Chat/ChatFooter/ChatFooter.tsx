import { memo, useCallback } from 'react'
import { BoltIcon } from 'lucide-react'

import { usePlatform, Platform } from '@/hooks/usePlatform.ts'
import { Button } from '@/components/ui/button'

function ChatFooter() {
  const platform = usePlatform()

  const openSettings = useCallback(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') })
  }, [])

  return (
    <div className="flex items-center justify-between pt-1 pl-1 pr-4">
      <Button variant="ghost" size="icon" onClick={openSettings} title="Open Settings">
        <BoltIcon className="w-5 h-5" />
        <span className="sr-only">{'Open Settings'}</span>
      </Button>
      <div className="text-gray-600 text-sm">
        {`Toggle Shortcut: ${platform === Platform.Mac ? '⌘+Shift+Y' : 'Ctrl+Shift+Y'}`}
      </div>
    </div>
  )
}

export default memo(ChatFooter)
