import { createContext } from 'react'

import type { ITokenStorage } from './ITokenStorage'
import { ChromeTokenStorage } from './ChromeTokenStorage'

export const TokenStorageContext = createContext<ITokenStorage>(new ChromeTokenStorage())
