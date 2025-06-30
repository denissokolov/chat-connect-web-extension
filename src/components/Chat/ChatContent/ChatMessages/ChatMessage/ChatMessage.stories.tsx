import type { Meta, StoryObj } from '@storybook/react-vite'

import ChatMessage from './ChatMessage'
import { MessageContentType, MessageRole } from '@/types/types'

const meta: Meta<typeof ChatMessage> = {
  title: 'Chat / Chat Message',
  component: ChatMessage,
  tags: ['autodocs'],
  argTypes: {
    role: { control: 'select', options: [MessageRole.User, MessageRole.Assistant] },
    content: { control: 'text' },
    progress: { control: 'boolean' },
  },
  args: {
    role: MessageRole.Assistant,
    content: [{ type: MessageContentType.OutputText, text: 'Hello, how are you?', id: '1' }],
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const UserChatMessage: Story = {
  args: {
    role: MessageRole.User,
    content: [{ type: MessageContentType.OutputText, text: 'Write a story about a cat', id: '1' }],
  },
}

export const UserChatMessageLong: Story = {
  args: {
    role: MessageRole.User,
    content: [
      {
        type: MessageContentType.OutputText,
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        id: '1',
      },
    ],
  },
}

export const AssistantChatMessage: Story = {
  args: {
    role: MessageRole.Assistant,
    content: [
      {
        type: MessageContentType.OutputText,
        text: 'Once upon a time, there was a cat who loved to play with a ball of yarn.',
        id: '1',
      },
    ],
  },
}

export const AssistantChatMessageLong: Story = {
  args: {
    role: MessageRole.Assistant,
    content: [
      {
        type: MessageContentType.OutputText,
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        id: '1',
      },
    ],
  },
}

export const AssistantChatMessageLoading: Story = {
  args: {
    role: MessageRole.Assistant,
    content: [{ type: MessageContentType.OutputText, text: '', id: '1' }],
    progress: true,
  },
}

export const Markdown: Story = {
  args: {
    role: MessageRole.Assistant,
    content: [
      {
        id: '1',
        type: MessageContentType.OutputText,
        text: `
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
    ],
  },
}

export const MarkdownWithLinks: Story = {
  args: {
    role: MessageRole.Assistant,
    content: [
      {
        type: MessageContentType.OutputText,
        text: `
Here are some useful links:

- [OpenAI Documentation](https://platform.openai.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

You can also visit https://github.com for more resources.

Check out this [inline link](https://example.com) in the middle of text.
        `,
        id: '1',
      },
    ],
  },
}

export const ErrorMessage: Story = {
  args: {
    role: MessageRole.User,
    content: [
      {
        type: MessageContentType.OutputText,
        text: 'My beautiful message with a lot of text',
        id: '1',
      },
    ],
    error:
      'Error message\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n123456789009392387423647263478234792384982394832984923492349823482934934758357837587358738578375835738573758357837583',
  },
}
