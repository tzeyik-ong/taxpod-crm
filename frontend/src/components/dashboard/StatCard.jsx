import { Info } from 'lucide-react'
import clsx from 'clsx'

const colorMap = {
  blue:    'bg-blue-50 text-blue-600',
  indigo:  'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber:   'bg-amber-50 text-amber-600',
}

export default function StatCard({ icon: Icon, label, value, color = 'blue', info }) {
  return (
    <div className="relative bg-white rounded-xl border border-gray-200 p-5">
      {info && (
        <div className="absolute top-3 right-3 group">
          <Info size={14} className="text-gray-300 hover:text-gray-500 cursor-help" />
          <div className="absolute right-0 top-5 w-52 bg-gray-800 text-white text-xs rounded-lg p-2.5 hidden group-hover:block z-10 shadow-lg leading-relaxed">
            {info}
          </div>
        </div>
      )}
      <div className={clsx('inline-flex p-2.5 rounded-lg mb-3', colorMap[color])}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
