import { beforeEach, describe, it, expect, vi } from 'vitest'

import { logError } from '@/utils/log'

import { clickButton } from './clickButton'

// Mock the logError function
vi.mock('@/utils/log', () => ({
  logError: vi.fn(),
}))

describe('clickButton', () => {
  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = ''
    // Clear all mocks
    vi.clearAllMocks()
    // Restore all mocks
    vi.restoreAllMocks()
  })

  it('returns true when button exists and is clicked successfully', () => {
    const button = document.createElement('button')
    button.id = 'test-button'
    button.textContent = 'Click me'
    document.body.appendChild(button)

    // Mock the click method
    const clickSpy = vi.spyOn(button, 'click')

    const result = clickButton('#test-button')

    expect(result).toBe(true)
    expect(clickSpy).toHaveBeenCalledOnce()
    expect(logError).not.toHaveBeenCalled()
  })

  it('returns false when button does not exist', () => {
    const result = clickButton('#non-existent-button')

    expect(result).toBe(false)
    expect(logError).toHaveBeenCalledWith(
      'clickButton: Button not found for selector: #non-existent-button',
    )
  })

  it('returns false when element exists but is not a button', () => {
    const div = document.createElement('div')
    div.id = 'test-div'
    document.body.appendChild(div)

    const result = clickButton('#test-div')

    expect(result).toBe(false)
    expect(logError).toHaveBeenCalledWith('clickButton: Button not found for selector: #test-div')
  })

  it('returns false when element is null', () => {
    const result = clickButton('invalid-selector')

    expect(result).toBe(false)
    expect(logError).toHaveBeenCalledWith(
      'clickButton: Button not found for selector: invalid-selector',
    )
  })

  it('returns false and logs error when click throws an exception', () => {
    const button = document.createElement('button')
    button.id = 'error-button'
    document.body.appendChild(button)

    // Mock the click method to throw an error
    const clickError = new Error('Click failed')
    vi.spyOn(button, 'click').mockImplementation(() => {
      throw clickError
    })

    const result = clickButton('#error-button')

    expect(result).toBe(false)
    expect(logError).toHaveBeenCalledWith(
      'clickButton: Error clicking button for selector #error-button:',
      clickError,
    )
  })

  it('returns false and logs error when querySelector throws an exception', () => {
    // Mock querySelector to throw an error
    const querySelectorError = new Error('querySelector failed')
    vi.spyOn(document, 'querySelector').mockImplementation(() => {
      throw querySelectorError
    })

    const result = clickButton('#test-button')

    expect(result).toBe(false)
    expect(logError).toHaveBeenCalledWith(
      'clickButton: Error clicking button for selector #test-button:',
      querySelectorError,
    )
  })

  it('works with class selectors', () => {
    const button = document.createElement('button')
    button.className = 'btn-primary'
    button.id = 'class-button'
    document.body.appendChild(button)

    const clickSpy = vi.spyOn(button, 'click')

    const result = clickButton('.btn-primary')

    expect(result).toBe(true)
    expect(clickSpy).toHaveBeenCalledOnce()
    expect(logError).not.toHaveBeenCalled()
  })

  it('works with attribute selectors', () => {
    const button = document.createElement('button')
    button.setAttribute('data-testid', 'submit-btn')
    document.body.appendChild(button)

    const clickSpy = vi.spyOn(button, 'click')

    const result = clickButton('[data-testid="submit-btn"]')

    expect(result).toBe(true)
    expect(clickSpy).toHaveBeenCalledOnce()
    expect(logError).not.toHaveBeenCalled()
  })

  it('returns false for input[type="button"] elements (not HTMLButtonElement)', () => {
    const input = document.createElement('input')
    input.type = 'button'
    input.id = 'input-button'
    input.value = 'Click me'
    document.body.appendChild(input)

    const result = clickButton('#input-button')

    expect(result).toBe(false)
    expect(logError).toHaveBeenCalledWith(
      'clickButton: Button not found for selector: #input-button',
    )
  })

  it('returns false for input[type="submit"] elements (not HTMLButtonElement)', () => {
    const input = document.createElement('input')
    input.type = 'submit'
    input.id = 'submit-button'
    input.value = 'Submit'
    document.body.appendChild(input)

    const result = clickButton('#submit-button')

    expect(result).toBe(false)
    expect(logError).toHaveBeenCalledWith(
      'clickButton: Button not found for selector: #submit-button',
    )
  })

  it('works with disabled buttons (still HTMLButtonElement)', () => {
    const button = document.createElement('button')
    button.id = 'disabled-button'
    button.disabled = true
    document.body.appendChild(button)

    const clickSpy = vi.spyOn(button, 'click')

    const result = clickButton('#disabled-button')

    expect(result).toBe(true) // The function still returns true as it successfully calls click()
    expect(clickSpy).toHaveBeenCalledOnce()
    expect(logError).not.toHaveBeenCalled()
  })

  it('handles nested button elements', () => {
    const container = document.createElement('div')
    container.className = 'container'
    const button = document.createElement('button')
    button.className = 'nested-btn'
    button.textContent = 'Nested Button'
    container.appendChild(button)
    document.body.appendChild(container)

    const clickSpy = vi.spyOn(button, 'click')

    const result = clickButton('.nested-btn')

    expect(result).toBe(true)
    expect(clickSpy).toHaveBeenCalledOnce()
    expect(logError).not.toHaveBeenCalled()
  })

  it('works with button elements that have onclick handlers', () => {
    const button = document.createElement('button')
    button.id = 'onclick-button'
    let clicked = false
    button.onclick = () => {
      clicked = true
    }
    document.body.appendChild(button)

    const result = clickButton('#onclick-button')

    expect(result).toBe(true)
    expect(clicked).toBe(true)
    expect(logError).not.toHaveBeenCalled()
  })
})
