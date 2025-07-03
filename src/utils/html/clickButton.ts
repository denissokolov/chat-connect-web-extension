import { logError } from '@/utils/log'

export function clickButton(selector: string): boolean {
  try {
    const button = document.querySelector(selector)
    if (button && button instanceof HTMLButtonElement) {
      button.click()
      return true
    }

    logError(`clickButton: Button not found for selector: ${selector}`)
    return false
  } catch (error) {
    logError(`clickButton: Error clicking button for selector ${selector}:`, error)
    return false
  }
}
