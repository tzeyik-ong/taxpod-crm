import { DragDropContext } from '@hello-pangea/dnd'
import KanbanColumn from './KanbanColumn'

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost']

export default function KanbanBoard({ opportunities, onDragEnd, onEdit, onDelete }) {
  const byStage = STAGES.reduce((acc, stage) => {
    acc[stage] = opportunities.filter(o => o.stage === stage)
    return acc
  }, {})

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <KanbanColumn
            key={stage}
            stage={stage}
            opps={byStage[stage]}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </DragDropContext>
  )
}
