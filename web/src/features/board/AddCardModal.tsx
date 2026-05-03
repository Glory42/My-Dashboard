import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { api } from '@/api/client'

const TAGS = [
  { label: 'FEAT',     color: '#b060ff' },
  { label: 'FIX',      color: '#ff5fdb' },
  { label: 'DOCS',     color: '#00e5ff' },
  { label: 'CHORE',    color: '#7c3aed' },
  { label: 'REFACTOR', color: '#f0c040' },
]

interface Props {
  columnId:    string
  workspaceId: string
  onClose:     () => void
}

export default function AddCardModal({ columnId, workspaceId, onClose }: Props) {
  const [title, setTitle]   = useState('')
  const [tag, setTag]       = useState<typeof TAGS[0] | null>(null)
  const qc = useQueryClient()

  const add = useMutation({
    mutationFn: () => api.post('/cards', {
      columnId,
      title: title.trim(),
      tag:      tag?.label,
      tagColor: tag?.color,
    }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['workspace', workspaceId] })
      onClose()
    },
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    add.mutate()
  }

  return (
    <div
      className="fixed inset-0 bg-rp-base/70 flex items-center justify-center z-50"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-rp-surface border border-rp-hl-med rounded-lg p-5 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs font-semibold text-rp-text tracking-wide uppercase">add card</span>
          <button onClick={onClose} className="text-rp-muted hover:text-rp-subtle cursor-pointer transition-colors">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            autoFocus
            type="text"
            placeholder="card title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') onClose() }}
            className="bg-rp-overlay border border-rp-hl-med rounded px-3 py-2 text-sm text-rp-text font-mono placeholder:text-rp-muted focus:outline-none focus:border-rp-pine transition-colors"
          />

          {/* Tag picker */}
          <div className="flex flex-wrap gap-1.5">
            {TAGS.map(t => (
              <button
                key={t.label}
                type="button"
                onClick={() => setTag(tag?.label === t.label ? null : t)}
                className="font-mono text-[10px] font-semibold tracking-[0.08em] rounded-[3px] px-1.5 py-px border uppercase cursor-pointer transition-all"
                style={{
                  color:       t.color,
                  background:  tag?.label === t.label ? `${t.color}30` : `${t.color}15`,
                  borderColor: tag?.label === t.label ? `${t.color}80` : `${t.color}35`,
                  opacity:     tag && tag.label !== t.label ? 0.5 : 1,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!title.trim() || add.isPending}
            className="bg-rp-pine text-rp-base font-mono text-xs font-semibold px-4 py-2 rounded hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer"
          >
            {add.isPending ? 'adding...' : 'add card'}
          </button>
        </form>
      </div>
    </div>
  )
}
