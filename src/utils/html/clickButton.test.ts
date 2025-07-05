import { beforeEach, describe, it, expect, vi } from 'vitest'

import { clickButton } from './clickButton'

describe('clickButton', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
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

    expect(result).toEqual({ success: true })
    expect(clickSpy).toHaveBeenCalledOnce()
  })

  it('returns false when button does not exist', () => {
    const result = clickButton('#non-existent-button')

    expect(result).toEqual({
      success: false,
      error: 'Button not found',
    })
  })

  it('returns false when element exists but is not a button', () => {
    const div = document.createElement('div')
    div.id = 'test-div'
    document.body.appendChild(div)

    const result = clickButton('#test-div')

    expect(result).toEqual({
      success: false,
      error: 'Button not found',
    })
  })

  it('returns false when element is null', () => {
    const result = clickButton('invalid-selector')

    expect(result).toEqual({
      success: false,
      error: 'Button not found',
    })
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

    expect(result).toEqual({
      success: false,
      error: 'Click failed',
    })
  })

  it('returns false and logs error when querySelector throws an exception', () => {
    // Mock querySelector to throw an error
    const querySelectorError = new Error('querySelector failed')
    vi.spyOn(document, 'querySelector').mockImplementation(() => {
      throw querySelectorError
    })

    const result = clickButton('#test-button')

    expect(result).toEqual({
      success: false,
      error: 'querySelector failed',
    })
  })

  it('works with class selectors', () => {
    const button = document.createElement('button')
    button.className = 'btn-primary'
    button.id = 'class-button'
    document.body.appendChild(button)

    const clickSpy = vi.spyOn(button, 'click')

    const result = clickButton('.btn-primary')

    expect(result).toEqual({ success: true })
    expect(clickSpy).toHaveBeenCalledOnce()
  })

  it('works with attribute selectors', () => {
    const button = document.createElement('button')
    button.setAttribute('data-testid', 'submit-btn')
    document.body.appendChild(button)

    const clickSpy = vi.spyOn(button, 'click')

    const result = clickButton('[data-testid="submit-btn"]')

    expect(result).toEqual({ success: true })
    expect(clickSpy).toHaveBeenCalledOnce()
  })

  it('returns true for input[type="button"] elements', () => {
    const input = document.createElement('input')
    input.type = 'button'
    input.id = 'input-button'
    input.value = 'Click me'
    document.body.appendChild(input)

    const clickSpy = vi.spyOn(input, 'click')

    const result = clickButton('#input-button')

    expect(result).toEqual({ success: true })
    expect(clickSpy).toHaveBeenCalledOnce()
  })

  it('returns false for disabled input[type="button"] elements', () => {
    const input = document.createElement('input')
    input.type = 'button'
    input.id = 'disabled-input-button'
    input.disabled = true
    input.value = 'Disabled Button'
    document.body.appendChild(input)

    const clickSpy = vi.spyOn(input, 'click')

    const result = clickButton('#disabled-input-button')

    expect(result).toEqual({
      success: false,
      error: 'Button is disabled',
    })
    expect(clickSpy).not.toHaveBeenCalled()
  })

  it('returns false for input[type="text"] elements', () => {
    const input = document.createElement('input')
    input.type = 'text'
    input.id = 'text-input'
    input.value = 'Text Input'
    document.body.appendChild(input)

    const result = clickButton('#text-input')

    expect(result).toEqual({
      success: false,
      error: 'Button not found',
    })
  })

  it('returns true for input[type="button"] with onclick handler', () => {
    const input = document.createElement('input')
    input.type = 'button'
    input.id = 'onclick-input-button'
    input.value = 'Click me'
    let clicked = false
    input.onclick = () => {
      clicked = true
    }
    document.body.appendChild(input)

    const result = clickButton('#onclick-input-button')

    expect(result).toEqual({ success: true })
    expect(clicked).toBe(true)
  })

  it('returns true for input[type="submit"] elements', () => {
    const input = document.createElement('input')
    input.type = 'submit'
    input.id = 'submit-button'
    input.value = 'Submit'
    document.body.appendChild(input)

    const clickSpy = vi.spyOn(input, 'click')

    const result = clickButton('#submit-button')

    expect(result).toEqual({ success: true })
    expect(clickSpy).toHaveBeenCalledOnce()
  })

  it('returns false for disabled input[type="submit"] elements', () => {
    const input = document.createElement('input')
    input.type = 'submit'
    input.id = 'disabled-submit-button'
    input.disabled = true
    input.value = 'Disabled Submit'
    document.body.appendChild(input)

    const clickSpy = vi.spyOn(input, 'click')

    const result = clickButton('#disabled-submit-button')

    expect(result).toEqual({
      success: false,
      error: 'Button is disabled',
    })
    expect(clickSpy).not.toHaveBeenCalled()
  })

  it('returns true for input[type="submit"] with onclick handler', () => {
    const input = document.createElement('input')
    input.type = 'submit'
    input.id = 'onclick-submit-button'
    input.value = 'Submit Form'
    let clicked = false
    input.onclick = () => {
      clicked = true
    }
    document.body.appendChild(input)

    const result = clickButton('#onclick-submit-button')

    expect(result).toEqual({ success: true })
    expect(clicked).toBe(true)
  })

  it('returns false for disabled buttons', () => {
    const button = document.createElement('button')
    button.id = 'disabled-button'
    button.disabled = true
    document.body.appendChild(button)

    const clickSpy = vi.spyOn(button, 'click')

    const result = clickButton('#disabled-button')

    expect(result).toEqual({
      success: false,
      error: 'Button is disabled',
    })
    expect(clickSpy).not.toHaveBeenCalled()
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

    expect(result).toEqual({ success: true })
    expect(clickSpy).toHaveBeenCalledOnce()
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

    expect(result).toEqual({ success: true })
    expect(clicked).toBe(true)
  })
})
