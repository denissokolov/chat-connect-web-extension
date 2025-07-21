import type { FunctionCallResult } from '@/types/tool.types'

export function getTextContent(html: string): FunctionCallResult {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    return {
      success: true,
      result: doc.body.textContent || '',
    }
  } catch (error) {
    console.error(`ChatConnect: error getting text content`)
    console.error(error)
    return { success: false, error: 'Error getting text content' }
  }
}
