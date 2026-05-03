import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { api } from '@/api/client'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post('/auth/register', { email, password })
      await api.post('/auth/login', { email, password })
      await navigate({ to: '/dashboard' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-rp-base flex items-center justify-center">
      <div className="bg-rp-surface border border-rp-hl-med rounded-lg p-8 w-full max-w-sm">
        <h1 className="font-mono text-rp-text text-lg font-semibold mb-1 tracking-widest uppercase">dash</h1>
        <p className="font-mono text-rp-muted text-xs mb-6">create your account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs text-rp-muted">email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="bg-rp-overlay border border-rp-hl-med rounded px-3 py-2 text-sm text-rp-text font-mono focus:outline-none focus:border-rp-pine transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs text-rp-muted">password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
              className="bg-rp-overlay border border-rp-hl-med rounded px-3 py-2 text-sm text-rp-text font-mono focus:outline-none focus:border-rp-pine transition-colors"
            />
          </div>

          {error && <p className="font-mono text-xs text-rp-love">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="bg-rp-pine text-rp-base font-mono text-xs font-semibold px-4 py-2 rounded hover:opacity-90 disabled:opacity-50 transition-opacity mt-1 cursor-pointer"
          >
            {loading ? 'creating account...' : 'create account'}
          </button>
        </form>

        <p className="font-mono text-xs text-rp-muted mt-5 text-center">
          have an account?{' '}
          <a href="/login" className="text-rp-pine hover:text-rp-foam transition-colors">sign in</a>
        </p>
      </div>
    </div>
  )
}
