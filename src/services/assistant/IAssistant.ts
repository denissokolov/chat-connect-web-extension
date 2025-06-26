import type { AIModel, AIProvider, Message } from '@/types/types'

export interface IAssistant {
  getProvider: () => AIProvider

  sendMessage: (params: {
    model: AIModel
    instructions?: string
    text: string
    history?: Message[]
  }) => Promise<Message>
}
