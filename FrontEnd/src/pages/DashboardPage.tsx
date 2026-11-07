import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, CircleCheck, Scale, TriangleAlert, Vault } from 'lucide-react'
import { StatCard } from '../components/dashboard/StatCard'
import { PresetBar } from '../components/dashboard/PresetBar'
import { CashflowChart } from '../components/dashboard/CashflowChart'
import { AssetDonut } from '../components/dashboard/AssetDonut'
import { RecentTransactions } from '../components/dashboard/RecentTransactions'
import { useFinance } from '../hooks/useFinance'
import { calculateTotals } from '../lib/finance'
import { formatRp } from '../lib/utils'

export default function DashboardPage() {
  const { transactions, accounts, balances } = useFinance()
  const { inflow, outflow, net } = calculateTotals(transactions)
  const deficit = net < 0
  const totalAssets = accounts.filter((a) => a.active).reduce((s, a) => s + (balances[a.id] || 0), 0)

  return (
    <div className="space-y-6">
      <div className="glass-panel flex flex-col justify-between gap-4 rounded-2xl p-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Dashboard Finansial</h2>
          <p className="mt-0.5 text-xs text-slate-400">Ringkasan arus kas, aset, dan performa keuangan pribadi</p>
        </div>
      </div>

      {deficit && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-500/40 bg-rose-950/60 p-4 text-rose-200 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/20 text-rose-400">
              <TriangleAlert className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-100">Peringatan Defisit Keuangan!</h4>
              <p className="mt-0.5 text-xs text-rose-300/90">
                Pengeluaran Anda pada periode ini melebihi total pemasukan. Evaluasi konsumsi rutin Anda.
              </p>
            </div>
          </div>
          <Link
            to="/analytics"
            className="whitespace-nowrap rounded-lg bg-rose-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-800"
          >
            Lihat Analisis
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Pemasukan"
          value={formatRp(inflow)}
          icon={ArrowDown}
          iconClass="bg-emerald-500/10 text-emerald-400"
          valueClass="text-emerald-400"
          footer="Semua transaksi"
        />
        <StatCard
          title="Total Pengeluaran"
          value={formatRp(outflow)}
          icon={ArrowUp}
          iconClass="bg-rose-500/10 text-rose-400"
          valueClass="text-rose-400"
          footer="Semua transaksi"
        />
        <StatCard
          title="Net Cash Flow"
          value={formatRp(net)}
          icon={Scale}
          iconClass="bg-brand-500/10 text-brand-400"
          valueClass={deficit ? 'text-rose-400' : 'text-emerald-400'}
          footer={
            deficit ? (
              <span className="inline-flex items-center gap-1 font-semibold text-rose-400">
                <TriangleAlert className="size-3" /> Defisit (Pengeluaran &gt; Pemasukan)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                <CircleCheck className="size-3" /> Surplus Finansial Sehat
              </span>
            )
          }
        />
        <StatCard
          title="Total Kekayaan (Aset)"
          value={formatRp(totalAssets)}
          icon={Vault}
          iconClass="bg-indigo-500/10 text-indigo-400"
          valueClass="text-indigo-300"
          footer="Semua Akun Aktif"
        />
      </div>

      <PresetBar />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CashflowChart />
        <AssetDonut />
      </div>

      <RecentTransactions />
    </div>
  )
}

