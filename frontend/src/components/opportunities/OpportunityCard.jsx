import { Draggable } from '@hello-pangea/dnd'
import { Pencil, Trash2 } from 'lucide-react'

const STAGE_BORDER = {
  New:       'border-l-gray-300',
  Contacted: 'border-l-blue-400',
  Qualified: 'border-l-indigo-400',
  Proposal:  'border-l-purple-400',
  Won:       'border-l-emerald-400',
  Lost:      'border-l-red-400',
}

export default function OpportunityCard({ opp, index, onEdit, onDelete }) {
  const borderColor = STAGE_BORDER[opp.stage] ?? 'border-l-gray-300'

  return (
    <Draggable draggableId={String(opp.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group bg-white rounded-lg border border-l-4 p-3 mb-2 shadow-sm transition-shadow ${borderColor} ${
            snapshot.isDragging ? 'shadow-lg border-blue-300' : 'border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between gap-1">
            <p className="text-sm font-medium text-gray-800 leading-snug flex-1 min-w-0">
              {opp.title}
            </p>
            {/* Buttons hidden until hover */}
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(opp)}
                className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => onDelete(opp)}
                className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          <p className="text-xs font-semibold text-emerald-600 mt-1">
            RM {Number(opp.value).toLocaleString()}
          </p>

          {opp.lead_name && (
            <p className="text-xs text-gray-400 mt-1 truncate">
              {opp.lead_name}
              {opp.lead_company && ` · ${opp.lead_company}`}
            </p>
          )}

          {opp.expected_close_date && (
            <p className="text-xs text-gray-400 mt-1">
              Close: {new Date(opp.expected_close_date).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </Draggable>
  )
}
