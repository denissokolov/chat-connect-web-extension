import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import Chat from './components/Chat/Chat'
import ThemeProvider from './components/providers/ThemeProvider'

import '@/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <Chat />
    </ThemeProvider>
  </StrictMode>,
)
