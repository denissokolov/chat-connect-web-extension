import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'

import UserMessage from './UserMessage'
import { MessageContentType } from '@/types/types'

const meta: Meta<typeof UserMessage> = {
  title: 'Chat / User Message',
  component: UserMessage,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    content: {
      control: 'object',
      description: 'Array of message content items',
    },
  },
}

export default meta
type Story = StoryObj<typeof UserMessage>

// Sample content for stories
const sampleTextContent = [
  {
    id: '1',
    type: MessageContentType.OutputText as const,
    text: 'Hello! Can you help me understand how React hooks work?',
  },
]

const markdownContent = [
  {
    id: '2',
    type: MessageContentType.OutputText as const,
    text: `# My Question About TypeScript

I'm working on a **TypeScript** project and need help with:

- Type definitions
- Generic constraints
- Utility types

Here's my current code:

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email?: string;
}
\`\`\`

Can you help me improve this? Also, here's a [useful link](https://www.typescriptlang.org/docs/) I found.

> Note: This is just an example of markdown formatting in user messages.`,
  },
]

const longContent = [
  {
    id: '3',
    type: MessageContentType.OutputText as const,
    text: `I'm working on a complex web application and running into several issues that I'd like your help with. The application is built using React, TypeScript, and Tailwind CSS, and I'm trying to implement a chat interface similar to what we're building here.

The main challenges I'm facing include state management across multiple components, proper TypeScript typing for complex data structures, and ensuring the UI is responsive and accessible. I've been reading through various documentation and tutorials, but I'm still struggling with some of the more advanced concepts.

Could you provide some guidance on best practices for structuring a React application of this complexity? I'm particularly interested in patterns for component composition, state management strategies, and how to handle asynchronous operations effectively.`,
  },
]

const multipleContentItems = [
  {
    id: '4a',
    type: MessageContentType.OutputText as const,
    text: 'I have multiple questions:',
  },
  {
    id: '4b',
    type: MessageContentType.OutputText as const,
    text: '1. How do I handle **error boundaries** in React?',
  },
  {
    id: '4c',
    type: MessageContentType.OutputText as const,
    text: '2. What are the best practices for [testing React components](https://testing-library.com/)?',
  },
]

export const Default: Story = {
  args: {
    content: sampleTextContent,
  },
}

export const WithMarkdown: Story = {
  args: {
    content: markdownContent,
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Check that markdown is rendered
    expect(canvas.getByRole('heading', { level: 1 })).toBeInTheDocument()

    // Check that links have proper attributes
    const link = canvas.getByRole('link')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  },
}

export const LongContent: Story = {
  args: {
    content: longContent,
  },
}

export const MultipleContentItems: Story = {
  args: {
    content: multipleContentItems,
  },
}

export const WithError: Story = {
  args: {
    content: sampleTextContent,
    error: 'Failed to send message. Please check your connection and try again.',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Check that error message is displayed
    expect(canvas.getByText(/Failed to send message/)).toBeInTheDocument()

    // Check that error icon is present
    const errorIcon = canvasElement.querySelector('.text-destructive')
    expect(errorIcon).toBeInTheDocument()
  },
}

export const ErrorOnly: Story = {
  args: {
    error: 'Message could not be sent due to network issues. Please try again later.',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Check that only error is displayed (no content)
    expect(canvas.getByText(/Message could not be sent/)).toBeInTheDocument()
    expect(canvas.queryByText('Hello!')).not.toBeInTheDocument()
  },
}

export const CodeSnippet: Story = {
  args: {
    content: [
      {
        id: '5',
        type: MessageContentType.OutputText as const,
        text: `Can you review this JavaScript function I wrote?

\`\`\`javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
\`\`\`

I'm using it to optimize search input handling, but I'm not sure if this implementation is correct.`,
      },
    ],
  },
}

export const WithLinks: Story = {
  args: {
    content: [
      {
        id: '6',
        type: MessageContentType.OutputText as const,
        text: `I've been studying these resources and have some questions:

- [React Documentation](https://react.dev) - Specifically about hooks
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Advanced types section
- [MDN Web Docs](https://developer.mozilla.org) - JavaScript fundamentals
- [Stack Overflow](https://stackoverflow.com) - Community discussions

Could you help me understand the concepts better?`,
      },
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Check that all links have proper attributes
    const links = canvas.getAllByRole('link')
    expect(links).toHaveLength(4)

    links.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  },
}

export const QuestionWithContext: Story = {
  args: {
    content: [
      {
        id: '7',
        type: MessageContentType.OutputText as const,
        text: `I'm building a chat application and need help with the message rendering logic. Here's what I'm trying to achieve:

**Requirements:**
- Support for markdown formatting
- Proper error handling
- Loading states
- Responsive design

**Current Issues:**
1. Messages don't wrap properly on mobile
2. Error states are not clearly visible
3. Loading animation feels too slow

Can you suggest improvements to the component architecture?`,
      },
    ],
  },
}

export const ShortQuestion: Story = {
  args: {
    content: [
      {
        id: '8',
        type: MessageContentType.OutputText as const,
        text: 'What is React?',
      },
    ],
  },
}

export const EmojiAndSpecialChars: Story = {
  args: {
    content: [
      {
        id: '9',
        type: MessageContentType.OutputText as const,
        text: `Hey! 👋 I'm working on a project and need help with these symbols: @#$%^&*()

Can you explain how to handle special characters in URLs? For example:
- Spaces: "hello world" → "hello%20world"
- Symbols: "user@domain.com" → "user%40domain.com"

Thanks! 🙏`,
      },
    ],
  },
}
