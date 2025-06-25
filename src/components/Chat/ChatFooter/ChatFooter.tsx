import { memo } from 'react'

import { getPlatform } from '@/utils/platform'
import { Platform } from '@/types/types'

function ChatFooter() {
  const platform = getPlatform()

  return (
    <div className="flex items-center justify-center pt-1 pr-4">
      <div className="text-gray-600 text-sm">
        {`Toggle Shortcut: ${platform === Platform.Mac ? '⌘+Shift+Y' : 'Ctrl+Shift+Y'}`}
      </div>
    </div>
  )
}

export default memo(ChatFooter)
