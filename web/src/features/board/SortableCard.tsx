import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import KanbanCard from './KanbanCard'
import type { Card, Column } from '@/api/types'

interface Props {
  card:        Card
  workspaceId: string
  allColumns:  Column[]
}

export default function SortableCard({ card, workspaceId, allColumns }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id:   card.id,
    data: { type: 'card', columnId: card.columnId },
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform:  CSS.Transform.toString(transform),
        transition: transition ?? undefined,
        opacity:    isDragging ? 0 : 1,
      }}
    >
      <KanbanCard
        card={card}
        workspaceId={workspaceId}
        allColumns={allColumns}
        dragListeners={listeners as Record<string, (...args: unknown[]) => unknown>}
        dragAttributes={attributes as unknown as Record<string, unknown>}
      />
    </div>
  )
}
