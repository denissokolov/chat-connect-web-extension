import { memo, useCallback } from 'react'

import { type FillInputArguments } from '@/types/types'
import browser from '@/services/browser'
import { sanitizeSelector } from '@/utils/html/sanitizeSelector'

import ExecuteFunction from './ExecuteFunction'

interface FunctionCallMessageProps {
  args: FillInputArguments[]
}

function FillInputMessage({ args }: FunctionCallMessageProps) {
  const execute = useCallback(async (): Promise<boolean> => {
    let allSuccess = true
    for (const arg of args) {
      const sanitizedSelector = sanitizeSelector(arg.input_selector)
      if (!sanitizedSelector) {
        return false
      }
      const success = await browser.setFieldValue(sanitizedSelector, arg.input_value)
      if (!success) {
        allSuccess = false
      }
    }
    return allSuccess
  }, [args])

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
      <ExecuteFunction execute={execute} label={`Fill the field${args.length > 1 ? 's' : ''}`} />
    </div>
  )
}

export default memo(FillInputMessage)
