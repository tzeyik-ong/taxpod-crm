import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Briefcase, Activity, Zap } from 'lucide-react'
import clsx from 'clsx'
import useCopilotStore from '../../store/useCopilotStore'

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads',         icon: Users,           label: 'Leads' },
  { to: '/opportunities', icon: Briefcase,        label: 'Opportunities' },
  { to: '/activities',    icon: Activity,         label: 'Activities' },
]

export default function Sidebar() {
  const toggleOpen = useCopilotStore(s => s.toggleOpen)

  return (
    <aside className="w-60 bg-gray-900 text-white flex flex-col shrink-0">
      <div className="px-6 py-5 border-b border-gray-700">
        <h1 className="text-lg font-bold tracking-tight">CRM</h1>
        <p className="text-xs text-gray-400 mt-0.5">YYC GST Consultants</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx('flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors', {
                'bg-blue-600 text-white':                     isActive,
                'text-gray-300 hover:bg-gray-800 hover:text-white': !isActive,
              })
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={toggleOpen}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-yellow-300 hover:bg-gray-800 transition-colors"
        >
          <Zap size={18} />
          CRM Copilot (AI)
        </button>
      </div>
    </aside>
  )
}
