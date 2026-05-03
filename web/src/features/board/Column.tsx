import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { Column as ColumnType, WorkspaceDetail } from '@/api/types'
import SortableCard from './SortableCard'
import AddCardModal from './AddCardModal'
import EditColumnModal from './EditColumnModal'

interface Props {
  column:      ColumnType
  workspaceId: string
  allColumns:  ColumnType[]
}

export default function Column({ column, workspaceId, allColumns }: Props) {
  const [addingCard, setAddingCard]   = useState(false)
  const [editingCol, setEditingCol]   = useState(false)
  const [headerHovered, setHeaderHovered] = useState(false)
  const qc = useQueryClient()

  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  const deleteCol = useMutation({
    mutationFn: () => api.delete(`/columns/${column.id}`),
    onSuccess: () => {
      qc.setQueryData<WorkspaceDetail>(['workspace', workspaceId], old =>
        old ? { ...old, columns: old.columns.filter(c => c.id !== column.id) } : old
      )
      void qc.invalidateQueries({ queryKey: ['workspace', workspaceId] })
    },
  })

  return (
    <div
      className="w-[264px] flex-shrink-0 overflow-y-auto"
      style={{ maxHeight: 'calc(100vh - 84px)' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 bg-rp-base z-10 flex items-center gap-2 pb-2.5 px-1"
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
      >
        <div
          className="w-[7px] h-[7px] rounded-full flex-shrink-0"
          style={{ background: column.color, boxShadow: `${column.color}cc 0px 0px 6px` }}
        />
        <span className="font-mono text-[12px] font-semibold text-rp-text tracking-[0.04em] flex-1 truncate">
          {column.name}
        </span>

        {/* Edit/delete — invisible preserves space, no layout shift */}
        <div className={`flex items-center gap-0.5 ${headerHovered ? 'visible' : 'invisible'}`}>
          <button
            onClick={() => setEditingCol(true)}
            className="w-5 h-5 flex items-center justify-center rounded text-rp-muted hover:text-rp-foam hover:bg-rp-hl-med transition-colors cursor-pointer"
          >
            <Pencil size={10} />
          </button>
          <button
            onClick={() => deleteCol.mutate()}
            disabled={deleteCol.isPending}
            className="w-5 h-5 flex items-center justify-center rounded text-rp-muted hover:text-rp-love hover:bg-rp-hl-med disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Trash2 size={10} />
          </button>
        </div>
        {/* Count badge — always visible */}
        <span className="font-mono text-[10px] text-rp-muted bg-rp-hl-low border border-rp-hl-med rounded-[3px] px-1.5 min-w-[20px] text-center">
          {column.cards.length}
        </span>
      </div>

      {/* Drop zone with sortable */}
      <div
        ref={setNodeRef}
        className="flex flex-col gap-2 pr-0.5 rounded-md transition-colors min-h-[2px]"
        style={{ background: isOver ? 'rgba(176,96,255,0.06)' : undefined }}
      >
        <SortableContext
          items={column.cards.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map(card => (
            <SortableCard
              key={card.id}
              card={card}
              workspaceId={workspaceId}
              allColumns={allColumns}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add card */}
      <div className="sticky bottom-0 bg-rp-base pt-2">
        <button
          onClick={() => setAddingCard(true)}
          className="w-full bg-transparent border border-dashed border-rp-hl-med rounded-[5px] px-2.5 py-[7px] flex items-center gap-1.5 text-rp-muted font-mono text-xs hover:text-rp-subtle hover:border-rp-hl-high transition-colors cursor-pointer"
        >
          <Plus size={12} />
          add card
        </button>
      </div>

      {addingCard && (
        <AddCardModal columnId={column.id} workspaceId={workspaceId} onClose={() => setAddingCard(false)} />
      )}
      {editingCol && (
        <EditColumnModal column={column} workspaceId={workspaceId} onClose={() => setEditingCol(false)} />
      )}
    </div>
  )
}
