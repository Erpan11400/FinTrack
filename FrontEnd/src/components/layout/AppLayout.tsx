import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { BookOpen, ChartLine, ChartPie, Lock, Plus, SlidersHorizontal, type LucideIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { TransactionModal } from '../transaction/TransactionModal'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { cn } from '../../lib/utils'

const NAV: { to: string; label: string; mobile: string; icon: LucideIcon }[] = [
  { to: '/', label: 'Dashboard', mobile: 'Dashboard', icon: ChartPie },
  { to: '/ledger', label: 'Buku Kas', mobile: 'Buku Kas', icon: BookOpen },
  { to: '/analytics', label: 'Analisis Tren', mobile: 'Analisis', icon: ChartLine },
  { to: '/master', label: 'Master & Setting', mobile: 'Pengaturan', icon: SlidersHorizontal },
]

export function AppLayout() {
  const [txOpen, setTxOpen] = useState(false)
  const { logout } = useAuth()
  const { toast } = useToast()

  function handleLock() {
    logout()
    toast('Aplikasi dikunci.', 'info')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="logo" className='w-8' />
            <div>
              <span className="text-base font-bold tracking-tight text-slate-100">Dompet Ervan</span>
              <span className="ml-1.5 hidden rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-400 md:inline">
                Personal Edition
              </span>
            </div>
          </div>

          <nav className="hidden items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-950 p-1 md:flex">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition',
                    isActive ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200',
                  )
                }
              >
                <Icon className="size-3.5" /> {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button onClick={() => setTxOpen(true)} className="px-3 sm:px-4">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Tambah Transaksi</span>
            </Button>
            <Button
              variant="secondary"
              onClick={handleLock}
              className="px-2.5 sm:px-3 text-slate-400 hover:text-rose-400 hover:border-rose-900/50"
              title="Kunci Akses"
            >
              <Lock className="size-4" />
              <span className="hidden sm:inline">Kunci</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-around border-t border-slate-800 bg-slate-950 px-2 py-2 text-xs md:hidden">
          {NAV.map(({ to, mobile, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn('flex flex-col items-center gap-1', isActive ? 'font-semibold text-brand-400' : 'text-slate-400')
              }
            >
              <Icon className="size-4" /> {mobile}
            </NavLink>
          ))}
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <TransactionModal open={txOpen} onOpenChange={setTxOpen} />
    </div>
  )
}

