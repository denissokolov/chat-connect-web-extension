/* eslint-disable no-console */

import { isDevEnv, isTestEnv } from './env'

export function logError(message: string, error?: unknown) {
  if (!isTestEnv()) {
    if (error) {
      console.error(message, error)
    } else {
      console.error(message)
    }
  }
}

export function logDebug(message: string, data?: unknown) {
  if (isDevEnv()) {
    if (data) {
      console.debug(message, data)
    } else {
      console.debug(message)
    }
  }
}
