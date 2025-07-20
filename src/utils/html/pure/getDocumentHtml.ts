import type { FunctionCallResult } from '@/types/tool.types'

export function getDocumentHtml(): FunctionCallResult {
  try {
    return {
      success: true,
      result: document.documentElement.outerHTML,
    }
  } catch (error) {
    console.error(`Error getting document html`)
    console.error(error)
    return {
      success: false,
      error: error instanceof Error ? error.message : (error?.toString?.() ?? 'Unknown error'),
    }
  }
}
