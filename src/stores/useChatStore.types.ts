import type { IAssistant } from '@/services/assistant'
import type { AIModel, ChatView, FunctionCallResult, Message, Thread } from '@/types/types'

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

export type MessageSlice = {
  messages: {
    list: ReadonlyArray<Message>
    loading: boolean
    error: string | null
    ready: boolean
  }
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
