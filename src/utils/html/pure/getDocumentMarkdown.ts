import type { FunctionCallResult } from '@/types/tool.types'

export function getDocumentMarkdown(): FunctionCallResult {
  const isVisibleElement = (element: Element) => {
    if (element.hasAttribute('hidden')) {
      return false
    }

    if (typeof element.checkVisibility === 'function' && !element.checkVisibility()) {
      return false
    }

    const style = element.getAttribute('style')
    if (style) {
      const normalizedStyle = style.toLowerCase().replace(/\s+/g, '')
      if (
        normalizedStyle.includes('display:none') ||
        normalizedStyle.includes('visibility:hidden')
      ) {
        return false
      }
    }

    return true
  }

  const needToCopyNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return true
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return false
    }
    const element = node as Element
    const tagName = element.tagName.toLowerCase()
    const ignoreTags = [
      'svg',
      'script',
      'style',
      'link',
      'img',
      'iframe',
      'head',
      'meta',
      'noscript',
    ]
    if (ignoreTags.includes(tagName)) {
      return false
    }

    return element.isConnected && isVisibleElement(element)
  }

  const convertHtmlToMarkdown = (element: Element): string => {
    const tagName = element.tagName.toLowerCase()
    const getText = () => element.textContent?.trim() || ''

    switch (tagName) {
      case 'h1':
        return `# ${getText()}\n\n`
      case 'h2':
        return `## ${getText()}\n\n`
      case 'h3':
        return `### ${getText()}\n\n`
      case 'h4':
        return `#### ${getText()}\n\n`
      case 'h5':
        return `##### ${getText()}\n\n`
      case 'h6':
        return `###### ${getText()}\n\n`

      case 'p':
        return `${convertChildNodes(element).trim()}\n\n`

      case 'strong':
      case 'b':
        return `**${convertChildNodes(element)}**`

      case 'em':
      case 'i':
        return `*${convertChildNodes(element)}*`

      case 'a': {
        return convertChildNodes(element)
      }

      case 'blockquote':
        return `> ${convertChildNodes(element).trim()}\n\n`

      case 'ul':
        return `${convertList(element, false).trim()}\n\n`

      case 'ol':
        return `${convertList(element, true).trim()}\n\n`

      case 'li':
        return convertChildNodes(element)

      case 'br':
        return '\n\n'

      case 'code':
        return `\`\`\`${getText()}\`\`\`\n\n`

      case 'pre':
        return `\`\`\`\n${getText()}\n\`\`\`\n\n`

      case 'table':
        return `${convertTable(element).trim()}\n\n`

      default:
        return convertChildNodes(element)
    }
  }

  const normalizeWhitespace = (text: string): string => {
    // Replace multiple whitespace characters (including newlines, tabs, multiple spaces) with single space
    // But preserve single spaces between words
    return text.replace(/\s+/g, ' ')
  }

  const convertChildNodes = (element: Element): string => {
    let result = ''
    for (const child of element.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        const textContent = child.textContent || ''
        result += normalizeWhitespace(textContent)
      } else if (child.nodeType === Node.ELEMENT_NODE && needToCopyNode(child)) {
        result += convertHtmlToMarkdown(child as Element)
      }
    }
    return result
  }

  const convertList = (listElement: Element, isOrdered: boolean): string => {
    let result = ''
    let index = 1

    for (const child of listElement.children) {
      if (child.tagName.toLowerCase() === 'li' && needToCopyNode(child)) {
        const listItemContent = convertChildNodes(child)
        if (isOrdered) {
          result += `${index}. ${listItemContent}\n`
          index++
        } else {
          result += `- ${listItemContent}\n`
        }
      }
    }

    return result
  }

  const extractTableHeaders = (thead: Element | null): string[] => {
    if (!thead) return []

    const headerRow = thead.querySelector('tr')
    if (!headerRow) return []

    const headers: string[] = []
    for (const cell of headerRow.children) {
      if (cell.tagName.toLowerCase() === 'th' || cell.tagName.toLowerCase() === 'td') {
        headers.push(cell.textContent?.trim() || '')
      }
    }
    return headers
  }

  const extractTableRows = (tbody: Element): string[][] => {
    const rows: string[][] = []
    const bodyRows = tbody.querySelectorAll('tr')

    for (const row of bodyRows) {
      const cells: string[] = []
      for (const cell of row.children) {
        if (cell.tagName.toLowerCase() === 'td' || cell.tagName.toLowerCase() === 'th') {
          cells.push(cell.textContent?.trim() || '')
        }
      }
      if (cells.length > 0) rows.push(cells)
    }

    return rows
  }

  const formatTableMarkdown = (rows: string[][], hasHeader: boolean): string => {
    if (rows.length === 0) return ''

    let result = ''

    if (hasHeader && rows.length > 0) {
      result += `| ${rows[0].join(' | ')} |\n`
      result += `| ${rows[0].map(() => '---').join(' | ')} |\n`

      for (let i = 1; i < rows.length; i++) {
        result += `| ${rows[i].join(' | ')} |\n`
      }
    } else {
      for (const row of rows) {
        result += `| ${row.join(' | ')} |\n`
      }
    }

    return result
  }

  const convertTable = (tableElement: Element): string => {
    const thead = tableElement.querySelector('thead')
    const tbody = tableElement.querySelector('tbody') || tableElement

    const headers = extractTableHeaders(thead)
    const rows = extractTableRows(tbody)

    let hasHeader = headers.length > 0
    let allRows = rows

    if (hasHeader) {
      allRows = [headers, ...rows]
    } else if (rows.length > 0) {
      hasHeader = true // Treat first row as header
    }

    return formatTableMarkdown(allRows, hasHeader)
  }

  try {
    const bodyElement = document.body

    if (!bodyElement) {
      return {
        success: false,
        error: 'No document body found',
      }
    }

    let markdown = ''
    for (const child of bodyElement.children) {
      if (needToCopyNode(child)) {
        markdown += convertHtmlToMarkdown(child as Element)
      }
    }

    // Clean up excessive newlines
    markdown = markdown.replace(/\n{3,}/g, '\n\n').trim()

    markdown = markdown
      .split('\n')
      .map(line => line.trim())
      .join('\n')

    return {
      success: true,
      result: markdown,
    }
  } catch (error) {
    console.error(`ChatConnect: error getting document markdown`)
    console.error(error)
    return {
      success: false,
      error: error instanceof Error ? error.message : (error?.toString?.() ?? 'Unknown error'),
    }
  }
}
