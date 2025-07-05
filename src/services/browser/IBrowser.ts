import type { FunctionCallResult, PageContext } from '@/types/types'

export interface IBrowser {
  openExtensionSettings(): void

  getSecureValue: (key: string) => Promise<string | null>
  saveSecureValue: (key: string, value: string) => Promise<void>

  subscribeToPageInfo(callback: (title: string | null, favicon: string | null) => void): () => void

  getPageContext: () => Promise<PageContext | null>

  setFieldValue(selector: string, value: string): Promise<FunctionCallResult>
  clickButton(selector: string): Promise<FunctionCallResult>
}
