import type { AIProvider } from '@/types/chat.types'
import type { ITokenStorage } from './ITokenStorage'

export class ChromeTokenStorage implements ITokenStorage {
  async getToken(provider: AIProvider): Promise<string | null> {
    const key = this.getStorageKey(provider)
    const result = await chrome.storage.sync.get(key)
    return result[key] || null
  }

  async setToken(provider: AIProvider, token: string): Promise<void> {
    const key = this.getStorageKey(provider)
    await chrome.storage.sync.set({ [key]: token })
  }

  private getStorageKey(provider: AIProvider): string {
    return `token_${provider}`
  }
}
