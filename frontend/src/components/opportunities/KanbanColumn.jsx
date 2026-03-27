import { Droppable } from '@hello-pangea/dnd'
import OpportunityCard from './OpportunityCard'

const STAGE_COLORS = {
  New:       'bg-gray-100 text-gray-600',
  Contacted: 'bg-blue-100 text-blue-700',
  Qualified: 'bg-indigo-100 text-indigo-700',
  Proposal:  'bg-purple-100 text-purple-700',
  Won:       'bg-emerald-100 text-emerald-700',
  Lost:      'bg-red-100 text-red-700',
}

export default function KanbanColumn({ stage, opps, onEdit, onDelete }) {
  const totalValue = opps.reduce((sum, o) => sum + (o.value || 0), 0)

  return (
    <div className="flex flex-col w-56 shrink-0">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STAGE_COLORS[stage]}`}>
          {stage}
        </span>
        <span className="text-xs text-gray-400">{opps.length}</span>
      </div>

      {totalValue > 0 && (
        <p className="text-xs text-gray-500 mb-2 px-1">
          RM {Number(totalValue).toLocaleString()}
        </p>
      )}

      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[480px] rounded-lg p-2 transition-colors ${
              snapshot.isDraggingOver
                ? 'bg-blue-50 border border-dashed border-blue-300'
                : 'bg-gray-50'
            }`}
          >
            {opps.map((opp, index) => (
              <OpportunityCard
                key={opp.id}
                opp={opp}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
