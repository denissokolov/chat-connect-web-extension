import { memo, useCallback } from 'react'

import { type ClickElementArguments } from '@/types/tool.types'
import { FunctionStatus, type FunctionCallResult } from '@/types/tool.types'
import browser from '@/services/browser'
import { sanitizeSelector } from '@/utils/html/sanitizeSelector'

import ExecuteButton from './ExecuteButton'
import { useAutoExecuteFunction } from './hooks'

interface ClickElementMessageProps {
  args: ClickElementArguments
  messageId: string
  callId: string
  status: FunctionStatus
  error: string | null | undefined
  saveResult: (messageId: string, callId: string, result: FunctionCallResult) => Promise<void>
  autoExecute: boolean
}

function ClickElementMessage({
  args,
  messageId,
  callId,
  status,
  error,
  saveResult,
  autoExecute,
}: ClickElementMessageProps) {
  const execute = useCallback(async () => {
    let result: FunctionCallResult

    const sanitizedSelector = sanitizeSelector(args.element_selector)
    if (!sanitizedSelector) {
      result = { success: false, error: 'Invalid selector' }
    } else {
      result = await browser.clickElement(sanitizedSelector)
    }

    saveResult(messageId, callId, result)
  }, [args, callId, messageId, saveResult])

  useAutoExecuteFunction(status, execute, autoExecute)

  return (
    <div className="rounded-lg p-3 text-sm/normal my-2 space-y-2 border ">
      <div>{`Click the ${args.element_type}`}</div>
      <ExecuteButton label={args.element_text} status={status} error={error} onClick={execute} />
    </div>
  )
}

export default memo(ClickElementMessage)
