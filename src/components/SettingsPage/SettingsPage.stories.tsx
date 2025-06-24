import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import SettingsPage from './SettingsPage'

const meta: Meta<typeof SettingsPage> = {
  title: 'Settings / Settings Page',
  component: SettingsPage,
}

export default meta
type Story = StoryObj<typeof SettingsPage>

export const Default: Story = {}

export const Saved: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('OpenAI API Key'), '1234567890')
    const button = canvas.getByText('Save Settings')
    await userEvent.click(button)
    await expect(canvas.getByText('Settings saved successfully!')).toBeInTheDocument()
  },
}
