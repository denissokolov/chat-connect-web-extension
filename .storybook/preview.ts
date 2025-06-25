import type { Preview } from '@storybook/react-vite'

import '@/global.css'

window['IS_STORYBOOK'] = true

const preview: Preview = {
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
