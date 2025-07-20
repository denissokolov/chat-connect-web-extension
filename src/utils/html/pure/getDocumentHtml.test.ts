import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'

import { getDocumentHtml } from './getDocumentHtml'

describe('getDocumentHtml', () => {
  let originalDocumentElement: Element

  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
    originalDocumentElement = document.documentElement
  })

  afterEach(() => {
    // Restore the original document element
    Object.defineProperty(document, 'documentElement', {
      value: originalDocumentElement,
      configurable: true,
    })
  })

  it('should return success with document HTML when document.documentElement.outerHTML is accessible', () => {
    const mockHtml =
      '<html><head><title>Test</title></head><body><h1>Hello World</h1></body></html>'

    Object.defineProperty(document, 'documentElement', {
      value: {
        outerHTML: mockHtml,
      },
      configurable: true,
    })

    const result = getDocumentHtml()

    expect(result).toEqual({
      success: true,
      result: mockHtml,
    })
  })

  it('should return error when accessing document.documentElement.outerHTML throws an error', () => {
    const mockError = new Error('Access denied')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    Object.defineProperty(document, 'documentElement', {
      get() {
        throw mockError
      },
      configurable: true,
    })

    const result = getDocumentHtml()

    expect(result).toEqual({
      success: false,
      error: 'Access denied',
    })
    expect(consoleSpy).toHaveBeenCalledWith('Error getting document html')
    expect(consoleSpy).toHaveBeenCalledWith(mockError)
  })

  it('should handle string errors correctly', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    Object.defineProperty(document, 'documentElement', {
      get() {
        throw 'String error'
      },
      configurable: true,
    })

    const result = getDocumentHtml()

    expect(result).toEqual({
      success: false,
      error: 'String error',
    })
    expect(consoleSpy).toHaveBeenCalledWith('Error getting document html')
    expect(consoleSpy).toHaveBeenCalledWith('String error')
  })

  it('should handle null/undefined errors with fallback message', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    Object.defineProperty(document, 'documentElement', {
      get() {
        throw null
      },
      configurable: true,
    })

    const result = getDocumentHtml()

    expect(result).toEqual({
      success: false,
      error: 'Unknown error',
    })
    expect(consoleSpy).toHaveBeenCalledWith('Error getting document html')
    expect(consoleSpy).toHaveBeenCalledWith(null)
  })

  it('should handle objects without toString method', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const errorObj = Object.create(null) // Object without toString

    Object.defineProperty(document, 'documentElement', {
      get() {
        throw errorObj
      },
      configurable: true,
    })

    const result = getDocumentHtml()

    expect(result).toEqual({
      success: false,
      error: 'Unknown error',
    })
    expect(consoleSpy).toHaveBeenCalledWith('Error getting document html')
    expect(consoleSpy).toHaveBeenCalledWith(errorObj)
  })

  it('should work with real document structure', () => {
    // Using the actual document structure in test environment
    const result = getDocumentHtml()

    expect(result.success).toBe(true)
    expect(result.result).toContain('<html')
    expect(result.result).toContain('</html>')
    expect(typeof result.result).toBe('string')
  })
})
