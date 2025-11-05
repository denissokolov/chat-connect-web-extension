import { cn } from '@/utils/ui'
import Markdown from 'markdown-to-jsx'

const markdownOptions = {
  overrides: {
    a: {
      props: {
        target: '_blank',
        rel: 'noopener noreferrer',
        className: 'underline text-primary hover:text-primary/90 transition-colors',
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
    <Markdown className={cn('prose text-sm', className)} options={markdownOptions}>
      {text}
    </Markdown>
  )
}

export default MarkdownMessage
