import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: ['src/panel.tsx', 'src/settings.tsx', 'src/background.ts', 'src/components/ui/**/*.tsx'],
  project: ['src/**/*.tsx', 'src/**/*.ts', 'src/**/*.css'],
  ignoreDependencies: ['tailwindcss', 'tw-animate-css'],
}

export default config
