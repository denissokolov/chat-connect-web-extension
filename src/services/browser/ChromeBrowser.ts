import { logError } from '@/utils/log'
import type { IBrowser } from './IBrowser'
import type { PageContext } from '@/types/types'
import { cleanHtmlContent } from '@/utils/html'

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

  subscribeToPageTitle(callback: (title: string | null) => void): () => void {
    const getPageTitle = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        callback(tab?.title || null)
      } catch (error) {
        logError('Failed to get page title', error)
        callback(null)
      }
    }

    getPageTitle()

    const handleTabActivated = () => {
      getPageTitle()
    }

    const handleTabUpdated = (
      _tabId: number,
      changeInfo: {
        status?: string
        title?: string
      },
      tab: chrome.tabs.Tab,
    ) => {
      if (tab.active && changeInfo.status === 'complete') {
        getPageTitle()
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
      html: cleanHtmlContent(html[0].result),
    }
  }
}
