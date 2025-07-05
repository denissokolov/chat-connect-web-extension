import type { IAssistant } from '@/services/assistant'
import type { AIModel, ChatView, FunctionCallResult, Message } from '@/types/types'

export type ThreadSlice = {
  threadId: string
  startNewThread: () => void
}

export type ProviderSlice = {
  provider: {
    ready: boolean
    loading: boolean
    configured: boolean | undefined
    error: string | null
  }
  setupProvider: (model: AIModel) => Promise<void>
}

export type ModelSlice = {
  model: AIModel
  setModel: (model: AIModel) => void
  assistant: IAssistant | null
}

export type ViewSlice = {
  currentView: ChatView
  setCurrentView: (view: ChatView) => void
}

export type MessageSlice = {
  messages: Message[]
  sendMessage: (text: string) => Promise<void>
  stopMessage: () => void
  waitingForReply: boolean
  waitingForTools: boolean
  messageAbortController: AbortController | null
  saveFunctionResult: (
    messageId: string,
    callId: string,
    result: FunctionCallResult,
  ) => Promise<void>
  handleMessageError: (messageId: string, threadId: string, error: unknown) => void
}

export type ChatStore = ThreadSlice & ProviderSlice & ModelSlice & ViewSlice & MessageSlice
