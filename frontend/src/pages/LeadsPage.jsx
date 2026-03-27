import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { leadsApi } from '../api/client'
import LeadList from '../components/leads/LeadList'
import LeadForm from '../components/leads/LeadForm'

const STATUSES = ['All', 'Lead', 'Prospect', 'Customer']
const FIELDS   = [
  { value: 'all',     label: 'All fields' },
  { value: 'name',    label: 'Name' },
  { value: 'email',   label: 'Email' },
  { value: 'company', label: 'Company' },
]

export default function LeadsPage() {
  const [leads,        setLeads]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [searchField,  setSearchField]  = useState('all')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showForm,     setShowForm]     = useState(false)
  const [editing,      setEditing]      = useState(null)

  const fetchLeads = useCallback(() => {
    const params = {}
    if (search)               params.search = search
    if (search && searchField !== 'all') params.field = searchField
    if (statusFilter !== 'All') params.status = statusFilter
    leadsApi.getAll(params)
      .then(r => setLeads(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [search, searchField, statusFilter])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  async function handleSave(form) {
    try {
      if (editing) {
        await leadsApi.update(editing.id, form)
      } else {
        await leadsApi.create(form)
      }
      setShowForm(false)
      setEditing(null)
      fetchLeads()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDelete(lead) {
    if (!window.confirm(`Delete "${lead.name}"? This cannot be undone.`)) return
    try {
      await leadsApi.remove(lead.id)
      fetchLeads()
    } catch (err) {
      console.error(err)
    }
  }

  function openEdit(lead) { setEditing(lead); setShowForm(true) }
  function openNew()       { setEditing(null); setShowForm(true) }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{leads.length} record{leads.length !== 1 ? 's' : ''}</p>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          New Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search with clear button */}
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Field selector */}
        <select
          value={searchField}
          onChange={e => setSearchField(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        {/* Status filter */}
        <div className="flex gap-1">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                statusFilter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <LeadList leads={leads} onEdit={openEdit} onDelete={handleDelete} hasFilters={!!(search || statusFilter)} />
      )}

      {showForm && (
        <LeadForm
          lead={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}
