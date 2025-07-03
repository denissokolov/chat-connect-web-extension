import { memo, useCallback } from 'react'

import { type ClickButtonArguments } from '@/types/types'
import ExecuteFunction from './ExecuteFunction'
import browser from '@/services/browser'
import { sanitizeSelector } from '@/utils/html/sanitizeSelector'

interface ClickButtonMessageProps {
  args: ClickButtonArguments
}

function ClickButtonMessage({ args }: ClickButtonMessageProps) {
  const execute = useCallback((): Promise<boolean> => {
    const sanitizedSelector = sanitizeSelector(args.button_selector)
    if (!sanitizedSelector) {
      return Promise.resolve(false)
    }
    return browser.clickButton(sanitizedSelector)
  }, [args.button_selector])

  return (
    <div className="rounded-lg p-3 text-sm/normal my-2 space-y-2 border border-gray-200">
      <div>{'Click the button'}</div>
      <ExecuteFunction execute={execute} label={args.button_text} />
    </div>
  )
}

export default memo(ClickButtonMessage)
