import { useEffect, useRef, useState } from 'react'
import { Phone, Mail, Users, FileText, Trash2 } from 'lucide-react'

const TYPE_META = {
  Call:    { icon: Phone,    iconCls: 'text-blue-600 bg-blue-50',       badgeCls: 'bg-blue-100 text-blue-700',       label: 'Call' },
  Email:   { icon: Mail,     iconCls: 'text-emerald-600 bg-emerald-50', badgeCls: 'bg-emerald-100 text-emerald-700', label: 'Email' },
  Meeting: { icon: Users,    iconCls: 'text-purple-600 bg-purple-50',   badgeCls: 'bg-purple-100 text-purple-700',   label: 'Meeting' },
  Note:    { icon: FileText, iconCls: 'text-amber-600 bg-amber-50',     badgeCls: 'bg-amber-100 text-amber-700',     label: 'Note' },
}

export default function ActivityList({ activities, onDelete, highlightId, hasFilters }) {
  const itemRefs  = useRef({})
  const [active, setActive] = useState(highlightId)

  useEffect(() => {
    if (!highlightId || !itemRefs.current[highlightId]) return
    itemRefs.current[highlightId].scrollIntoView({ behavior: 'smooth', block: 'center' })
    setActive(highlightId)
    const t = setTimeout(() => setActive(null), 2500)
    return () => clearTimeout(t)
  }, [activities, highlightId])

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
        <p className="text-gray-400 text-sm">
          {hasFilters ? 'No activities match the selected type.' : 'No activities logged yet.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {activities.map(a => {
        const meta = TYPE_META[a.type] ?? TYPE_META.Note
        const Icon = meta.icon
        const isHighlighted = active === a.id

        return (
          <div
            key={a.id}
            ref={el => { itemRefs.current[a.id] = el }}
            className={`rounded-xl border p-4 flex items-start gap-4 transition-colors duration-700 ${
              isHighlighted
                ? 'bg-yellow-50 border-yellow-300'
                : 'bg-white border-gray-200'
            }`}
          >
            <span className={`p-2 rounded-lg shrink-0 mt-0.5 ${meta.iconCls}`}>
              <Icon size={16} />
            </span>

            <div className="flex-1 min-w-0">
              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${meta.badgeCls}`}>
                {meta.label}
              </span>

              {(a.lead_name || a.opportunity_title) && (
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-600 mb-1.5">
                  {a.lead_name && (
                    <span><span className="font-medium text-gray-500">Lead: </span>{a.lead_name}</span>
                  )}
                  {a.opportunity_title && (
                    <span><span className="font-medium text-gray-500">Opportunity: </span>{a.opportunity_title}</span>
                  )}
                </div>
              )}

              <p className="text-sm text-gray-800">
                <span className="text-xs font-medium text-gray-500">Description: </span>
                {a.description}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                <span className="font-medium text-gray-500">Date: </span>
                {new Date(a.activity_date).toLocaleString()}
              </p>
            </div>

            <button
              onClick={() => onDelete(a)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
