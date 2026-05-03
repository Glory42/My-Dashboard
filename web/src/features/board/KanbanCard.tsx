import { useState } from 'react'
import { Trash2, ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { Card, Column, WorkspaceDetail } from '@/api/types'
import EditCardModal from './EditCardModal'

interface Props {
  card:           Card
  workspaceId:    string
  allColumns:     Column[]
  dragListeners?: Record<string, (...args: unknown[]) => unknown>
  dragAttributes?: Record<string, unknown>
}

export default function KanbanCard({ card, workspaceId, allColumns, dragListeners, dragAttributes }: Props) {
  const [hovered, setHovered]   = useState(false)
  const [editing, setEditing]   = useState(false)
  const qc = useQueryClient()

  const sorted       = [...allColumns].sort((a, b) => a.position - b.position)
  const currentIndex = sorted.findIndex(c => c.id === card.columnId)
  const prevCol      = currentIndex > 0 ? sorted[currentIndex - 1] : null
  const nextCol      = currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null

  const remove = useMutation({
    mutationFn: () => api.delete(`/cards/${card.id}`),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['workspace', workspaceId] })
      const prev = qc.getQueryData<WorkspaceDetail>(['workspace', workspaceId])
      qc.setQueryData<WorkspaceDetail>(['workspace', workspaceId], old =>
        old ? { ...old, columns: old.columns.map(c => ({ ...c, cards: c.cards.filter(k => k.id !== card.id) })) } : old
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(['workspace', workspaceId], ctx.prev) },
    onSettled: () => void qc.invalidateQueries({ queryKey: ['workspace', workspaceId] }),
  })

  const move = useMutation({
    mutationFn: (target: Column) => api.patch(`/cards/${card.id}/move`, {
      columnId: target.id,
      position: target.cards.length,
    }),
    onMutate: async (target) => {
      await qc.cancelQueries({ queryKey: ['workspace', workspaceId] })
      const prev = qc.getQueryData<WorkspaceDetail>(['workspace', workspaceId])
      qc.setQueryData<WorkspaceDetail>(['workspace', workspaceId], old => {
        if (!old) return old
        return {
          ...old,
          columns: old.columns.map(col => {
            if (col.id === card.columnId) return { ...col, cards: col.cards.filter(c => c.id !== card.id) }
            if (col.id === target.id)     return { ...col, cards: [...col.cards, { ...card, columnId: target.id }] }
            return col
          }),
        }
      })
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(['workspace', workspaceId], ctx.prev) },
    onSettled: () => void qc.invalidateQueries({ queryKey: ['workspace', workspaceId] }),
  })

  const busy = remove.isPending || move.isPending

  return (
    <>
      <div
        {...dragAttributes}
        {...dragListeners}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="bg-rp-overlay border border-rp-hl-med rounded-[6px] px-3 py-2.5 relative transition-colors"
        style={{ borderColor: hovered ? '#3d2d6e' : undefined, cursor: 'grab' }}
      >
        {/* Title + action buttons — always in DOM, invisible preserves space */}
        <div className="flex items-start gap-2">
          <div className="flex-1 text-[13px] text-rp-text leading-[1.45]">
            {card.title}
          </div>

          <div className={`flex items-center gap-0.5 flex-shrink-0 mt-0.5 ${hovered ? 'visible' : 'invisible'}`}>
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={() => prevCol && move.mutate(prevCol)}
                disabled={!prevCol || busy}
                title={prevCol ? `← ${prevCol.name}` : undefined}
                className="w-5 h-5 flex items-center justify-center rounded text-rp-muted hover:text-rp-text hover:bg-rp-hl-med disabled:opacity-20 disabled:cursor-default transition-colors cursor-pointer"
              >
                <ChevronLeft size={11} />
              </button>
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={() => nextCol && move.mutate(nextCol)}
                disabled={!nextCol || busy}
                title={nextCol ? `${nextCol.name} →` : undefined}
                className="w-5 h-5 flex items-center justify-center rounded text-rp-muted hover:text-rp-text hover:bg-rp-hl-med disabled:opacity-20 disabled:cursor-default transition-colors cursor-pointer"
              >
                <ChevronRight size={11} />
              </button>
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={() => setEditing(true)}
                className="w-5 h-5 flex items-center justify-center rounded text-rp-muted hover:text-rp-foam hover:bg-rp-hl-med transition-colors cursor-pointer"
              >
                <Pencil size={10} />
              </button>
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={() => remove.mutate()}
                disabled={busy}
                className="w-5 h-5 flex items-center justify-center rounded text-rp-muted hover:text-rp-love hover:bg-rp-hl-med disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Trash2 size={10} />
              </button>
            </div>
        </div>

        {/* Tag */}
        {card.tag && (
          <div className="mt-2">
            <span
              className="font-mono text-[10px] font-semibold tracking-[0.08em] rounded-[3px] px-1.5 py-px inline-block uppercase border"
              style={{
                color:       card.tagColor ?? '#00e5ff',
                background:  card.tagColor ? `${card.tagColor}18` : 'rgba(0,229,255,0.094)',
                borderColor: card.tagColor ? `${card.tagColor}40` : 'rgba(0,229,255,0.25)',
              }}
            >
              {card.tag}
            </span>
          </div>
        )}
      </div>

      {editing && (
        <EditCardModal card={card} workspaceId={workspaceId} onClose={() => setEditing(false)} />
      )}
    </>
  )
}
