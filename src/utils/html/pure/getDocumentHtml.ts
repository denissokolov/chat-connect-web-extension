import type { FunctionCallResult } from '@/types/tool.types'

export function getDocumentHtml(): FunctionCallResult {
  const isVisibleElement = (element: Element) => {
    if (element.hasAttribute('hidden')) {
      return false
    }

    if (typeof element.checkVisibility === 'function' && !element.checkVisibility()) {
      return false
    }

    const style = element.getAttribute('style')
    if (style) {
      const normalizedStyle = style.toLowerCase().replace(/\s+/g, '')
      if (
        normalizedStyle.includes('display:none') ||
        normalizedStyle.includes('visibility:hidden')
      ) {
        return false
      }
    }

    return true
  }

  const needToCopyNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return true
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return false
    }
    const element = node as Element

    const tagName = element.tagName.toLowerCase()
    if (['html', 'head', 'body', 'title'].includes(tagName)) {
      return true
    }
    if (['svg', 'script', 'style', 'link'].includes(tagName)) {
      return false
    }

    if (tagName === 'meta') {
      const name = element.getAttribute('name')
      const property = element.getAttribute('property')
      const keepPatterns = [
        'description',
        'keywords',
        'author',
        'twitter:',
        'og:',
        'article:',
        'fb:',
        'al:',
      ]
      return keepPatterns.some(
        pattern => (name && name.includes(pattern)) || (property && property.includes(pattern)),
      )
    }

    return element.isConnected && isVisibleElement(element)
  }

  const markChildrenToCopy = (originalNode: Node, elementsToCopy: WeakSet<Node>): void => {
    for (let i = 0; i < originalNode.childNodes.length; i++) {
      const child = originalNode.childNodes[i]
      if (needToCopyNode(child)) {
        elementsToCopy.add(child)
        markChildrenToCopy(child, elementsToCopy)
      }
    }
  }

  const clearClonedNode = (
    clonedNode: Node,
    originalNode: Node,
    elementsToCopy: WeakSet<Node>,
  ): void => {
    // Work backwards through children to avoid index issues when removing
    for (let i = clonedNode.childNodes.length - 1; i >= 0; i--) {
      const clonedChild = clonedNode.childNodes[i]
      const originalChild = originalNode.childNodes[i]

      if (!elementsToCopy.has(originalChild)) {
        clonedChild.remove()
      } else {
        if (clonedChild instanceof Element) {
          clonedChild.removeAttribute('style')
        }
        clearClonedNode(clonedChild, originalChild, elementsToCopy)
      }
    }
  }

  try {
    const nodesToCopy = new WeakSet<Node>([document.documentElement])

    markChildrenToCopy(document.documentElement, nodesToCopy)

    const documentClone = document.documentElement.cloneNode(true)

    clearClonedNode(documentClone, document.documentElement, nodesToCopy)

    return {
      success: true,
      result: (documentClone as Element).outerHTML,
    }
  } catch (error) {
    console.error(`ChatConnect: error getting document html`)
    console.error(error)
    return {
      success: false,
      error: error instanceof Error ? error.message : (error?.toString?.() ?? 'Unknown error'),
    }
  }
}
