import type { FunctionCallResult } from '@/types/tool.types'

export function clickButton(selector: string): FunctionCallResult {
  try {
    const button = document.querySelector(selector)
    if (
      button &&
      (button instanceof HTMLButtonElement ||
        (button instanceof HTMLInputElement &&
          (button.type === 'button' || button.type === 'submit')))
    ) {
      if (button.disabled) {
        console.error(`Button is disabled for selector: ${selector}`)
        return { success: false, error: 'Button is disabled' }
      }
      button.click()
      return { success: true }
    }

    console.error(`Button not found for selector: ${selector}`)
    return { success: false, error: 'Button not found' }
  } catch (error) {
    console.error(`ChatConnect: error clicking button for selector ${selector}`)
    console.error(error)
    return {
      success: false,
      error: error instanceof Error ? error.message : (error?.toString?.() ?? 'Unknown error'),
    }
  }
}
