import { type StateCreator } from 'zustand'

import type { ModelSlice, ChatStore } from '@/stores/useChatStore.types'
import { AIModel } from '@/types/types'

export const createModelSlice: StateCreator<ChatStore, [], [], ModelSlice> = set => ({
  model: AIModel.OpenAI_GPT_4_1,
  setModel: (model: AIModel) => set({ model }),
  assistant: null,
  autoExecuteTools: false,
  setAutoExecuteTools: (autoExecuteTools: boolean) => set({ autoExecuteTools }),
})
