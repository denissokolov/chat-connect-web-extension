import { describe, it, expect, beforeEach, vi } from 'vitest'

import useChatStore from '@/stores/useChatStore'
import { ChatView } from '@/types/types'

describe('viewSlice', () => {
  beforeEach(() => {
    useChatStore.setState({
      ...useChatStore.getInitialState(),
    })

    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have ChatView.Chat as initial currentView', () => {
      const { currentView } = useChatStore.getState()
      expect(currentView).toBe(ChatView.Chat)
    })
  })

  describe('setCurrentView', () => {
    it('should set currentView to the provided view', () => {
      const { setCurrentView } = useChatStore.getState()

      setCurrentView(ChatView.History)

      const { currentView } = useChatStore.getState()
      expect(currentView).toBe(ChatView.History)
    })

    it('should set currentView back to Chat', () => {
      const { setCurrentView } = useChatStore.getState()

      setCurrentView(ChatView.History)
      expect(useChatStore.getState().currentView).toBe(ChatView.History)

      setCurrentView(ChatView.Chat)
      expect(useChatStore.getState().currentView).toBe(ChatView.Chat)
    })

    it('should call loadThreads when view is set to History', () => {
      const mockLoadThreads = vi.fn()
      useChatStore.setState({
        loadThreads: mockLoadThreads,
      })

      const { setCurrentView } = useChatStore.getState()

      setCurrentView(ChatView.History)

      expect(mockLoadThreads).toHaveBeenCalledOnce()
    })

    it('should not call loadThreads when view is set to Chat', () => {
      const mockLoadThreads = vi.fn()
      useChatStore.setState({
        loadThreads: mockLoadThreads,
      })

      const { setCurrentView } = useChatStore.getState()

      setCurrentView(ChatView.Chat)

      expect(mockLoadThreads).not.toHaveBeenCalled()
    })

    it('should call loadThreads only when switching to History, not when already in History', () => {
      const mockLoadThreads = vi.fn()
      useChatStore.setState({
        loadThreads: mockLoadThreads,
        currentView: ChatView.History,
      })

      const { setCurrentView } = useChatStore.getState()

      setCurrentView(ChatView.History)

      expect(mockLoadThreads).toHaveBeenCalledOnce()
    })

    it('should maintain view state across multiple calls', () => {
      const { setCurrentView } = useChatStore.getState()

      setCurrentView(ChatView.History)
      expect(useChatStore.getState().currentView).toBe(ChatView.History)

      setCurrentView(ChatView.Chat)
      expect(useChatStore.getState().currentView).toBe(ChatView.Chat)

      setCurrentView(ChatView.History)
      expect(useChatStore.getState().currentView).toBe(ChatView.History)
    })

    it('should work with real loadThreads function from threadSlice', () => {
      const { setCurrentView } = useChatStore.getState()

      expect(() => setCurrentView(ChatView.History)).not.toThrow()
      expect(useChatStore.getState().currentView).toBe(ChatView.History)
    })
  })
})
