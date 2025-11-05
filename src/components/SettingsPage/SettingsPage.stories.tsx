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
  openAIServer: '',
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

export const HistoryEnabled: Story = {
  beforeEach: () => {
    useChatStore.setState({
      ...useChatStore.getInitialState(),
      settings: {
        ready: true,
        loading: false,
        error: null,
        data: { ...testSettings, historyEnabled: true },
      },
      settingsForm: {
        saving: false,
        saved: false,
        saveError: null,
        changed: false,
        data: { ...testSettings, historyEnabled: true },
      },
    })
  },
  play: async ({ canvas }) => {
    const checkbox = canvas.getByLabelText('Enable chat history')
    await expect(checkbox).toBeChecked()
    await expect(canvas.queryByText(/conversations will not be saved/)).not.toBeInTheDocument()
  },
}

export const HistoryDisabled: Story = {
  beforeEach: () => {
    useChatStore.setState({
      ...useChatStore.getInitialState(),
      settings: {
        ready: true,
        loading: false,
        error: null,
        data: { ...testSettings, historyEnabled: false },
      },
      settingsForm: {
        saving: false,
        saved: false,
        saveError: null,
        changed: false,
        data: { ...testSettings, historyEnabled: false },
      },
    })
  },
  play: async ({ canvas }) => {
    const checkbox = canvas.getByLabelText('Enable chat history')
    await expect(checkbox).not.toBeChecked()
    await expect(
      canvas.getByText(/Chat history is disabled. Your conversations will not be saved./),
    ).toBeInTheDocument()
  },
}

export const ToggleHistory: Story = {
  beforeEach: () => {
    useChatStore.setState({
      ...useChatStore.getInitialState(),
      settings: {
        ready: true,
        loading: false,
        error: null,
        data: { ...testSettings, historyEnabled: true },
      },
      settingsForm: {
        saving: false,
        saved: false,
        saveError: null,
        changed: false,
        data: { ...testSettings, historyEnabled: true },
      },
    })
  },
  play: async ({ canvas, userEvent }) => {
    const checkbox = canvas.getByLabelText('Enable chat history')
    await expect(checkbox).toBeChecked()

    await userEvent.click(checkbox)

    await expect(checkbox).not.toBeChecked()
    await expect(
      canvas.getByText(/Chat history is disabled. Your conversations will not be saved./),
    ).toBeInTheDocument()

    await userEvent.click(checkbox)

    await expect(checkbox).toBeChecked()
    await expect(canvas.queryByText(/conversations will not be saved/)).not.toBeInTheDocument()
  },
}
