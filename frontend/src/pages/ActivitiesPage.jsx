import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { activitiesApi } from '../api/client'
import ActivityList from '../components/activities/ActivityList'
import ActivityForm from '../components/activities/ActivityForm'

export default function ActivitiesPage() {
  const location   = useLocation()
  const highlightId = location.state?.highlightId ?? null

  const [activities,  setActivities]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [showForm,    setShowForm]    = useState(false)
  const [typeFilter,  setTypeFilter]  = useState('all')

  const TYPES = ['all', 'Call', 'Email', 'Meeting', 'Note']

  const filtered = typeFilter === 'all'
    ? activities
    : activities.filter(a => a.type === typeFilter)

  const fetchActivities = useCallback(() => {
    activitiesApi.getAll({ limit: 100 })
      .then(r => setActivities(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchActivities() }, [fetchActivities])

  async function handleSave(form) {
    try {
      await activitiesApi.create(form)
      setShowForm(false)
      fetchActivities()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDelete(activity) {
    if (!window.confirm('Delete this activity?')) return
    try {
      await activitiesApi.remove(activity.id)
      fetchActivities()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm text-gray-500 mr-1">
            {filtered.length} activit{filtered.length !== 1 ? 'ies' : 'y'}
          </p>
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                typeFilter === t
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Log Activity
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <ActivityList activities={filtered} onDelete={handleDelete} highlightId={highlightId} hasFilters={typeFilter !== 'all'} />
      )}

      {showForm && (
        <ActivityForm
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
