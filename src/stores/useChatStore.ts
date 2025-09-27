import { create } from 'zustand'

import type { ChatStore } from './useChatStore.types'
import { createThreadSlice } from './slices/threadSlice'
import { createSettingsSlice } from './slices/settingsSlice'
import { createViewSlice } from './slices/viewSlice'
import { createMessageSlice } from './slices/messageSlice'

const useChatStore = create<ChatStore>((set, get, api) => ({
  ...createThreadSlice(set, get, api),
  ...createSettingsSlice(set, get, api),
  ...createViewSlice(set, get, api),
  ...createMessageSlice(set, get, api),
}))

export default useChatStore
