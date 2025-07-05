import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import SettingsPage from '@/components/SettingsPage/SettingsPage'
import ThemeProvider from '@/components/providers/ThemeProvider'

import '@/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <SettingsPage />
    </ThemeProvider>
  </StrictMode>,
)
