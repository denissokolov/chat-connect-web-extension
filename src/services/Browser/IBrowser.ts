export interface IBrowser {
  openExtensionPage(address: string): void

  getSecureValue: (key: string) => Promise<string | null>
  saveSecureValue: (key: string, value: string) => Promise<void>

  subscribeToPageTitle(callback: (title: string | null) => void): () => void
}
