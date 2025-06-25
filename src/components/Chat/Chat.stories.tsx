import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import Chat from './Chat'
import useChatStore from '@/stores/useChatStore'
import { type Message, MessageRole } from '@/types/types'
import { useEffect } from 'react'

const messages: Message[] = [
  {
    id: '1',
    content: 'Please make a summary of this page',
    role: MessageRole.User,
    timestamp: new Date(),
  },
  {
    id: '2',
    content:
      'This is the summary of the page: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    role: MessageRole.Assistant,
    timestamp: new Date(),
  },
  {
    id: '3',
    content: 'What is the main idea of the page?',
    role: MessageRole.User,
    timestamp: new Date(),
  },
  {
    id: '4',
    content: 'The main idea of the page is to make a summary of the page',
    role: MessageRole.Assistant,
    timestamp: new Date(),
  },
  {
    id: '5',
    content: 'What time is it?',
    role: MessageRole.User,
    timestamp: new Date(),
  },
  {
    id: '6',
    content: 'It is 12:00 PM',
    role: MessageRole.Assistant,
    timestamp: new Date(),
  },
  {
    id: '7',
    content: 'Ultimate Question of Life, the Universe, and Everything',
    role: MessageRole.User,
    timestamp: new Date(),
  },
]

const meta: Meta<typeof Chat> = {
  title: 'Chat / Chat',
  component: Chat,
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
type Story = StoryObj<typeof Chat>

export const Default: Story = {
  decorators: [
    Story => {
      useEffect(() => {
        useChatStore.setState({
          messages,
          waitingForReply: true,
        })
      }, [])

      return <Story />
    },
  ],
  play: async ({ canvas }) => {
    const text = canvas.getByText('Ultimate Question of Life, the Universe, and Everything')
    await expect(text).toBeInTheDocument()
  },
}

export const Empty: Story = {
  decorators: [
    Story => {
      useEffect(() => {
        useChatStore.setState({
          messages: [],
          waitingForReply: false,
        })
      }, [])

      return <Story />
    },
  ],
  play: async ({ canvas }) => {
    const text = canvas.getByText('Start a conversation by sending a message')
    await expect(text).toBeInTheDocument()
  },
}

export const WriteMessage: Story = {
  decorators: [
    Story => {
      useEffect(() => {
        useChatStore.setState({
          messages: [],
          waitingForReply: false,
          provider: {
            ready: true,
            loading: false,
            configured: true,
            error: null,
          },
        })
      }, [])

      return <Story />
    },
  ],
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox')
    await userEvent.type(input, 'Hello, world!')
    await userEvent.click(canvas.getByTitle('Send'))
    await expect(canvas.getByText('Hello, world!')).toBeInTheDocument()
    await expect(canvas.getByText('Hello, how can I help you today?')).toBeInTheDocument()
  },
}
