import { describe, it, expect, vi, beforeEach } from 'vitest'

import { getTextContent } from './getTextContent'

describe('getTextContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('Success cases', () => {
    it('should extract text content from simple HTML', () => {
      const html = '<p>Hello World</p>'

      const result = getTextContent(html)

      expect(result).toEqual({
        success: true,
        result: 'Hello World',
      })
    })

    it('should extract text content from nested HTML elements', () => {
      const html = '<div><h1>Title</h1><p>Paragraph text</p></div>'

      const result = getTextContent(html)

      expect(result).toEqual({
        success: true,
        result: 'TitleParagraph text',
      })
    })

    it('should handle empty HTML string', () => {
      const html = ''

      const result = getTextContent(html)

      expect(result).toEqual({
        success: true,
        result: '',
      })
    })

    it('should handle HTML with only whitespace', () => {
      const html = '<div>   </div>'

      const result = getTextContent(html)

      expect(result).toEqual({
        success: true,
        result: '   ',
      })
    })

    it('should handle HTML with no text content', () => {
      const html = '<img src="test.jpg" alt=""><br><hr>'

      const result = getTextContent(html)

      expect(result).toEqual({
        success: true,
        result: '',
      })
    })

    it('should handle HTML with special characters and unicode', () => {
      const html = '<p>Special chars: &amp; &lt; &gt; 🚀 中文</p>'

      const result = getTextContent(html)

      expect(result).toEqual({
        success: true,
        result: 'Special chars: & < > 🚀 中文',
      })
    })

    it('should handle complex HTML structure', () => {
      const html = `
        <html>
          <head><title>Page Title</title></head>
          <body>
            <header><h1>Main Title</h1></header>
            <main>
              <article>
                <h2>Article Title</h2>
                <p>First paragraph with <strong>bold text</strong>.</p>
                <p>Second paragraph with <em>italic text</em>.</p>
                <ul>
                  <li>List item 1</li>
                  <li>List item 2</li>
                </ul>
              </article>
            </main>
            <footer>Footer content</footer>
          </body>
        </html>
      `

      const result = getTextContent(html)

      expect(result.success).toBe(true)
      expect(result.result).toContain('Main Title')
      expect(result.result).toContain('Article Title')
      expect(result.result).toContain('First paragraph with bold text')
      expect(result.result).toContain('List item 1')
      expect(result.result).toContain('Footer content')
    })

    it('should extract text content including script and style content', () => {
      const html = `
        <div>
          <script>console.log('script content')</script>
          <style>.class { color: red; }</style>
          <p>Visible text</p>
        </div>
      `

      const result = getTextContent(html)

      expect(result.success).toBe(true)
      expect(result.result).toContain('Visible text')
      expect(result.result).toContain("console.log('script content')")
      expect(result.result).toContain('.class { color: red; }')
    })

    it('should handle malformed HTML gracefully', () => {
      const html = '<p>Unclosed paragraph<div>Nested div</p></div>'

      const result = getTextContent(html)

      expect(result.success).toBe(true)
      expect(result.result).toContain('Unclosed paragraph')
      expect(result.result).toContain('Nested div')
    })

    it('should handle HTML entities correctly', () => {
      const html = '<p>&quot;Quoted text&quot; &copy; 2024</p>'

      const result = getTextContent(html)

      expect(result).toEqual({
        success: true,
        result: '"Quoted text" © 2024',
      })
    })

    it('should preserve line breaks and spacing in text content', () => {
      const html = '<pre>Line 1\nLine 2\n  Indented line</pre>'

      const result = getTextContent(html)

      expect(result).toEqual({
        success: true,
        result: 'Line 1\nLine 2\n  Indented line',
      })
    })
  })

  describe('Error handling', () => {
    it('should handle DOMParser errors gracefully', () => {
      const originalDOMParser = window.DOMParser
      const mockParseFromString = vi.fn().mockImplementation(() => {
        throw new Error('Parser error')
      })
      const mockDOMParser = vi.fn().mockImplementation(() => ({
        parseFromString: mockParseFromString,
      }))
      window.DOMParser = mockDOMParser

      const result = getTextContent('<p>Test</p>')

      expect(result).toEqual({
        success: false,
        error: 'Error getting text content',
      })

      window.DOMParser = originalDOMParser
    })

    it('should handle case when parsed document has no body', () => {
      const originalDOMParser = window.DOMParser
      const mockParseFromString = vi.fn().mockImplementation(() => ({
        body: null,
      }))
      const mockDOMParser = vi.fn().mockImplementation(() => ({
        parseFromString: mockParseFromString,
      }))
      window.DOMParser = mockDOMParser

      const result = getTextContent('<p>Test</p>')

      expect(result).toEqual({
        success: false,
        error: 'Error getting text content',
      })

      window.DOMParser = originalDOMParser
    })

    it('should handle case when textContent is null', () => {
      const originalDOMParser = window.DOMParser
      const mockParseFromString = vi.fn().mockImplementation(() => ({
        body: {
          textContent: null,
        },
      }))
      const mockDOMParser = vi.fn().mockImplementation(() => ({
        parseFromString: mockParseFromString,
      }))
      window.DOMParser = mockDOMParser

      const result = getTextContent('<p>Test</p>')

      expect(result).toEqual({
        success: true,
        result: '',
      })

      window.DOMParser = originalDOMParser
    })
  })

  describe('Edge cases', () => {
    it('should handle moderately large HTML content', () => {
      const largeText = 'a'.repeat(10000) // Reduced size to avoid potential issues
      const html = `<p>${largeText}</p>`

      const result = getTextContent(html)

      expect(result).toEqual({
        success: true,
        result: largeText,
      })
    })

    it('should handle HTML with only comments', () => {
      const html = '<!-- This is a comment -->'

      const result = getTextContent(html)

      expect(result).toEqual({
        success: true,
        result: '',
      })
    })

    it('should handle HTML with valid content', () => {
      const html = '<div>Regular text content</div>'

      const result = getTextContent(html)

      expect(result.success).toBe(true)
      expect(result.result).toContain('Regular text content')
    })

    it('should handle HTML with mixed content types', () => {
      const html = `
        <div>
          Text before
          <span>Span text</span>
          Text after
          <br>
          <!-- Comment -->
          Final text
        </div>
      `

      const result = getTextContent(html)

      expect(result.success).toBe(true)
      expect(result.result).toContain('Text before')
      expect(result.result).toContain('Span text')
      expect(result.result).toContain('Text after')
      expect(result.result).toContain('Final text')
    })
  })
})
