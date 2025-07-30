import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import SettingsPage from '@/components/SettingsPage/SettingsPage'
import ThemeProvider from '@/components/providers/ThemeProvider'

import '@/assets/global.css'

export const Settings = () => {
  return (
    <StrictMode>
      <ThemeProvider>
        <SettingsPage />
      </ThemeProvider>
    </StrictMode>
  )
}

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(<Settings />)
}
