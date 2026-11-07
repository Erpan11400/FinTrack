import { Bar } from 'react-chartjs-2'
import { Crown, Flame, PiggyBank } from 'lucide-react'
import '../lib/chart'
import { useFinance } from '../hooks/useFinance'
import { buildCategoryBreakdown, calculateTotals, findPeakSpendingDay } from '../lib/finance'
import { formatRp } from '../lib/utils'

export default function AnalyticsPage() {
  const { transactions, categories } = useFinance()
  const breakdown = buildCategoryBreakdown(transactions, categories)
  const top5 = breakdown.slice(0, 5)
  const { inflow, net } = calculateTotals(transactions)
  const savingsRate = inflow > 0 ? (net / inflow) * 100 : 0
  const peak = findPeakSpendingDay(transactions)
  const peakLabel = peak
    ? `${new Date(peak.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })} · ${formatRp(peak.amount)}`
    : '-'

  const insights = [
    { icon: Flame, tone: 'amber', title: 'Hari Pengeluaran Tertinggi', value: peakLabel, desc: 'Hari dengan lonjakan konsumsi terbesar', valueClass: 'text-white' },
    { icon: Crown, tone: 'rose', title: 'Kategori Dominan', value: breakdown[0]?.name ?? '-', desc: 'Menyerap porsi anggaran terbanyak', valueClass: 'text-rose-300' },
    { icon: PiggyBank, tone: 'emerald', title: 'Rasio Tabungan / Surplus', value: `${savingsRate.toFixed(1)}%`, desc: 'Persentase net cash flow dari pemasukan', valueClass: savingsRate >= 0 ? 'text-emerald-400' : 'text-rose-400' },
  ] as const

  const tones = {
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-5">
        <h2 className="text-xl font-bold text-white">Analisis Tren & Pola Konsumsi</h2>
        <p className="mt-0.5 text-xs text-slate-400">Identifikasi kategori pengeluaran terbesar dan kebiasaan finansial</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {insights.map(({ icon: Icon, tone, title, value, desc, valueClass }) => (
          <div key={title} className="glass-panel flex items-start gap-4 rounded-2xl p-5">
            <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border ${tones[tone]}`}>
              <Icon className="size-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
              <div className={`mt-1 text-xl font-bold ${valueClass}`}>{value}</div>
              <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-panel space-y-4 rounded-2xl p-5">
          <h3 className="text-base font-bold text-slate-100">Top 5 Kategori Pengeluaran</h3>
          <div className="relative h-64 w-full">
            <Bar
              data={{
                labels: top5.map((c) => c.name),
                datasets: [{ label: 'Pengeluaran (Rp)', data: top5.map((c) => c.amount), backgroundColor: top5.map((c) => c.color), borderRadius: 6 }],
              }}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                  y: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                },
              }}
            />
          </div>
        </div>

        <div className="glass-panel space-y-4 rounded-2xl p-5">
          <h3 className="text-base font-bold text-slate-100">Rincian Pola Konsumsi Kategori</h3>
          <div className="space-y-3">
            {breakdown.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="size-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="font-semibold text-slate-200">{c.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-white">{formatRp(c.amount)}</span>
                  <span className="block text-xs text-slate-500">{c.percent}% dari total pengeluaran</span>
                </div>
              </div>
            ))}
            {breakdown.length === 0 && <p className="text-xs text-slate-500">Belum ada data pengeluaran.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

