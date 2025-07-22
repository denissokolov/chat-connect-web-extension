export function getPlatform() {
  return navigator.userAgent.includes('Mac') ? 'mac' : 'win'
}
