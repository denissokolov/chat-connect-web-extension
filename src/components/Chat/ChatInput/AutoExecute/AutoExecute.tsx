import { memo } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import useChatStore from '@/stores/useChatStore'

function AutoExecute() {
  const { autoExecuteTools, setAutoExecuteTools } = useChatStore()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoExecuteTools(e.target.checked)
  }

  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="checkbox"
        id="auto-execute"
        checked={autoExecuteTools}
        onChange={handleChange}
        className="w-4 h-4"
      />
      <Label htmlFor="auto-execute" className="text-sm font-normal">
        {'Auto-run tools'}
      </Label>
    </div>
  )
}

export default memo(AutoExecute)
