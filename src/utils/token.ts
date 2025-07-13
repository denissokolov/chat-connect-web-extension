import type { AIProvider } from '@/types/provider.types'

export function getTokenKey(provider: AIProvider) {
  return `token_${provider}`
}
