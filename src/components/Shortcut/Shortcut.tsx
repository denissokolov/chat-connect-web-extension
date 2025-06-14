import cn from 'classnames'
import { memo } from 'react'

import { usePlatform, Platform } from '../../hooks/usePlatform.ts'

interface ShortcutProps {
  className?: string
}

function Shortcut({ className }: ShortcutProps) {
  const platform = usePlatform()
  return (
    <div className={cn('text-gray-600 text-right text-sm', className)}>
      {`Toggle Shortcut: ${platform === Platform.Mac ? '⌘+Shift+Y' : 'Ctrl+Shift+Y'}`}
    </div>
  )
}

export default memo(Shortcut)
