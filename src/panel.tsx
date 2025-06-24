import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import Chat from './components/Chat/Chat'

import '@/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Chat />
  </StrictMode>,
)
