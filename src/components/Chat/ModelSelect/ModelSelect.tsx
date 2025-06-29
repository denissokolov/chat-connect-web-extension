import { memo, useCallback } from 'react'
import { Settings } from 'lucide-react'

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
    <Select value={model} onValueChange={handleValueChange}>
      <SelectTrigger
        className=" hover:border-gray-300 w-auto shadow-none gap-2 px-2 text-xs font-medium text-gray-700 rounded-lg bg-white cursor-pointer"
        id="model-select"
        aria-label="Select AI model"
      >
        <SelectValue placeholder={'Select a model'} />
      </SelectTrigger>
      <SelectContent className="shadow-none rounded-lg">
        {availableModels.map(i => (
          <SelectItem key={i} value={i} className="cursor-pointer">
            {getModelDisplayName(i)}
          </SelectItem>
        ))}
        <SelectSeparator />
        <SelectItem value="manage-keys" aria-label="Manage API Keys" className="cursor-pointer">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 flex h-3.5 w-3.5 items-center justify-center">
            <Settings className="h-4 w-4" />
          </span>
          {'Manage Keys'}
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

export default memo(ModelSelect)
