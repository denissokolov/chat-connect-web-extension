import type { IAssistant } from '@/services/assistant'
import type { ChatView, Message, Thread } from '@/types/chat.types'
import type { FunctionCallResult } from '@/types/tool.types'
import type { AIModel, ProviderMessageEvent } from '@/types/provider.types'

export type ThreadSlice = {
  threadId: string
  startNewThread: () => void
  threads: {
    list: ReadonlyArray<Thread>
    loading: boolean
    error: string | null
    ready: boolean
  }
  loadThreads: () => Promise<void>
  selectThread: (threadId: string) => Promise<void>
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
  autoExecuteTools: boolean
  setAutoExecuteTools: (autoExecuteTools: boolean) => void
}

export type ViewSlice = {
  currentView: ChatView
  setCurrentView: (view: ChatView) => void
}

export type StoreMessages = Readonly<{
  list: ReadonlyArray<Message>
  loading: boolean
  error: string | null
  ready: boolean
}>

export type MessageSlice = {
  messages: StoreMessages
  sendMessage: (text: string) => Promise<void>
  stopMessage: () => void
  waitingForReply: boolean
  waitingForTools: boolean
  saveFunctionResult: (
    messageId: string,
    callId: string,
    result: FunctionCallResult,
  ) => Promise<void>
  handleMessageError: (
    threadId: string,
    error: unknown,
    userMessageId: string,
    assistantMessageId?: string | undefined,
  ) => void
  handleMessageEvent: (event: ProviderMessageEvent) => void
  sendFunctionResults: (message: Message) => Promise<void>
}

export type ChatStore = ThreadSlice & ProviderSlice & ModelSlice & ViewSlice & MessageSlice
