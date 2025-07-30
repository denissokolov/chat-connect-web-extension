import { useEffect } from 'react'
import type { Preview } from '@storybook/react-vite'

import '@/assets/global.css'

window['IS_STORYBOOK'] = true

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      toolbar: {
        title: 'Theme',
        items: [
          {
            value: 'light',
            icon: 'sun',
            title: 'Light',
          },
          {
            value: 'dark',
            icon: 'moon',
            title: 'Dark',
          },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [
    (story, context) => {
      const theme = context.globals.theme || 'light'
      useEffect(() => {
        document.body.classList.add(theme)
        return () => {
          document.body.classList.remove(theme)
        }
      }, [theme])
      return story()
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'error',
    },
  },
}

export default preview
