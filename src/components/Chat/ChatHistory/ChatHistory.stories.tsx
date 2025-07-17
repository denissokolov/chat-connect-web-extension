import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { useLayoutEffect } from 'react'

import useChatStore from '@/stores/useChatStore'
import ChatHistory from './ChatHistory'
import { mockThreads } from './ChatHistory.mocks'

const meta: Meta<typeof ChatHistory> = {
  title: 'Chat / Chat History',
  component: ChatHistory,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div style={{ height: '600px', width: '350px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ChatHistory>

export const EmptyState: Story = {
  decorators: [
    Story => {
      useLayoutEffect(() => {
        useChatStore.setState({
          threads: {
            list: [],
            loading: false,
            error: null,
            ready: true,
          },
        })
      }, [])
      return <Story />
    },
  ],
  play: async ({ canvas }) => {
    const heading = canvas.getByText('No chats yet')
    await expect(heading).toBeInTheDocument()

    const description = canvas.getByText(
      'Your chat history will appear here once you start conversations.',
    )
    await expect(description).toBeInTheDocument()

    // Check that the MessageSquare icon is present by looking for the SVG element
    const icon = document.querySelector('.lucide-message-square')
    await expect(icon).toBeInTheDocument()
  },
}

export const WithChats: Story = {
  decorators: [
    Story => {
      useLayoutEffect(() => {
        useChatStore.setState({
          threads: {
            list: mockThreads,
            loading: false,
            error: null,
            ready: true,
          },
        })
      }, [])
      return <Story />
    },
  ],
  play: async ({ canvas }) => {
    // Check that chat items are rendered
    const firstChat = canvas.getByText('How do I implement a React component with TypeScript?')
    await expect(firstChat).toBeInTheDocument()

    const secondChat = canvas.getByText(
      'What are the best practices for state management in React?',
    )
    await expect(secondChat).toBeInTheDocument()
  },
}

export const Loading: Story = {
  decorators: [
    Story => {
      useLayoutEffect(() => {
        useChatStore.setState({
          threads: {
            list: mockThreads,
            loading: true,
            error: null,
            ready: true,
          },
        })
      }, [])
      return <Story />
    },
  ],
  play: async ({ canvas }) => {
    const loading = canvas.getByText('Loading threads...')
    await expect(loading).toBeInTheDocument()
  },
}

export const ErrorState: Story = {
  decorators: [
    Story => {
      useLayoutEffect(() => {
        useChatStore.setState({
          threads: {
            list: mockThreads,
            loading: false,
            error: 'Error loading threads',
            ready: false,
          },
        })
      }, [])
      return <Story />
    },
  ],
  play: async ({ canvas }) => {
    const error = canvas.getByText('Error loading threads')
    await expect(error).toBeInTheDocument()
  },
}
