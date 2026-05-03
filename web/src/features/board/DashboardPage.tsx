import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { api } from '@/api/client'
import type { User, Workspace, WorkspaceDetail } from '@/api/types'
import TopBar from './TopBar'
import Board from './Board'
import AddWorkspaceModal from './AddWorkspaceModal'

interface Props {
  user: User
}

export default function DashboardPage({ user }: Props) {
  const [activeId, setActiveId]           = useState<string | null>(null)
  const [addingWorkspace, setAddingWorkspace] = useState(false)

  const { data: workspaces = [], isLoading: loadingWorkspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => api.get<Workspace[]>('/workspaces'),
  })

  // Auto-select first workspace on load
  useEffect(() => {
    if (workspaces.length > 0 && !activeId) {
      setActiveId(workspaces[0].id)
    }
  }, [workspaces, activeId])

  const { data: workspace, isLoading: loadingBoard } = useQuery({
    queryKey: ['workspace', activeId],
    queryFn: () => api.get<WorkspaceDetail>(`/workspaces/${activeId}`),
    enabled: !!activeId,
  })

  // 1-4 keyboard shortcuts
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    const i = parseInt(e.key) - 1
    if (i >= 0 && i < workspaces.length) setActiveId(workspaces[i].id)
  }, [workspaces])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const totalCards = workspace?.columns.reduce((s, c) => s + c.cards.length, 0) ?? 0
  const isEmpty    = !loadingWorkspaces && workspaces.length === 0

  return (
    <div className="flex flex-col h-screen bg-rp-base overflow-hidden">
      <TopBar
        workspaces={workspaces}
        activeId={activeId}
        onSelect={(id: string | null) => setActiveId(id)}
        onAddWorkspace={() => setAddingWorkspace(true)}
        user={user}
      />

      <div className="flex-1 overflow-hidden">
        {loadingBoard && activeId ? (
          <div className="flex items-center justify-center h-full">
            <span className="font-mono text-xs text-rp-muted">loading...</span>
          </div>
        ) : isEmpty ? (
          <EmptyState onCreateWorkspace={() => setAddingWorkspace(true)} />
        ) : workspace ? (
          <Board workspace={workspace} />
        ) : null}
      </div>

      <div className="h-7 bg-rp-base border-t border-rp-hl-med flex items-center justify-between px-4 flex-shrink-0">
        <span className="font-mono text-[10px] text-rp-muted">
          {totalCards} cards total · {workspace?.columns.length ?? 0} columns
        </span>
        <span className="font-mono text-[10px] text-rp-hl-high tracking-wide">
          1-4 switch workspace · esc close · enter confirm
        </span>
      </div>

      {addingWorkspace && (
        <AddWorkspaceModal
          onClose={() => setAddingWorkspace(false)}
          onCreated={id => setActiveId(id)}
        />
      )}
    </div>
  )
}

function EmptyState({ onCreateWorkspace }: { onCreateWorkspace: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-xs text-rp-muted">no workspaces yet</span>
        <span className="font-mono text-[10px] text-rp-hl-high">
          create one to get started
        </span>
      </div>
      <button
        onClick={onCreateWorkspace}
        className="flex items-center gap-2 bg-rp-pine text-rp-base font-mono text-xs font-semibold px-4 py-2 rounded hover:opacity-90 transition-opacity cursor-pointer"
      >
        <Plus size={12} />
        new workspace
      </button>
    </div>
  )
}
