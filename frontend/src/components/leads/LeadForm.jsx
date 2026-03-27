import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import countryCodesList from 'country-codes-list'
import CountryCodeSelect from './CountryCodeSelect'

const STATUSES = ['Lead', 'Prospect', 'Customer']

// Build a deduplicated, sorted list: Malaysia first, then A-Z by country name
function buildCountryCodes() {
  const raw = countryCodesList.all()
    .filter(c => c.countryCallingCode)
    .map(c => ({
      code: `+${c.countryCallingCode}`,
      label: `+${c.countryCallingCode} (${c.countryCode}) ${c.countryNameEn}`,
      countryCode: c.countryCode,
      name: c.countryNameEn,
      flag: c.flag ?? '',
    }))

  const seen = new Set()
  const result = []

  // Malaysia pinned first
  const my = raw.find(c => c.countryCode === 'MY')
  if (my) { result.push(my); seen.add(my.countryCode) }

  raw
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(c => {
      if (!seen.has(c.countryCode)) { seen.add(c.countryCode); result.push(c) }
    })

  return result
}

const COUNTRY_CODES = buildCountryCodes()

const EMPTY = { name: '', email: '', dialCode: '+60', localNumber: '', company: '', status: 'Lead', notes: '' }

function parsePhone(phone) {
  if (!phone) return { dialCode: '+60', localNumber: '' }
  // Sort by code length descending so +1868 matches before +1
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length)
  for (const { code } of sorted) {
    if (phone.startsWith(code)) {
      return { dialCode: code, localNumber: phone.slice(code.length).trim() }
    }
  }
  return { dialCode: '+60', localNumber: phone }
}

export default function LeadForm({ lead, onSave, onClose }) {
  const [form, setForm]   = useState(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (lead) {
      const { dialCode, localNumber } = parsePhone(lead.phone || '')
      setForm({ ...EMPTY, ...lead, dialCode, localNumber })
    } else {
      setForm(EMPTY)
    }
    setError('')
  }, [lead])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    if (form.localNumber && !/^[\d\s\-().]+$/.test(form.localNumber)) {
      setError('Phone may only contain digits, spaces, hyphens and parentheses')
      return
    }
    const fullPhone = form.localNumber.trim() ? `${form.dialCode} ${form.localNumber.trim()}` : ''
    onSave({ ...form, phone: fullPhone })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">
            {lead ? 'Edit Lead' : 'New Lead'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Full name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
            <div className="flex gap-2">
              <CountryCodeSelect
                options={COUNTRY_CODES}
                value={form.dialCode}
                onChange={code => setForm(f => ({ ...f, dialCode: code }))}
              />
              <input
                name="localNumber"
                value={form.localNumber}
                onChange={handleChange}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12 345 6789"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Company name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
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
              {lead ? 'Save Changes' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}