import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { leadsApi, opportunitiesApi } from '../../api/client'

const TYPES = ['Call', 'Email', 'Meeting', 'Note']
const EMPTY = { type: 'Call', description: '', activity_date: '', lead_id: '', opportunity_id: '' }

function todayISO() {
  return new Date().toISOString().slice(0, 16)
}

export default function ActivityForm({ onSave, onClose, prefillLeadId, prefillOppId }) {
  const [form, setForm]   = useState({ ...EMPTY, activity_date: todayISO() })
  const [leads, setLeads] = useState([])
  const [opps,  setOpps]  = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    leadsApi.getAll().then(r => setLeads(r.data)).catch(console.error)
    opportunitiesApi.getAll().then(r => setOpps(r.data)).catch(console.error)
    if (prefillLeadId)  setForm(f => ({ ...f, lead_id: prefillLeadId }))
    if (prefillOppId)   setForm(f => ({ ...f, opportunity_id: prefillOppId }))
  }, [prefillLeadId, prefillOppId])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.description.trim()) { setError('Description is required'); return }
    onSave({
      ...form,
      lead_id:        form.lead_id        || null,
      opportunity_id: form.opportunity_id || null,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Log Activity</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date & Time</label>
              <input
                name="activity_date"
                type="datetime-local"
                value={form.activity_date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="What happened?"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Related Lead</label>
            <select
              name="lead_id"
              value={form.lead_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— None —</option>
              {leads.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name}{l.company ? ` (${l.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Related Opportunity</label>
            <select
              name="opportunity_id"
              value={form.opportunity_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— None —</option>
              {opps.map(o => (
                <option key={o.id} value={o.id}>{o.title}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Log Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
