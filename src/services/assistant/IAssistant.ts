import type { Message } from '@/types/chat.types'
import type { AIModel, AIProvider, ProviderMessageEvent } from '@/types/provider.types'
import type { AssistantTool } from '@/types/tool.types'

export interface IAssistant {
  getProvider: () => AIProvider

  sendMessage: (params: {
    model: AIModel
    message: Message
    eventHandler: (event: ProviderMessageEvent) => void
    tools: AssistantTool[]
    instructions?: string
    history?: ReadonlyArray<Message>
  }) => Promise<void>

  sendFunctionCallResponse(params: {
    model: AIModel
    message: Message
    eventHandler: (event: ProviderMessageEvent) => void
    tools: AssistantTool[]
  }): Promise<void>

  cancelActiveRequest: () => void
}
