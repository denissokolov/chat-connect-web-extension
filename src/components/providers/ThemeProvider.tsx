import { useEffect } from 'react'

type ThemeProviderProps = {
  children: React.ReactNode
}

function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      const root = window.document.documentElement

      root.classList.remove('light', 'dark')

      const systemTheme = mediaQuery.matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    }

    handleChange()

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return children
}

export default ThemeProvider
