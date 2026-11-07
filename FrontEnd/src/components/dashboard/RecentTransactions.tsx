import { Link } from 'react-router-dom'
import { useFinance } from '../../hooks/useFinance'
import { cn, formatRp } from '../../lib/utils'

export function RecentTransactions() {
  const { transactions, accounts, categories } = useFinance()

  return (
    <div className="glass-panel space-y-4 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-100">Transaksi Terakhir</h3>
        <Link to="/ledger" className="text-xs font-medium text-brand-400 hover:text-brand-300">
          Lihat Semua di Buku Kas &rarr;
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-3 py-3">Tanggal</th>
              <th className="px-3 py-3">Deskripsi</th>
              <th className="px-3 py-3">Kategori</th>
              <th className="px-3 py-3">Akun</th>
              <th className="px-3 py-3 text-right">Nominal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {transactions.slice(0, 5).map((t) => {
              const acc = accounts.find((a) => a.id === t.accountId)
              const cat = categories.find((c) => c.id === t.categoryId)
              return (
                <tr key={t.id} className="transition hover:bg-slate-900/40">
                  <td className="px-3 py-2.5 font-mono text-slate-400">{t.date}</td>
                  <td className="px-3 py-2.5 font-medium text-slate-200">{t.description}</td>
                  <td className="px-3 py-2.5">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                      {t.type === 'transfer' ? 'Transfer' : (cat?.name ?? '-')}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-400">{acc?.name ?? 'Unknown'}</td>
                  <td
                    className={cn(
                      'px-3 py-2.5 text-right font-mono font-semibold',
                      t.type === 'pemasukan' ? 'text-emerald-400' : 'text-rose-400',
                    )}
                  >
                    {t.type === 'pemasukan' ? '+' : '-'}
                    {formatRp(t.amount)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

