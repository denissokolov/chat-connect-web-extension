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
import useChatStore from '@/stores/useChatStore'
import SettingsInput from './SettingsInput/SettingsInput'

export default function SettingsPage() {
  const { initSettings, updateSettingsForm, saveSettingsForm, settingsForm, settings } =
    useChatStore()

  useEffect(() => {
    initSettings()
  }, [initSettings])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    saveSettingsForm()
  }

  return (
    <div className="min-h-screen bg-sidebar p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{'Chat Connect Settings'}</CardTitle>
            <CardDescription>
              {'Manage your keys and other settings for the extension.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-2" onSubmit={onSubmit}>
              <SettingsInput
                id="openAIToken"
                label="OpenAI API Key"
                value={settingsForm.data?.openAIToken ?? ''}
                disabled={settings.loading}
                updateSettingsForm={updateSettingsForm}
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
            </form>
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              onClick={saveSettingsForm}
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
      </div>
    </div>
  )
}
