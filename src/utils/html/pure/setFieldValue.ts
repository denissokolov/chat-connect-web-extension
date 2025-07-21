import type { FunctionCallResult } from '@/types/tool.types'

export function setFieldValue(selector: string, value: string): FunctionCallResult {
  const parseBooleanValue = (): boolean => {
    const normalizedValue = value.toLowerCase().trim()
    return ['true', '1', 'yes', 'on', 'checked'].includes(normalizedValue)
  }

  const handleInputElement = (input: HTMLInputElement): FunctionCallResult => {
    switch (input.type.toLowerCase()) {
      case 'radio':
        // For radio buttons, only check if the value matches the input's value attribute
        if (input.value === value) {
          input.checked = true
          return { success: true }
        }
        // Also try to find and uncheck other radio buttons with the same name
        if (input.name) {
          const radioGroup = document.querySelectorAll(`input[type="radio"][name="${input.name}"]`)
          radioGroup.forEach(radio => {
            if (radio instanceof HTMLInputElement) {
              radio.checked = radio.value === value
            }
          })
          return { success: true }
        }
        return { success: false, error: 'Radio button not found' }

      case 'checkbox': {
        // For checkboxes, interpret the value as a boolean-like value
        const booleanValue = parseBooleanValue()
        input.checked = booleanValue
        return { success: true }
      }

      case 'file':
        // File inputs cannot be programmatically set for security reasons
        console.error('Cannot set value for file input elements')
        return { success: false, error: 'Cannot set value for file input elements' }

      case 'number':
      case 'range': {
        // Validate numeric inputs
        const numericValue = parseFloat(value)
        if (!isNaN(numericValue)) {
          input.value = value
          return { success: true }
        }
        console.error(`Invalid numeric value "${value}" for ${input.type} input`)
        return { success: false, error: 'Invalid numeric value' }
      }

      case 'email':
        // Basic email validation
        if (value === '' || isValidEmail(value)) {
          input.value = value
          return { success: true }
        }
        console.error(`Invalid email format "${value}"`)
        return { success: false, error: 'Invalid email format' }

      case 'url':
        // Basic URL validation
        if (value === '' || isValidUrl(value)) {
          input.value = value
          return { success: true }
        }
        console.error(`Invalid URL format "${value}"`)
        return { success: false, error: 'Invalid URL format' }

      default:
        // Handle text, password, tel, search, and other text-based inputs
        input.value = value
        return { success: true }
    }
  }

  const handleTextAreaElement = (textarea: HTMLTextAreaElement): FunctionCallResult => {
    textarea.value = value
    return { success: true }
  }

  const handleSelectElement = (select: HTMLSelectElement): FunctionCallResult => {
    // Check if the option exists before setting the value
    const optionExists = Array.from(select.options).some(option => option.value === value)

    if (optionExists || value === '') {
      select.value = value
      return { success: true }
    }

    // If exact match not found, try case-insensitive match
    const caseInsensitiveMatch = Array.from(select.options).find(
      option => option.value.toLowerCase() === value.toLowerCase(),
    )

    if (caseInsensitiveMatch) {
      select.value = caseInsensitiveMatch.value
      return { success: true }
    }

    console.error(`Option "${value}" not found in select element`)
    return { success: false, error: 'Option not found' }
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
      console.error(`Element not found for selector: ${selector}`)
      return { success: false, error: 'Element not found' }
    }

    let result: FunctionCallResult
    if (field instanceof HTMLInputElement) {
      result = handleInputElement(field)
    } else if (field instanceof HTMLTextAreaElement) {
      result = handleTextAreaElement(field)
    } else if (field instanceof HTMLSelectElement) {
      result = handleSelectElement(field)
    } else {
      console.error(`Unsupported element type for selector: ${selector}`)
      result = { success: false, error: 'Unsupported element type' }
    }

    if (result.success) {
      // Dispatch events to notify any listeners that the field value changed
      dispatchFieldEvents(field)
    }

    return result
  } catch (error) {
    console.error(`ChatConnect: error setting value for selector ${selector}`)
    console.error(error)
    return {
      success: false,
      error: error instanceof Error ? error.message : (error?.toString?.() ?? 'Unknown error'),
    } as FunctionCallResult
  }
}
