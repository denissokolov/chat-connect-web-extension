import { CheckCircle2Icon } from 'lucide-react'
import { useState, useEffect } from 'react'

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

export default function SettingsPage() {
  const [token, setToken] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    chrome.storage.sync.get('token', result => {
      if (result.token) {
        setToken(result.token)
      }
    })
  }, [])

  const handleSave = () => {
    chrome.storage.sync.set({ token }, () => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value)
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
                value={token}
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
            <Button onClick={handleSave} disabled={!token.trim()}>
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
