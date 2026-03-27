import { useLocation } from 'react-router-dom'
import { Zap } from 'lucide-react'
import useCopilotStore from '../../store/useCopilotStore'

const titles = {
  '/dashboard':     'Dashboard',
  '/leads':         'Leads',
  '/opportunities': 'Opportunities',
  '/activities':    'Activities',
}

export default function TopBar() {
  const { pathname } = useLocation()
  const toggleOpen   = useCopilotStore(s => s.toggleOpen)

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
      <h2 className="text-lg font-semibold text-gray-800">
        {titles[pathname] ?? 'CRM'}
      </h2>
      <button
        onClick={toggleOpen}
        className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Zap size={15} />
        Ask Copilot
      </button>
    </header>
  )
}
