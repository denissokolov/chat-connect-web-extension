import type { PageContext } from '@/types/browser.types'
import { PageContentFormat, type FunctionCallResult } from '@/types/tool.types'

export interface IBrowser {
  openExtensionSettings(): void

  getSecureValue: (key: string) => Promise<string | null>
  saveSecureValue: (key: string, value: string) => Promise<void>

  subscribeToPageInfo(callback: (title: string | null, favicon: string | null) => void): () => void

  getPageContext: () => Promise<PageContext | null>
  getPageContent(format: PageContentFormat): Promise<FunctionCallResult>
  setFieldValue(selector: string, value: string): Promise<FunctionCallResult>
  clickElement(selector: string): Promise<FunctionCallResult>
}
