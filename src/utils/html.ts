export function getH1Text(): string | null {
  const h1Element = document.querySelector('h1')
  return h1Element?.textContent?.trim() || null
}
