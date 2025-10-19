import { memo, useState } from 'react'
import { EyeOffIcon, EyeIcon } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Settings } from '@/types/settings.types'

const MAX_LENGTH = 500

type SettingsInputProps = {
  id: keyof Settings
  label: string
  value: string
  disabled: boolean
  updateSettingsForm: (settings: Partial<Settings>) => void
  sensitive?: boolean
  placeholder?: string
}

function SettingsInput({
  id,
  label,
  value,
  disabled,
  updateSettingsForm,
  sensitive,
  placeholder,
}: SettingsInputProps) {
  const [showValue, setShowValue] = useState(!sensitive)

  const toggleShowValue = () => setShowValue(show => !show)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    updateSettingsForm({ [id]: e.target.value })

  return (
    <>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={!sensitive || showValue ? 'text' : 'password'}
          autoComplete="off"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="pr-10"
          maxLength={MAX_LENGTH}
          placeholder={placeholder}
        />
        {sensitive && value.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={toggleShowValue}
            disabled={disabled}
          >
            {showValue ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            <span className="sr-only">{showValue ? 'Hide value' : 'Show value'}</span>
          </Button>
        )}
      </div>
      {value.length >= MAX_LENGTH && (
        <p className="text-sm text-yellow-600">
          {'Value is too long. Please verify it is correct.'}
        </p>
      )}
    </>
  )
}

export default memo(SettingsInput)
