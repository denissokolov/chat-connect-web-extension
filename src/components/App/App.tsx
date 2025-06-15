import { BoltIcon } from 'lucide-react'

import Shortcut from './Shortcut/Shortcut'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePageContext } from '@/hooks/usePageContext'

export default function App() {
  const pageContext = usePageContext()

  const openSettings = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') })
  }

  return (
    <div className="p-4 bg-gray-50 h-full flex flex-col space-y-4">
      <div className="space-y-4 flex-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{'Page Title'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground break-words">
              {pageContext?.title || 'No title'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{'H1 Text'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground break-words">
              {pageContext?.h1 || 'No h1'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex">
        <Button variant="ghost" size="icon" onClick={openSettings} title="Open Settings">
          <BoltIcon className="w-5 h-5" />
          <span className="sr-only">{'Open Settings'}</span>
        </Button>
        <Shortcut className="ml-auto" />
      </div>
    </div>
  )
}
