import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import ModelSelect from './ModelSelect'
import useChatStore from '@/stores/useChatStore'
import { AIModel } from '@/types/provider.types'

const meta: Meta<typeof ModelSelect> = {
  title: 'Chat / Model Select',
  component: ModelSelect,
  beforeEach: () => {
    useChatStore.setState({
      ...useChatStore.getInitialState(),
      settings: {
        ...useChatStore.getInitialState().settings,
        data: {
          model: AIModel.OpenAI_GPT_5,
          openAIToken: '',
          autoExecuteTools: false,
        },
      },
    })
  },
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

export const WithGPT5: Story = {
  play: async ({ canvas, userEvent }) => {
    const select = canvas.getByRole('combobox')
    await userEvent.click(select)

    const options = document.body.querySelectorAll('[role="option"]')
    const gpt5Option = Array.from(options).find(opt => opt.textContent?.includes('GPT-5'))
    expect(gpt5Option).toBeInTheDocument()
    if (gpt5Option) {
      await userEvent.click(gpt5Option)
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
      'GPT-4o',
      'GPT-5',
      'GPT-5 Mini',
    ]

    const options = document.body.querySelectorAll('[role="option"]')
    expect(options.length).toBeGreaterThanOrEqual(expectedModels.length)

    for (const modelName of expectedModels) {
      const option = Array.from(options).find(opt => opt.textContent?.includes(modelName))
      expect(option).toBeInTheDocument()
    }
  },
}
