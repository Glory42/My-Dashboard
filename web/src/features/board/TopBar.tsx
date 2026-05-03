import { useState, useEffect, useRef } from 'react'
import { Clock, Plus, Pencil, Trash2, Settings, LogOut } from 'lucide-react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { User, Workspace } from '@/api/types'
import EditWorkspaceModal from './EditWorkspaceModal'

interface Props {
  workspaces:     Workspace[]
  activeId:       string | null
  onSelect:       (id: string | null) => void
  onAddWorkspace: () => void
  user?:          User
}

export default function TopBar({ workspaces, activeId, onSelect, onAddWorkspace, user }: Props) {
  const [time, setTime]           = useState(() => fmt(new Date()))
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [editingWs, setEditingWs] = useState<Workspace | null>(null)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const closeTimer                = useRef<ReturnType<typeof setTimeout> | null>(null)
  const avatarRef                 = useRef<HTMLDivElement>(null)
  const navigate                  = useNavigate()
  const qc                        = useQueryClient()

  useEffect(() => {
    const id = setInterval(() => setTime(fmt(new Date())), 10_000)
    return () => clearInterval(id)
  }, [])

  // Close avatar menu on outside click
  useEffect(() => {
    if (!avatarOpen) return
    function handleClick(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [avatarOpen])

  // Delay hiding so mouse can move from pill → dropdown without flicker
  function openDropdown(id: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setHoveredId(id)
  }
  function scheduleClose() {
    closeTimer.current = setTimeout(() => setHoveredId(null), 120)
  }
  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  const deleteWs = useMutation({
    mutationFn: (id: string) => api.delete(`/workspaces/${id}`),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: ['workspaces'] })
      qc.removeQueries({ queryKey: ['workspace', id] })
      if (id === activeId) {
        const next = workspaces.find(w => w.id !== id)
        onSelect(next?.id ?? null)
      }
      setHoveredId(null)
    },
  })

  async function handleLogout() {
    await api.post('/auth/logout')
    qc.clear()
    await navigate({ to: '/login' })
  }

  const active   = workspaces.find(w => w.id === activeId)
  const initials = (user?.email ?? '??').slice(0, 2).toUpperCase()

  return (
    <>
      <div className="h-[34px] bg-rp-base border-b border-rp-hl-med flex items-center justify-between px-4 flex-shrink-0 relative z-50">

        {/* Left: workspace pills */}
        <div className="flex items-center gap-1.5">
          {workspaces.map((ws, i) => {
            const isActive = ws.id === activeId
            const isHovered = ws.id === hoveredId
            return (
              <div
                key={ws.id}
                className="relative"
                onMouseEnter={() => openDropdown(ws.id)}
                onMouseLeave={scheduleClose}
              >
                <button
                  onClick={() => onSelect(ws.id)}
                  className={[
                    'font-mono text-[12px] rounded px-2.5 py-0.5 border transition-colors duration-150 whitespace-nowrap cursor-pointer',
                    isActive
                      ? 'bg-rp-hl-med text-rp-text border-rp-hl-high'
                      : 'bg-transparent text-rp-muted border-rp-hl-med hover:text-rp-subtle hover:border-rp-hl-high',
                  ].join(' ')}
                >
                  <span style={{ color: isActive ? '#b060ff' : '#5a5475' }}>{i + 1}:</span>
                  <span className="ml-1">{ws.name}</span>
                </button>

                {/* Hover dropdown */}
                {isHovered && (
                  <div
                    className="absolute top-full left-0 mt-1.5 bg-rp-surface border border-rp-hl-med rounded-lg p-3 z-[200] min-w-[180px] shadow-lg"
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                  >
                    {/* Workspace info */}
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ws.color }} />
                      <span className="font-mono text-xs font-semibold text-rp-text truncate">{ws.name}</span>
                    </div>
                    {ws.description && (
                      <p className="font-mono text-[10px] text-rp-muted mb-2 pl-4 leading-relaxed">
                        {ws.description}
                      </p>
                    )}

                    {/* Divider */}
                    <div className="border-t border-rp-hl-med my-2" />

                    {/* Actions */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => { setEditingWs(ws); setHoveredId(null) }}
                        className="flex items-center gap-1.5 font-mono text-[10px] text-rp-muted hover:text-rp-text px-2 py-1 rounded hover:bg-rp-hl-low transition-colors cursor-pointer flex-1 justify-center"
                      >
                        <Pencil size={10} />
                        edit
                      </button>
                      <button
                        onClick={() => deleteWs.mutate(ws.id)}
                        disabled={deleteWs.isPending}
                        className="flex items-center gap-1.5 font-mono text-[10px] text-rp-muted hover:text-rp-love px-2 py-1 rounded hover:bg-rp-hl-low transition-colors cursor-pointer flex-1 justify-center disabled:opacity-40"
                      >
                        <Trash2 size={10} />
                        delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Add workspace pill */}
          <button
            onClick={onAddWorkspace}
            title="new workspace"
            className="font-mono text-[12px] rounded px-2 py-0.5 border border-dashed border-rp-hl-med text-rp-muted hover:text-rp-subtle hover:border-rp-hl-high transition-colors cursor-pointer"
          >
            <Plus size={11} />
          </button>
        </div>

        {/* Center: current workspace title */}
        <div className="absolute left-1/2 -translate-x-1/2 font-mono text-[12px] font-semibold text-rp-text tracking-[0.12em] uppercase pointer-events-none select-none">
          dash — {active?.name ?? '...'}
        </div>

        {/* Right: clock + avatar */}
        <div className="flex items-center gap-3">
          <div className="font-mono text-[12px] text-rp-muted flex items-center gap-1.5">
            <Clock size={11} aria-hidden />
            {time}
          </div>

          {/* Avatar with dropdown */}
          <div className="relative" ref={avatarRef}>
            <button
              onClick={() => setAvatarOpen(o => !o)}
              className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold font-mono flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #b060ff, #ff5fdb)',
                color: '#080810',
                boxShadow: 'rgba(176, 96, 255, 0.5) 0px 0px 8px',
              }}
            >
              {initials}
            </button>

            {avatarOpen && (
              <div className="absolute top-full right-0 mt-1.5 bg-rp-surface border border-rp-hl-med rounded-lg py-1 z-[200] min-w-[140px] shadow-lg">
                <div className="px-3 py-1.5 border-b border-rp-hl-med mb-1">
                  <span className="font-mono text-[10px] text-rp-muted truncate block max-w-[120px]">
                    {user?.email}
                  </span>
                </div>
                <Link
                  to="/settings"
                  onClick={() => setAvatarOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 font-mono text-[11px] text-rp-muted hover:text-rp-text hover:bg-rp-hl-low transition-colors cursor-pointer w-full"
                >
                  <Settings size={11} />
                  settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 font-mono text-[11px] text-rp-muted hover:text-rp-love hover:bg-rp-hl-low transition-colors cursor-pointer w-full"
                >
                  <LogOut size={11} />
                  sign out
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {editingWs && (
        <EditWorkspaceModal
          workspace={editingWs}
          onClose={() => setEditingWs(null)}
        />
      )}
    </>
  )
}

function fmt(d: Date) {
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
