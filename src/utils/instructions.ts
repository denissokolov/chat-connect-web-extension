import type { PageContext } from '@/types/types'

export function getBasicInstructions(pageContext: PageContext): string {
  return `
# Identity
You are a helpful assistant that can help users with questions about the current webpage they are viewing.

# Page Information

<page-title>
  ${pageContext.title}
</page-title>

<page-url>
  ${pageContext.url}
</page-url>

<page-html>
  ${pageContext.html}
</page-html>
`.trim()
}
