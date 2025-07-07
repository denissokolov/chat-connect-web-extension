import type {
  AIModel,
  AIProvider,
  Message,
  ProviderMessageResponse,
  PageContext,
} from '@/types/types'

export interface IAssistant {
  getProvider: () => AIProvider

  sendMessage: (params: {
    model: AIModel
    instructions?: string
    text: string
    history?: Message[]
    signal?: AbortSignal
  }) => Promise<ProviderMessageResponse>

  sendFunctionCallResponse(params: {
    model: AIModel
    message: Message
  }): Promise<ProviderMessageResponse>

  sendMessageWithPageContext?(params: {
    model: AIModel
    instructions?: string
    text: string
    pageContext: PageContext
    history?: Message[]
    signal?: AbortSignal
  }): Promise<ProviderMessageResponse>
}
