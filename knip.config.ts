import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: ['src/panel.tsx', 'src/settings.tsx', 'src/background.ts', 'src/components/ui/**/*.tsx'],
  project: ['src/**/*.tsx', 'src/**/*.ts', 'src/**/*.css'],
  ignoreDependencies: [
    'tailwindcss',
    '@tailwindcss/typography',
    'tw-animate-css',
    'playwright',
    '@vitest/coverage-v8',
    '@testing-library/react',
  ],
}

export default config
