import type { Message } from '@/types/types'
import type { AIModel, AIProvider, ProviderMessageEvent } from '@/types/provider.types'

export interface IAssistant {
  getProvider: () => AIProvider

  sendMessage: (params: {
    model: AIModel
    message: Message
    eventHandler: (event: ProviderMessageEvent) => void
    instructions?: string
    history?: ReadonlyArray<Message>
  }) => Promise<void>

  sendFunctionCallResponse(params: {
    model: AIModel
    message: Message
    eventHandler: (event: ProviderMessageEvent) => void
  }): Promise<void>
}
