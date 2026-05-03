import { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import type { DragStartEvent, DragOverEvent, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { WorkspaceDetail, Column } from '@/api/types'
import ColumnComponent from './Column'
import AddColumnModal from './AddColumnModal'
import KanbanCard from './KanbanCard'

interface Props {
  workspace: WorkspaceDetail
}

export default function Board({ workspace }: Props) {
  const [addingColumn, setAddingColumn] = useState(false)
  const [activeId, setActiveId]         = useState<UniqueIdentifier | null>(null)
  // Local columns state for live drag preview
  const [columns, setColumns]           = useState<Column[]>(workspace.columns)
  const qc = useQueryClient()

  // Sync local state when workspace data changes (after API settle)
  useEffect(() => { setColumns(workspace.columns) }, [workspace])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const activeCard = useMemo(
    () => activeId ? columns.flatMap(c => c.cards).find(c => c.id === activeId) : null,
    [activeId, columns]
  )

  function onDragStart({ active }: DragStartEvent) {
    setActiveId(active.id)
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const activeId    = active.id as string
    const overId      = over.id as string

    // Find source column
    const sourceCol = columns.find(c => c.cards.some(card => card.id === activeId))
    if (!sourceCol) return

    // Target is a column directly, or find column of the target card
    const targetCol = columns.find(c => c.id === overId)
      ?? columns.find(c => c.cards.some(card => card.id === overId))
    if (!targetCol) return

    if (sourceCol.id === targetCol.id) {
      // Reorder within same column
      const oldIdx = sourceCol.cards.findIndex(c => c.id === activeId)
      const newIdx = targetCol.cards.findIndex(c => c.id === overId)
      if (oldIdx === newIdx || newIdx === -1) return
      setColumns(cols => cols.map(col =>
        col.id === sourceCol.id
          ? { ...col, cards: arrayMove(col.cards, oldIdx, newIdx) }
          : col
      ))
    } else {
      // Move card to different column (live preview)
      const movingCard = sourceCol.cards.find(c => c.id === activeId)
      if (!movingCard) return
      const overIdx = targetCol.cards.findIndex(c => c.id === overId)
      const insertAt = overIdx >= 0 ? overIdx : targetCol.cards.length
      setColumns(cols => cols.map(col => {
        if (col.id === sourceCol.id) return { ...col, cards: col.cards.filter(c => c.id !== activeId) }
        if (col.id === targetCol.id) {
          const updated = [...col.cards]
          updated.splice(insertAt, 0, { ...movingCard, columnId: targetCol.id })
          return { ...col, cards: updated }
        }
        return col
      }))
    }
  }

  function onDragEnd({ active }: DragEndEvent) {
    const cardId    = active.id as string
    const origCard  = workspace.columns.flatMap(c => c.cards).find(c => c.id === cardId)
    const newColumn = columns.find(c => c.cards.some(c2 => c2.id === cardId))
    if (!origCard || !newColumn) { setActiveId(null); return }

    const newPosition = newColumn.cards.findIndex(c => c.id === cardId)
    const origColumn  = workspace.columns.find(c => c.cards.some(c2 => c2.id === cardId))
    const origPosition = origColumn?.cards.findIndex(c => c.id === cardId) ?? -1

    setActiveId(null)

    // Nothing changed
    if (newColumn.id === origCard.columnId && newPosition === origPosition) return

    // Persist to server (local state already updated via onDragOver)
    qc.setQueryData<WorkspaceDetail>(['workspace', workspace.id], old =>
      old ? { ...old, columns } : old
    )
    void api
      .patch(`/cards/${cardId}/move`, { columnId: newColumn.id, position: newPosition })
      .catch(() => {
        setColumns(workspace.columns)
        void qc.invalidateQueries({ queryKey: ['workspace', workspace.id] })
      })
  }

  function onDragCancel() {
    setActiveId(null)
    setColumns(workspace.columns)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="h-full overflow-x-auto overflow-y-hidden">
        <div className="flex gap-3.5 items-start h-full px-5 pt-5 min-w-max">

          {columns.map(col => (
            <ColumnComponent
              key={col.id}
              column={col}
              workspaceId={workspace.id}
              allColumns={columns}
            />
          ))}

          {/* Add column — aligns with column headers */}
          <div className="flex-shrink-0 w-[200px]">
            <div className="flex items-center pb-2.5 px-1">
              <button
                onClick={() => setAddingColumn(true)}
                className="w-full bg-transparent border border-dashed border-rp-hl-med rounded-md px-3 py-0.5 flex items-center gap-1.5 text-rp-muted font-mono text-[12px] hover:text-rp-subtle hover:border-rp-hl-high transition-colors cursor-pointer h-[20px]"
              >
                <Plus size={11} />
                add column
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Ghost card while dragging */}
      <DragOverlay>
        {activeCard && (
          <div className="rotate-1 shadow-xl w-[264px]">
            <KanbanCard
              card={activeCard}
              workspaceId={workspace.id}
              allColumns={columns}
            />
          </div>
        )}
      </DragOverlay>

      {addingColumn && (
        <AddColumnModal workspaceId={workspace.id} onClose={() => setAddingColumn(false)} />
      )}
    </DndContext>
  )
}
