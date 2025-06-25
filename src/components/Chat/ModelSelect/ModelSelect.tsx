import { memo } from 'react'
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

  const handleValueChange = (value: string) => {
    if (value === 'manage-keys') {
      browser.openExtensionSettings()
    } else {
      setModel(value as AIModel)
    }
  }

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
            <SelectItem value="manage-keys">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                {'Manage Keys'}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default memo(ModelSelect)
