import { memo, useCallback } from 'react'

import { type FillInputArguments, type FunctionCallResult, FunctionStatus } from '@/types/types'
import browser from '@/services/browser'
import { sanitizeSelector } from '@/utils/html/sanitizeSelector'

import ExecuteButton from './ExecuteButton'

interface FunctionCallMessageProps {
  args: FillInputArguments
  messageId: string
  callId: string
  status: FunctionStatus
  error: string | null | undefined
  saveResult: (messageId: string, callId: string, result: FunctionCallResult) => Promise<void>
}

function FillInputMessage({
  args,
  messageId,
  callId,
  status,
  error,
  saveResult,
}: FunctionCallMessageProps) {
  const execute = useCallback(async () => {
    let result: FunctionCallResult

    const sanitizedSelector = sanitizeSelector(args.input_selector)
    if (!sanitizedSelector) {
      result = { success: false, error: 'Invalid selector' }
    } else {
      result = await browser.setFieldValue(sanitizedSelector, args.input_value)
    }

    saveResult(messageId, callId, result)
  }, [args, callId, messageId, saveResult])

  return (
    <div className="rounded-lg p-3 text-sm/normal my-2 space-y-2 border border-gray-200">
      <div className="text-gray-600">{args.label_value}</div>
      <div>{args.input_value}</div>
      <ExecuteButton label={`Fill the field`} status={status} error={error} onClick={execute} />
    </div>
  )
}

export default memo(FillInputMessage)
