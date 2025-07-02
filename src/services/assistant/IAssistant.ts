import type { AIModel, AIProvider, Message, ProviderMessageResponse } from '@/types/types'

export interface IAssistant {
  getProvider: () => AIProvider

  sendMessage: (params: {
    model: AIModel
    instructions?: string
    text: string
    history?: Message[]
    signal?: AbortSignal
  }) => Promise<ProviderMessageResponse>
}
