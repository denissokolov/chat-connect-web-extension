export function isTestEnv(): boolean {
  return (
    process.env.NODE_ENV === 'test' ||
    (typeof import.meta !== 'undefined' && 'vitest' in import.meta)
  )
}

export function isStorybookEnv(): boolean {
  return typeof process !== 'undefined' && process.env.STORYBOOK_ENV !== undefined
}
