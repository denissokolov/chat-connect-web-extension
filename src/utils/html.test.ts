import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest'

import { getH1Text, cleanHtmlContent, sanitizeSelector } from './html'

describe('html utils', () => {
  describe('getH1Text', () => {
    beforeAll(() => {
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        width: 100,
        height: 100,
      } as DOMRect)
    })

    beforeEach(() => {
      document.body.innerHTML = ''
    })

    it('returns null if no h1 is present', () => {
      expect(getH1Text()).toBeNull()
    })

    it('returns text from a visible h1', () => {
      const el = document.createElement('h1')
      el.innerText = 'Visible Heading'
      document.body.appendChild(el)

      expect(getH1Text()).toBe('Visible Heading')
    })

    it('ignores hidden h1 elements', () => {
      const hidden = document.createElement('h1')
      hidden.innerText = 'Hidden Heading'
      hidden.style.display = 'none'
      document.body.appendChild(hidden)

      expect(getH1Text()).toBeNull()
    })

    it('ignores h1 elements with opacity 0 or visibility hidden', () => {
      const h1 = document.createElement('h1')
      h1.innerText = 'Invisible'
      h1.style.visibility = 'hidden'
      document.body.appendChild(h1)

      expect(getH1Text()).toBeNull()
    })

    it('returns first visible h1 when multiple are present', () => {
      const hidden = document.createElement('h1')
      hidden.innerText = 'Hidden H1'
      hidden.style.display = 'none'
      document.body.appendChild(hidden)

      const visible = document.createElement('h1')
      visible.innerText = 'Visible H1'
      document.body.appendChild(visible)

      const second = document.createElement('h1')
      second.innerText = 'Second H1'
      document.body.appendChild(second)

      expect(getH1Text()).toBe('Visible H1')
    })

    it('returns text from a h1 with visible parent', () => {
      const hiddenParent = document.createElement('div')
      hiddenParent.style.display = 'none'
      hiddenParent.style.visibility = 'hidden'
      hiddenParent.style.opacity = '0'
      document.body.appendChild(hiddenParent)

      const hiddenH1 = document.createElement('h1')
      hiddenH1.innerText = 'Hidden H1'
      hiddenParent.appendChild(hiddenH1)

      const parent = document.createElement('div')
      parent.style.display = 'block'
      parent.style.visibility = 'visible'
      parent.style.opacity = '1'
      document.body.appendChild(parent)

      const h1 = document.createElement('h1')
      h1.innerText = 'Visible H1'
      parent.appendChild(h1)

      expect(getH1Text()).toBe('Visible H1')
    })

    it('returns null if the h1 has no width or height', () => {
      const h1 = document.createElement('h1')
      h1.innerText = 'Visible H1'
      document.body.appendChild(h1)

      h1.getBoundingClientRect = () =>
        ({
          width: 0,
          height: 0,
        }) as DOMRect

      expect(getH1Text()).toBeNull()
    })
  })

  describe('cleanHtmlContent', () => {
    it('removes script tags from HTML', () => {
      const htmlWithScript = `
      <html>
        <head><title>Test</title></head>
        <body>
          <h1>Hello World</h1>
          <script>alert('malicious code')</script>
          <p>Content</p>
        </body>
      </html>
    `

      const cleaned = cleanHtmlContent(htmlWithScript)
      expect(cleaned).not.toContain('<script>')
      expect(cleaned).not.toContain('alert')
      expect(cleaned).toContain('Hello World')
      expect(cleaned).toContain('Content')
    })

    it('removes style tags from HTML', () => {
      const htmlWithStyle = `
      <html>
        <head>
          <title>Test</title>
          <style>body { background: red; }</style>
        </head>
        <body>
          <h1>Hello World</h1>
        </body>
      </html>
    `

      const cleaned = cleanHtmlContent(htmlWithStyle)
      expect(cleaned).not.toContain('<style>')
      expect(cleaned).not.toContain('background: red')
      expect(cleaned).toContain('Hello World')
    })

    it('removes inline style attributes from elements', () => {
      const htmlWithInlineStyles = `
      <html>
        <head><title>Test</title></head>
        <body>
          <h1 style="color: red; font-size: 24px;">Hello World</h1>
          <p style="margin: 10px;">Content with inline styles</p>
        </body>
      </html>
    `

      const cleaned = cleanHtmlContent(htmlWithInlineStyles)
      expect(cleaned).not.toContain('style="color: red')
      expect(cleaned).not.toContain('style="margin: 10px"')
      expect(cleaned).toContain('Hello World')
      expect(cleaned).toContain('Content with inline styles')
    })

    it('removes all types of inline styles and scripts together', () => {
      const htmlWithAll = `
      <html>
        <head>
          <title>Test</title>
          <style>.header { color: blue; }</style>
          <script>console.log('test')</script>
        </head>
        <body style="background: white;">
          <h1 style="color: red;">Hello World</h1>
          <script>alert('another script')</script>
          <p style="font-weight: bold;">Content</p>
        </body>
      </html>
    `

      const cleaned = cleanHtmlContent(htmlWithAll)
      expect(cleaned).not.toContain('<style>')
      expect(cleaned).not.toContain('<script>')
      expect(cleaned).not.toContain('style="')
      expect(cleaned).not.toContain('background: white')
      expect(cleaned).not.toContain('color: red')
      expect(cleaned).not.toContain('font-weight: bold')
      expect(cleaned).not.toContain('console.log')
      expect(cleaned).not.toContain('alert')
      expect(cleaned).toContain('Hello World')
      expect(cleaned).toContain('Content')
    })

    it('removes meta and link tags', () => {
      const htmlWithMetaAndLinks = `
      <html>
        <head>
          <title>Test</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta charset="UTF-8">
          <meta name="description" content="Page description">
          <meta name="twitter:card" content="summary_large_image">
          <meta property="og:title" content="Page Title">
          <link rel="stylesheet" href="/styles.css">
          <link rel="preload" href="/font.woff2" as="font" crossorigin type="font/woff2">
          <link rel="preload" as="script" fetchpriority="low" href="/script.js">
        </head>
        <body>
          <h1>Hello World</h1>
          <p>Content</p>
        </body>
      </html>
    `

      const cleaned = cleanHtmlContent(htmlWithMetaAndLinks)
      expect(cleaned).not.toContain('<link')
      expect(cleaned).not.toContain('viewport')
      expect(cleaned).not.toContain('charset')
      expect(cleaned).not.toContain('stylesheet')
      expect(cleaned).not.toContain('preload')
      expect(cleaned).toContain('Hello World')
      expect(cleaned).toContain('Content')
      expect(cleaned).toContain('<title>Test</title>')
      expect(cleaned).toContain('name="description"')
      expect(cleaned).toContain('name="twitter:card"')
      expect(cleaned).toContain('property="og:title"')
    })

    it('removes all unwanted elements while preserving content', () => {
      const complexHtml = `
      <html>
        <head>
          <title>Complex Page</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="description" content="Test page description">
          <meta name="twitter:card" content="summary">
          <meta property="og:title" content="Complex Page">
          <meta property="og:description" content="A complex test page">
          <link rel="stylesheet" href="/_next/static/css/styles.css">
          <link rel="preload" href="/_next/static/media/font.woff2" as="font" crossorigin type="font/woff2">
          <style>body { margin: 0; }</style>
          <script>window.dataLayer = [];</script>
        </head>
        <body style="font-family: Arial;">
          <div style="padding: 20px;">
            <h1 style="color: blue;">Main Title</h1>
            <svg width="100" height="100">
              <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
            </svg>
            <p>Important content here</p>
            <script>gtag('config', 'GA_MEASUREMENT_ID');</script>
          </div>
        </body>
      </html>
    `

      const cleaned = cleanHtmlContent(complexHtml)
      expect(cleaned).not.toContain('<link')
      expect(cleaned).not.toContain('<style>')
      expect(cleaned).not.toContain('<script>')
      expect(cleaned).not.toContain('<svg')
      expect(cleaned).not.toContain('style="')
      expect(cleaned).not.toContain('viewport')
      expect(cleaned).not.toContain('stylesheet')
      expect(cleaned).not.toContain('preload')
      expect(cleaned).not.toContain('dataLayer')
      expect(cleaned).not.toContain('gtag')
      expect(cleaned).not.toContain('circle')
      expect(cleaned).not.toContain('stroke')
      expect(cleaned).toContain('Main Title')
      expect(cleaned).toContain('Important content here')
      expect(cleaned).toContain('<title>Complex Page</title>')
      expect(cleaned).toContain('name="description"')
      expect(cleaned).toContain('name="twitter:card"')
      expect(cleaned).toContain('property="og:title"')
      expect(cleaned).toContain('property="og:description"')
    })

    it('removes SVG elements', () => {
      const htmlWithSvg = `
      <html>
        <head><title>SVG Test</title></head>
        <body>
          <h1>Page with SVG</h1>
          <svg width="200" height="200">
            <rect x="10" y="10" width="100" height="100" fill="blue" />
            <circle cx="150" cy="50" r="30" fill="red" />
            <text x="10" y="150" font-family="Arial" font-size="16" fill="black">SVG Text</text>
          </svg>
          <p>Regular content</p>
          <div>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            </svg>
            More content
          </div>
        </body>
      </html>
    `

      const cleaned = cleanHtmlContent(htmlWithSvg)
      expect(cleaned).not.toContain('<svg')
      expect(cleaned).not.toContain('<rect')
      expect(cleaned).not.toContain('<circle')
      expect(cleaned).not.toContain('<text')
      expect(cleaned).not.toContain('<path')
      expect(cleaned).not.toContain('viewBox')
      expect(cleaned).not.toContain('fill="blue"')
      expect(cleaned).not.toContain('SVG Text')
      expect(cleaned).toContain('Page with SVG')
      expect(cleaned).toContain('Regular content')
      expect(cleaned).toContain('More content')
    })

    it('preserves HTML structure and content while cleaning', () => {
      const htmlWithNesting = `
      <html>
        <head><title>Test</title></head>
        <body>
          <div style="padding: 20px;">
            <header style="background: gray;">
              <h1 style="color: blue;">Title</h1>
            </header>
            <main>
              <article style="margin: 10px;">
                <p>Paragraph content</p>
              </article>
            </main>
          </div>
        </body>
      </html>
    `

      const cleaned = cleanHtmlContent(htmlWithNesting)
      expect(cleaned).toContain('<div>')
      expect(cleaned).toContain('<header>')
      expect(cleaned).toContain('<h1>')
      expect(cleaned).toContain('<main>')
      expect(cleaned).toContain('<article>')
      expect(cleaned).toContain('<p>')
      expect(cleaned).toContain('Title')
      expect(cleaned).toContain('Paragraph content')
      expect(cleaned).not.toContain('style="')
    })
  })

  describe('sanitizeSelector', () => {
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
      expect(sanitizeSelector('a[href="https://example.com"]')).toBe(
        'a[href="https://example.com"]',
      )
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
      expect(sanitizeSelector('form input[type="text"]:focus')).toBe(
        'form input[type="text"]:focus',
      )
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
})
