import { logError } from '@/utils/log'
import type { IBrowser } from './IBrowser'
import { type PageContext } from '@/types/types'
import { PageContentFormat, type FunctionCallResult } from '@/types/tool.types'
import { clickButton } from '@/utils/html/pure/clickButton'
import { setFieldValue } from '@/utils/html/pure/setFieldValue'
import { getDocumentHtml } from '@/utils/html/pure/getDocumentHtml'
import { getTextContent } from '@/utils/html/pure/getTextContent'

export class ChromeBrowser implements IBrowser {
  openExtensionSettings() {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') })
  }

  async getSecureValue(key: string): Promise<string | null> {
    const result = await chrome.storage.sync.get(key)
    return result[key] || null
  }

  async saveSecureValue(key: string, value: string): Promise<void> {
    await chrome.storage.sync.set({ [key]: value })
  }

  subscribeToPageInfo(
    callback: (title: string | null, favicon: string | null) => void,
  ): () => void {
    const getPageInfo = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
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
      tab: chrome.tabs.Tab,
    ) => {
      if (
        tab.active &&
        (changeInfo.status === 'complete' || changeInfo.title || changeInfo.favIconUrl)
      ) {
        getPageInfo()
      }
    }

    chrome.tabs.onActivated.addListener(handleTabActivated)
    chrome.tabs.onUpdated.addListener(handleTabUpdated)

    return () => {
      chrome.tabs.onActivated.removeListener(handleTabActivated)
      chrome.tabs.onUpdated.removeListener(handleTabUpdated)
    }
  }

  async getPageContext(): Promise<PageContext | null> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
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
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab || !tab.id) {
      return { success: false, error: 'Failed to get current tab' }
    }

    const html = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: getDocumentHtml,
    })

    const result: FunctionCallResult = html[0].result
    if (!result.success) {
      return result
    }

    if (!result.result) {
      return { success: false, error: 'Failed to get page content' }
    }

    return format === PageContentFormat.Html ? result : getTextContent(result.result)
  }

  async setFieldValue(selector: string, value: string): Promise<FunctionCallResult> {
    const tabId = await this.getCurrentTabId()
    if (!tabId) {
      return { success: false, error: 'Failed to get current tab' }
    }

    const result = await chrome.scripting.executeScript({
      target: { tabId },
      args: [selector, value],
      func: setFieldValue as unknown as () => void,
    })

    return result[0].result
  }

  async clickButton(selector: string): Promise<FunctionCallResult> {
    const tabId = await this.getCurrentTabId()
    if (!tabId) {
      return { success: false, error: 'Failed to get current tab' }
    }

    const result = await chrome.scripting.executeScript({
      target: { tabId },
      args: [selector],
      func: clickButton as unknown as () => void,
    })

    return result[0].result
  }

  private async getCurrentTabId(): Promise<number | null> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) {
      logError('Failed to get current tab id')
      return null
    }

    return tab.id
  }
}
