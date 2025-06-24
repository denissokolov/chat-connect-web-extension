import type { Meta, StoryObj } from '@storybook/react-vite'

import ChatMessage from './ChatMessage'
import { MessageRole } from '@/types/types'

const meta: Meta<typeof ChatMessage> = {
  title: 'Chat / Chat Message',
  component: ChatMessage,
  tags: ['autodocs'],
  argTypes: {
    role: { control: 'select', options: [MessageRole.User, MessageRole.Assistant] },
    content: { control: 'text' },
    timestamp: { control: 'date' },
    progress: { control: 'boolean' },
  },
  args: {
    role: MessageRole.Assistant,
    content: 'Hello, how are you?',
    timestamp: new Date(),
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const UserChatMessage: Story = {
  args: {
    role: MessageRole.User,
    content: 'Write a story about a cat',
  },
}

export const UserChatMessageLong: Story = {
  args: {
    role: MessageRole.User,
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
}

export const AssistantChatMessage: Story = {
  args: {
    role: MessageRole.Assistant,
    content: 'Once upon a time, there was a cat who loved to play with a ball of yarn.',
  },
}

export const AssistantChatMessageLong: Story = {
  args: {
    role: MessageRole.Assistant,
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
}

export const AssistantChatMessageLoading: Story = {
  args: {
    role: MessageRole.Assistant,
    content: '',
    progress: true,
  },
}

export const Markdown: Story = {
  args: {
    role: MessageRole.Assistant,
    content: `
**Hello**, how are you?

## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

\`\`\`javascript
console.log("Hello, world!");
\`\`\`

- List item 1
- List item 2
- List item 3

> Blockquote

*italic*
    `,
  },
}
