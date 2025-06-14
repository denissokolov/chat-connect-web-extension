export enum Platform {
  Mac = 'mac',
  Win = 'win',
}

export function usePlatform() {
  const platform = navigator.userAgent.includes('Mac') ? Platform.Mac : Platform.Win
  return platform
}
