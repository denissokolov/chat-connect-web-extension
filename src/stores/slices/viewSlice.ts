import { type StateCreator } from 'zustand'

import type { ViewSlice, ChatStore } from '@/stores/useChatStore.types'
import { ChatView } from '@/types/chat.types'

export const createViewSlice: StateCreator<ChatStore, [], [], ViewSlice> = (set, get) => ({
  currentView: ChatView.Chat,
  setCurrentView: (view: ChatView) => {
    set({ currentView: view })
    if (view === ChatView.History) {
      get().loadThreads()
    }
  },
})
