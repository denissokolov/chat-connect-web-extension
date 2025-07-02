import { logError } from './log'

export function getH1Text(): string | null {
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
}

export function cleanHtmlContent(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Remove all script tags
  const scripts = doc.querySelectorAll('script')
  scripts.forEach(script => script.remove())

  // Remove all style tags
  const styles = doc.querySelectorAll('style')
  styles.forEach(style => style.remove())

  // Remove all link tags (stylesheets, fonts, script preloads, etc.)
  const links = doc.querySelectorAll('link')
  links.forEach(link => link.remove())

  // Remove all SVG elements
  const svgs = doc.querySelectorAll('svg')
  svgs.forEach(svg => svg.remove())

  // Remove only technical meta tags, preserve content-related ones
  const metas = doc.querySelectorAll('meta')
  metas.forEach(meta => {
    const name = meta.getAttribute('name')
    const property = meta.getAttribute('property')

    // Keep important content/SEO meta tags
    const keepPatterns = [
      'description',
      'keywords',
      'author',
      'robots',
      'twitter:',
      'og:',
      'article:',
      'fb:',
      'al:',
      'msapplication-',
    ]

    const shouldKeep = keepPatterns.some(
      pattern => (name && name.includes(pattern)) || (property && property.includes(pattern)),
    )

    // Remove technical/layout meta tags
    if (!shouldKeep) {
      meta.remove()
    }
  })

  // Remove inline style attributes from all elements
  const allElements = doc.querySelectorAll('*')
  allElements.forEach(element => {
    element.removeAttribute('style')
  })

  return doc.documentElement.outerHTML
}

export function sanitizeSelector(selector: string): string | null {
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
}

export function setFieldValue(selector: string, value: string): boolean {
  const parseBooleanValue = (): boolean => {
    const normalizedValue = value.toLowerCase().trim()
    return ['true', '1', 'yes', 'on', 'checked'].includes(normalizedValue)
  }

  const handleInputElement = (input: HTMLInputElement): boolean => {
    switch (input.type.toLowerCase()) {
      case 'radio':
        // For radio buttons, only check if the value matches the input's value attribute
        if (input.value === value) {
          input.checked = true
          return true
        }
        // Also try to find and uncheck other radio buttons with the same name
        if (input.name) {
          const radioGroup = document.querySelectorAll(`input[type="radio"][name="${input.name}"]`)
          radioGroup.forEach(radio => {
            if (radio instanceof HTMLInputElement) {
              radio.checked = radio.value === value
            }
          })
          return true
        }
        return false

      case 'checkbox': {
        // For checkboxes, interpret the value as a boolean-like value
        const booleanValue = parseBooleanValue()
        input.checked = booleanValue
        return true
      }

      case 'file':
        // File inputs cannot be programmatically set for security reasons
        logError('setFieldValue: Cannot set value for file input elements')
        return false

      case 'number':
      case 'range': {
        // Validate numeric inputs
        const numericValue = parseFloat(value)
        if (!isNaN(numericValue)) {
          input.value = value
          return true
        }
        logError(`setFieldValue: Invalid numeric value "${value}" for ${input.type} input`)
        return false
      }

      case 'email':
        // Basic email validation
        if (value === '' || isValidEmail(value)) {
          input.value = value
          return true
        }
        logError(`setFieldValue: Invalid email format "${value}"`)
        return false

      case 'url':
        // Basic URL validation
        if (value === '' || isValidUrl(value)) {
          input.value = value
          return true
        }
        logError(`setFieldValue: Invalid URL format "${value}"`)
        return false

      default:
        // Handle text, password, tel, search, and other text-based inputs
        input.value = value
        return true
    }
  }

  const handleTextAreaElement = (textarea: HTMLTextAreaElement): boolean => {
    textarea.value = value
    return true
  }

  const handleSelectElement = (select: HTMLSelectElement): boolean => {
    // Check if the option exists before setting the value
    const optionExists = Array.from(select.options).some(option => option.value === value)

    if (optionExists || value === '') {
      select.value = value
      return true
    }

    // If exact match not found, try case-insensitive match
    const caseInsensitiveMatch = Array.from(select.options).find(
      option => option.value.toLowerCase() === value.toLowerCase(),
    )

    if (caseInsensitiveMatch) {
      select.value = caseInsensitiveMatch.value
      return true
    }

    logError(`setFieldValue: Option "${value}" not found in select element`)
    return false
  }

  const isValidEmail = (email: string): boolean => {
    // Use a safer regex pattern to avoid ReDoS attacks
    // This pattern is more restrictive but avoids backtracking issues
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email) && email.length <= 254 // RFC 5321 length limit
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  function dispatchFieldEvents(element: Element): void {
    // Dispatch input event (modern, bubbles)
    element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))

    // Dispatch change event (legacy support, bubbles)
    element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))

    // For form validation frameworks that might listen to blur
    element.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }))
  }

  try {
    const field = document.querySelector(selector)
    if (!field) {
      logError(`setFieldValue: Element not found for selector: ${selector}`)
      return false
    }

    let success = false
    if (field instanceof HTMLInputElement) {
      success = handleInputElement(field)
    } else if (field instanceof HTMLTextAreaElement) {
      success = handleTextAreaElement(field)
    } else if (field instanceof HTMLSelectElement) {
      success = handleSelectElement(field)
    } else {
      logError(`setFieldValue: Unsupported element type for selector: ${selector}`)
    }

    if (success) {
      // Dispatch events to notify any listeners that the field value changed
      dispatchFieldEvents(field)
      return true
    }
  } catch (error) {
    logError(`setFieldValue: Error setting value for selector ${selector}:`, error)
  }

  return false
}

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
