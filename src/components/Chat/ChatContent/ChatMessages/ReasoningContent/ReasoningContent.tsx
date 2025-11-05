import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'
import { memo, useState } from 'react'

import MarkdownMessage from '@/components/Chat/ChatContent/ChatMessages/MarkdownMessage/MarkdownMessage'

interface ReasoningContentProps {
  summaryText: string
  detailText?: string
  initiallyExpanded?: boolean
}

function ReasoningContent({
  summaryText,
  detailText,
  initiallyExpanded = false,
}: ReasoningContentProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded)

  const handleToggle = () => {
    if (detailText) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <div
      className={detailText ? 'cursor-pointer' : ''}
      onClick={handleToggle}
      onKeyDown={e => {
        if (detailText && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handleToggle()
        }
      }}
      role={detailText ? 'button' : undefined}
      tabIndex={detailText ? 0 : undefined}
      aria-expanded={detailText ? isExpanded : undefined}
    >
      <div className="flex items-start gap-2">
        {detailText && (
          <div className="mt-0.5 shrink-0">
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        )}
        <MarkdownMessage text={summaryText} className="mb-2 prose-muted prose-sm" />
      </div>

      {isExpanded && detailText && (
        <div className="mt-1 pt-3 border-t border-border">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {'Detailed Reasoning'}
          </div>
          <MarkdownMessage text={detailText} className="mb-2 prose-muted prose-sm" />
        </div>
      )}
    </div>
  )
}

export default memo(ReasoningContent)
