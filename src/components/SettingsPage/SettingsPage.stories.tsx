import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import SettingsPage from './SettingsPage'
import { BrowserContext, MockBrowser } from '@/services/Browser'

const meta: Meta<typeof SettingsPage> = {
  title: 'Settings / Settings Page',
  component: SettingsPage,
}

export default meta
type Story = StoryObj<typeof SettingsPage>

export const Default: Story = {}

const browserWithoutToken = new MockBrowser()
browserWithoutToken.getSecureValue = () => Promise.resolve(null)
export const Empty: Story = {
  decorators: [
    Story => {
      return (
        <BrowserContext.Provider value={browserWithoutToken}>
          <Story />
        </BrowserContext.Provider>
      )
    },
  ],
}

export const Saved: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('OpenAI API Key'), '1234567890')
    const button = canvas.getByText('Save Settings')
    await userEvent.click(button)
    await expect(canvas.getByText('Settings saved successfully!')).toBeInTheDocument()
  },
}
