import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import SettingsPage from './components/SettingsPage/SettingsPage.tsx'
import './global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsPage />
  </StrictMode>,
)
