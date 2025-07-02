import { PlayIcon } from 'lucide-react'
import { memo } from 'react'

import { Button } from '@/components/ui/button'
import { type ClickButtonArguments } from '@/types/types'

interface ClickButtonMessageProps {
  args: ClickButtonArguments
}

function ClickButtonMessage({ args }: ClickButtonMessageProps) {
  return (
    <div className="rounded-lg p-3 text-sm/normal my-2 space-y-2 border border-gray-200">
      <div>{'Click the button'}</div>
      <Button variant="default" className="min-w-60 w-full">
        <PlayIcon className="w-4 h-4" />
        <span>{args.button_text}</span>
      </Button>
    </div>
  )
}

export default memo(ClickButtonMessage)
