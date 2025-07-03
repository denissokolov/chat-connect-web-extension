import { useState, memo } from 'react'
import { CheckIcon, Loader2, PlayIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { logError } from '@/utils/log'

interface ExecuteFunctionProps {
  execute: () => Promise<boolean>
  label: string
}

function ExecuteFunction({ execute, label }: ExecuteFunctionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      const success = await execute()
      setIsSuccess(success)
      if (success) {
        setTimeout(() => setIsSuccess(false), 2000)
      }
    } catch (error) {
      logError(`Error executing function: ${error}`)
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
          <span>{label}</span>
        </>
      )}
    </Button>
  )
}

export default memo(ExecuteFunction)
