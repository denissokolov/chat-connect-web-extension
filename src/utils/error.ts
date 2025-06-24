export function getStringError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (error instanceof String || typeof error === 'string') {
    return error.toString()
  }
  return 'Unknown error'
}
