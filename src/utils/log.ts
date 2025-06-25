/* eslint-disable no-console */

import { isTestEnv } from './env'

export function logError(message: string, error: unknown) {
  if (!isTestEnv()) {
    console.error(message, error)
  }
}
