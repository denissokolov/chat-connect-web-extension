import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import Chat from '@/components/Chat/Chat'
import ThemeProvider from '@/components/providers/ThemeProvider'

import '@/assets/global.css'

export const SidePanel = () => {
  return (
    <StrictMode>
      <ThemeProvider>
        <Chat />
      </ThemeProvider>
    </StrictMode>
  )
}

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(<SidePanel />)
}
