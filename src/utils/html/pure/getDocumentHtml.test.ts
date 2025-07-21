import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'

import { getDocumentHtml } from './getDocumentHtml'

describe('getDocumentHtml', () => {
  let originalDocumentElement: Element
  let originalDocument: Document

  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
    originalDocumentElement = document.documentElement
    originalDocument = document
    document.body.innerHTML = ''
  })

  afterEach(() => {
    Object.defineProperty(globalThis, 'document', {
      value: originalDocument,
      configurable: true,
    })
    if (originalDocumentElement) {
      Object.defineProperty(document, 'documentElement', {
        value: originalDocumentElement,
        configurable: true,
      })
    }
  })

  describe('basic functionality', () => {
    it('should return success with filtered document HTML', () => {
      document.documentElement.innerHTML = `
        <head>
          <title>Test Page</title>
          <meta name="description" content="Test description">
          <script>console.log('test');</script>
          <style>body { color: red; }</style>
        </head>
        <body>
          <h1>Visible Heading</h1>
          <p>Visible paragraph</p>
          <div hidden>Hidden content</div>
        </body>
      `

      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(result.result).toContain('<title>Test Page</title>')
      expect(result.result).toContain('<meta name="description"')
      expect(result.result).toContain('<h1>Visible Heading</h1>')
      expect(result.result).toContain('<p>Visible paragraph</p>')
      expect(result.result).not.toContain('<script>')
      expect(result.result).not.toContain('<style>')
      expect(result.result).not.toContain('Hidden content')
    })

    it('should work with real document structure', () => {
      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(result.result).toContain('<html')
      expect(result.result).toContain('</html>')
      expect(typeof result.result).toBe('string')
    })
  })

  describe('visibility filtering', () => {
    it('should exclude elements with hidden attribute', () => {
      document.body.innerHTML = `
        <div>Visible content</div>
        <div hidden>Hidden content</div>
        <p hidden="true">Also hidden</p>
      `

      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(result.result).toContain('Visible content')
      expect(result.result).not.toContain('Hidden content')
      expect(result.result).not.toContain('Also hidden')
    })

    it('should exclude elements with display:none style', () => {
      document.body.innerHTML = `
        <div>Visible content</div>
        <div style="display: none;">Hidden by display</div>
        <div style="DISPLAY:NONE;">Hidden by display uppercase</div>
        <div style="color: red; display: none; margin: 10px;">Hidden with other styles</div>
      `

      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(result.result).toContain('Visible content')
      expect(result.result).not.toContain('Hidden by display')
      expect(result.result).not.toContain('Hidden by display uppercase')
      expect(result.result).not.toContain('Hidden with other styles')
    })

    it('should exclude elements with visibility:hidden style', () => {
      document.body.innerHTML = `
        <div>Visible content</div>
        <div style="visibility: hidden;">Hidden by visibility</div>
        <div style="VISIBILITY:HIDDEN;">Hidden by visibility uppercase</div>
        <div style="color: blue; visibility: hidden; padding: 5px;">Hidden with other styles</div>
      `

      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(result.result).toContain('Visible content')
      expect(result.result).not.toContain('Hidden by visibility')
      expect(result.result).not.toContain('Hidden by visibility uppercase')
      expect(result.result).not.toContain('Hidden with other styles')
    })

    it('should handle checkVisibility method when available', () => {
      const mockElement = document.createElement('div')
      mockElement.textContent = 'Test element'
      mockElement.checkVisibility = vi.fn().mockReturnValue(false)
      document.body.appendChild(mockElement)

      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(mockElement.checkVisibility).toHaveBeenCalled()
      expect(result.result).not.toContain('Test element')
    })

    it('should include elements when checkVisibility returns true', () => {
      const mockElement = document.createElement('div')
      mockElement.textContent = 'Visible element'
      mockElement.checkVisibility = vi.fn().mockReturnValue(true)
      document.body.appendChild(mockElement)

      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(mockElement.checkVisibility).toHaveBeenCalled()
      expect(result.result).toContain('Visible element')
    })

    it('should include elements when checkVisibility is not available', () => {
      document.body.innerHTML = '<div>No checkVisibility method</div>'

      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(result.result).toContain('No checkVisibility method')
    })
  })

  describe('element type filtering', () => {
    it('should always include html, head, body, and title elements', () => {
      document.documentElement.innerHTML = `
        <head>
          <title>Test Title</title>
        </head>
        <body>
          <p>Body content</p>
        </body>
      `

      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(result.result).toContain('<html')
      expect(result.result).toContain('<head>')
      expect(result.result).toContain('<body>')
      expect(result.result).toContain('<title>Test Title</title>')
    })

    it('should exclude svg, script, style, and link elements', () => {
      document.head.innerHTML = `
        <title>Test</title>
        <script src="test.js"></script>
        <style>body { color: red; }</style>
        <link rel="stylesheet" href="style.css">
      `
      document.body.innerHTML = `
        <div>Content</div>
        <svg><circle cx="50" cy="50" r="40"/></svg>
        <script>alert('inline');</script>
      `

      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(result.result).toContain('<title>Test</title>')
      expect(result.result).toContain('<div>Content</div>')
      expect(result.result).not.toContain('<script')
      expect(result.result).not.toContain('<style>')
      expect(result.result).not.toContain('<link')
      expect(result.result).not.toContain('<svg>')
      expect(result.result).not.toContain('circle')
    })

    it('should include meta tags with allowed name attributes', () => {
      document.head.innerHTML = `
        <meta name="description" content="Page description">
        <meta name="keywords" content="test, page">
        <meta name="author" content="Test Author">
        <meta name="twitter:card" content="summary">
        <meta name="viewport" content="width=device-width">
        <meta charset="utf-8">
      `

      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(result.result).toContain('name="description"')
      expect(result.result).toContain('name="keywords"')
      expect(result.result).toContain('name="author"')
      expect(result.result).toContain('name="twitter:card"')
      expect(result.result).not.toContain('name="viewport"')
      expect(result.result).not.toContain('charset="utf-8"')
    })

    it('should include meta tags with allowed property attributes', () => {
      document.head.innerHTML = `
        <meta property="og:title" content="Page Title">
        <meta property="og:description" content="Page description">
        <meta property="article:author" content="Author Name">
        <meta property="fb:app_id" content="123456">
        <meta property="al:ios:app_name" content="App Name">
        <meta property="custom:property" content="Custom">
      `

      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(result.result).toContain('property="og:title"')
      expect(result.result).toContain('property="og:description"')
      expect(result.result).toContain('property="article:author"')
      expect(result.result).toContain('property="fb:app_id"')
      expect(result.result).toContain('property="al:ios:app_name"')
      expect(result.result).not.toContain('property="custom:property"')
    })

    it('should exclude meta tags without allowed name or property attributes', () => {
      document.head.innerHTML = `
        <meta name="viewport" content="width=device-width">
        <meta charset="utf-8">
        <meta http-equiv="refresh" content="30">
        <meta property="custom:tag" content="not allowed">
      `

      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(result.result).not.toContain('name="viewport"')
      expect(result.result).not.toContain('charset="utf-8"')
      expect(result.result).not.toContain('http-equiv="refresh"')
      expect(result.result).not.toContain('property="custom:tag"')
    })

    it('should exclude comprehensive SVG content', () => {
      document.body.innerHTML = `
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
      `

      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(result.result).not.toContain('<svg')
      expect(result.result).not.toContain('<rect')
      expect(result.result).not.toContain('<circle')
      expect(result.result).not.toContain('<text')
      expect(result.result).not.toContain('<path')
      expect(result.result).not.toContain('viewBox')
      expect(result.result).not.toContain('fill="blue"')
      expect(result.result).not.toContain('SVG Text')
      expect(result.result).toContain('Page with SVG')
      expect(result.result).toContain('Regular content')
      expect(result.result).toContain('More content')
    })

    it('should exclude various types of link tags', () => {
      document.head.innerHTML = `
        <title>Test</title>
        <link rel="stylesheet" href="/styles.css">
        <link rel="preload" href="/font.woff2" as="font" crossorigin type="font/woff2">
        <link rel="preload" as="script" fetchpriority="low" href="/script.js">
        <link rel="icon" type="image/x-icon" href="/favicon.ico">
        <link rel="canonical" href="https://example.com/page">
      `

      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(result.result).toContain('<title>Test</title>')
      expect(result.result).not.toContain('<link')
      expect(result.result).not.toContain('stylesheet')
      expect(result.result).not.toContain('preload')
      expect(result.result).not.toContain('favicon')
      expect(result.result).not.toContain('canonical')
      expect(result.result).not.toContain('fetchpriority')
    })
  })

  describe('style attribute removal', () => {
    it('should remove style attributes from copied elements', () => {
      document.body.innerHTML = `
        <div style="color: red; font-size: 16px;">Styled content</div>
        <p style="margin: 10px;">Paragraph with margin</p>
      `

      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(result.result).toContain('Styled content')
      expect(result.result).toContain('Paragraph with margin')
      expect(result.result).not.toContain('style="color: red')
      expect(result.result).not.toContain('style="margin: 10px"')
    })

    it('should preserve other attributes while removing style', () => {
      document.body.innerHTML = `
        <div id="test" class="container" style="background: blue;" data-value="123">
          Content with multiple attributes
        </div>
      `

      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(result.result).toContain('id="test"')
      expect(result.result).toContain('class="container"')
      expect(result.result).toContain('data-value="123"')
      expect(result.result).not.toContain('style="background: blue;"')
    })
  })

  describe('disconnected elements', () => {
    it('should exclude disconnected elements', () => {
      const disconnectedDiv = document.createElement('div')
      disconnectedDiv.textContent = 'Disconnected content'

      document.body.innerHTML = '<div>Connected content</div>'

      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(result.result).toContain('Connected content')
      expect(result.result).not.toContain('Disconnected content')
    })
  })

  describe('text node handling', () => {
    it('should include text nodes', () => {
      document.body.innerHTML = `
        <div>Text in div</div>
        Plain text node
        <p>Text in paragraph</p>
      `

      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(result.result).toContain('Text in div')
      expect(result.result).toContain('Text in paragraph')
      expect(result.result).toContain('Plain text node')
    })
  })

  describe('comment node handling', () => {
    it('should exclude HTML comments', () => {
      document.documentElement.innerHTML = `
        <head>
          <title>Test</title>
          <!-- Meta tags and other head content -->
        </head>
        <body>
          <!-- Main content starts here -->
          <h1>Hello World</h1>
          <!-- This is a comment in the middle -->
          <p>Important content</p>
          <!-- TODO: Add more content later -->
          <div>
            <!-- Nested comment -->
            <span>Nested content</span>
            <!-- Another comment -->
          </div>
          <!-- End of content -->
        </body>
      `

      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(result.result).not.toContain('<!--')
      expect(result.result).not.toContain('-->')
      expect(result.result).not.toContain('Meta tags and other head content')
      expect(result.result).not.toContain('Main content starts here')
      expect(result.result).not.toContain('This is a comment in the middle')
      expect(result.result).not.toContain('TODO: Add more content later')
      expect(result.result).not.toContain('Nested comment')
      expect(result.result).not.toContain('Another comment')
      expect(result.result).not.toContain('End of content')
      expect(result.result).toContain('Hello World')
      expect(result.result).toContain('Important content')
      expect(result.result).toContain('Nested content')
    })
  })

  describe('error handling', () => {
    it('should return error when cloneNode throws an error', () => {
      const mockError = new Error('Clone failed')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.spyOn(document.documentElement, 'cloneNode').mockImplementation(() => {
        throw mockError
      })

      const result = getDocumentHtml()

      expect(result).toEqual({
        success: false,
        error: 'Clone failed',
      })
      expect(consoleSpy).toHaveBeenCalledWith('ChatConnect: error getting document html')
      expect(consoleSpy).toHaveBeenCalledWith(mockError)
    })

    it('should handle string errors correctly', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.spyOn(document.documentElement, 'cloneNode').mockImplementation(() => {
        throw 'String error'
      })

      const result = getDocumentHtml()

      expect(result).toEqual({
        success: false,
        error: 'String error',
      })
      expect(consoleSpy).toHaveBeenCalledWith('ChatConnect: error getting document html')
      expect(consoleSpy).toHaveBeenCalledWith('String error')
    })

    it('should handle null/undefined errors with fallback message', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.spyOn(document.documentElement, 'cloneNode').mockImplementation(() => {
        throw null
      })

      const result = getDocumentHtml()

      expect(result).toEqual({
        success: false,
        error: 'Unknown error',
      })
      expect(consoleSpy).toHaveBeenCalledWith('ChatConnect: error getting document html')
      expect(consoleSpy).toHaveBeenCalledWith(null)
    })

    it('should handle objects without toString method', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const errorObj = Object.create(null)

      vi.spyOn(document.documentElement, 'cloneNode').mockImplementation(() => {
        throw errorObj
      })

      const result = getDocumentHtml()

      expect(result).toEqual({
        success: false,
        error: 'Unknown error',
      })
      expect(consoleSpy).toHaveBeenCalledWith('ChatConnect: error getting document html')
      expect(consoleSpy).toHaveBeenCalledWith(errorObj)
    })
  })

  describe('complex scenarios', () => {
    it('should handle nested structures with mixed visibility', () => {
      document.body.innerHTML = `
        <div>
          <p>Visible paragraph</p>
          <div hidden>
            <span>Hidden content</span>
          </div>
          <article>
            <h2>Article title</h2>
            <div style="display: none;">Hidden article content</div>
            <p>Visible article content</p>
          </article>
        </div>
      `

      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(result.result).toContain('Visible paragraph')
      expect(result.result).toContain('Article title')
      expect(result.result).toContain('Visible article content')
      expect(result.result).not.toContain('Hidden content')
      expect(result.result).not.toContain('Hidden article content')
    })

    it('should preserve document structure while filtering content', () => {
      document.documentElement.innerHTML = `
        <head>
          <title>Complex Page</title>
          <meta name="description" content="Test page">
          <script>var x = 1;</script>
          <style>.test { color: red; }</style>
        </head>
        <body>
          <header>
            <h1>Main Title</h1>
            <nav style="display: none;">Hidden navigation</nav>
          </header>
          <main>
            <article>
              <h2>Article</h2>
              <p>Content</p>
            </article>
          </main>
          <script>console.log('footer script');</script>
        </body>
      `

      const result = getDocumentHtml()

      expect(result.success).toBe(true)
      expect(result.result).toContain('<html')
      expect(result.result).toContain('<head>')
      expect(result.result).toContain('<body>')
      expect(result.result).toContain('<title>Complex Page</title>')
      expect(result.result).toContain('name="description"')
      expect(result.result).toContain('<header>')
      expect(result.result).toContain('<h1>Main Title</h1>')
      expect(result.result).toContain('<main>')
      expect(result.result).toContain('<article>')
      expect(result.result).toContain('<h2>Article</h2>')
      expect(result.result).toContain('<p>Content</p>')
      expect(result.result).not.toContain('<script>')
      expect(result.result).not.toContain('<style>')
      expect(result.result).not.toContain('Hidden navigation')
      expect(result.result).not.toContain('var x = 1')
      expect(result.result).not.toContain('color: red')
    })

    it('should handle comprehensive document with all unwanted elements', () => {
      document.documentElement.innerHTML = `
        <head>
          <title>Comprehensive Test</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="description" content="Test page description">
          <meta name="twitter:card" content="summary">
          <meta property="og:title" content="Test Page">
          <meta property="og:description" content="A comprehensive test page">
          <link rel="stylesheet" href="/_next/static/css/styles.css">
          <link rel="preload" href="/_next/static/media/font.woff2" as="font" crossorigin type="font/woff2">
          <style>body { margin: 0; }</style>
          <script>window.dataLayer = [];</script>
          <!-- Analytics script -->
        </head>
        <body style="font-family: Arial;">
          <!-- Main content starts here -->
          <div style="padding: 20px;">
            <h1 style="color: blue;">Main Title</h1>
            <svg width="100" height="100">
              <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
            </svg>
            <p>Important content here</p>
            <div hidden>Hidden content with nested elements</div>
            <span style="display: none;">Hidden span</span>
            <script>gtag('config', 'GA_MEASUREMENT_ID');</script>
            <!-- TODO: Add more content -->
          </div>
          <!-- End of content -->
        </body>
      `

      const result = getDocumentHtml()

      expect(result.success).toBe(true)

      // Should contain allowed content
      expect(result.result).toContain('<title>Comprehensive Test</title>')
      expect(result.result).toContain('name="description"')
      expect(result.result).toContain('name="twitter:card"')
      expect(result.result).toContain('property="og:title"')
      expect(result.result).toContain('property="og:description"')
      expect(result.result).toContain('Main Title')
      expect(result.result).toContain('Important content here')

      // Should exclude unwanted elements and content
      expect(result.result).not.toContain('<link')
      expect(result.result).not.toContain('<style>')
      expect(result.result).not.toContain('<script>')
      expect(result.result).not.toContain('<svg')
      expect(result.result).not.toContain('style="')
      expect(result.result).not.toContain('<!--')
      expect(result.result).not.toContain('name="viewport"')
      expect(result.result).not.toContain('stylesheet')
      expect(result.result).not.toContain('preload')
      expect(result.result).not.toContain('dataLayer')
      expect(result.result).not.toContain('gtag')
      expect(result.result).not.toContain('circle')
      expect(result.result).not.toContain('stroke')
      expect(result.result).not.toContain('Hidden content with nested elements')
      expect(result.result).not.toContain('Hidden span')
      expect(result.result).not.toContain('Analytics script')
      expect(result.result).not.toContain('TODO: Add more content')
      expect(result.result).not.toContain('Main content starts here')
      expect(result.result).not.toContain('End of content')
    })
  })
})
