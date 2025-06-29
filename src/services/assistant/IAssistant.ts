import type { AIModel, AIProvider, Message } from '@/types/types'

export interface IAssistant {
  getProvider: () => AIProvider

  sendMessage: (params: {
    threadId: string
    model: AIModel
    instructions?: string
    text: string
    history?: Message[]
    signal?: AbortSignal
  }) => Promise<Message>
}
