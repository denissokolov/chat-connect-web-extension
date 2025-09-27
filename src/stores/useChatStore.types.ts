import type { IAssistant } from '@/services/assistant'
import type { ChatView, Message, Thread } from '@/types/chat.types'
import type { FunctionCallResult } from '@/types/tool.types'
import type { ProviderMessageEvent } from '@/types/provider.types'
import { Settings } from '@/types/settings.types'

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

export type SettingsSlice = {
  settings: {
    ready: boolean
    loading: boolean
    error: string | null
    data: Settings | null
  }
  initSettings: () => Promise<void>
  loadSettings: () => Promise<void>
  updateSettings: (settings: Partial<Settings>) => void
  settingsForm: {
    saving: boolean
    saved: boolean
    saveError: string | null
    changed: boolean
    data: Settings | null
  }
  updateSettingsForm: (settings: Partial<Settings>) => void
  saveSettingsForm: () => Promise<void>
  assistant: IAssistant | null
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

export type ChatStore = ThreadSlice & SettingsSlice & ViewSlice & MessageSlice
