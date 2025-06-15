import { memo } from 'react'

import { usePlatform, Platform } from '@/hooks/usePlatform.ts'
import { cn } from '@/utils/ui.ts'

interface ShortcutProps {
  className?: string
}

function Shortcut({ className }: ShortcutProps) {
  const platform = usePlatform()
  return (
    <div className={cn('text-gray-600 text-sm', className)}>
      {`Toggle Shortcut: ${platform === Platform.Mac ? '⌘+Shift+Y' : 'Ctrl+Shift+Y'}`}
    </div>
  )
}

export default memo(Shortcut)
