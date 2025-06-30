import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import { DateTime } from 'luxon'

import ChatHistory from './ChatHistory'
import { MessageContentType, MessageRole, type Thread, type Message } from '@/types/types'

// Mock data for stories
const mockThreads: Thread[] = [
  {
    id: 'thread-1',
    createdAt: DateTime.now().minus({ hours: 2 }).toISO(),
    updatedAt: DateTime.now().minus({ minutes: 30 }).toISO(),
  },
  {
    id: 'thread-2',
    createdAt: DateTime.now().minus({ days: 1 }).toISO(),
    updatedAt: DateTime.now().minus({ hours: 5 }).toISO(),
  },
  {
    id: 'thread-3',
    createdAt: DateTime.now().minus({ days: 3 }).toISO(),
    updatedAt: DateTime.now().minus({ days: 2 }).toISO(),
  },
  {
    id: 'thread-4',
    createdAt: DateTime.now().minus({ weeks: 1 }).toISO(),
    updatedAt: DateTime.now().minus({ days: 5 }).toISO(),
  },
]

const mockMessages: Record<string, Message[]> = {
  'thread-1': [
    {
      id: 'msg-1',
      role: MessageRole.User,
      content: [
        {
          type: MessageContentType.OutputText,
          text: 'How do I implement a React component with TypeScript?',
          id: '1',
        },
      ],
      createdAt: DateTime.now().minus({ hours: 2 }).toISO(),
      threadId: 'thread-1',
    },
    {
      id: 'msg-2',
      role: MessageRole.Assistant,
      content: [
        {
          type: MessageContentType.OutputText,
          text: 'To implement a React component with TypeScript, you need to define the component props interface and use proper typing...',
          id: '2',
        },
      ],
      createdAt: DateTime.now().minus({ hours: 2, minutes: 1 }).toISO(),
      threadId: 'thread-1',
    },
    {
      id: 'msg-3',
      role: MessageRole.User,
      content: [
        {
          type: MessageContentType.OutputText,
          text: 'Can you show me an example with hooks?',
          id: '3',
        },
      ],
      createdAt: DateTime.now().minus({ minutes: 30 }).toISO(),
      threadId: 'thread-1',
    },
  ],
  'thread-2': [
    {
      id: 'msg-4',
      role: MessageRole.User,
      content: [
        {
          type: MessageContentType.OutputText,
          text: 'What are the best practices for state management in React?',
          id: '4',
        },
      ],
      createdAt: DateTime.now().minus({ days: 1 }).toISO(),
      threadId: 'thread-2',
    },
    {
      id: 'msg-5',
      role: MessageRole.Assistant,
      content: [
        {
          type: MessageContentType.OutputText,
          text: 'There are several approaches to state management in React, including useState, useReducer, Context API, and external libraries like Zustand or Redux...',
          id: '5',
        },
      ],
      createdAt: DateTime.now().minus({ days: 1, minutes: 2 }).toISO(),
      threadId: 'thread-2',
    },
  ],
  'thread-3': [
    {
      id: 'msg-6',
      role: MessageRole.User,
      content: [
        {
          type: MessageContentType.OutputText,
          text: 'Explain the difference between useEffect and useLayoutEffect',
          id: '6',
        },
      ],
      createdAt: DateTime.now().minus({ days: 3 }).toISO(),
      threadId: 'thread-3',
    },
  ],
  'thread-4': [
    {
      id: 'msg-7',
      role: MessageRole.User,
      content: [
        {
          type: MessageContentType.OutputText,
          text: 'Help me debug this CSS flexbox layout issue',
          id: '7',
        },
      ],
      createdAt: DateTime.now().minus({ weeks: 1 }).toISO(),
      threadId: 'thread-4',
    },
    {
      id: 'msg-8',
      role: MessageRole.Assistant,
      content: [
        {
          type: MessageContentType.OutputText,
          text: "I'd be happy to help you debug your flexbox layout. Can you share the CSS code you're working with?",
          id: '8',
        },
      ],
      createdAt: DateTime.now().minus({ weeks: 1, minutes: 1 }).toISO(),
      threadId: 'thread-4',
    },
    {
      id: 'msg-9',
      role: MessageRole.User,
      content: [
        {
          type: MessageContentType.OutputText,
          text: "Here's my CSS: .container { display: flex; justify-content: space-between; }",
          id: '9',
        },
      ],
      createdAt: DateTime.now().minus({ days: 5 }).toISO(),
      threadId: 'thread-4',
    },
  ],
}

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
  args: {
    threads: [],
  },
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
  args: {
    threads: mockThreads,
    getThreadMessages: (threadId: string) => mockMessages[threadId] || [],
  },
  play: async ({ canvas }) => {
    // Check that the header is present
    const header = canvas.getByText('Chat History')
    await expect(header).toBeInTheDocument()

    // Check that chat items are rendered
    const firstChat = canvas.getByText('How do I implement a React component with TypeScript?')
    await expect(firstChat).toBeInTheDocument()

    const secondChat = canvas.getByText(
      'What are the best practices for state management in React?',
    )
    await expect(secondChat).toBeInTheDocument()
  },
}

export const WithSelectedChat: Story = {
  args: {
    threads: mockThreads,
    getThreadMessages: (threadId: string) => mockMessages[threadId] || [],
    selectedThreadId: 'thread-1',
  },
  play: async ({ canvas }) => {
    // Check that the selected chat has the selected styling
    const selectedChat = canvas
      .getByText('How do I implement a React component with TypeScript?')
      .closest('button')
    await expect(selectedChat).toHaveClass('bg-muted')
  },
}

export const Interactive: Story = {
  args: {
    threads: mockThreads,
    getThreadMessages: (threadId: string) => mockMessages[threadId] || [],
    onThreadSelect: (_threadId: string) => {
      // Thread selection callback - in a real app, this would update the selected state
    },
  },
  play: async ({ canvas }) => {
    // Test clicking on a chat item
    const firstChat = canvas.getByText('How do I implement a React component with TypeScript?')
    await userEvent.click(firstChat)

    // The click should trigger the onThreadSelect callback
    // In a real app, this would update the selected state
  },
}

export const SingleMessage: Story = {
  args: {
    threads: [mockThreads[2]], // Thread with only one message
    getThreadMessages: (threadId: string) => mockMessages[threadId] || [],
  },
  play: async ({ canvas }) => {
    // Check that the chat item is rendered
    const chatItem = canvas.getByText(
      'Explain the difference between useEffect and useLayoutEffect',
    )
    await expect(chatItem).toBeInTheDocument()
  },
}

// Legacy story for backward compatibility
export const Default: Story = EmptyState
