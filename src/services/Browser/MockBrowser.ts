import type { IBrowser } from './IBrowser'

export class MockBrowser implements IBrowser {
  openExtensionPage() {}

  getSecureValue(): Promise<string | null> {
    return Promise.resolve('mock-value')
  }

  saveSecureValue(): Promise<void> {
    return Promise.resolve()
  }

  subscribeToPageTitle(callback: (title: string | null) => void): () => void {
    callback('mock-title')
    return () => {}
  }
}
