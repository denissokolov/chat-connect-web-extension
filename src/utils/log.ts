/* eslint-disable no-console */

import { isDevEnv, isTestEnv } from './env'

export function logError(message: string, error: unknown) {
  if (!isTestEnv()) {
    console.error(message, error)
  }
}

export function logDebug(message: string, data: unknown) {
  if (isDevEnv()) {
    console.debug(message, data)
  }
}
