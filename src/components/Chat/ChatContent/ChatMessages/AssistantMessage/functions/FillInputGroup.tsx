import { memo, useCallback, useState, useEffect, useRef } from 'react'
import { PlayIcon, CheckIcon, CircleAlertIcon, Loader2 } from 'lucide-react'

import { type FillInputArguments } from '@/types/tool.types'
import { type FunctionCallResult, FunctionStatus } from '@/types/tool.types'
import browser from '@/services/browser'
import { sanitizeSelector } from '@/utils/html/sanitizeSelector'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/ui'

interface FillInputItem {
  id: string
  args: FillInputArguments
  status: FunctionStatus
  error?: string | null
}

interface FillInputGroupProps {
  items: FillInputItem[]
  messageId: string
  saveResult: (messageId: string, callId: string, result: FunctionCallResult) => Promise<void>
  autoExecute: boolean
}

// Helper: execute a single fill operation (moves conditional out of component to reduce complexity)
function executeFillInput(item: FillInputItem): Promise<FunctionCallResult> {
  const sanitizedSelector = sanitizeSelector(item.args.input_selector)
  if (!sanitizedSelector) return Promise.resolve({ success: false, error: 'Invalid selector' })
  return browser.setFieldValue(sanitizedSelector, item.args.input_value)
}

// Helper: decide content for the group action button
type GroupState = 'executing' | 'success' | 'error' | 'idle'
function getGroupState(
  executingAll: boolean,
  allSuccess: boolean,
  hasError: boolean,
  hasIdleItems: boolean,
): GroupState {
  if (executingAll) return 'executing'
  if (allSuccess) return 'success'
  if (hasError && !hasIdleItems) return 'error'
  return 'idle'
}

function renderGroupContent(state: GroupState) {
  switch (state) {
    case 'executing':
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{'Filling all fields...'}</span>
        </>
      )
    case 'success':
      return (
        <>
          <CheckIcon className="w-4 h-4" />
          <span>{'All fields filled!'}</span>
        </>
      )
    case 'error':
      return (
        <>
          <CircleAlertIcon className="w-4 h-4" />
          <span>{'Some fields failed'}</span>
        </>
      )
    default:
      return (
        <>
          <PlayIcon className="w-4 h-4" />
          <span>{'Fill all'}</span>
        </>
      )
  }
}

// Helper: decide the right-side control for each item row
function renderItemStatusControl(
  item: FillInputItem,
  isExecutingAll: boolean,
  isAnyExecuting: boolean,
  isExecutingItem: boolean,
  onExecute: () => void,
) {
  if (item.status === FunctionStatus.Success) {
    return <CheckIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
  }
  if (item.status === FunctionStatus.Error) {
    return <CircleAlertIcon className="w-4 h-4 text-destructive" />
  }
  if (item.status === FunctionStatus.Pending || isExecutingItem) {
    return <Loader2 className="w-4 h-4 animate-spin" />
  }
  if (isExecutingAll || isAnyExecuting) {
    return null
  }
  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn('h-8 w-8 transition-opacity opacity-0 group-hover:opacity-100')}
      onClick={onExecute}
    >
      <PlayIcon className="w-4 h-4" />
    </Button>
  )
}

function FillInputGroup({ items, messageId, saveResult, autoExecute }: FillInputGroupProps) {
  const [executingAll, setExecutingAll] = useState(false)
  const [executingItemId, setExecutingItemId] = useState<string | null>(null)
  const autoExecuted = useRef(false)

  const executeSingle = useCallback(
    async (item: FillInputItem) => {
      setExecutingItemId(item.id)
      const result = await executeFillInput(item)
      await saveResult(messageId, item.id, result)
      setExecutingItemId(null)
    },
    [messageId, saveResult],
  )

  const executeAll = useCallback(async () => {
    setExecutingAll(true)

    const promises = items
      .filter(item => item.status === FunctionStatus.Idle)
      .map(async item => {
        const result = await executeFillInput(item)
        await saveResult(messageId, item.id, result)
      })

    await Promise.all(promises)
    setExecutingAll(false)
  }, [items, messageId, saveResult])

  const hasIdleItems = items.some(item => item.status === FunctionStatus.Idle)
  const allSuccess = items.every(item => item.status === FunctionStatus.Success)
  const hasError = items.some(item => item.status === FunctionStatus.Error)

  // Auto-execute all fields when component mounts if autoExecute is true
  useEffect(() => {
    if (autoExecute && hasIdleItems && !autoExecuted.current) {
      autoExecuted.current = true
      executeAll()
    }
  }, [autoExecute, hasIdleItems, executeAll])

  const isAnyExecuting = executingItemId !== null
  const groupState = getGroupState(executingAll, allSuccess, hasError, hasIdleItems)

  return (
    <div className="my-2 rounded-lg border overflow-hidden">
      {/* Individual Fill Items */}
      {items.map(item => (
        <div key={item.id} className="relative group">
          <div
            className={cn(
              'p-2 text-sm/normal space-y-1 border-b',
              item.status === FunctionStatus.Success &&
                'border-green-500/50 bg-green-50/50 dark:bg-green-950/20',
              item.status === FunctionStatus.Error && 'border-destructive/50 bg-destructive/10',
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-1">
                <div className="text-muted-foreground">{item.args.label_value}</div>
                <div className="font-medium">{item.args.input_value}</div>
              </div>

              {/* Status indicator or hover button */}
              <div className="flex items-center">
                {renderItemStatusControl(
                  item,
                  executingAll,
                  isAnyExecuting,
                  executingItemId === item.id,
                  () => executeSingle(item),
                )}
              </div>
            </div>

            {item.error && <p className="text-xs text-destructive mt-1">{item.error}</p>}
          </div>
        </div>
      ))}

      {(hasIdleItems || executingAll) && (
        <div className="p-2">
          <Button variant="default" className="w-full" onClick={executeAll}>
            {renderGroupContent(groupState)}
          </Button>
        </div>
      )}
    </div>
  )
}

export default memo(FillInputGroup)
