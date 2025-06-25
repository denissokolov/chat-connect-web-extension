import type { AIModel, AIProvider, Message } from '@/types/types'

export interface SendMessageParams {
  model: AIModel
  instructions?: string
  text: string
  history?: Message[]
}

export interface IAssistant {
  getProvider: () => AIProvider

  sendMessage: (params: SendMessageParams) => Promise<Message>

  // Optional streaming method - not all providers may support it
  sendMessageStream?: (params: SendMessageParams) => AsyncIterable<string>
}
