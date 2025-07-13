import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'

import AssistantMessage from './AssistantMessage'
import {
  FunctionName,
  FunctionStatus,
  MessageContentType,
  type MessageContent,
} from '@/types/types'

const meta: Meta<typeof AssistantMessage> = {
  title: 'Chat / Assistant Message',
  component: AssistantMessage,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    content: {
      control: 'object',
      description: 'Array of message content items',
    },
  },
}

export default meta
type Story = StoryObj<typeof AssistantMessage>

// Sample content for stories
const sampleTextContent: MessageContent[] = [
  {
    id: '1',
    type: MessageContentType.OutputText,
    text: 'Hello! I can help you with various tasks. What would you like to know?',
  },
]

const markdownContent: MessageContent[] = [
  {
    id: '2',
    type: MessageContentType.OutputText,
    text: `# Welcome to Chat Connect

This is a **markdown** message with various formatting:

- Bullet point 1
- Bullet point 2
- Bullet point 3

Here's some \`inline code\` and a [link to Google](https://google.com).

## Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

> This is a blockquote with important information.`,
  },
]

const longContent: MessageContent[] = [
  {
    id: '3',
    type: MessageContentType.OutputText,
    text: `This is a longer message that demonstrates how the component handles extended content. It includes multiple paragraphs and should wrap properly within the container.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
  },
]

const multipleContentItems: MessageContent[] = [
  {
    id: '4a',
    type: MessageContentType.OutputText,
    text: 'First part of the response.',
  },
  {
    id: '4b',
    type: MessageContentType.OutputText,
    text: 'Second part with **bold text** and *italic text*.',
  },
  {
    id: '4c',
    type: MessageContentType.OutputText,
    text: 'Third part with a [link](https://example.com) and `code`.',
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
    expect(canvas.getByRole('heading', { level: 2 })).toBeInTheDocument()

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

export const CodeSnippet: Story = {
  args: {
    content: [
      {
        id: '5',
        type: MessageContentType.OutputText,
        text: `Here's a Python function to calculate fibonacci numbers:

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Example usage
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
\`\`\`

This implementation uses recursion, but for better performance with larger numbers, you might want to use dynamic programming or memoization.`,
      },
    ] as MessageContent[],
  },
}

