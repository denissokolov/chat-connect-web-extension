import { type StateCreator } from 'zustand'

import type { ThreadSlice, ChatStore } from '@/stores/useChatStore.types'
import { ChatView } from '@/types/types'

export const createThreadSlice: StateCreator<ChatStore, [], [], ThreadSlice> = set => ({
  threadId: crypto.randomUUID(),
  startNewThread: () =>
    set({
      threadId: crypto.randomUUID(),
      messages: [],
      waitingForReply: false,
      messageAbortController: null,
      currentView: ChatView.Chat,
    }),
})
