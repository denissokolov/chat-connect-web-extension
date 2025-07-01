import type { PageContext } from '@/types/types'

export interface IBrowser {
  openExtensionSettings(): void

  getSecureValue: (key: string) => Promise<string | null>
  saveSecureValue: (key: string, value: string) => Promise<void>

  subscribeToPageInfo(callback: (title: string | null, favicon: string | null) => void): () => void
  getCurrentPageInfo: () => Promise<{ title: string | null; favicon: string | null }>

  getPageContext: () => Promise<PageContext | null>
}