export const WithLinks: Story = {
  args: {
    content: [
      {
        id: '6',
        type: MessageContentType.OutputText,
        text: `Here are some useful resources:

- [React Documentation](https://react.dev) - Official React docs
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Learn TypeScript
- [Storybook](https://storybook.js.org) - Tool for building UI components
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework

All links will open in a new tab for your convenience.`,
      },
    ] as MessageContent[],
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

export const WithOneFunctionCall: Story = {
  args: {
    content: [
      {
        id: '7',
        type: MessageContentType.FunctionCall,
        name: FunctionName.FillInput,
        status: FunctionStatus.Idle,
        arguments: {
          input_type: 'input',
          input_value: '1234',
          input_selector: '#postalcode',
          label_value: 'Postcode',
        },
      },
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByText('Postcode')).toBeInTheDocument()
    expect(canvas.getByText('1234')).toBeInTheDocument()
    expect(canvas.getByText('Fill the field')).toBeInTheDocument()
  },
}

export const WithMultipleFunctionCalls: Story = {
  args: {
    content: [
      {
        id: '7',
        type: MessageContentType.FunctionCall,
        name: FunctionName.FillInput,
        status: FunctionStatus.Idle,
        arguments: {
          input_type: 'input',
          input_value: '1234',
          input_selector: '#postalcode',
          label_value: 'Postcode',
        },
      },
      {
        id: '8',
        type: MessageContentType.FunctionCall,
        name: FunctionName.FillInput,
        status: FunctionStatus.Idle,
        arguments: {
          input_type: 'input',
          input_value: 'AB',
          input_selector: '#postalcode_letters',
          label_value: 'Postcode letters',
        },
      },
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByText('Postcode')).toBeInTheDocument()
    expect(canvas.getByText('1234')).toBeInTheDocument()
    expect(canvas.getByText('Postcode letters')).toBeInTheDocument()
    expect(canvas.getByText('AB')).toBeInTheDocument()
    expect(canvas.queryAllByText('Fill the field')).toHaveLength(2)
  },
}

export const WithMultipleFunctionCallsAndText: Story = {
  args: {
    content: [
      {
        id: '6',
        type: MessageContentType.OutputText,
        text: 'Hello! I can help you with various tasks. ',
      },
      {
        id: '7',
        type: MessageContentType.FunctionCall,
        name: FunctionName.FillInput,
        status: FunctionStatus.Idle,
        arguments: {
          input_type: 'input',
          input_value: '1234',
          input_selector: '#postalcode',
          label_value: 'Postcode',
        },
      },
      {
        id: '77',
        type: MessageContentType.FunctionCall,
        name: FunctionName.FillInput,
        status: FunctionStatus.Idle,
        arguments: {
          input_type: 'input',
          input_value: 'AB',
          input_selector: '#postalcode_letters',
          label_value: 'Postcode letters',
        },
      },
      {
        id: '8',
        type: MessageContentType.OutputText,
        text: 'If you need more information, please let me know.',
      },
      {
        id: '88',
        type: MessageContentType.FunctionCall,
        name: FunctionName.FillInput,
        status: FunctionStatus.Idle,
        arguments: {
          input_type: 'input',
          input_value: 'AB',
          input_selector: '#postalcode_letters',
          label_value: 'Postcode letters',
        },
      },
      {
        id: '11',
        type: MessageContentType.FunctionCall,
        name: FunctionName.ClickButton,
        status: FunctionStatus.Idle,
        arguments: {
          button_selector: '#submit',
          button_text: 'Bestellen',
        },
      },
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByText('Click the button')).toBeInTheDocument()
    expect(canvas.getByText('Bestellen')).toBeInTheDocument()
  },
}

export const WithFunctionCallSuccess: Story = {
  args: {
    content: [
      {
        id: '777',
        type: MessageContentType.FunctionCall,
        name: FunctionName.FillInput,
        status: FunctionStatus.Success,
        result: {
          success: true,
        },
        arguments: {
          input_type: 'input',
          input_value: '1234',
          input_selector: '#postalcode',
          label_value: 'Postcode',
        },
      },
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByText('Postcode')).toBeInTheDocument()
    expect(canvas.getByText('1234')).toBeInTheDocument()
    expect(canvas.getByText('Success!')).toBeInTheDocument()
  },
}

export const WithFunctionCallError: Story = {
  args: {
    content: [
      {
        id: '7',
        type: MessageContentType.FunctionCall,
        name: FunctionName.FillInput,
        status: FunctionStatus.Error,
        result: {
          success: false,
          error: 'Invalid selector',
        },
        arguments: {
          input_type: 'input',
          input_value: '1234',
          // eslint-disable-next-line sonarjs/code-eval
          input_selector: 'javascript:alert("test")',
          label_value: 'Postcode',
        },
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(await canvas.findByText('Error!')).toBeInTheDocument()
  },
}

export const WithFunctionInProgress: Story = {
  args: {
    content: [
      {
        id: '7',
        type: MessageContentType.FunctionCall,
        name: FunctionName.FillInput,
        status: FunctionStatus.Pending,
        arguments: {
          input_type: 'input',
          input_value: '1234',
          input_selector: '#postalcode',
          label_value: 'Postcode',
        },
      },
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByText('Postcode')).toBeInTheDocument()
    expect(canvas.getByText('1234')).toBeInTheDocument()
    expect(canvas.getByTitle('Executing...')).toBeInTheDocument()
  },
}

export const WithError: Story = {
  args: {
    content: [
      {
        id: '7',
        type: MessageContentType.OutputText,
        text: 'Hello! I can help you with various tasks. What would you like to know?',
      },
    ],
    error: 'Failed to get the response from the server. Please try again later.',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByText(/Failed to get the response/)).toBeInTheDocument()
  },
}

export const ErrorOnly: Story = {
  args: {
    content: [],
    error: 'Failed to get the response from the server. Please try again later.',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByText(/Failed to get the response/)).toBeInTheDocument()
  },
}
