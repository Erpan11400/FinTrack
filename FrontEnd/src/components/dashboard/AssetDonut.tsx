import { Doughnut } from 'react-chartjs-2'
import '../../lib/chart'
import { useFinance } from '../../hooks/useFinance'
import { formatRp } from '../../lib/utils'

export function AssetDonut() {
  const { accounts, balances } = useFinance()
  const active = accounts.filter((a) => a.active)

  return (
    <div className="glass-panel flex flex-col justify-between space-y-4 rounded-2xl p-5">
      <div>
        <h3 className="text-base font-bold text-slate-100">Komposisi Aset</h3>
        <p className="text-xs text-slate-400">Distribusi Saldo antar Akun Penyimpanan</p>
      </div>
      <div className="relative flex h-56 w-full items-center justify-center">
        <Doughnut
          data={{
            labels: active.map((a) => a.name),
            datasets: [
              {
                data: active.map((a) => Math.max(0, balances[a.id] || 0)),
                backgroundColor: active.map((a) => a.color || '#6366f1'),
                borderWidth: 0,
              },
            ],
          }}
          options={{ responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-2 text-xs">
        {active.map((a) => (
          <div key={a.id} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: a.color }} />
            <span className="truncate text-slate-300">{a.name}:</span>
            <strong className="ml-auto font-mono text-slate-200">{formatRp(balances[a.id] || 0)}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

