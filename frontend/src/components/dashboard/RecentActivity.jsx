import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, Mail, Users, FileText } from 'lucide-react'

const TYPE_META = {
  Call:    { icon: Phone,    iconCls: 'text-blue-600 bg-blue-50',       badgeCls: 'bg-blue-100 text-blue-700',       label: 'Call' },
  Email:   { icon: Mail,     iconCls: 'text-emerald-600 bg-emerald-50', badgeCls: 'bg-emerald-100 text-emerald-700', label: 'Email' },
  Meeting: { icon: Users,    iconCls: 'text-purple-600 bg-purple-50',   badgeCls: 'bg-purple-100 text-purple-700',   label: 'Meeting' },
  Note:    { icon: FileText, iconCls: 'text-amber-600 bg-amber-50',     badgeCls: 'bg-amber-100 text-amber-700',     label: 'Note' },
}

const TOOLTIP_HEIGHT = 170  // estimated px — used for flip-above logic

export default function RecentActivity({ activities = [] }) {
  const navigate = useNavigate()
  const [tooltip, setTooltip] = useState(null) // { activity, x, y }

  function handleMouseEnter(e, a) {
    const rect = e.currentTarget.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const top = spaceBelow >= TOOLTIP_HEIGHT + 8
      ? rect.bottom + 4           // show below
      : rect.top - TOOLTIP_HEIGHT - 4  // flip above
    // Keep tooltip within horizontal viewport
    const left = Math.min(rect.left, window.innerWidth - 296)
    setTooltip({ activity: a, top, left })
  }

  function handleMouseLeave() {
    setTooltip(null)
  }

  function goToActivity(id) {
    navigate('/activities', { state: { highlightId: id } })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-700 mb-3">Recent Activity</h3>
      {activities.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">No activities yet</p>
      ) : (
        <ul className="space-y-1">
          {activities.map(a => {
            const meta = TYPE_META[a.type] ?? TYPE_META.Note
            const Icon = meta.icon
            return (
              <li
                key={a.id}
                onClick={() => goToActivity(a.id)}
                onMouseEnter={e => handleMouseEnter(e, a)}
                onMouseLeave={handleMouseLeave}
                className="flex items-start gap-3 rounded-lg px-2 py-1.5 -mx-2 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <span className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${meta.iconCls}`}>
                  <Icon size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-800 line-clamp-1">{a.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {a.lead_name && <span>{a.lead_name} · </span>}
                    {new Date(a.activity_date).toLocaleDateString()}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {/* Fixed-position tooltip — rendered once, outside the list */}
      {tooltip && (() => {
        const a    = tooltip.activity
        const meta = TYPE_META[a.type] ?? TYPE_META.Note
        const Icon = meta.icon
        return (
          <div
            className="fixed z-50 w-72 bg-white border border-gray-200 rounded-xl shadow-xl p-3 pointer-events-none"
            style={{ top: tooltip.top, left: tooltip.left }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`p-1.5 rounded-lg ${meta.iconCls}`}><Icon size={13} /></span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.badgeCls}`}>
                {meta.label}
              </span>
            </div>
            {a.lead_name && (
              <p className="text-xs text-gray-600 mb-0.5">
                <span className="font-medium text-gray-500">Lead: </span>{a.lead_name}
              </p>
            )}
            {a.opportunity_title && (
              <p className="text-xs text-gray-600 mb-0.5">
                <span className="font-medium text-gray-500">Opportunity: </span>{a.opportunity_title}
              </p>
            )}
            <p className="text-xs text-gray-600 mb-0.5">
              <span className="font-medium text-gray-500">Description: </span>{a.description}
            </p>
            <p className="text-xs text-gray-600">
              <span className="font-medium text-gray-500">Date: </span>
              {new Date(a.activity_date).toLocaleString()}
            </p>
            <p className="text-xs text-blue-500 font-medium mt-2">Click to view in Activities →</p>
          </div>
        )
      })()}
    </div>
  )
}
