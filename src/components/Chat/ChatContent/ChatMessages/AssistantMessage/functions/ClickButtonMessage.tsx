import { memo, useCallback, useEffect } from 'react'

import { FunctionStatus, type ClickButtonArguments, type FunctionCallResult } from '@/types/types'
import browser from '@/services/browser'
import { sanitizeSelector } from '@/utils/html/sanitizeSelector'

import ExecuteButton from './ExecuteButton'

interface ClickButtonMessageProps {
  args: ClickButtonArguments
  messageId: string
  callId: string
  status: FunctionStatus
  error: string | null | undefined
  saveResult: (messageId: string, callId: string, result: FunctionCallResult) => Promise<void>
  autoExecute: boolean
}

function ClickButtonMessage({
  args,
  messageId,
  callId,
  status,
  error,
  saveResult,
  autoExecute,
}: ClickButtonMessageProps) {
  const execute = useCallback(async () => {
    let result: FunctionCallResult

    const sanitizedSelector = sanitizeSelector(args.button_selector)
    if (!sanitizedSelector) {
      result = { success: false, error: 'Invalid selector' }
    } else {
      result = await browser.clickButton(sanitizedSelector)
    }

    saveResult(messageId, callId, result)
  }, [args, callId, messageId, saveResult])

  useEffect(() => {
    if (autoExecute && status === FunctionStatus.Idle) {
      execute()
    }
  }, [autoExecute, execute, status])

  return (
    <div className="rounded-lg p-3 text-sm/normal my-2 space-y-2 border ">
      <div>{'Click the button'}</div>
      <ExecuteButton label={args.button_text} status={status} error={error} onClick={execute} />
    </div>
  )
}

export default memo(ClickButtonMessage)
