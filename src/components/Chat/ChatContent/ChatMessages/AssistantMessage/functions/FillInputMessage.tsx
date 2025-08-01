import { memo, useCallback } from 'react'

import { type FillInputArguments } from '@/types/tool.types'
import { type FunctionCallResult, FunctionStatus } from '@/types/tool.types'
import browser from '@/services/browser'
import { sanitizeSelector } from '@/utils/html/sanitizeSelector'

import ExecuteButton from './ExecuteButton'
import { useAutoExecuteFunction } from './hooks'

interface FunctionCallMessageProps {
  args: FillInputArguments
  messageId: string
  callId: string
  status: FunctionStatus
  error: string | null | undefined
  saveResult: (messageId: string, callId: string, result: FunctionCallResult) => Promise<void>
  autoExecute: boolean
}

function FillInputMessage({
  args,
  messageId,
  callId,
  status,
  error,
  saveResult,
  autoExecute,
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

  useAutoExecuteFunction(status, execute, autoExecute)

  return (
    <div className="rounded-lg p-3 text-sm/normal my-2 space-y-2 border">
      <div className="text-muted-foreground">{args.label_value}</div>
      <div>{args.input_value}</div>
      <ExecuteButton label={`Fill the field`} status={status} error={error} onClick={execute} />
    </div>
  )
}

export default memo(FillInputMessage)
