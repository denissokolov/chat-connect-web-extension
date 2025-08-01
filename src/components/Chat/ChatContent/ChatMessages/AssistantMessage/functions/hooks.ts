import { useEffect, useRef } from 'react'
import { FunctionStatus } from '@/types/tool.types'

export function useAutoExecuteFunction(
  status: FunctionStatus,
  execute: () => void,
  autoExecute: boolean = true,
) {
  const executed = useRef(false)
  useEffect(() => {
    if (autoExecute && status === FunctionStatus.Idle && !executed.current) {
      executed.current = true
      execute()
    }
  }, [execute, autoExecute, status, executed])
}
