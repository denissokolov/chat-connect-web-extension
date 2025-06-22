import { CheckCircle2Icon } from 'lucide-react'
import { useState, useEffect, useContext } from 'react'

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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BrowserContext } from '@/services/Browser'
import { AIProvider } from '@/types/chat.types'
import { getTokenKey } from '@/utils/token'

const openAITokenKey = getTokenKey(AIProvider.OpenAI)

export default function SettingsPage() {
  const browser = useContext(BrowserContext)

  const [openAIToken, setOpenAIToken] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    browser.getSecureValue(openAITokenKey).then(token => {
      if (token) {
        setOpenAIToken(token)
      }
    })
  }, [browser])

  const handleSave = async () => {
    await browser.saveSecureValue(openAITokenKey, openAIToken)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpenAIToken(e.target.value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{'Chat Connect Settings'}</CardTitle>
            <CardDescription>
              {'Manage your keys and other settings for the extension.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="token">{'OpenAI API Key'}</Label>
              <Input
                id="token"
                type="password"
                value={openAIToken}
                onChange={handleTokenChange}
                placeholder="Enter your API token"
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
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={handleSave} disabled={!openAIToken.trim()}>
              {'Save Settings'}
            </Button>
          </CardFooter>
        </Card>
        {saved && (
          <Alert className="mt-4">
            <CheckCircle2Icon />
            <AlertDescription>{'Settings saved successfully!'}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
