import { Cog6ToothIcon } from '@heroicons/react/24/outline'

import Shortcut from './Shortcut/Shortcut'

import { usePageContext } from '@/hooks/usePageContext'

export default function App() {
  const pageContext = usePageContext()

  const openSettings = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') })
  }

  return (
    <div className="p-4 bg-blue-50 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">{'Chat Connect'}</h1>
        <button
          onClick={openSettings}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-all duration-200"
          title="Open Settings"
        >
          <Cog6ToothIcon className="w-5 h-5" />
          <span className="sr-only">{'Open Settings'}</span>
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">{'Page Title'}</h2>
          <p className="text-sm text-gray-600 break-words bg-white p-2 rounded border">
            {pageContext?.title || 'No title'}
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">{'H1 Text'}</h2>
          <p className="text-sm text-gray-600 break-words bg-white p-2 rounded border">
            {pageContext?.h1 || 'No h1'}
          </p>
        </div>
      </div>
      <Shortcut className="mt-auto" />
    </div>
  )
}
