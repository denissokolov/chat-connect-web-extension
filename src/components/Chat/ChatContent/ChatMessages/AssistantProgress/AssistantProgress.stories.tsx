import type { Meta, StoryObj } from '@storybook/react-vite'

import AssistantProgress from './AssistantProgress'
import { expect } from 'storybook/test'

const meta: Meta<typeof AssistantProgress> = {
  title: 'Chat / Assistant Progress',
  component: AssistantProgress,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof AssistantProgress>

export const Default: Story = {
  play: ({ canvasElement }) => {
    const loadingDots = canvasElement.querySelectorAll('.animate-bounce')
    expect(loadingDots).toHaveLength(3)
  },
}
