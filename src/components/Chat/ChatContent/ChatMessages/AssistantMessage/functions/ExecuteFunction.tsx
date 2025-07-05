import { useState, memo } from 'react'
import { CheckIcon, Loader2, PlayIcon, CircleAlertIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { logError } from '@/utils/log'
import { getStringError } from '@/utils/error'
import { useSafeTimeout } from '@/hooks/useSafeTimeout'

const SUCCESS_TIMEOUT = 2000
const ERROR_TIMEOUT = 2000

interface ExecuteFunctionProps {
  execute: () => Promise<boolean>
  label: string
}

function ExecuteFunction({ execute, label }: ExecuteFunctionProps) {
  const safeTimeout = useSafeTimeout()

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = (err: unknown) => {
    setIsError(true)
    setError(getStringError(err))
    safeTimeout(() => setIsError(false), ERROR_TIMEOUT)
  }

  const handleClick = async () => {
    setIsLoading(true)
    try {
      const success = await execute()
      setIsSuccess(success)
      if (success) {
        safeTimeout(() => setIsSuccess(false), SUCCESS_TIMEOUT)
      } else {
        handleError('Failed to execute action. See console for details.')
      }
    } catch (err) {
      logError(`Error executing function: ${err}`)
      handleError(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
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
        ) : isError ? (
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
      {error && <p className="text-red-600">{error}</p>}
    </>
  )
}

export default memo(ExecuteFunction)
