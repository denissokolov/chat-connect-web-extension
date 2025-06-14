import { usePageContext } from '../../hooks/usePageContext'
import Shortcut from '../Shortcut/Shortcut'

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
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
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
