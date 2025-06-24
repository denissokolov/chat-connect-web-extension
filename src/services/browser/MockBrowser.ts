import type { PageContext } from '@/types/types'
import type { IBrowser } from './IBrowser'

export class MockBrowser implements IBrowser {
  openExtensionSettings() {}

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

  getPageContext(): Promise<PageContext> {
    return Promise.resolve({
      title: 'Sample Web Page',
      url: 'mock-url',
      html: `
        <html>
          <head>
            <title>Sample Web Page</title>
          </head>
          <body>
            <h1>Sample Web Page</h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <p>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </body>
        </html>
      `,
    })
  }
}
