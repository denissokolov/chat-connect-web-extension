import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import SettingsPage from './SettingsPage'
import useChatStore from '@/stores/useChatStore'
import { AIModel } from '@/types/provider.types'
import { Settings } from '@/types/settings.types'

const meta: Meta<typeof SettingsPage> = {
  title: 'Settings / Settings Page',
  component: SettingsPage,
}

export default meta
type Story = StoryObj<typeof SettingsPage>

const testSettings: Settings = {
  openAIToken: '1234567890',
  model: AIModel.OpenAI_GPT_5,
  autoExecuteTools: false,
}

export const Empty: Story = {
  beforeEach: () => {
    useChatStore.setState(useChatStore.getInitialState())
  },
}

export const Saved: Story = {
  beforeEach: () => {
    useChatStore.setState(useChatStore.getInitialState())
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('OpenAI API Key'), '1234567890')
    const button = canvas.getByText('Save Settings')
    await userEvent.click(button)
    await expect(canvas.getByText('Settings saved successfully!')).toBeInTheDocument()
  },
}

export const SaveError: Story = {
  beforeEach: () => {
    useChatStore.setState({
      ...useChatStore.getInitialState(),
      settings: {
        data: testSettings,
        ready: true,
        loading: false,
        error: null,
      },
      settingsForm: {
        saving: false,
        saved: false,
        data: testSettings,
        changed: true,
        saveError: 'Error saving settings',
      },
    })
  },
}

export const Saving: Story = {
  beforeEach: () => {
    useChatStore.setState({
      ...useChatStore.getInitialState(),
      settings: {
        data: testSettings,
        ready: true,
        loading: false,
        error: null,
      },
      settingsForm: {
        saving: true,
        saved: false,
        data: testSettings,
        changed: true,
        saveError: null,
      },
    })
  },
}

export const Loading: Story = {
  beforeEach: () => {
    useChatStore.setState({
      ...useChatStore.getInitialState(),
      settings: { ...useChatStore.getInitialState().settings, loading: true },
    })
  },
}

export const LoadingError: Story = {
  beforeEach: () => {
    useChatStore.setState({
      ...useChatStore.getInitialState(),
      settings: {
        ...useChatStore.getInitialState().settings,
        loading: true,
        error: 'Error loading settings',
      },
      settingsForm: {
        ...useChatStore.getInitialState().settingsForm,
        saving: false,
        saved: false,
        data: testSettings,
        changed: true,
        saveError: null,
      },
    })
  },
}

export const HiddenValue: Story = {
  beforeEach: () => {
    useChatStore.setState({
      ...useChatStore.getInitialState(),
      settings: {
        ready: true,
        loading: false,
        error: null,
        data: null,
      },
    })
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.clear(canvas.getByLabelText('OpenAI API Key'))
    await userEvent.type(canvas.getByLabelText('OpenAI API Key'), '1234567890')
    await expect(canvas.getByDisplayValue('1234567890')).toHaveAttribute('type', 'password')
  },
}

export const VisibleValue: Story = {
  beforeEach: () => {
    useChatStore.setState({
      ...useChatStore.getInitialState(),
      settings: {
        ready: true,
        loading: false,
        error: null,
        data: null,
      },
    })
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.clear(canvas.getByLabelText('OpenAI API Key'))
    await userEvent.type(canvas.getByLabelText('OpenAI API Key'), '1234567890')
    await userEvent.click(canvas.getByText('Show value'))
    await expect(canvas.getByDisplayValue('1234567890')).toHaveAttribute('type', 'text')
  },
}

export const LongValue: Story = {
  beforeEach: () => {
    useChatStore.setState({
      ...useChatStore.getInitialState(),
      settings: {
        ready: true,
        loading: false,
        error: null,
        data: null,
      },
      settingsForm: {
        changed: true,
        saving: false,
        saved: false,
        saveError: null,
        data: { ...testSettings, openAIToken: 'a'.repeat(500) },
      },
    })
  },
}
