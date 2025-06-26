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

  subscribeToPageInfo(
    callback: (title: string | null, favicon: string | null) => void,
  ): () => void {
    callback(
      'mock-title',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVDiNpZNLaJNnGMd/7/clX5I2aZq0SdM0bWqrtVpb29pWW6/4AREv4AURF148gOLAiQdPHjx4cA',
    )
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
