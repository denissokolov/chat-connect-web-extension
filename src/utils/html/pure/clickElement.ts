import type { FunctionCallResult } from '@/types/tool.types'

export function clickElement(selector: string): FunctionCallResult {
  try {
    const element = document.querySelector(selector)
    if (element) {
      // Check if element is a button or input that might be disabled
      if (
        (element instanceof HTMLButtonElement ||
          (element instanceof HTMLInputElement &&
            (element.type === 'button' || element.type === 'submit'))) &&
        element.disabled
      ) {
        console.error(`Button is disabled for selector: ${selector}`)
        return { success: false, error: 'Button is disabled' }
      }

      // Click any element
      ;(element as HTMLElement).click()
      return { success: true }
    }

    console.error(`Element not found for selector: ${selector}`)
    return { success: false, error: 'Element not found' }
  } catch (error) {
    console.error(`ChatConnect: error clicking element for selector ${selector}`)
    console.error(error)
    return {
      success: false,
      error: error instanceof Error ? error.message : (error?.toString?.() ?? 'Unknown error'),
    }
  }
}
