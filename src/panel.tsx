import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/components/App/App'
import BrowserProvider from '@/components/BrowserProvider/BrowserProvider'

import '@/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserProvider>
      <App />
    </BrowserProvider>
  </StrictMode>,
)
