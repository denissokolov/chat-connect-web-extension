import { memo } from 'react'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AIModel } from '@/types/types'
import { getModelDisplayName } from '@/utils/provider'
import useChatStore from '@/stores/useChatStore'

const availableModels = Object.values(AIModel)

function ModelSelect() {
  const setModel = useChatStore(state => state.setModel)
  const model = useChatStore(state => state.model)

  return (
    <div className="p-4 border-b">
      <div className="flex items-center gap-2">
        <Label htmlFor="model-select">{'Model:'}</Label>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="w-48" id="model-select">
            <SelectValue placeholder={'Select a model'} />
          </SelectTrigger>
          <SelectContent>
            {availableModels.map(i => (
              <SelectItem key={i} value={i}>
                {getModelDisplayName(i)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default memo(ModelSelect)
