import { Pencil, Trash2 } from 'lucide-react'
import clsx from 'clsx'

const STATUS_BADGE = {
  Lead:     'bg-blue-100 text-blue-700',
  Prospect: 'bg-indigo-100 text-indigo-700',
  Customer: 'bg-emerald-100 text-emerald-700',
}

export default function LeadList({ leads, onEdit, onDelete, hasFilters }) {
  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
        <p className="text-gray-400 text-sm">
          {hasFilters ? 'No leads match your search or filter.' : 'No leads yet. Create one to get started.'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leads.map(lead => (
            <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-800">{lead.name}</td>
              <td className="px-4 py-3 text-gray-600">{lead.company || '—'}</td>
              <td className="px-4 py-3 text-gray-600">{lead.email || '—'}</td>
              <td className="px-4 py-3 text-gray-600">{lead.phone || '—'}</td>
              <td className="px-4 py-3">
                <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_BADGE[lead.status])}>
                  {lead.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(lead)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(lead)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
