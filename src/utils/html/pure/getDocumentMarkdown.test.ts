import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'

import { getDocumentMarkdown } from './getDocumentMarkdown'

describe('getDocumentMarkdown', () => {
  let originalDocumentElement: Element
  let originalDocument: Document

  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
    originalDocumentElement = document.documentElement
    originalDocument = document
    if (document.body) {
      document.body.innerHTML = ''
    }
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
    it('should return success with basic markdown conversion', () => {
      document.body.innerHTML = `
        <h1>Welcome to Our Blog</h1>
        <p>This is an <strong>important</strong> article about <em>web development</em>.</p>
        <h2>Key Points</h2>
        <ul>
          <li>HTML parsing with DOMParser</li>
          <li>Markdown conversion for <a href="https://commonmark.org/">CommonMark</a> compatibility</li>
          <li>Support for tables, lists, and emphasis</li>
        </ul>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('# Welcome to Our Blog')
      expect(result.result).toContain('**important**')
      expect(result.result).toContain('*web development*')
      expect(result.result).toContain('## Key Points')
      expect(result.result).toContain('- HTML parsing with DOMParser')
      expect(result.result).toContain('CommonMark')
    })

    it('should work with real document structure', () => {
      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(typeof result.result).toBe('string')
    })

    it('should handle empty body', () => {
      document.body.innerHTML = ''

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toBe('')
    })
  })

  describe('heading conversion', () => {
    it('should convert all heading levels correctly', () => {
      document.body.innerHTML = `
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <h4>Heading 4</h4>
        <h5>Heading 5</h5>
        <h6>Heading 6</h6>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('# Heading 1')
      expect(result.result).toContain('## Heading 2')
      expect(result.result).toContain('### Heading 3')
      expect(result.result).toContain('#### Heading 4')
      expect(result.result).toContain('##### Heading 5')
      expect(result.result).toContain('###### Heading 6')
    })
  })

  describe('text formatting conversion', () => {
    it('should convert bold text with strong and b tags', () => {
      document.body.innerHTML = `
        <p>This is <strong>strong text</strong> and this is <b>bold text</b>.</p>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('**strong text**')
      expect(result.result).toContain('**bold text**')
    })

    it('should convert italic text with em and i tags', () => {
      document.body.innerHTML = `
        <p>This is <em>emphasized text</em> and this is <i>italic text</i>.</p>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('*emphasized text*')
      expect(result.result).toContain('*italic text*')
    })

    it('should handle nested text formatting', () => {
      document.body.innerHTML = `
        <p>This has <strong>bold with <em>italic inside</em></strong> text.</p>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('**bold with *italic inside***')
    })
  })

  describe('link conversion', () => {
    it('should extract text from links ignoring href', () => {
      document.body.innerHTML = `
        <p>Visit <a href="https://example.com">our website</a> for more info.</p>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('Visit our website for more info.')
      expect(result.result).not.toContain('[our website](https://example.com)')
    })

    it('should skip empty links', () => {
      document.body.innerHTML = `
        <p>This is an <a href=""></a> empty link.</p>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).not.toContain('[]()')
      expect(result.result).toContain('This is an  empty link.')
    })

    it('should extract text from links with text but no href', () => {
      document.body.innerHTML = `
        <p>This is a <a>link with text only</a>.</p>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('This is a link with text only.')
    })

    it('should skip links with href but no text', () => {
      document.body.innerHTML = `
        <p>This is a <a href="https://example.com"></a> link with href only.</p>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('This is a  link with href only.')
      expect(result.result).not.toContain('https://example.com')
    })
  })

  describe('list conversion', () => {
    it('should convert unordered lists correctly', () => {
      document.body.innerHTML = `
        <ul>
          <li>First item</li>
          <li>Second item</li>
          <li>Third item</li>
        </ul>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('- First item')
      expect(result.result).toContain('- Second item')
      expect(result.result).toContain('- Third item')
    })

    it('should convert ordered lists correctly', () => {
      document.body.innerHTML = `
        <ol>
          <li>First step</li>
          <li>Second step</li>
          <li>Third step</li>
        </ol>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('1. First step')
      expect(result.result).toContain('2. Second step')
      expect(result.result).toContain('3. Third step')
    })

    it('should handle nested lists', () => {
      document.body.innerHTML = `
        <ul>
          <li>Main item
            <ul>
              <li>Sub item 1</li>
              <li>Sub item 2</li>
            </ul>
          </li>
          <li>Another main item</li>
        </ul>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('- Main item')
      expect(result.result).toContain('- Another main item')
    })

    it('should handle empty list items', () => {
      document.body.innerHTML = `
        <ul>
          <li>Item with content</li>
          <li></li>
          <li>Another item</li>
        </ul>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('- Item with content')
      expect(result.result).toContain('- Another item')
    })
  })

  describe('blockquote conversion', () => {
    it('should convert blockquotes correctly', () => {
      document.body.innerHTML = `
        <blockquote>This is a blockquote with important information.</blockquote>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('> This is a blockquote with important information.')
    })

    it('should handle nested content in blockquotes', () => {
      document.body.innerHTML = `
        <blockquote>
          <p>This is a paragraph in a blockquote with <strong>bold text</strong>.</p>
        </blockquote>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('> This is a paragraph in a blockquote with **bold text**.')
    })
  })

  describe('code conversion', () => {
    it('should convert inline code correctly', () => {
      document.body.innerHTML = `
        <p>Use the <code>console.log()</code> function to debug.</p>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('`console.log()`')
    })

    it('should convert code blocks correctly', () => {
      document.body.innerHTML = `
        <pre>function hello() {
  console.log('Hello World');
}</pre>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('```')
      expect(result.result).toContain('function hello() {')
      expect(result.result).toContain("console.log('Hello World');")
    })
  })

  describe('table conversion', () => {
    it('should convert simple tables with thead correctly', () => {
      document.body.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John</td>
              <td>30</td>
            </tr>
            <tr>
              <td>Jane</td>
              <td>25</td>
            </tr>
          </tbody>
        </table>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('| Name | Age |')
      expect(result.result).toContain('| --- | --- |')
      expect(result.result).toContain('| John | 30 |')
      expect(result.result).toContain('| Jane | 25 |')
    })

    it('should convert tables without thead by treating first row as header', () => {
      document.body.innerHTML = `
        <table>
          <tr>
            <td>Feature</td>
            <td>Status</td>
          </tr>
          <tr>
            <td>Headings</td>
            <td>✅ Complete</td>
          </tr>
        </table>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('| Feature | Status |')
      expect(result.result).toContain('| --- | --- |')
      expect(result.result).toContain('| Headings | ✅ Complete |')
    })

    it('should handle tables with mixed th and td in header', () => {
      document.body.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>Column 1</th>
              <td>Column 2</td>
              <th>Column 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Data 1</td>
              <td>Data 2</td>
              <td>Data 3</td>
            </tr>
          </tbody>
        </table>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('| Column 1 | Column 2 | Column 3 |')
      expect(result.result).toContain('| --- | --- | --- |')
      expect(result.result).toContain('| Data 1 | Data 2 | Data 3 |')
    })

    it('should handle empty tables', () => {
      document.body.innerHTML = `
        <table></table>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).not.toContain('|')
    })

    it('should handle tables with empty cells', () => {
      document.body.innerHTML = `
        <table>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Test</td>
            <td></td>
          </tr>
        </table>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('| Test |  |')
    })
  })

  describe('visibility filtering', () => {
    it('should exclude elements with hidden attribute', () => {
      document.body.innerHTML = `
        <h1>Visible Heading</h1>
        <p hidden>Hidden paragraph</p>
        <div>Visible content</div>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('# Visible Heading')
      expect(result.result).toContain('Visible content')
      expect(result.result).not.toContain('Hidden paragraph')
    })

    it('should exclude elements with display:none style', () => {
      document.body.innerHTML = `
        <h1>Visible Heading</h1>
        <p style="display: none;">Hidden by display</p>
        <div>Visible content</div>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('# Visible Heading')
      expect(result.result).toContain('Visible content')
      expect(result.result).not.toContain('Hidden by display')
    })

    it('should exclude elements with visibility:hidden style', () => {
      document.body.innerHTML = `
        <h1>Visible Heading</h1>
        <p style="visibility: hidden;">Hidden by visibility</p>
        <div>Visible content</div>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('# Visible Heading')
      expect(result.result).toContain('Visible content')
      expect(result.result).not.toContain('Hidden by visibility')
    })

    it('should handle checkVisibility method when available', () => {
      const mockDiv = document.createElement('div')
      mockDiv.textContent = 'Test element'
      mockDiv.checkVisibility = vi.fn().mockReturnValue(false)
      document.body.appendChild(mockDiv)

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(mockDiv.checkVisibility).toHaveBeenCalled()
      expect(result.result).not.toContain('Test element')
    })

    it('should include elements when checkVisibility returns true', () => {
      const mockDiv = document.createElement('div')
      mockDiv.textContent = 'Visible element'
      mockDiv.checkVisibility = vi.fn().mockReturnValue(true)
      document.body.appendChild(mockDiv)

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(mockDiv.checkVisibility).toHaveBeenCalled()
      expect(result.result).toContain('Visible element')
    })
  })

  describe('element type filtering', () => {
    it('should exclude svg, script, style, and link elements', () => {
      document.body.innerHTML = `
        <h1>Main Content</h1>
        <svg><circle cx="50" cy="50" r="40"/></svg>
        <script>console.log('test');</script>
        <style>body { color: red; }</style>
        <link rel="stylesheet" href="style.css">
        <p>Visible paragraph</p>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('# Main Content')
      expect(result.result).toContain('Visible paragraph')
      expect(result.result).not.toContain('circle')
      expect(result.result).not.toContain('console.log')
      expect(result.result).not.toContain('color: red')
      expect(result.result).not.toContain('stylesheet')
    })

    it('should exclude meta tags without allowed attributes', () => {
      document.head.innerHTML = `
        <meta charset="utf-8">
        <meta name="description" content="Page description">
        <meta name="viewport" content="width=device-width">
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).not.toContain('charset')
      expect(result.result).not.toContain('viewport')
    })
  })

  describe('line break and spacing handling', () => {
    it('should handle br tags correctly', () => {
      document.body.innerHTML = `
        <p>First line<br>Second line<br>Third line</p>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('First line\n\nSecond line\n\nThird line')
    })

    it('should clean up excessive newlines', () => {
      document.body.innerHTML = `
        <h1>Heading</h1>
        
        
        
        <p>Paragraph</p>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).not.toMatch(/\n{3,}/)
    })
  })

  describe('complex scenarios', () => {
    it('should handle comprehensive document structure', () => {
      document.body.innerHTML = `
        <div>
          <h1>Welcome to Our Blog</h1>
          <p>This is an <strong>important</strong> article about <em>web development</em>.</p>
          <h2>Key Points</h2>
          <ul>
            <li>HTML parsing with DOMParser</li>
            <li>Markdown conversion for <a href="https://commonmark.org/">CommonMark</a> compatibility</li>
            <li>Support for tables, lists, and emphasis</li>
          </ul>
          <blockquote>
            Web development is constantly evolving.
          </blockquote>
          <table>
            <tr>
              <th>Feature</th>
              <th>Status</th>
            </tr>
            <tr>
              <td>Headings</td>
              <td>✅ Complete</td>
            </tr>
            <tr>
              <td>Lists</td>
              <td>✅ Complete</td>
            </tr>
          </table>
        </div>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toEqual(
        '# Welcome to Our Blog\n\nThis is an **important** article about *web development*.\n\n## Key Points\n\n- HTML parsing with DOMParser\n- Markdown conversion for CommonMark compatibility\n- Support for tables, lists, and emphasis\n\n> Web development is constantly evolving.\n\n| Feature | Status |\n| --- | --- |\n| Headings | ✅ Complete |\n| Lists | ✅ Complete |',
      )
    })

    it('should handle nested structures with mixed visibility', () => {
      document.body.innerHTML = `
        <div>
          <h1>Visible Heading</h1>
          <div hidden>
            <p>Hidden content</p>
          </div>
          <article>
            <h2>Article Title</h2>
            <div style="display: none;">Hidden article content</div>
            <p>Visible article content</p>
          </article>
        </div>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('# Visible Heading')
      expect(result.result).toContain('## Article Title')
      expect(result.result).toContain('Visible article content')
      expect(result.result).not.toContain('Hidden content')
      expect(result.result).not.toContain('Hidden article content')
    })

    it('should handle mixed content types within paragraphs', () => {
      document.body.innerHTML = `
        <p>This paragraph has <strong>bold</strong>, <em>italic</em>, <code>code</code>, and a <a href="https://example.com">link</a>.</p>
      `

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('**bold**')
      expect(result.result).toContain('*italic*')
      expect(result.result).toContain('`code`')
      expect(result.result).toContain('link')
    })
  })

  describe('error handling', () => {
    it('should return error when document.body is null', () => {
      const originalBody = document.body
      const originalDocElement = document.documentElement

      Object.defineProperty(document, 'body', {
        value: null,
        configurable: true,
      })
      Object.defineProperty(document, 'documentElement', {
        value: null,
        configurable: true,
      })

      const result = getDocumentMarkdown()

      expect(result).toEqual({
        success: false,
        error: 'No document body found',
      })

      // Restore original values
      Object.defineProperty(document, 'body', {
        value: originalBody,
        configurable: true,
      })
      Object.defineProperty(document, 'documentElement', {
        value: originalDocElement,
        configurable: true,
      })
    })

    it('should handle errors during markdown conversion', () => {
      document.body.innerHTML = '<h1>Test</h1>'

      const mockError = new Error('Conversion failed')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.spyOn(document.body, 'children', 'get').mockImplementation(() => {
        throw mockError
      })

      const result = getDocumentMarkdown()

      expect(result).toEqual({
        success: false,
        error: 'Conversion failed',
      })
      expect(consoleSpy).toHaveBeenCalledWith('ChatConnect: error getting document markdown')
      expect(consoleSpy).toHaveBeenCalledWith(mockError)
    })

    it('should handle string errors correctly', () => {
      document.body.innerHTML = '<h1>Test</h1>'

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.spyOn(document.body, 'children', 'get').mockImplementation(() => {
        throw 'String error'
      })

      const result = getDocumentMarkdown()

      expect(result).toEqual({
        success: false,
        error: 'String error',
      })
      expect(consoleSpy).toHaveBeenCalledWith('ChatConnect: error getting document markdown')
      expect(consoleSpy).toHaveBeenCalledWith('String error')
    })

    it('should handle null/undefined errors with fallback message', () => {
      document.body.innerHTML = '<h1>Test</h1>'

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.spyOn(document.body, 'children', 'get').mockImplementation(() => {
        throw null
      })

      const result = getDocumentMarkdown()

      expect(result).toEqual({
        success: false,
        error: 'Unknown error',
      })
      expect(consoleSpy).toHaveBeenCalledWith('ChatConnect: error getting document markdown')
      expect(consoleSpy).toHaveBeenCalledWith(null)
    })

    it('should handle objects without toString method', () => {
      document.body.innerHTML = '<h1>Test</h1>'

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const errorObj = Object.create(null)

      vi.spyOn(document.body, 'children', 'get').mockImplementation(() => {
        throw errorObj
      })

      const result = getDocumentMarkdown()

      expect(result).toEqual({
        success: false,
        error: 'Unknown error',
      })
      expect(consoleSpy).toHaveBeenCalledWith('ChatConnect: error getting document markdown')
      expect(consoleSpy).toHaveBeenCalledWith(errorObj)
    })
  })

  describe('edge cases', () => {
    it('should handle empty elements correctly', () => {
      if (document.body) {
        document.body.innerHTML = `
          <h1></h1>
          <p></p>
          <ul></ul>
          <table></table>
        `
      }

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('#')
      expect(result.result).not.toContain('| ')
    })

    it('should handle elements with only whitespace', () => {
      if (document.body) {
        document.body.innerHTML = `
          <h1>   </h1>
          <p>   \t   </p>
        `
      }

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('#')
    })

    it('should handle deeply nested elements', () => {
      if (document.body) {
        document.body.innerHTML = `
          <div>
            <section>
              <article>
                <header>
                  <h1>Deep Heading</h1>
                </header>
                <main>
                  <p>Deep paragraph with <span><strong>nested bold</strong></span> text.</p>
                </main>
              </article>
            </section>
          </div>
        `
      }

      const result = getDocumentMarkdown()

      expect(result.success).toBe(true)
      expect(result.result).toContain('# Deep Heading')
      expect(result.result).toContain('**nested bold**')
    })
  })
})
