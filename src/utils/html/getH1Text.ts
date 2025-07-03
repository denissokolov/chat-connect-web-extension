import { logError } from '@/utils/log'

export function getH1Text(): string | null {
  try {
    const h1Elements = document.querySelectorAll('h1')

    for (const h1 of h1Elements) {
      const style = window.getComputedStyle(h1)
      const rect = h1.getBoundingClientRect()

      const isVisible =
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width > 1 &&
        rect.height > 1

      if (isVisible) {
        return (h1.textContent || h1.innerText).trim() || null
      }
    }

    return null
  } catch (error) {
    logError(`getH1Text: Error getting h1 text:`, error)
    return null
  }
}
