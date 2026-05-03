import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { api } from '@/api/client'
import type { Workspace } from '@/api/types'

const COLORS = ['#b060ff','#00e5ff','#7c3aed','#ff5fdb','#f0c040','#d4a8ff','#5a5475']

interface Props {
  onClose:   () => void
  onCreated: (id: string) => void
}

export default function AddWorkspaceModal({ onClose, onCreated }: Props) {
  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor]             = useState(COLORS[0])
  const qc = useQueryClient()

  const add = useMutation({
    mutationFn: () => api.post<Workspace>('/workspaces', {
      name:        name.trim(),
      color,
      description: description.trim() || undefined,
    }),
    onSuccess: async (workspace) => {
      await qc.invalidateQueries({ queryKey: ['workspaces'] })
      onCreated(workspace.id)
      onClose()
    },
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    add.mutate()
  }

  return (
    <div
      className="fixed inset-0 bg-rp-base/70 flex items-center justify-center z-50"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-rp-surface border border-rp-hl-med rounded-lg p-5 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs font-semibold text-rp-text tracking-wide uppercase">
            new workspace
          </span>
          <button onClick={onClose} className="text-rp-muted hover:text-rp-subtle cursor-pointer transition-colors">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            autoFocus
            type="text"
            placeholder="workspace name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') onClose() }}
            className="bg-rp-overlay border border-rp-hl-med rounded px-3 py-2 text-sm text-rp-text font-mono placeholder:text-rp-muted focus:outline-none focus:border-rp-pine transition-colors"
          />

          <input
            type="text"
            placeholder="description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="bg-rp-overlay border border-rp-hl-med rounded px-3 py-2 text-sm text-rp-text font-mono placeholder:text-rp-muted focus:outline-none focus:border-rp-pine transition-colors"
          />

          <div className="flex gap-2 items-center">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-5 h-5 rounded-full cursor-pointer transition-transform"
                style={{
                  background:    c,
                  outline:       color === c ? `2px solid ${c}` : 'none',
                  outlineOffset: '2px',
                  transform:     color === c ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={!name.trim() || add.isPending}
            className="bg-rp-pine text-rp-base font-mono text-xs font-semibold px-4 py-2 rounded hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer"
          >
            {add.isPending ? 'creating...' : 'create workspace'}
          </button>
        </form>
      </div>
    </div>
  )
}
