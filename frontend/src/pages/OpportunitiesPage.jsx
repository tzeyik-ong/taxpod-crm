import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { opportunitiesApi } from '../api/client'
import KanbanBoard      from '../components/opportunities/KanbanBoard'
import OpportunityForm  from '../components/opportunities/OpportunityForm'

export default function OpportunitiesPage() {
  const [opps,    setOpps]    = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)

  const fetchOpps = useCallback(() => {
    opportunitiesApi.getAll()
      .then(r => setOpps(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchOpps() }, [fetchOpps])

  async function handleSave(form) {
    try {
      if (editing) {
        await opportunitiesApi.update(editing.id, form)
      } else {
        await opportunitiesApi.create(form)
      }
      setShowForm(false)
      setEditing(null)
      fetchOpps()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDelete(opp) {
    if (!window.confirm(`Delete "${opp.title}"? This cannot be undone.`)) return
    try {
      await opportunitiesApi.remove(opp.id)
      fetchOpps()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDragEnd(result) {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    const newStage = destination.droppableId
    const oppId    = parseInt(draggableId)

    // Optimistic update
    setOpps(prev => prev.map(o => o.id === oppId ? { ...o, stage: newStage } : o))

    try {
      await opportunitiesApi.update(oppId, { stage: newStage })
    } catch (err) {
      console.error(err)
      fetchOpps() // revert on failure
    }
  }

  function openEdit(opp) { setEditing(opp); setShowForm(true) }
  function openNew()      { setEditing(null); setShowForm(true) }

  const totalPipeline = opps
    .filter(o => !['Won', 'Lost'].includes(o.stage))
    .reduce((s, o) => s + (o.value || 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {opps.length} opportunit{opps.length !== 1 ? 'ies' : 'y'} · Pipeline: RM {Number(totalPipeline).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Drag cards between columns to update stage</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          New Opportunity
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <KanbanBoard
          opportunities={opps}
          onDragEnd={handleDragEnd}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {showForm && (
        <OpportunityForm
          opp={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}
