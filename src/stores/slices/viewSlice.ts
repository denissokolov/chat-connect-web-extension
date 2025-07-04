import { type StateCreator } from 'zustand'

import type { ViewSlice, ChatStore } from '@/stores/useChatStore.types'
import { ChatView } from '@/types/types'

export const createViewSlice: StateCreator<ChatStore, [], [], ViewSlice> = set => ({
  currentView: ChatView.Chat,
  setCurrentView: (view: ChatView) => set({ currentView: view }),
})
