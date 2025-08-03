import { describe, it, expect, beforeEach, vi } from 'vitest'

import { setFieldValue } from './setFieldValue'

describe('html setFieldValue', () => {
  beforeEach(() => {
    // Clear the document body before each test
    document.body.innerHTML = ''

    // Clear all mocks
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('Input Elements', () => {
    describe('Text Input', () => {
      it('should set value for text input', () => {
        document.body.innerHTML = '<input type="text" id="test-input" />'
        const input = document.getElementById('test-input') as HTMLInputElement

        const result = setFieldValue('#test-input', 'Hello World')

        expect(result).toEqual({ success: true })
        expect(input.value).toBe('Hello World')
      })

      it('should set empty value for text input', () => {
        document.body.innerHTML = '<input type="text" id="test-input" value="existing" />'
        const input = document.getElementById('test-input') as HTMLInputElement

        const result = setFieldValue('#test-input', '')

        expect(result).toEqual({ success: true })
        expect(input.value).toBe('')
      })
    })

    describe('Number Input', () => {
      it('should set valid numeric value', () => {
        document.body.innerHTML = '<input type="number" id="test-input" />'
        const input = document.getElementById('test-input') as HTMLInputElement

        const result = setFieldValue('#test-input', '42')

        expect(result).toEqual({ success: true })
        expect(input.value).toBe('42')
      })

      it('should set decimal value', () => {
        document.body.innerHTML = '<input type="number" id="test-input" />'
        const input = document.getElementById('test-input') as HTMLInputElement

        const result = setFieldValue('#test-input', '3.14')

        expect(result).toEqual({ success: true })
        expect(input.value).toBe('3.14')
      })

      it('should reject invalid numeric value', () => {
        document.body.innerHTML = '<input type="number" id="test-input" />'

        const result = setFieldValue('#test-input', 'not-a-number')

        expect(result).toEqual({
          success: false,
          error: 'Invalid numeric value',
        })
      })
    })

    describe('Range Input', () => {
      it('should set valid numeric value for range input', () => {
        document.body.innerHTML = '<input type="range" id="test-input" min="0" max="100" />'
        const input = document.getElementById('test-input') as HTMLInputElement

        const result = setFieldValue('#test-input', '75')

        expect(result).toEqual({ success: true })
        expect(input.value).toBe('75')
      })

      it('should reject invalid numeric value for range input', () => {
        document.body.innerHTML = '<input type="range" id="test-input" min="0" max="100" />'

        const result = setFieldValue('#test-input', 'invalid')

        expect(result).toEqual({
          success: false,
          error: 'Invalid numeric value',
        })
      })
    })

    describe('Email Input', () => {
      it('should set valid email', () => {
        document.body.innerHTML = '<input type="email" id="test-input" />'
        const input = document.getElementById('test-input') as HTMLInputElement

        const result = setFieldValue('#test-input', 'test@example.com')

        expect(result).toEqual({ success: true })
        expect(input.value).toBe('test@example.com')
      })

      it('should set empty email', () => {
        document.body.innerHTML = '<input type="email" id="test-input" />'
        const input = document.getElementById('test-input') as HTMLInputElement

        const result = setFieldValue('#test-input', '')

        expect(result).toEqual({ success: true })
        expect(input.value).toBe('')
      })

      it('should reject invalid email format', () => {
        document.body.innerHTML = '<input type="email" id="test-input" />'

        const result = setFieldValue('#test-input', 'invalid-email')

        expect(result).toEqual({
          success: false,
          error: 'Invalid email format',
        })
      })

      it('should reject email that is too long', () => {
        document.body.innerHTML = '<input type="email" id="test-input" />'
        const longEmail = 'a'.repeat(250) + '@example.com'

        const result = setFieldValue('#test-input', longEmail)

        expect(result).toEqual({
          success: false,
          error: 'Invalid email format',
        })
      })
    })

    describe('URL Input', () => {
      it('should set valid URL', () => {
        document.body.innerHTML = '<input type="url" id="test-input" />'
        const input = document.getElementById('test-input') as HTMLInputElement

        const result = setFieldValue('#test-input', 'https://example.com')

        expect(result).toEqual({ success: true })
        expect(input.value).toBe('https://example.com')
      })

      it('should set empty URL', () => {
        document.body.innerHTML = '<input type="url" id="test-input" />'
        const input = document.getElementById('test-input') as HTMLInputElement

        const result = setFieldValue('#test-input', '')

        expect(result).toEqual({ success: true })
        expect(input.value).toBe('')
      })

      it('should reject invalid URL format', () => {
        document.body.innerHTML = '<input type="url" id="test-input" />'

        const result = setFieldValue('#test-input', 'not-a-url')

        expect(result).toEqual({
          success: false,
          error: 'Invalid URL format',
        })
      })
    })

    describe('Checkbox Input', () => {
      it('should check checkbox for truthy values', () => {
        document.body.innerHTML = '<input type="checkbox" id="test-input" />'
        const input = document.getElementById('test-input') as HTMLInputElement

        const truthyValues = ['true', 'True', 'TRUE', '1', 'yes', 'Yes', 'on', 'checked']

        for (const value of truthyValues) {
          input.checked = false
          const result = setFieldValue('#test-input', value)
          expect(result).toEqual({ success: true })
          expect(input.checked).toBe(true)
        }
      })

      it('should uncheck checkbox for falsy values', () => {
        document.body.innerHTML = '<input type="checkbox" id="test-input" checked />'
        const input = document.getElementById('test-input') as HTMLInputElement

        const falsyValues = ['false', 'False', 'FALSE', '0', 'no', 'off', 'unchecked', '']

        for (const value of falsyValues) {
          input.checked = true
          const result = setFieldValue('#test-input', value)
          expect(result).toEqual({ success: true })
          expect(input.checked).toBe(false)
        }
      })
    })

    describe('Radio Input', () => {
      it('should select radio button with matching value', () => {
        document.body.innerHTML = `
          <input type="radio" name="test-radio" value="option1" id="radio1" />
          <input type="radio" name="test-radio" value="option2" id="radio2" />
          <input type="radio" name="test-radio" value="option3" id="radio3" />
        `

        const radio1 = document.getElementById('radio1') as HTMLInputElement
        const radio2 = document.getElementById('radio2') as HTMLInputElement
        const radio3 = document.getElementById('radio3') as HTMLInputElement

        const result = setFieldValue('#radio2', 'option2')

        expect(result).toEqual({ success: true })
        expect(radio1.checked).toBe(false)
        expect(radio2.checked).toBe(true)
        expect(radio3.checked).toBe(false)
      })

      it('should uncheck other radio buttons in the same group', () => {
        document.body.innerHTML = `
          <input type="radio" name="test-radio" value="option1" id="radio1" checked />
          <input type="radio" name="test-radio" value="option2" id="radio2" />
        `

        const radio1 = document.getElementById('radio1') as HTMLInputElement
        const radio2 = document.getElementById('radio2') as HTMLInputElement

        const result = setFieldValue('input[name="test-radio"]', 'option2')

        expect(result).toEqual({ success: true })
        expect(radio1.checked).toBe(false)
        expect(radio2.checked).toBe(true)
      })

      it('should return false when value does not match and no name attribute', () => {
        document.body.innerHTML = '<input type="radio" value="option1" id="radio1" />'

        const result = setFieldValue('#radio1', 'option2')

        expect(result).toEqual({
          success: false,
          error: 'Radio button not found',
        })
      })
    })

    describe('File Input', () => {
      it('should reject file input and log error', () => {
        document.body.innerHTML = '<input type="file" id="test-input" />'

        const result = setFieldValue('#test-input', 'file.txt')

        expect(result).toEqual({
          success: false,
          error: 'Cannot set value for file input elements',
        })
      })
    })
  })

  describe('TextArea Elements', () => {
    it('should set value for textarea', () => {
      document.body.innerHTML = '<textarea id="test-textarea"></textarea>'
      const textarea = document.getElementById('test-textarea') as HTMLTextAreaElement

      const result = setFieldValue('#test-textarea', 'Multi-line\ntext content')

      expect(result).toEqual({ success: true })
      expect(textarea.value).toBe('Multi-line\ntext content')
    })

    it('should set empty value for textarea', () => {
      document.body.innerHTML = '<textarea id="test-textarea">existing content</textarea>'
      const textarea = document.getElementById('test-textarea') as HTMLTextAreaElement

      const result = setFieldValue('#test-textarea', '')

      expect(result).toEqual({ success: true })
      expect(textarea.value).toBe('')
    })
  })

  describe('Select Elements', () => {
    it('should set value for select element with exact match', () => {
      document.body.innerHTML = `
        <select id="test-select">
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
          <option value="option3">Option 3</option>
        </select>
      `
      const select = document.getElementById('test-select') as HTMLSelectElement

      const result = setFieldValue('#test-select', 'option2')

      expect(result).toEqual({ success: true })
      expect(select.value).toBe('option2')
    })

    it('should set empty value for select element', () => {
      document.body.innerHTML = `
        <select id="test-select">
          <option value="">Select an option</option>
          <option value="option1">Option 1</option>
        </select>
      `
      const select = document.getElementById('test-select') as HTMLSelectElement

      const result = setFieldValue('#test-select', '')

      expect(result).toEqual({ success: true })
      expect(select.value).toBe('')
    })

    it('should set value with case-insensitive match', () => {
      document.body.innerHTML = `
        <select id="test-select">
          <option value="Option1">Option 1</option>
          <option value="Option2">Option 2</option>
        </select>
      `
      const select = document.getElementById('test-select') as HTMLSelectElement

      const result = setFieldValue('#test-select', 'option1')

      expect(result).toEqual({ success: true })
      expect(select.value).toBe('Option1')
    })

    it('should reject value that does not exist in options', () => {
      document.body.innerHTML = `
        <select id="test-select">
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        </select>
      `

      const result = setFieldValue('#test-select', 'nonexistent')

      expect(result).toEqual({
        success: false,
        error: 'Option not found',
      })
    })
  })

  describe('Content Editable Elements', () => {
    it('should set text content for content editable element', () => {
      document.body.innerHTML = '<div id="test-editable" contenteditable="true"></div>'
      const editableDiv = document.getElementById('test-editable') as HTMLElement

      const result = setFieldValue('#test-editable', 'Hello World')

      expect(result).toEqual({ success: true })
      expect(editableDiv.textContent).toBe('Hello World')
    })

    it('should set empty content for content editable element', () => {
      document.body.innerHTML =
        '<div id="test-editable" contenteditable="true">existing content</div>'
      const editableDiv = document.getElementById('test-editable') as HTMLElement

      const result = setFieldValue('#test-editable', '')

      expect(result).toEqual({ success: true })
      expect(editableDiv.textContent).toBe('')
    })

    it('should handle multi-line content', () => {
      document.body.innerHTML = '<div id="test-editable" contenteditable="true"></div>'
      const editableDiv = document.getElementById('test-editable') as HTMLElement
      const multiLineContent = 'Line 1\nLine 2\nLine 3'

      const result = setFieldValue('#test-editable', multiLineContent)

      expect(result).toEqual({ success: true })
      expect(editableDiv.textContent).toBe(multiLineContent)
    })

    it('should handle special characters and unicode', () => {
      document.body.innerHTML = '<div id="test-editable" contenteditable="true"></div>'
      const editableDiv = document.getElementById('test-editable') as HTMLElement
      const specialContent = '🚀 Special chars: <>&"\'中文'

      const result = setFieldValue('#test-editable', specialContent)

      expect(result).toEqual({ success: true })
      expect(editableDiv.textContent).toBe(specialContent)
    })

    it('should work with different contenteditable values', () => {
      // Test with contenteditable="false" - still handled as content editable due to hasAttribute check
      document.body.innerHTML = '<div id="test-editable" contenteditable="false"></div>'
      const editableDiv = document.getElementById('test-editable') as HTMLElement

      const result = setFieldValue('#test-editable', 'test')

      expect(result).toEqual({ success: true })
      expect(editableDiv.textContent).toBe('test')
    })

    it('should not handle elements without contenteditable attribute', () => {
      // Test regular div without contenteditable attribute - should be unsupported
      document.body.innerHTML = '<div id="test-div">Not editable</div>'

      const result = setFieldValue('#test-div', 'test')

      expect(result).toEqual({
        success: false,
        error: 'Unsupported element type',
      })
    })

    it('should work with contenteditable attribute without value', () => {
      document.body.innerHTML = '<div id="test-editable" contenteditable></div>'
      const editableDiv = document.getElementById('test-editable') as HTMLElement

      const result = setFieldValue('#test-editable', 'Test content')

      expect(result).toEqual({ success: true })
      expect(editableDiv.textContent).toBe('Test content')
    })

    it('should replace existing HTML content with plain text', () => {
      document.body.innerHTML =
        '<div id="test-editable" contenteditable="true"><p>Existing <strong>HTML</strong></p></div>'
      const editableDiv = document.getElementById('test-editable') as HTMLElement

      const result = setFieldValue('#test-editable', 'Plain text replacement')

      expect(result).toEqual({ success: true })
      expect(editableDiv.textContent).toBe('Plain text replacement')
      // Verify that HTML structure is removed (textContent strips HTML)
      expect(editableDiv.innerHTML).toBe('Plain text replacement')
    })

    it('should dispatch events for content editable elements', () => {
      document.body.innerHTML = '<div id="test-editable" contenteditable="true"></div>'
      const editableDiv = document.getElementById('test-editable') as HTMLElement

      const inputSpy = vi.fn()
      const changeSpy = vi.fn()

      editableDiv.addEventListener('input', inputSpy)
      editableDiv.addEventListener('change', changeSpy)

      const result = setFieldValue('#test-editable', 'test content')

      expect(result).toEqual({ success: true })
      expect(inputSpy).toHaveBeenCalledTimes(1)
      expect(changeSpy).toHaveBeenCalledTimes(1)
    })

    it('should handle very long content', () => {
      document.body.innerHTML = '<div id="test-editable" contenteditable="true"></div>'
      const editableDiv = document.getElementById('test-editable') as HTMLElement
      const longContent = 'a'.repeat(10000)

      const result = setFieldValue('#test-editable', longContent)

      expect(result).toEqual({ success: true })
      expect(editableDiv.textContent).toBe(longContent)
      expect(editableDiv.textContent?.length).toBe(10000)
    })

    it('should work with different HTML elements that are content editable', () => {
      const testCases = [
        { tag: 'div', id: 'editable-div' },
        { tag: 'p', id: 'editable-p' },
        { tag: 'span', id: 'editable-span' },
        { tag: 'article', id: 'editable-article' },
      ]

      testCases.forEach(({ tag, id }) => {
        document.body.innerHTML = `<${tag} id="${id}" contenteditable="true"></${tag}>`
        const element = document.getElementById(id) as HTMLElement

        const result = setFieldValue(`#${id}`, `Content for ${tag}`)

        expect(result).toEqual({ success: true })
        expect(element.textContent).toBe(`Content for ${tag}`)
      })
    })
  })

  describe('Event Dispatching', () => {
    it('should dispatch input, change, and blur events after successful value change', () => {
      document.body.innerHTML = '<input type="text" id="test-input" />'
      const input = document.getElementById('test-input') as HTMLInputElement

      const inputSpy = vi.fn()
      const changeSpy = vi.fn()
      const blurSpy = vi.fn()

      input.addEventListener('input', inputSpy)
      input.addEventListener('change', changeSpy)
      input.addEventListener('blur', blurSpy)

      const result = setFieldValue('#test-input', 'test value')

      expect(result).toEqual({ success: true })
      expect(inputSpy).toHaveBeenCalledTimes(1)
      expect(changeSpy).toHaveBeenCalledTimes(1)
      expect(blurSpy).toHaveBeenCalledTimes(1)
    })

    it('should not dispatch events when value setting fails', () => {
      document.body.innerHTML = '<input type="file" id="test-input" />'
      const input = document.getElementById('test-input') as HTMLInputElement

      const inputSpy = vi.fn()
      input.addEventListener('input', inputSpy)

      const result = setFieldValue('#test-input', 'test')

      expect(result).toEqual({ success: false, error: 'Cannot set value for file input elements' })
      expect(inputSpy).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should return false when element is not found', () => {
      const result = setFieldValue('#nonexistent', 'value')

      expect(result).toEqual({
        success: false,
        error: 'Element not found',
      })
    })

    it('should return false for unsupported element type', () => {
      document.body.innerHTML = '<div id="test-div">Not a form element</div>'

      const result = setFieldValue('#test-div', 'value')

      expect(result).toEqual({
        success: false,
        error: 'Unsupported element type',
      })
    })

    it('should handle and log unexpected errors', () => {
      // Mock querySelector to throw an error
      const originalQuerySelector = document.querySelector
      document.querySelector = vi.fn().mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = setFieldValue('#test', 'value')

      expect(result).toEqual({
        success: false,
        error: 'Unexpected error',
      })

      // Restore original method
      document.querySelector = originalQuerySelector
    })
  })

  describe('Edge Cases', () => {
    it('should handle special characters in selector', () => {
      document.body.innerHTML = '<input type="text" id="test-input[0]" />'
      const input = document.getElementById('test-input[0]') as HTMLInputElement

      const result = setFieldValue('[id="test-input[0]"]', 'test value')

      expect(result).toEqual({ success: true })
      expect(input.value).toBe('test value')
    })

    it('should handle unicode characters in value', () => {
      document.body.innerHTML = '<input type="text" id="test-input" />'
      const input = document.getElementById('test-input') as HTMLInputElement

      const result = setFieldValue('#test-input', '🚀 Unicode test 中文')

      expect(result).toEqual({ success: true })
      expect(input.value).toBe('🚀 Unicode test 中文')
    })

    it('should handle very long values', () => {
      document.body.innerHTML = '<textarea id="test-textarea"></textarea>'
      const textarea = document.getElementById('test-textarea') as HTMLTextAreaElement
      const longValue = 'a'.repeat(10000)

      const result = setFieldValue('#test-textarea', longValue)

      expect(result).toEqual({ success: true })
      expect(textarea.value).toBe(longValue)
    })
  })
})
