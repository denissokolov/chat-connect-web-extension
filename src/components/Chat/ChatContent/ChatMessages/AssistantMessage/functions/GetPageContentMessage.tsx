import { memo, useCallback } from 'react'
import { Eye } from 'lucide-react'

import browser from '@/services/browser'
import { type GetPageContentArguments } from '@/types/tool.types'
import { FunctionStatus, type FunctionCallResult } from '@/types/tool.types'

import { useAutoExecuteFunction } from './hooks'

interface GetPageContentProps {
  args: GetPageContentArguments
  messageId: string
  callId: string
  status: FunctionStatus
  error: string | null | undefined
  saveResult: (messageId: string, callId: string, result: FunctionCallResult) => Promise<void>
}

function GetPageContentMessage({
  args,
  messageId,
  callId,
  status,
  error,
  saveResult,
}: GetPageContentProps) {
  const execute = useCallback(async () => {
    const result = await browser.getPageContent(args.format)
    saveResult(messageId, callId, result)
  }, [args, callId, messageId, saveResult])

  useAutoExecuteFunction(status, execute)

  const statusText =
    status === FunctionStatus.Success
      ? ' - success'
      : status === FunctionStatus.Error
        ? ' - error'
        : '...'

  return (
    <div className="rounded-lg py-3 text-sm/normal my-2 space-y-2">
      <div className="text-muted-foreground flex items-center gap-2">
        <Eye className="h-4 w-4" />
        {`Getting page ${args.format}${statusText}`}
      </div>
      {error && <p className="text-destructive">{error}</p>}
    </div>
  )
}

export default memo(GetPageContentMessage)
