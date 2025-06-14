import { usePageContext } from '../../hooks/usePageContext'
import Shortcut from '../Shortcut/Shortcut'

export default function App() {
  const pageContext = usePageContext()
  return (
    <div className="p-4 bg-blue-50 h-full flex flex-col">
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
