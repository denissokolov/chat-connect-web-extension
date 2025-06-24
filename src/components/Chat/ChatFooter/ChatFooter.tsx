import { memo } from 'react'
import { BoltIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import browser from '@/services/browserService'
import { getPlatform } from '@/utils/platform'
import { Platform } from '@/types/types'

function ChatFooter() {
  const platform = getPlatform()

  return (
    <div className="flex items-center justify-between pt-1 pl-1 pr-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={browser.openExtensionSettings}
        title="Open Settings"
      >
        <BoltIcon className="w-5 h-5" />
      </Button>
      <div className="text-gray-600 text-sm">
        {`Toggle Shortcut: ${platform === Platform.Mac ? '⌘+Shift+Y' : 'Ctrl+Shift+Y'}`}
      </div>
    </div>
  )
}

export default memo(ChatFooter)
