import { createContext } from 'react'

import type { IBrowser } from './IBrowser'
import { MockBrowser } from './MockBrowser'

export const BrowserContext = createContext<IBrowser>(new MockBrowser())
