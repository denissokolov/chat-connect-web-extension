import { type PageContext } from '@/types/browser.types'
import { PageContentFormat, type FunctionCallResult } from '@/types/tool.types'

import type { IBrowser } from './IBrowser'

export class MockBrowser implements IBrowser {
  private favicon =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAANnSURBVHgBhVdNUpsxDLXB7HuD5gZly67fCYAF9+gNUm5QehJYsSxHgBXLcAQ2MJNMElVyLef52V+aGcf+/CM9PcmyHQP9Xl9fv4vIpZar/X6/iDGK1tHGtC/wtxVvW2VjgzXP+v2s7duLi4s31Be9sVqtvnx8fCy1+aN06XzJ47o4MABXWPojgkFwCLC0f63X69tpmt4rAFP++fn5R5vfXBhYk5EUMFIANW1QLLC+soIAzQD9vWw2m8lAnNgMs1w7z12YFaa5lAhz4m63izxO34K1A9Zyfnp6uswMqM8X2+125RagYqzdFO/zeWChjUVna+QOkJHH1YAp6d8SBhurC10IKHo8gOIIa4UUVjAuy+eV+ioZ9T4ThRRlEQWVsc41CBDnl/gJwFrDiv4uk/kDqXdrWLDPAWua3UF0N/OJXQEWFgkWBAIiOAZzAoEdxQsqiSOWXF6CyYH83QgT2s/kGrTM3VeZK+4Q8n+WkWRmz6IrIIAaS8nKuewYkTVmJtF+53YVPgMwoHXIHAYcBZ8gYwn9hlazS8h/QQZba7C+AyaUFdMRZYGVcdrlKBfpU/LAbdXdtj6xUqMLLKsBQ8oaF4ECYUMIFDKQXZdoL+dEA8qadBvardlIdlfwUexGhcOOaNhIc7TNUFeFBMh6mBf8pJT+BOT4yN+JqSE2AloGsSK8rVCoHLZvA6q41xnLY5mBwcnmFgq7ZRCMCB4pFjuu6T5RlXuMJWn3dxdQ0u+IYarGOAFmjuWUfy4Ynf//awOtnBXxW4QCVwaJKs0pC+3R6uvigM4uWYU2MEdHeu1Pgah2ZO5rz7NzdM4wNer3GHIjBF2A6CIL8as2BpDvClo/SkBd9gMmqwsw8jsBpKgyBUqP5f/6LRSwDuBNrfkqMydeaIOouR8O4oYvEjyvus4Y1PJi1/J7vI7Dwkq/SHfdRoUO0K/cTaJh+jEm7MVkAB5QKIIB1MKWHgHnSQt/zWPGCdJye6KvkyedcIcUDgBFBOIKoK+zWA5Jp2bQAE9B7ft9fX39ll9G+kr5qR3PRXjAmoGwpSMWwH01auUQgPmxajqtnQHYG+3s7GxyJkTavA7FzwYp+aJjTPpdFEMbmHcKYFLr37tB+z0+Pi60Wpb3wjkFUtee6/P8VRKI7bQHPZzub25unlDfX/41u+ssY6FcAAAAAElFTkSuQmCC'

  openExtensionSettings() {}

  getSecureValue(): Promise<string | null> {
    return Promise.resolve(null)
  }

  subscribeToSecureValue(): () => void {
    return () => {}
  }

  saveSecureValue(): Promise<void> {
    return Promise.resolve()
  }

  subscribeToPageInfo(
    callback: (title: string | null, favicon: string | null) => void,
  ): () => void {
    callback('mock-title', this.favicon)
    return () => {}
  }

  getPageContext(): Promise<PageContext> {
    return Promise.resolve({
      title: 'Sample Web Page',
      url: 'mock-url',
      favicon: this.favicon,
    })
  }

  getPageContent(format: PageContentFormat): Promise<FunctionCallResult> {
    if (format === PageContentFormat.Html) {
      return Promise.resolve({
        success: true,
        result: `
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

    return Promise.resolve({
      success: true,
      result: `Sample Web Page
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      `,
    })
  }

  setFieldValue(_selector: string, _value: string): Promise<FunctionCallResult> {
    return Promise.resolve({ success: true })
  }

  clickElement(_selector: string): Promise<FunctionCallResult> {
    return Promise.resolve({ success: true })
  }
}
