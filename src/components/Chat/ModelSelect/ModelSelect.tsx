import { memo, useCallback } from 'react'
import { Settings } from 'lucide-react'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '@/components/ui/select'
import { AIModel } from '@/types/types'
import { getModelDisplayName } from '@/utils/provider'
import useChatStore from '@/stores/useChatStore'
import browser from '@/services/browser'

const availableModels = Object.values(AIModel)

function ModelSelect() {
  const setModel = useChatStore(state => state.setModel)
  const model = useChatStore(state => state.model)

  const handleValueChange = useCallback(
    (value: string) => {
      if (value === 'manage-keys') {
        browser.openExtensionSettings()
      } else {
        setModel(value as AIModel)
      }
    },
    [setModel],
  )

  return (
    <div className="p-4 border-b">
      <div className="flex items-center gap-2">
        <Label htmlFor="model-select">{'Model:'}</Label>
        <Select value={model} onValueChange={handleValueChange}>
          <SelectTrigger className="w-48" id="model-select">
            <SelectValue placeholder={'Select a model'} />
          </SelectTrigger>
          <SelectContent>
            {availableModels.map(i => (
              <SelectItem key={i} value={i}>
                {getModelDisplayName(i)}
              </SelectItem>
            ))}
            <SelectSeparator />
            <SelectItem value="manage-keys" aria-label="Manage API Keys">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 flex h-3.5 w-3.5 items-center justify-center">
                <Settings className="h-4 w-4" />
              </span>
              {'Manage Keys'}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default memo(ModelSelect)
