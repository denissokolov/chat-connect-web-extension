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

export const Empty: Story = {
  decorators: [
    Story => {
      const browser = new MockBrowser()
      browser.getSecureValue = () => Promise.resolve(null)
      return (
        <BrowserContext.Provider value={browser}>
          <Story />
        </BrowserContext.Provider>
      )
    },
  ],
}

export const Saved: Story = {
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByText('Save Settings')
    await userEvent.click(button)
    await expect(canvas.getByText('Settings saved successfully!')).toBeInTheDocument()
  },
}
