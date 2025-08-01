import { memo, useRef } from 'react'
import { CheckIcon, Loader2, PlayIcon, CircleAlertIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FunctionStatus } from '@/types/tool.types'

interface ExecuteFunctionProps {
  label: string
  status: FunctionStatus
  error: string | null | undefined
  onClick: () => unknown
}

function ExecuteButton({ label, status, error, onClick }: ExecuteFunctionProps) {
  const executed = useRef(false)
  const handleClick = () => {
    if (status !== FunctionStatus.Idle || executed.current) {
      return
    }

    executed.current = true
    onClick()
  }

  return (
    <>
      <Button
        variant="default"
        className="min-w-60 w-full"
        onClick={handleClick}
        disabled={status !== FunctionStatus.Idle}
        title={status === FunctionStatus.Pending ? 'Executing...' : undefined}
      >
        {status === FunctionStatus.Pending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : status === FunctionStatus.Success ? (
          <>
            <CheckIcon className="w-4 h-4" />
            <span>{'Success!'}</span>
          </>
        ) : status === FunctionStatus.Error ? (
          <>
            <CircleAlertIcon className="w-4 h-4" />
            <span>{'Error!'}</span>
          </>
        ) : (
          <>
            <PlayIcon className="w-4 h-4" />
            <span>{label}</span>
          </>
        )}
      </Button>
      {error && <p className="text-destructive">{error}</p>}
    </>
  )
}

export default memo(ExecuteButton)
