import type { AIProvider } from '@/types/chat.types'

export function getTokenKey(provider: AIProvider) {
  return `token_${provider}`
}
