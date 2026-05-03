import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from '@tanstack/react-router'
import { ArrowLeft, LogOut } from 'lucide-react'
import { api } from '@/api/client'
import type { User } from '@/api/types'

interface Props {
  user: User
}

export default function SettingsPage({ user }: Props) {
  const navigate = useNavigate()
  const qc       = useQueryClient()

  async function handleLogout() {
    await api.post('/auth/logout')
    qc.clear()
    await navigate({ to: '/login' })
  }

  const joined = new Date(user.createdAt).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-rp-base text-rp-text">
      {/* Top bar */}
      <div className="h-[34px] bg-rp-base border-b border-rp-hl-med flex items-center px-4 gap-3">
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 font-mono text-[11px] text-rp-muted hover:text-rp-subtle transition-colors"
        >
          <ArrowLeft size={11} />
          back
        </Link>
        <span className="font-mono text-[12px] font-semibold text-rp-text tracking-[0.12em] uppercase">
          dash — settings
        </span>
      </div>

      <div className="max-w-md mx-auto px-6 py-10 flex flex-col gap-6">

        {/* Account section */}
        <section className="bg-rp-surface border border-rp-hl-med rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-rp-hl-med">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-rp-muted">
              account
            </span>
          </div>

          <div className="px-5 py-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-rp-muted uppercase tracking-wider">email</label>
              <span className="font-mono text-sm text-rp-text">{user.email}</span>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-rp-muted uppercase tracking-wider">member since</label>
              <span className="font-mono text-sm text-rp-text">{joined}</span>
            </div>
          </div>
        </section>

        {/* Session section */}
        <section className="bg-rp-surface border border-rp-hl-med rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-rp-hl-med">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-rp-muted">
              session
            </span>
          </div>
          <div className="px-5 py-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 font-mono text-xs text-rp-love hover:opacity-80 transition-opacity cursor-pointer"
            >
              <LogOut size={12} />
              sign out
            </button>
          </div>
        </section>

      </div>
    </div>
  )
}
