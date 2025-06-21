import type { AIProvider } from '@/types/chat.types'

export interface ITokenStorage {
  getToken: (provider: AIProvider) => Promise<string | null>
  setToken: (provider: AIProvider, token: string) => Promise<void>
}
