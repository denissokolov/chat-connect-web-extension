import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { DateTime } from 'luxon'

import Chat from './Chat'
import useChatStore from '@/stores/useChatStore'
import { MessageContentType, MessageRole } from '@/types/chat.types'
import { MockAssistant } from '@/services/assistant'
import { messagesMock, messagesWithFunctionCallMock } from './Chat.mocks'
import { FunctionName } from '@/types/tool.types'
import { ChatStore } from '@/stores/useChatStore.types'
import { AIModel } from '@/types/provider.types'

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

const initialState: ChatStore = {
  ...useChatStore.getInitialState(),
  settings: {
    ready: true,
    loading: false,
    error: null,
    data: {
      model: AIModel.OpenAI_GPT_5,
      openAIToken: 'mock-api-key',
      autoExecuteTools: false,
    },
  },
}

export const Default: Story = {
  beforeEach: () => {
    useChatStore.setState({
      ...initialState,
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
      ...initialState,
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
      ...initialState,
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
      ...initialState,
      messages: {
        list: [],
        loading: false,
        error: null,
        ready: true,
      },
      waitingForReply: false,
      assistant: mockAssistant,
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
      ...initialState,
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
      ...initialState,
      waitingForReply: false,
      assistant: mockAssistant,
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
      ...initialState,
      waitingForReply: false,
      assistant: mockAssistant,
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
      ...initialState,
      waitingForReply: false,
      assistant: mockAssistant,
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

export const SettingsLoading: Story = {
  beforeEach: () => {
    useChatStore.setState({
      ...initialState,
      settings: {
        data: null,
        ready: false,
        loading: true,
        error: null,
      },
    })
  },
  play: async ({ canvas }) => {
    const loading = canvas.getByText('Initializing chat...')
    await expect(loading).toBeInTheDocument()
  },
}

export const SettingsError: Story = {
  beforeEach: () => {
    useChatStore.setState({
      ...initialState,
      settings: {
        data: null,
        ready: false,
        loading: false,
        error: 'Error loading settings',
      },
    })
  },
  play: async ({ canvas }) => {
    const error = canvas.getByText('Error loading settings')
    await expect(error).toBeInTheDocument()
  },
}

export const StreamingEmpty: Story = {
  beforeEach: () => {
    useChatStore.setState({
      ...initialState,
      waitingForReply: true,
      messages: {
        ...initialState.messages,
        list: [messagesMock[0]],
      },
    })
  },
}

export const StreamingEmptyMessage: Story = {
  beforeEach: () => {
    useChatStore.setState({
      ...initialState,
      waitingForReply: true,
      messages: {
        ...initialState.messages,
        list: [
          messagesMock[0],
          {
            id: '2',
            content: [{ type: MessageContentType.OutputText, text: '', id: '2' }],
            role: MessageRole.Assistant,
            createdAt: DateTime.now().toISO(),
            threadId: '1',
            complete: false,
          },
        ],
      },
    })
  },
}

export const StreamingMessagePart: Story = {
  beforeEach: () => {
    useChatStore.setState({
      ...initialState,
      waitingForReply: true,
      messages: {
        ...initialState.messages,
        list: [
          messagesMock[0],
          {
            id: '2',
            content: [{ type: MessageContentType.OutputText, text: 'This is a part of', id: '2' }],
            role: MessageRole.Assistant,
            createdAt: DateTime.now().toISO(),
            threadId: '1',
            complete: false,
          },
        ],
      },
    })
  },
}

export const StreamingMessageSecondLineEmpty: Story = {
  beforeEach: () => {
    useChatStore.setState({
      ...initialState,
      waitingForReply: true,
      messages: {
        ...initialState.messages,
        list: [
          messagesMock[0],
          {
            id: '2',
            content: [
              {
                type: MessageContentType.OutputText,
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                id: '2',
              },
              { type: MessageContentType.OutputText, text: '', id: '3' },
            ],
            role: MessageRole.Assistant,
            createdAt: DateTime.now().toISO(),
            threadId: '1',
            complete: false,
          },
        ],
      },
    })
  },
}

export const StreamingFunctionEmpty: Story = {
  beforeEach: () => {
    useChatStore.setState({
      ...initialState,
      waitingForReply: true,
      messages: {
        ...initialState.messages,
        list: [
          messagesMock[0],
          {
            id: '2',
            content: [
              {
                type: MessageContentType.OutputText,
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                id: '2',
              },
              {
                type: MessageContentType.FunctionCall,
                name: FunctionName.Placeholder,
                id: '3',
              },
            ],
            role: MessageRole.Assistant,
            createdAt: DateTime.now().toISO(),
            threadId: '1',
            complete: false,
          },
        ],
      },
    })
  },
}
