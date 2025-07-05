import { logError } from '@/utils/log'
import type { IBrowser } from './IBrowser'
import type { PageContext } from '@/types/types'
import { cleanHtmlContent } from '@/utils/html/cleanHtmlContent'
import { clickButton } from '@/utils/html/clickButton'
import { setFieldValue } from '@/utils/html/setFieldValue'

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

    const html = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.documentElement.outerHTML,
    })

    return {
      title: tab.title || '',
      url: tab.url || '',
      favicon: tab.favIconUrl || null,
      html: cleanHtmlContent(html[0].result),
    }
  }

  async setFieldValue(selector: string, value: string): Promise<boolean> {
    const tabId = await this.getCurrentTabId()
    if (!tabId) {
      return false
    }

    const result = await chrome.scripting.executeScript({
      target: { tabId },
      args: [selector, value],
      func: setFieldValue as unknown as () => void,
    })

    return result[0].result
  }

  async clickButton(selector: string): Promise<boolean> {
    const tabId = await this.getCurrentTabId()
    if (!tabId) {
      return false
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
