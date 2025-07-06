import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import Chat from './components/Chat/Chat'
import ThemeProvider from './components/providers/ThemeProvider'

import '@/global.css'

export const Panel = () => {
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
  createRoot(root).render(<Panel />)
}
