import { cn } from '@/utils/ui'
import Markdown from 'markdown-to-jsx'

const withForegroundText = {
  props: { className: 'text-foreground' },
}

const markdownOptions = {
  overrides: {
    h1: withForegroundText,
    h2: withForegroundText,
    h3: withForegroundText,
    p: withForegroundText,
    span: withForegroundText,
    strong: withForegroundText,
    li: withForegroundText,
    a: {
      props: {
        target: '_blank',
        rel: 'noopener noreferrer',
        className: 'underline text-primary hover:text-primary/90 transition-colors',
      },
    },
    code: {
      props: {
        className: 'text-muted-foreground',
      },
    },
  },
}

interface MarkdownMessageProps {
  text: string
  className?: string
}

function MarkdownMessage({ text, className }: MarkdownMessageProps) {
  return (
    <Markdown className={cn('prose text-foreground text-sm', className)} options={markdownOptions}>
      {text}
    </Markdown>
  )
}

export default MarkdownMessage
