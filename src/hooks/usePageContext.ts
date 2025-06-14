import { useCallback, useEffect, useState } from 'react'

import { getH1Text } from '../utils/html'
import { logError } from '../utils/log'

type PageContext = {
  title: string
  h1: string | null
}

type TabChangeInfo = {
  status?: string
  title?: string
}

export const usePageContext = () => {
  const [context, setContext] = useState<PageContext | null>(null)

  const syncContext = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab || !tab.id || !tab.title) {
        return
      }

      const h1 = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: getH1Text,
      })

      setContext({
        title: tab.title,
        h1: h1[0]?.result,
      })
    } catch (error) {
      logError(error)
    }
  }, [])

  useEffect(() => {
    syncContext()

    const handleTabActivated = () => {
      syncContext()
    }

    const handleTabUpdated = (_tabId: number, changeInfo: TabChangeInfo, tab: chrome.tabs.Tab) => {
      if (tab.active && (changeInfo.status === 'complete' || changeInfo.title)) {
        syncContext()
      }
    }

    chrome.tabs.onActivated.addListener(handleTabActivated)
    chrome.tabs.onUpdated.addListener(handleTabUpdated)

    return () => {
      chrome.tabs.onActivated.removeListener(handleTabActivated)
      chrome.tabs.onUpdated.removeListener(handleTabUpdated)
    }
  }, [syncContext])

  return context
}
