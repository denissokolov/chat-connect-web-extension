import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import ChatHistory from './ChatHistory'

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

export const Default: Story = {
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

export const EmptyState: Story = {
  play: async ({ canvas }) => {
    // Verify the empty state layout
    const heading = canvas.getByRole('heading', { level: 3 })
    await expect(heading).toHaveTextContent('No chats yet')

    // Check styling classes are applied correctly
    const container = canvas.getByText('No chats yet').closest('div')
    await expect(container).toHaveClass('space-y-2')

    // Verify the description text
    const description = canvas.getByText(/Your chat history will appear here/)
    await expect(description).toBeInTheDocument()
    await expect(description).toHaveClass('text-sm', 'text-muted-foreground', 'max-w-sm')
  },
}
