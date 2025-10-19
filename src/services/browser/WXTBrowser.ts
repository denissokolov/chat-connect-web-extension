import { type PageContext } from '@/types/browser.types'
import { PageContentFormat, type FunctionCallResult } from '@/types/tool.types'
import { clickElement } from '@/utils/html/pure/clickElement'
import { setFieldValue } from '@/utils/html/pure/setFieldValue'
import { getDocumentHtml } from '@/utils/html/pure/getDocumentHtml'
import { getDocumentMarkdown } from '@/utils/html/pure/getDocumentMarkdown'
import { logError } from '@/utils/log'
import { encodeSecureValue, decodeSecureValue } from '@/utils/crypto'
import { Browser } from '#imports'

import type { IBrowser } from './IBrowser'

export class WXTBrowser implements IBrowser {
  openExtensionSettings() {
    browser.tabs.create({ url: browser.runtime.getURL('/settings.html') })
  }

  async getSecureValue(key: string): Promise<string | null> {
    const encodedValue = await storage.getItem<string>(`sync:${key}`)
    if (!encodedValue) {
      return null
    }
    return decodeSecureValue(encodedValue, key)
  }

  subscribeToSecureValue(key: string, callback: (value: string | null) => void): () => void {
    return storage.watch<string>(`sync:${key}`, encodedValue => {
      if (!encodedValue) {
        callback(null)
        return
      }
      const decodedValue = decodeSecureValue(encodedValue, key)
      callback(decodedValue)
    })
  }

  async saveSecureValue(key: string, value: string): Promise<void> {
    const encodedValue = encodeSecureValue(value, key)
    await storage.setItem(`sync:${key}`, encodedValue)
  }

  subscribeToPageInfo(
    callback: (title: string | null, favicon: string | null) => void,
  ): () => void {
    const getPageInfo = async () => {
      try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
        callback(tab?.title || null, tab?.favIconUrl || null)
      } catch (error) {
        logError('Failed to get page info', error)
        callback(null, null)
      }
    }

    getPageInfo()

    const handleTabActivated = () => {
      getPageInfo()
    }

    const handleTabUpdated = (
      _tabId: number,
      changeInfo: {
        status?: string
        title?: string
        favIconUrl?: string
      },
      tab: Browser.tabs.Tab,
    ) => {
      if (
        tab.active &&
        (changeInfo.status === 'complete' || changeInfo.title || changeInfo.favIconUrl)
      ) {
        getPageInfo()
      }
    }

    browser.tabs.onActivated.addListener(handleTabActivated)
    browser.tabs.onUpdated.addListener(handleTabUpdated)

    return () => {
      browser.tabs.onActivated.removeListener(handleTabActivated)
      browser.tabs.onUpdated.removeListener(handleTabUpdated)
    }
  }

  async getPageContext(): Promise<PageContext | null> {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab || !tab.id) {
      return null
    }

    return {
      title: tab.title || '',
      url: tab.url || '',
      favicon: tab.favIconUrl || null,
    }
  }

  async getPageContent(format: PageContentFormat): Promise<FunctionCallResult> {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab || !tab.id) {
      return { success: false, error: 'Failed to get current tab' }
    }

    const result = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: format === PageContentFormat.Html ? getDocumentHtml : getDocumentMarkdown,
    })

    return this.handleFunctionCallResult(result, 'Failed to get page content')
  }

  async setFieldValue(selector: string, value: string): Promise<FunctionCallResult> {
    const tabId = await this.getCurrentTabId()
    if (!tabId) {
      return { success: false, error: 'Failed to get current tab' }
    }

    const result = await browser.scripting.executeScript({
      target: { tabId },
      args: [selector, value],
      func: setFieldValue,
    })

    return this.handleFunctionCallResult(result, 'Failed to set field value')
  }

  async clickElement(selector: string): Promise<FunctionCallResult> {
    const tabId = await this.getCurrentTabId()
    if (!tabId) {
      return { success: false, error: 'Failed to get current tab' }
    }

    const result = await browser.scripting.executeScript({
      target: { tabId },
      args: [selector],
      func: clickElement,
    })

    return this.handleFunctionCallResult(result, 'Failed to click element')
  }

  private handleFunctionCallResult(
    result: Browser.scripting.InjectionResult<FunctionCallResult>[],
    errorMessage: string,
  ): FunctionCallResult {
    const functionCallResult = result[0].result
    if (!functionCallResult) {
      return { success: false, error: errorMessage }
    }
    return functionCallResult
  }

  private async getCurrentTabId(): Promise<number | null> {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) {
      logError('Failed to get current tab id')
      return null
    }

    return tab.id
  }
}
