import type { AIProvider } from '@/types/types'

export function getTokenKey(provider: AIProvider) {
  return `token_${provider}`
}
