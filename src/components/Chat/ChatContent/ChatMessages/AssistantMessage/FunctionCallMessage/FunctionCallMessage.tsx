import { Button } from '@/components/ui/button'
import { FunctionName, type SingleFunctionCall } from '@/types/types'
import { PlayIcon } from 'lucide-react'

interface FunctionCallMessageProps {
  batch: SingleFunctionCall[]
}

const functionNameToLabel = {
  [FunctionName.FillInput]: 'Fill the input',
}

function FunctionCallMessage({ batch }: FunctionCallMessageProps) {
  return (
    <div className="rounded-lg p-3 bg-slate-700 text-slate-50 text-sm/normal my-2 space-y-2">
      {batch.map(item => {
        return (
          <div key={item.id}>
            {functionNameToLabel[item.name]}
            {item.name === FunctionName.FillInput && (
              <div>
                <span className="font-bold">{`${item.arguments.label_value}: `}</span>
                <span>{item.arguments.input_value}</span>
              </div>
            )}
          </div>
        )
      })}
      <div className="flex justify-end">
        <Button variant="secondary">
          <PlayIcon className="w-4 h-4" />
          <span>{'Execute'}</span>
        </Button>
      </div>
    </div>
  )
}

export default FunctionCallMessage
