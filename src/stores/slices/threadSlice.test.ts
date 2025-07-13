import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'

import useChatStore from '@/stores/useChatStore'
import { ChatView, MessageRole, MessageContentType, type Thread, type Message } from '@/types/types'
import { emptyMessages, emptyThreads } from '@/utils/empty'
import { AIModel } from '@/types/provider.types'

vi.mock('@/services/repository', () => ({
  default: {
    getThreads: vi.fn(),
    getMessages: vi.fn(),
  },
}))

// Import the mocked repository after mocking
import repository from '@/services/repository'

describe('threadSlice', () => {
  const mockThreads: Thread[] = [
    {
      id: 'thread-1',
      title: 'Test Thread 1',
      createdAt: '2024-01-01T12:00:00Z',
      updatedAt: '2024-01-01T12:30:00Z',
    },
    {
      id: 'thread-2',
      title: 'Test Thread 2',
      createdAt: '2024-01-02T10:00:00Z',
      updatedAt: '2024-01-02T10:15:00Z',
    },
  ]

  const mockMessages: Message[] = [
    {
      id: 'message-1',
      threadId: 'thread-1',
      role: MessageRole.User,
      content: [{ type: MessageContentType.OutputText, text: 'Hello', id: '1' }],
      createdAt: '2024-01-01T12:00:00Z',
      complete: true,
    },
    {
      id: 'message-2',
      threadId: 'thread-1',
      role: MessageRole.Assistant,
      content: [{ type: MessageContentType.OutputText, text: 'Hi there!', id: '2' }],
      createdAt: '2024-01-01T12:01:00Z',
      complete: true,
    },
  ]

  beforeEach(() => {
    useChatStore.setState({
      ...useChatStore.getInitialState(),
      threadId: 'current-thread-id',
    })

    vi.clearAllMocks()
  })

  describe('startNewThread', () => {
    it('should create a new thread and reset state', () => {
      useChatStore.setState({
        threadId: 'old-thread-id',
        messages: { list: mockMessages, loading: false, error: null, ready: true },
        waitingForReply: true,
        currentView: ChatView.History,
      })

      const { startNewThread } = useChatStore.getState()

      startNewThread()

      const state = useChatStore.getState()
      expect(state.threadId).not.toBe('old-thread-id')
      expect(state.messages).toEqual({
        list: emptyMessages,
        loading: false,
        error: null,
        ready: true,
      })
      expect(state.waitingForReply).toBe(false)
      expect(state.currentView).toBe(ChatView.Chat)
    })
  })

  describe('loadThreads', () => {
    it('should load threads successfully', async () => {
      ;(repository.getThreads as Mock).mockResolvedValue(mockThreads)

      const { loadThreads } = useChatStore.getState()

      await loadThreads()

      const state = useChatStore.getState()
      expect(state.threads).toEqual({
        list: mockThreads,
        loading: false,
        error: null,
        ready: true,
      })
    })

    it('should set loading state while loading threads', async () => {
      let resolvePromise: (value: Thread[]) => void
      const promise = new Promise<Thread[]>(resolve => {
        resolvePromise = resolve
      })
      ;(repository.getThreads as Mock).mockReturnValue(promise)

      const { loadThreads } = useChatStore.getState()

      const loadPromise = loadThreads()

      // Check loading state
      const loadingState = useChatStore.getState()
      expect(loadingState.threads).toEqual({
        list: emptyThreads,
        loading: true,
        error: null,
        ready: false,
      })

      // Resolve the promise
      resolvePromise!(mockThreads)
      await loadPromise

      // Check final state
      const finalState = useChatStore.getState()
      expect(finalState.threads).toEqual({
        list: mockThreads,
        loading: false,
        error: null,
        ready: true,
      })
    })

    it('should handle errors when loading threads', async () => {
      const error = new Error('Failed to load threads')
      const errorMessage = 'Failed to load threads'
      ;(repository.getThreads as Mock).mockRejectedValue(error)

      const { loadThreads } = useChatStore.getState()

      await loadThreads()

      const state = useChatStore.getState()
      expect(state.threads).toEqual({
        list: emptyThreads,
        loading: false,
        error: errorMessage,
        ready: false,
      })
    })
  })

  describe('selectThread', () => {
    it('should select thread and load messages successfully', async () => {
      ;(repository.getMessages as Mock).mockResolvedValue(mockMessages)

      const { selectThread } = useChatStore.getState()

      await selectThread('thread-1')

      const state = useChatStore.getState()
      expect(state.threadId).toBe('thread-1')
      expect(state.messages).toEqual({
        list: mockMessages,
        loading: false,
        error: null,
        ready: true,
      })
      expect(state.waitingForReply).toBe(false)
      expect(state.currentView).toBe(ChatView.Chat)
    })

    it('should set loading state while loading messages', async () => {
      let resolvePromise: (value: Message[]) => void
      const promise = new Promise<Message[]>(resolve => {
        resolvePromise = resolve
      })
      ;(repository.getMessages as Mock).mockReturnValue(promise)

      const { selectThread } = useChatStore.getState()

      const selectPromise = selectThread('thread-1')

      // Check loading state
      const loadingState = useChatStore.getState()
      expect(loadingState.threadId).toBe('thread-1')
      expect(loadingState.messages).toEqual({
        list: emptyMessages,
        loading: true,
        error: null,
        ready: false,
      })
      expect(loadingState.waitingForReply).toBe(false)
      expect(loadingState.currentView).toBe(ChatView.Chat)

      // Resolve the promise
      resolvePromise!(mockMessages)
      await selectPromise

      // Check final state
      const finalState = useChatStore.getState()
      expect(finalState.messages).toEqual({
        list: mockMessages,
        loading: false,
        error: null,
        ready: true,
      })
    })

    it('should handle errors when loading messages', async () => {
      const error = new Error('Failed to load messages')
      const errorMessage = 'Failed to load messages'
      ;(repository.getMessages as Mock).mockRejectedValue(error)

      const { selectThread } = useChatStore.getState()

      await selectThread('thread-1')

      const state = useChatStore.getState()
      expect(state.threadId).toBe('thread-1')
      expect(state.messages).toEqual({
        list: emptyMessages,
        loading: false,
        error: errorMessage,
        ready: false,
      })
    })

    it('should reset message state on error', async () => {
      const error = new Error('Failed to load messages')
      const errorMessage = 'Failed to load messages'
      ;(repository.getMessages as Mock).mockRejectedValue(error)

      // Start with some existing messages
      useChatStore.setState({
        messages: { list: mockMessages, loading: false, error: null, ready: true },
        waitingForReply: true,
      })

      const { selectThread } = useChatStore.getState()

      await selectThread('thread-1')

      const state = useChatStore.getState()
      expect(state.messages).toEqual({
        list: emptyMessages,
        loading: false,
        error: errorMessage,
        ready: false,
      })
      expect(state.waitingForReply).toBe(false)
    })
  })

  describe('integration with other slices', () => {
    it('should work with existing state from other slices', () => {
      // Set up some initial state from other slices
      useChatStore.setState({
        model: AIModel.OpenAI_GPT_4o,
        provider: {
          ready: true,
          loading: false,
          configured: true,
          error: null,
        },
        assistant: null,
      })

      const { startNewThread } = useChatStore.getState()

      startNewThread()

      const state = useChatStore.getState()
      // Should preserve other slice state
      expect(state.model).toBe(AIModel.OpenAI_GPT_4o)
      expect(state.provider.configured).toBe(true)
      expect(state.assistant).toBe(null)
    })
  })

  describe('repository method calls', () => {
    it('should call repository.getThreads when loading threads', async () => {
      ;(repository.getThreads as Mock).mockResolvedValue(mockThreads)

      const { loadThreads } = useChatStore.getState()

      await loadThreads()

      expect(repository.getThreads).toHaveBeenCalledTimes(1)
    })

    it('should call repository.getMessages with correct threadId when selecting thread', async () => {
      ;(repository.getMessages as Mock).mockResolvedValue(mockMessages)

      const { selectThread } = useChatStore.getState()

      await selectThread('thread-1')

      expect(repository.getMessages).toHaveBeenCalledWith('thread-1')
      expect(repository.getMessages).toHaveBeenCalledTimes(1)
    })
  })
})
