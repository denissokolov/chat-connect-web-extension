export function getH1Text(): string | null {
  const h1Elements = document.querySelectorAll('h1')

  for (const h1 of h1Elements) {
    const style = window.getComputedStyle(h1)
    const rect = h1.getBoundingClientRect()

    const isVisible =
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      rect.width > 1 &&
      rect.height > 1

    if (isVisible) {
      return (h1.textContent || h1.innerText).trim() || null
    }
  }

  return null
}

export function cleanHtmlContent(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Remove all script tags
  const scripts = doc.querySelectorAll('script')
  scripts.forEach(script => script.remove())

  // Remove all style tags
  const styles = doc.querySelectorAll('style')
  styles.forEach(style => style.remove())

  // Remove all link tags (stylesheets, fonts, script preloads, etc.)
  const links = doc.querySelectorAll('link')
  links.forEach(link => link.remove())

  // Remove all SVG elements
  const svgs = doc.querySelectorAll('svg')
  svgs.forEach(svg => svg.remove())

  // Remove only technical meta tags, preserve content-related ones
  const metas = doc.querySelectorAll('meta')
  metas.forEach(meta => {
    const name = meta.getAttribute('name')
    const property = meta.getAttribute('property')

    // Keep important content/SEO meta tags
    const keepPatterns = [
      'description',
      'keywords',
      'author',
      'robots',
      'twitter:',
      'og:',
      'article:',
      'fb:',
      'al:',
      'msapplication-',
    ]

    const shouldKeep = keepPatterns.some(
      pattern => (name && name.includes(pattern)) || (property && property.includes(pattern)),
    )

    // Remove technical/layout meta tags
    if (!shouldKeep) {
      meta.remove()
    }
  })

  // Remove inline style attributes from all elements
  const allElements = doc.querySelectorAll('*')
  allElements.forEach(element => {
    element.removeAttribute('style')
  })

  return doc.documentElement.outerHTML
}
