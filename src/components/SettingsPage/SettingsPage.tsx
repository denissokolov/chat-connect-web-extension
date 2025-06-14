import { CheckCircleIcon } from '@heroicons/react/20/solid'
import { useState, useEffect } from 'react'

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
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{'Chat Connect Settings'}</h1>
          </div>
          <div className="space-y-6">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                {'OpenAI API Key'}
              </label>
              <input
                id="token"
                type="password"
                value={token}
                onChange={handleTokenChange}
                placeholder="Enter your API token"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              />
              <p className="text-sm text-gray-500 mt-1">
                {'Your token will be stored only in your browser. '}
                {'You can create an API key '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {'here'}
                </a>
                {'.'}
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                {saved && (
                  <div className="flex items-center text-green-600">
                    <CheckCircleIcon className="w-5 h-5 mr-1" />
                    {'Settings saved successfully!'}
                  </div>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={!token.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                {'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
