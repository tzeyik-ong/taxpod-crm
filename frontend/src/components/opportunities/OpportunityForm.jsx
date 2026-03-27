import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { leadsApi } from '../../api/client'
import DatePickerInput from '../common/DatePickerInput'

const STAGES  = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost']
const EMPTY   = { title: '', value: '', stage: 'New', lead_id: '', notes: '', expected_close_date: '' }

export default function OpportunityForm({ opp, onSave, onClose }) {
  const [form,   setForm]   = useState(EMPTY)
  const [leads,  setLeads]  = useState([])
  const [error,  setError]  = useState('')

  useEffect(() => {
    setForm(opp ? {
      title: opp.title || '',
      value: opp.value || '',
      stage: opp.stage || 'New',
      lead_id: opp.lead_id || '',
      notes: opp.notes || '',
      expected_close_date: opp.expected_close_date?.slice(0, 10) || '',
    } : EMPTY)
    setError('')
    leadsApi.getAll().then(r => setLeads(r.data)).catch(console.error)
  }, [opp])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    onSave({
      ...form,
      value:   parseFloat(form.value) || 0,
      lead_id: form.lead_id || null,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">
            {opp ? 'Edit Opportunity' : 'New Opportunity'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Opportunity title"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Value (RM)</label>
              <input
                name="value"
                type="number"
                min="0"
                step="0.01"
                value={form.value}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Stage</label>
              <select
                name="stage"
                value={form.stage}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Associated Lead</label>
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
            <label className="block text-xs font-medium text-gray-600 mb-1">Expected Close Date</label>
            <DatePickerInput
              value={form.expected_close_date}
              onChange={val => setForm(f => ({ ...f, expected_close_date: val }))}
              placeholder="Pick a date"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Optional notes..."
            />
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
              {opp ? 'Save Changes' : 'Create Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
