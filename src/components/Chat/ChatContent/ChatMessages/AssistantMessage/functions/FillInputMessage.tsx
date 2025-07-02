import { PlayIcon } from 'lucide-react'
import { memo } from 'react'

import { Button } from '@/components/ui/button'
import { type FillInputArguments } from '@/types/types'

interface FunctionCallMessageProps {
  args: FillInputArguments[]
}

function FillInputMessage({ args }: FunctionCallMessageProps) {
  return (
    <div className="rounded-lg p-3 text-sm/normal my-2 space-y-2 border border-gray-200">
      {args.map(item => {
        return (
          <div key={item.id}>
            <div className="text-gray-600">{item.label_value}</div>
            <div>{item.input_value}</div>
          </div>
        )
      })}
      <Button variant="default" className="min-w-60 w-full">
        <PlayIcon className="w-4 h-4" />
        <span>{`Fill the field${args.length > 1 ? 's' : ''}`}</span>
      </Button>
    </div>
  )
}

export default memo(FillInputMessage)
