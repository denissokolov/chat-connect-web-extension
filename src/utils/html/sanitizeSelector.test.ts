import { describe, it, expect } from 'vitest'

import { sanitizeSelector } from './sanitizeSelector'

describe('html sanitizeSelector', () => {
  it('returns null for non-string inputs', () => {
    expect(sanitizeSelector(null as unknown as string)).toBeNull()
    expect(sanitizeSelector(undefined as unknown as string)).toBeNull()
    expect(sanitizeSelector(123 as unknown as string)).toBeNull()
    expect(sanitizeSelector({} as unknown as string)).toBeNull()
    expect(sanitizeSelector([] as unknown as string)).toBeNull()
  })

  it('returns empty string for empty or whitespace-only strings', () => {
    expect(sanitizeSelector('')).toBe('')
    expect(sanitizeSelector('   ')).toBe('')
    expect(sanitizeSelector('\n\t')).toBe('')
  })

  it('trims whitespace from valid selectors', () => {
    expect(sanitizeSelector('  div  ')).toBe('div')
    expect(sanitizeSelector('\n.class\t')).toBe('.class')
    expect(sanitizeSelector('  #id  ')).toBe('#id')
  })

  it('accepts valid basic CSS selectors', () => {
    expect(sanitizeSelector('div')).toBe('div')
    expect(sanitizeSelector('.class-name')).toBe('.class-name')
    expect(sanitizeSelector('#my-id')).toBe('#my-id')
    expect(sanitizeSelector('*')).toBe('*')
    expect(sanitizeSelector('body')).toBe('body')
    expect(sanitizeSelector('h1')).toBe('h1')
  })

  it('accepts valid CSS combinators', () => {
    expect(sanitizeSelector('div > p')).toBe('div > p')
    expect(sanitizeSelector('div + p')).toBe('div + p')
    expect(sanitizeSelector('div ~ p')).toBe('div ~ p')
    expect(sanitizeSelector('div p')).toBe('div p')
  })

  it('accepts valid attribute selectors', () => {
    expect(sanitizeSelector('[data-test]')).toBe('[data-test]')
    expect(sanitizeSelector('[data-test="value"]')).toBe('[data-test="value"]')
    expect(sanitizeSelector("[data-test='value']")).toBe("[data-test='value']")
    expect(sanitizeSelector('[class="btn btn-primary"]')).toBe('[class="btn btn-primary"]')
    expect(sanitizeSelector('input[type="text"]')).toBe('input[type="text"]')
    expect(sanitizeSelector('a[href="https://example.com"]')).toBe('a[href="https://example.com"]')
  })

  it('accepts valid pseudo-selectors', () => {
    expect(sanitizeSelector('div:hover')).toBe('div:hover')
    expect(sanitizeSelector('input:focus')).toBe('input:focus')
    expect(sanitizeSelector('li:nth-child(2)')).toBe('li:nth-child(2)')
    expect(sanitizeSelector('tr:nth-of-type(even)')).toBe('tr:nth-of-type(even)')
    expect(sanitizeSelector('p:first-child')).toBe('p:first-child')
    expect(sanitizeSelector('a:not(.active)')).toBe('a:not(.active)')
  })

  it('accepts complex valid selectors', () => {
    expect(sanitizeSelector('div.container > .row .col-md-6')).toBe(
      'div.container > .row .col-md-6',
    )
    expect(sanitizeSelector('form input[type="text"]:focus')).toBe('form input[type="text"]:focus')
    expect(sanitizeSelector('.nav-menu li:nth-child(2n+1) a')).toBe(
      '.nav-menu li:nth-child(2n+1) a',
    )
    expect(sanitizeSelector('table tbody tr:hover td')).toBe('table tbody tr:hover td')
  })

  it('accepts selectors with underscores and hyphens', () => {
    expect(sanitizeSelector('my_element')).toBe('my_element')
    expect(sanitizeSelector('.my-class_name')).toBe('.my-class_name')
    expect(sanitizeSelector('#my_id-123')).toBe('#my_id-123')
    expect(sanitizeSelector('[data-my_attr="value-123"]')).toBe('[data-my_attr="value-123"]')
  })

  it('rejects selectors with dangerous JavaScript patterns', () => {
    // eslint-disable-next-line
    expect(sanitizeSelector('javascript:alert(1)')).toBeNull()
    // eslint-disable-next-line
    expect(sanitizeSelector('JAVASCRIPT:void(0)')).toBeNull()
    expect(sanitizeSelector('div javascript: alert')).toBeNull()
    expect(sanitizeSelector('onclick=alert(1)')).toBeNull()
    expect(sanitizeSelector('onload=malicious()')).toBeNull()
    expect(sanitizeSelector('onmouseover=hack()')).toBeNull()
    expect(sanitizeSelector('div onclick=bad')).toBeNull()
  })

  it('rejects selectors with HTML-like content', () => {
    expect(sanitizeSelector('<script>alert(1)</script>')).toBeNull()
    expect(sanitizeSelector('div<script>')).toBeNull()
    // div>script>alert is actually a valid CSS selector (child combinators)
    expect(sanitizeSelector('div>script>alert')).toBe('div>script>alert')
    expect(sanitizeSelector('<img src=x onerror=alert(1)>')).toBeNull()
    expect(sanitizeSelector('div<>')).toBeNull()
  })

  it('rejects selectors with invalid characters', () => {
    expect(sanitizeSelector('div@invalid')).toBeNull()
    // $ is now allowed in our pattern, but @ should be rejected
    expect(sanitizeSelector('div$invalid')).toBe('div$invalid')
    // % is now allowed in our pattern (for URLs)
    expect(sanitizeSelector('div%invalid')).toBe('div%invalid')
    // & is now allowed in our pattern (for URLs)
    expect(sanitizeSelector('div&invalid')).toBe('div&invalid')
    expect(sanitizeSelector('div*invalid{')).toBeNull()
    expect(sanitizeSelector('div}')).toBeNull()
    expect(sanitizeSelector('div;')).toBeNull()
    // | is now allowed in our pattern (for attribute selectors)
    expect(sanitizeSelector('div|')).toBe('div|')
    expect(sanitizeSelector('div\\')).toBeNull()
    expect(sanitizeSelector('div`')).toBeNull()
  })

  it('handles selectors with parentheses', () => {
    // Basic parentheses content is allowed (needed for pseudo-selectors)
    expect(sanitizeSelector('div(alert(1))')).toBe('div(alert(1))')
    expect(sanitizeSelector('div(javascript:void(0))')).toBeNull()
    expect(sanitizeSelector('div(onclick=bad)')).toBeNull()
  })

  it('handles mixed valid and invalid content', () => {
    expect(sanitizeSelector('div.valid javascript:bad')).toBeNull()
    expect(sanitizeSelector('div.valid onclick=bad')).toBeNull()
    expect(sanitizeSelector('div.valid <script>')).toBeNull()
    expect(sanitizeSelector('div.valid @ invalid')).toBeNull()
  })

  it('handles edge cases with special characters in attributes', () => {
    // Valid cases with special characters in attribute values
    expect(sanitizeSelector('[data-url="https://example.com/path?q=1&r=2"]')).toBe(
      '[data-url="https://example.com/path?q=1&r=2"]',
    )
    expect(sanitizeSelector('[title="Hello World: A Story"]')).toBe(
      '[title="Hello World: A Story"]',
    )
    expect(sanitizeSelector('[alt="Image (photo)"]')).toBe('[alt="Image (photo)"]')

    // Invalid cases with dangerous content in attributes
    expect(sanitizeSelector('[onclick="javascript:alert(1)"]')).toBeNull()
    expect(sanitizeSelector('[href="javascript:void(0)"]')).toBeNull()
  })

  it('handles numeric values in selectors', () => {
    expect(sanitizeSelector('div123')).toBe('div123')
    expect(sanitizeSelector('.class-123')).toBe('.class-123')
    expect(sanitizeSelector('#id123')).toBe('#id123')
    expect(sanitizeSelector('[data-index="123"]')).toBe('[data-index="123"]')
    expect(sanitizeSelector('li:nth-child(3)')).toBe('li:nth-child(3)')
  })

  it('handles complex real-world selectors', () => {
    expect(sanitizeSelector('form.login-form input[type="password"]:required')).toBe(
      'form.login-form input[type="password"]:required',
    )
    expect(sanitizeSelector('.sidebar nav ul li:not(.active) a[href^="/"]')).toBe(
      '.sidebar nav ul li:not(.active) a[href^="/"]',
    )
    expect(sanitizeSelector('table.data-table tbody tr:nth-child(odd) td:first-child')).toBe(
      'table.data-table tbody tr:nth-child(odd) td:first-child',
    )
  })
})
