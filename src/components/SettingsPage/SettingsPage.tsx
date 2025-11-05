import { CheckCircle2Icon, AlertCircleIcon } from 'lucide-react'
import { useEffect } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import useChatStore from '@/stores/useChatStore'
import repository from '@/services/repository'
import { logError } from '@/utils/log'

import SettingsInput from './SettingsInput/SettingsInput'

export default function SettingsPage() {
  const { initSettings, updateSettingsForm, saveSettingsForm, settingsForm, settings } =
    useChatStore()

  useEffect(() => {
    initSettings()
  }, [initSettings])

  const historyEnabled = settingsForm.data?.historyEnabled ?? true
  const handleHistoryEnabledChange = (checked: boolean) => {
    updateSettingsForm({ historyEnabled: checked })
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await saveSettingsForm()
    if (!historyEnabled) {
      try {
        await repository.clearAllHistory()
      } catch (error) {
        logError('Failed to clear history', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-sidebar p-8">
      <form className="block max-w-2xl mx-auto" onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{'Chat Connect Settings'}</CardTitle>
            <CardDescription>
              {'Manage your keys and other settings for the extension.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <SettingsInput
                  id="openAIToken"
                  label="OpenAI API Key"
                  value={settingsForm.data?.openAIToken ?? ''}
                  disabled={settings.loading}
                  updateSettingsForm={updateSettingsForm}
                  sensitive={true}
                />
                <p className="text-sm text-muted-foreground">
                  {'Your token will be stored only in your browser. '}
                  {'You can create an API key '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {'here'}
                  </a>
                  {'.'}
                </p>
              </div>
              <div className="space-y-2">
                <SettingsInput
                  id="openAIServer"
                  label="Custom OpenAI Server URL"
                  value={settingsForm.data?.openAIServer ?? ''}
                  disabled={settings.loading}
                  updateSettingsForm={updateSettingsForm}
                  placeholder="Leave blank to use the official server."
                />
              </div>
              <div className="mt-8 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="historyEnabled"
                    checked={historyEnabled}
                    onCheckedChange={handleHistoryEnabledChange}
                    disabled={settings.loading}
                  />
                  <Label
                    htmlFor="historyEnabled"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {'Enable chat history'}
                  </Label>
                </div>
                {!historyEnabled && (
                  <p className="text-sm text-muted-foreground">
                    {
                      'Chat history is disabled. Your conversations will not be saved. Existing history will be deleted.'
                    }
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              type="submit"
              disabled={settingsForm.saving || !settingsForm.changed || settings.loading}
            >
              {'Save Settings'}
            </Button>
          </CardFooter>
        </Card>
        {(settings.error || settingsForm.saveError) && (
          <Alert className="mt-4" variant="destructive">
            <AlertCircleIcon />
            <AlertDescription>{settings.error || settingsForm.saveError}</AlertDescription>
          </Alert>
        )}
        {settingsForm.saved && (
          <Alert className="mt-4">
            <CheckCircle2Icon />
            <AlertDescription>{'Settings saved successfully!'}</AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  )
}
