import { logError } from '@/utils/log'

export function sanitizeSelector(selector: string): string | null {
  try {
    if (typeof selector !== 'string') return null

    const trimmed = selector.trim()

    // Reject known dangerous patterns
    const blacklistPattern = /(javascript:|on\w+\s*=|<script|<\/script)/i
    if (blacklistPattern.test(trimmed)) {
      logError(`Dangerous content in selector rejected: ${selector}`)
      return null
    }

    // Allow reasonable CSS selector characters including:
    // - Letters, digits, spaces
    // - CSS selectors: . # *
    // - Combinators: > + ~
    // - Attribute selectors: [ ] = ^ $ |
    // - Pseudo-selectors: : ( )
    // - Quotes and other valid characters: " ' - _ / ? & %
    // Note: @ is excluded as it's not used in standard CSS selectors
    const allowedPattern = /^[a-zA-Z0-9\s.#*>+~_\-[\]="'():^$|/?&%]*$/
    if (!allowedPattern.test(trimmed)) {
      logError(`Invalid characters in selector: ${selector}`)
      return null
    }

    return trimmed
  } catch (error) {
    logError(`sanitizeSelector: Error sanitizing selector:`, error)
    return null
  }
}
