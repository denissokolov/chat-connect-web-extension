import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: [
    'src/entrypoints/**/*.tsx',
    'src/entrypoints/**/*.ts',
    'src/components/ui/**/*.tsx',
    '.storybook/vite.config.ts',
    'wxt.config.ts',
  ],
  ignoreDependencies: [
    'tailwindcss',
    '@tailwindcss/typography',
    'tw-animate-css',
    '@wxt-dev/module-react',
  ],
  paths: {
    '#imports': ['.wxt/types/imports-module.d.ts'],
  },
}

export default config
