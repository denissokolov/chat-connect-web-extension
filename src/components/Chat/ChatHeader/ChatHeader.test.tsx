import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import ChatHeader from './ChatHeader'
import useChatStore from '@/stores/useChatStore'
import { ChatView } from '@/types/chat.types'
import { AIModel } from '@/types/provider.types'

vi.mock('@/services/browser', () => ({
  default: {
    openExtensionSettings: vi.fn(),
  },
}))

describe('ChatHeader', () => {
  const mockSetCurrentView = vi.fn()

  beforeEach(() => {
    useChatStore.setState(useChatStore.getInitialState())
    mockSetCurrentView.mockClear()
  })

  describe('history button visibility', () => {
    it('should show history button when history is enabled', () => {
      useChatStore.setState({
        settings: {
          ready: true,
          loading: false,
          error: null,
          data: {
            openAIToken: 'test-token',
            openAIServer: '',
            model: AIModel.OpenAI_GPT_5,
            autoExecuteTools: false,
            historyEnabled: true,
          },
        },
      })

      render(<ChatHeader currentView={ChatView.Chat} setCurrentView={mockSetCurrentView} />)

      const historyButton = screen.getByTitle('Show chat history')
      expect(historyButton).toBeDefined()
    })

    it('should hide history button when history is disabled', () => {
      useChatStore.setState({
        settings: {
          ready: true,
          loading: false,
          error: null,
          data: {
            openAIToken: 'test-token',
            openAIServer: '',
            model: AIModel.OpenAI_GPT_5,
            autoExecuteTools: false,
            historyEnabled: false,
          },
        },
      })

      render(<ChatHeader currentView={ChatView.Chat} setCurrentView={mockSetCurrentView} />)

      const historyButton = screen.queryByTitle('Show chat history')
      expect(historyButton).toBeNull()
    })

    it('should show history button when historyEnabled is undefined (defaults to true)', () => {
      useChatStore.setState({
        settings: {
          ready: true,
          loading: false,
          error: null,
          data: {
            openAIToken: 'test-token',
            openAIServer: '',
            model: AIModel.OpenAI_GPT_5,
            autoExecuteTools: false,
          },
        },
      })

      render(<ChatHeader currentView={ChatView.Chat} setCurrentView={mockSetCurrentView} />)

      const historyButton = screen.getByTitle('Show chat history')
      expect(historyButton).toBeDefined()
    })
  })

  describe('other buttons', () => {
    it('should always show settings button in chat view', () => {
      useChatStore.setState({
        settings: {
          ready: true,
          loading: false,
          error: null,
          data: {
            openAIToken: 'test-token',
            openAIServer: '',
            model: AIModel.OpenAI_GPT_5,
            autoExecuteTools: false,
            historyEnabled: false,
          },
        },
      })

      render(<ChatHeader currentView={ChatView.Chat} setCurrentView={mockSetCurrentView} />)

      const settingsButton = screen.getByTitle('Show settings')
      expect(settingsButton).toBeDefined()
    })

    it('should always show new chat button in chat view', () => {
      useChatStore.setState({
        settings: {
          ready: true,
          loading: false,
          error: null,
          data: {
            openAIToken: 'test-token',
            openAIServer: '',
            model: AIModel.OpenAI_GPT_5,
            autoExecuteTools: false,
            historyEnabled: false,
          },
        },
      })

      render(<ChatHeader currentView={ChatView.Chat} setCurrentView={mockSetCurrentView} />)

      const newChatButton = screen.getByTitle('Start new chat')
      expect(newChatButton).toBeDefined()
    })
  })

  describe('history view', () => {
    it('should show back button in history view', () => {
      render(<ChatHeader currentView={ChatView.History} setCurrentView={mockSetCurrentView} />)

      const backButton = screen.getByLabelText('Back to chat')
      expect(backButton).toBeDefined()
    })

    it('should show new chat button in history view', () => {
      render(<ChatHeader currentView={ChatView.History} setCurrentView={mockSetCurrentView} />)

      const newChatButton = screen.getByLabelText('Start new chat thread')
      expect(newChatButton).toBeDefined()
    })
  })
})
