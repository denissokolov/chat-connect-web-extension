import { useCallback, useEffect, useRef } from 'react'

type Timer = ReturnType<typeof setTimeout>

export function useSafeTimeout() {
  const timer = useRef<Timer>(undefined)

  useEffect(() => {
    return () => {
      if (timer.current != null) {
        clearTimeout(timer.current)
      }
    }
  }, [])

  return useCallback((callback: () => void, ms: number) => {
    timer.current = setTimeout(callback, ms)
  }, [])
}
