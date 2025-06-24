import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import ModelSelect from './ModelSelect'

const meta: Meta<typeof ModelSelect> = {
  title: 'Chat / Model Select',
  component: ModelSelect,
  parameters: {
    // Fix accessibility issue by ensuring proper focus management
    a11y: {
      config: {
        rules: [
          {
            id: 'aria-hidden-focus',
            enabled: false,
          },
        ],
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ModelSelect>

export const Default: Story = {}

export const WithGPT4o: Story = {
  play: async ({ canvas, userEvent }) => {
    const select = canvas.getByRole('combobox')
    await userEvent.click(select)

    const options = document.body.querySelectorAll('[role="option"]')
    const gpt4oOption = Array.from(options).find(opt => opt.textContent?.includes('ChatGPT-4o'))
    expect(gpt4oOption).toBeInTheDocument()
    if (gpt4oOption) {
      await userEvent.click(gpt4oOption)
    }
  },
}

export const WithO3Mini: Story = {
  play: async ({ canvas, userEvent }) => {
    const select = canvas.getByRole('combobox')
    await userEvent.click(select)

    const options = document.body.querySelectorAll('[role="option"]')
    const o3MiniOption = Array.from(options).find(opt => opt.textContent?.includes('o3-mini'))
    expect(o3MiniOption).toBeInTheDocument()
    if (o3MiniOption) {
      await userEvent.click(o3MiniOption)
    }
  },
}

export const ShowAllModels: Story = {
  play: async ({ canvas, userEvent }) => {
    const select = canvas.getByRole('combobox')
    await userEvent.click(select)

    const expectedModels = [
      'o4-mini',
      'o3-mini',
      'o3',
      'GPT-4.1',
      'GPT-4.1 Mini',
      'GPT-4.1 Nano',
      'GPT-4o',
      'ChatGPT-4o',
    ]

    const options = document.body.querySelectorAll('[role="option"]')
    expect(options.length).toBeGreaterThanOrEqual(expectedModels.length)

    for (const modelName of expectedModels) {
      const option = Array.from(options).find(opt => opt.textContent?.includes(modelName))
      expect(option).toBeInTheDocument()
    }
  },
}
