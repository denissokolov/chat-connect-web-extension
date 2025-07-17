import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { DateTime } from 'luxon'

import Chat from './Chat'
import useChatStore from '@/stores/useChatStore'
import { MessageContentType, MessageRole } from '@/types/types'
import { MockAssistant } from '@/services/assistant'
import { messagesMock, messagesWithFunctionCallMock } from './Chat.mocks'

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
  beforeEach: () => {
    useChatStore.setState({
      ...useChatStore.getInitialState(),
      messages: {
        list: messagesMock,
        loading: false,
        error: null,
        ready: true,
      },
      waitingForReply: true,
    })
  },
  play: async ({ canvas }) => {
    const text = canvas.getByText('Ultimate Question of Life, the Universe, and Everything')
    await expect(text).toBeInTheDocument()
  },
}

export const Empty: Story = {
  beforeEach: () => {
    useChatStore.setState({
      ...useChatStore.getInitialState(),
      messages: {
        list: [],
        loading: false,
        error: null,
        ready: true,
      },
      waitingForReply: false,
    })
  },
  play: async ({ canvas }) => {
    const text = canvas.getByText('Start a conversation by sending a message')
    await expect(text).toBeInTheDocument()
  },
}

export const Typing: Story = {
  beforeEach: () => {
    useChatStore.setState({
      ...useChatStore.getInitialState(),
      messages: {
        list: [],
        loading: false,
        error: null,
        ready: true,
      },
      waitingForReply: false,
    })
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox')
    await userEvent.type(input, 'Hello, world!')
    await expect(canvas.getByText('Hello, world!')).toBeInTheDocument()
  },
}

export const WriteMessage: Story = {
  beforeEach: () => {
    const mockAssistant = new MockAssistant('mock-api-key')
    useChatStore.setState({
      ...useChatStore.getInitialState(),
      messages: {
        list: [],
        loading: false,
        error: null,
        ready: true,
      },
      waitingForReply: false,
      assistant: mockAssistant,
      provider: {
        ready: true,
        loading: false,
        configured: true,
        error: null,
      },
    })
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox')
    await userEvent.type(input, 'Hello, world!')
    await userEvent.click(canvas.getByTitle('Send'))
    await expect(canvas.getByText('Hello, world!')).toBeInTheDocument()

    // Wait for the assistant response to appear (MockAssistant has 1s delay)
    await waitFor(
      () => expect(canvas.getByText('Hello, how can I help you today?')).toBeInTheDocument(),
      { timeout: 3000 },
    )
  },
}

export const WithError: Story = {
  beforeEach: () => {
    useChatStore.setState({
      ...useChatStore.getInitialState(),
      messages: {
        list: [
          {
            id: '1',
            content: [{ type: MessageContentType.OutputText, text: 'Hello, world!', id: '1' }],
            role: MessageRole.User,
            createdAt: DateTime.now().toISO(),
            error:
              '401 Incorrect API key provided: 123. You can find your API key at https://platform.openai.com/account/api-keys.',
            threadId: '1',
            complete: true,
            hasError: true,
          },
        ],
        loading: false,
        error: null,
        ready: true,
      },
    })
  },
}

export const WithFunctionCall: Story = {
  beforeEach: () => {
    const mockAssistant = new MockAssistant('mock-api-key')
    useChatStore.setState({
      ...useChatStore.getInitialState(),
      waitingForReply: false,
      assistant: mockAssistant,
      provider: {
        ready: true,
        loading: false,
        configured: true,
        error: null,
      },
      messages: {
        list: messagesWithFunctionCallMock,
        loading: false,
        error: null,
        ready: true,
      },
    })
  },
}

export const MessagesLoading: Story = {
  beforeEach: () => {
    const mockAssistant = new MockAssistant('mock-api-key')
    useChatStore.setState({
      ...useChatStore.getInitialState(),
      waitingForReply: false,
      assistant: mockAssistant,
      provider: {
        ready: true,
        loading: false,
        configured: true,
        error: null,
      },
      messages: {
        list: [],
        loading: true,
        error: null,
        ready: false,
      },
    })
  },
  play: async ({ canvas }) => {
    const loading = canvas.getByText('Loading messages...')
    await expect(loading).toBeInTheDocument()
  },
}

export const MessagesError: Story = {
  beforeEach: () => {
    const mockAssistant = new MockAssistant('mock-api-key')
    useChatStore.setState({
      ...useChatStore.getInitialState(),
      waitingForReply: false,
      assistant: mockAssistant,
      provider: {
        ready: true,
        loading: false,
        configured: true,
        error: null,
      },
      messages: {
        list: [],
        loading: false,
        error: 'Error loading messages',
        ready: false,
      },
    })
  },
  play: async ({ canvas }) => {
    const error = canvas.getByText('Error loading messages')
    await expect(error).toBeInTheDocument()
  },
}
