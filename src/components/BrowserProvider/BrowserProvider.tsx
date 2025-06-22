import type { PropsWithChildren } from 'react'

import { BrowserContext, ChromeBrowser } from '@/services/Browser'

const browser = new ChromeBrowser()

export default function BrowserProvider({ children }: PropsWithChildren) {
  return <BrowserContext.Provider value={browser}>{children}</BrowserContext.Provider>
}
