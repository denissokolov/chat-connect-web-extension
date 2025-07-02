import { CheckIcon, Loader2, PlayIcon } from 'lucide-react'
import { memo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { type FillInputArguments } from '@/types/types'
import browser from '@/services/browser'
import { sanitizeSelector } from '@/utils/html'
import { logError } from '@/utils/log'

interface FunctionCallMessageProps {
  args: FillInputArguments[]
}

function FillInputMessage({ args }: FunctionCallMessageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)

    let allSuccess = true
    for (const arg of args) {
      try {
        const sanitizedSelector = sanitizeSelector(arg.input_selector)
        if (!sanitizedSelector) {
          allSuccess = false
          break
        }

        const success = await browser.setFieldValue(sanitizedSelector, arg.input_value)
        if (!success) {
          allSuccess = false
        }
      } catch (error) {
        logError(`Error setting field value: ${error}`)
        allSuccess = false
      }
    }

    setIsSuccess(allSuccess)
    setIsLoading(false)

    if (allSuccess) {
      setTimeout(() => setIsSuccess(false), 2000)
    }
  }

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
      <Button
        variant="default"
        className="min-w-60 w-full"
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSuccess ? (
          <>
            <CheckIcon className="w-4 h-4" />
            <span>{'Success!'}</span>
          </>
        ) : (
          <>
            <PlayIcon className="w-4 h-4" />
            <span>{`Fill the field${args.length > 1 ? 's' : ''}`}</span>
          </>
        )}
      </Button>
    </div>
  )
}

export default memo(FillInputMessage)
