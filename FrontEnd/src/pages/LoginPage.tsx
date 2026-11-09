import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  TriangleAlert,
  Eye,
  EyeOff,
  CircleX,
  KeyRound,
  LockKeyholeOpen,
  Loader2,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

export default function LoginPage() {
  const { isAuthenticated, isDefaultPassword, login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  // Redirect if already authenticated
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'
  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  async function handleUnlock(e: FormEvent) {
    e.preventDefault()
    if (!password) return

    setLoading(true)
    setError(false)

    try {
      const success = await login(password)
      if (success) {
        toast('Login Berhasil! Selamat datang kembali.', 'success')
        navigate(from, { replace: true })
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 font-sans text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* LOCK SCREEN GATEWAY (FR-01, FR-02, FR-03) */}
      <div id="lock-screen" className="w-full max-w-md">
        <div className="glass-panel w-full space-y-6 rounded-2xl border border-slate-800 p-8 text-center shadow-2xl">
          <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-500/30 bg-brand-600/20 text-brand-500 shadow-lg shadow-brand-500/10">
            <ShieldCheck className="size-8" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">DompetKu Private</h1>
            <p className="mt-1 text-sm text-slate-400">Single-User Master Password Security Gate</p>
          </div>

          {isDefaultPassword ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-left text-xs text-amber-300">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-400" />
              <div>
                <strong className="block font-semibold text-amber-200">Mode Demo Aktif:</strong>
                Gunakan Master Password:{' '}
                <code className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-amber-400">admin123</code>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-xl border border-brand-500/20 bg-brand-500/10 p-3 text-left text-xs text-brand-300">
              <KeyRound className="mt-0.5 size-4 shrink-0 text-brand-400" />
              <div>
                <strong className="block font-semibold text-brand-200">Master Password Kustom Aktif</strong>
                Masukkan master password pribadi Anda untuk membuka akses.
              </div>
            </div>
          )}

          <form id="lock-form" onSubmit={handleUnlock} className="space-y-4 text-left">
            <div>
              <label
                htmlFor="master-password-input"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Masukkan Master Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="master-password-input"
                  required
                  autoFocus
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError(false)
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 transition focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition"
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {error && (
                <p id="lock-error" className="mt-2 flex items-center gap-1 text-xs text-rose-400">
                  <CircleX className="size-3.5 shrink-0" /> Password salah! Silakan coba lagi.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-3 font-medium text-white shadow-lg shadow-brand-600/25 transition hover:from-brand-500 hover:to-indigo-500 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Memverifikasi...
                </>
              ) : (
                <>
                  <LockKeyholeOpen className="size-4" /> Buka Akses Keuangan
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
              Direct Hash Check
            </span>
            <span>Single Tenant App</span>
          </div>
        </div>
      </div>
    </div>
  )
}

