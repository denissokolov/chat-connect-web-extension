import type { PageContext } from '@/types/types'

export interface IBrowser {
  openExtensionSettings(): void

  getSecureValue: (key: string) => Promise<string | null>
  saveSecureValue: (key: string, value: string) => Promise<void>

  subscribeToPageTitle(callback: (title: string | null) => void): () => void

  getPageContext: () => Promise<PageContext | null>
}
