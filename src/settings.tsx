import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import BrowserProvider from '@/components/BrowserProvider/BrowserProvider'
import SettingsPage from '@/components/SettingsPage/SettingsPage'

import '@/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserProvider>
      <SettingsPage />
    </BrowserProvider>
  </StrictMode>,
)
