import { type StateCreator } from 'zustand'

import type { ThreadSlice, ChatStore } from '@/stores/useChatStore.types'
import { ChatView } from '@/types/types'
import repository from '@/services/repository'
import { getStringError } from '@/utils/error'
import { emptyMessages, emptyThreads } from '@/utils/empty'

export const createThreadSlice: StateCreator<ChatStore, [], [], ThreadSlice> = set => ({
  threadId: crypto.randomUUID(),
  startNewThread: () =>
    set({
      threadId: crypto.randomUUID(),
      messages: { list: emptyMessages, loading: false, error: null, ready: true },
      waitingForReply: false,
      messageAbortController: null,
      currentView: ChatView.Chat,
    }),
  threads: {
    list: emptyThreads,
    loading: false,
    error: null,
    ready: false,
  },
  loadThreads: async () => {
    set({ threads: { list: emptyThreads, loading: true, error: null, ready: false } })
    try {
      const threads = await repository.getThreads()
      set({ threads: { list: threads, loading: false, error: null, ready: true } })
    } catch (error) {
      set({
        threads: { list: emptyThreads, loading: false, error: getStringError(error), ready: false },
      })
    }
  },
  selectThread: async (threadId: string) => {
    set({
      threadId,
      messages: { list: emptyMessages, loading: true, error: null, ready: false },
      waitingForReply: false,
      messageAbortController: null,
      currentView: ChatView.Chat,
    })

    try {
      const list = await repository.getMessages(threadId)
      set({ messages: { list, loading: false, error: null, ready: true } })
    } catch (error) {
      set({
        messages: {
          list: emptyMessages,
          loading: false,
          error: getStringError(error),
          ready: false,
        },
      })
    }
  },
})
