import { useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import '../../lib/chart'
import { axisStyle } from '../../lib/chart'
import { useFinance } from '../../hooks/useFinance'
import { buildCashflowSeries } from '../../lib/finance'
import { cn } from '../../lib/utils'
import type { CashflowPeriod } from '../../types'

const PERIODS: { value: CashflowPeriod; label: string }[] = [
  { value: 'harian', label: 'Harian' },
  { value: 'mingguan', label: 'Mingguan' },
  { value: 'bulanan', label: 'Bulanan' },
  { value: 'tahunan', label: 'Tahunan' },
]

export function CashflowChart() {
  const { transactions } = useFinance()
  const [period, setPeriod] = useState<CashflowPeriod>('bulanan')

  const series = useMemo(() => buildCashflowSeries(transactions, period), [transactions, period])

  return (
    <div className="glass-panel space-y-4 rounded-2xl p-5 lg:col-span-2">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-bold text-slate-100">Grafik Arus Kas (Cash Flow)</h3>
          <p className="text-xs text-slate-400">Perbandingan Pemasukan (Inflow) vs Pengeluaran (Outflow)</p>
        </div>
        <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900 p-1 text-xs">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={cn(
                'rounded-lg px-2.5 py-1 font-medium transition',
                period === p.value ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative h-64 w-full sm:h-72">
        <Bar
          data={{
            labels: series.map((s) => s.label),
            datasets: [
              { label: 'Pemasukan (Inflow)', data: series.map((s) => s.inflow), backgroundColor: '#10b981', borderRadius: 8 },
              { label: 'Pengeluaran (Outflow)', data: series.map((s) => s.outflow), backgroundColor: '#f43f5e', borderRadius: 8 },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94a3b8' } } },
            scales: axisStyle,
          }}
        />
      </div>
    </div>
  )
}

