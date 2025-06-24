import { Platform } from '@/types/types'

export function getPlatform() {
  const platform = navigator.userAgent.includes('Mac') ? Platform.Mac : Platform.Win
  return platform as Platform
}
