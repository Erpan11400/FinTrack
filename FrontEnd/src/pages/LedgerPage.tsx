import { useState } from 'react'
import { Pencil, Search, Trash2 } from 'lucide-react'
import { Select } from '../components/ui/Select'
import { TransactionModal } from '../components/transaction/TransactionModal'
import { useFinance } from '../hooks/useFinance'
import { formatRp } from '../lib/utils'
import type { Transaction } from '../types'

export default function LedgerPage() {
  const { accounts, transactions, categories, deleteTransaction } = useFinance()
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '')
  const [search, setSearch] = useState('')
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)

  const account = accounts.find((a) => a.id === accountId) ?? accounts[0]
  if (!account) return <p className="text-xs text-slate-400">Belum ada akun.</p>

  let running = account.initialBalance || 0
  let totalIn = 0
  let totalOut = 0
  const q = search.toLowerCase()

  const allRows: { t: Transaction; amountIn: number; amountOut: number; balance: number }[] = []
  const related = transactions
    .filter((t) => t.accountId === account.id || t.toAccountId === account.id)
    .sort((a, b) => a.date.localeCompare(b.date))
  for (const t of related) {
    let amountIn = 0
    let amountOut = 0
    if (t.type === 'pemasukan') amountIn = t.amount
    else if (t.type === 'pengeluaran') amountOut = t.amount
    else if (t.accountId === account.id) amountOut = t.amount + (t.fee || 0)
    else amountIn = t.amount
    running += amountIn - amountOut
    totalIn += amountIn
    totalOut += amountOut
    allRows.push({ t, amountIn, amountOut, balance: running })
  }
  const rows = allRows.filter(
    ({ t }) => !q || t.description.toLowerCase().includes(q) || (t.tags || '').toLowerCase().includes(q),
  )

  return (
    <div className="space-y-6">
      <div className="glass-panel flex flex-col justify-between gap-4 rounded-2xl p-5 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Buku Kas per Akun (Account Ledger)</h2>
          <p className="mt-0.5 text-xs text-slate-400">Kronologi mutasi terisolasi dan saldo berjalan per akun penyimpanan</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="whitespace-nowrap font-semibold text-slate-400">Pilih Akun:</span>
          <Select
            aria-label="Pilih Akun"
            value={account.id}
            onValueChange={setAccountId}
            className="min-w-[200px]"
            options={accounts.map((a) => ({ value: a.id, label: `${a.name} (${a.type})` }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="glass-panel rounded-xl p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Saldo Awal</span>
          <div className="mt-1 text-xl font-bold text-slate-200">{formatRp(account.initialBalance || 0)}</div>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Total Masuk</span>
          <div className="mt-1 text-xl font-bold text-emerald-400">+{formatRp(totalIn)}</div>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Total Keluar</span>
          <div className="mt-1 text-xl font-bold text-rose-400">-{formatRp(totalOut)}</div>
        </div>
        <div className="glass-panel rounded-xl border-brand-500/30 bg-brand-900/20 p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-300">Saldo Akhir Saat Ini</span>
          <div className="mt-1 text-xl font-extrabold text-white">{formatRp(running)}</div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/60 p-4 sm:flex-row">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari deskripsi atau tag..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="text-xs text-slate-400">Menampilkan saldo berjalan kronologis (terlama &rarr; terbaru)</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Deskripsi & Tag</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3 text-right">Masuk (In)</th>
                <th className="px-4 py-3 text-right">Keluar (Out)</th>
                <th className="px-4 py-3 text-right font-semibold">Saldo Berjalan</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {rows.map(({ t, amountIn, amountOut, balance }) => (
                <tr key={t.id} className="transition hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-mono text-slate-400">{t.date}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-200">{t.description}</div>
                    <div className="mt-0.5 font-mono text-xs text-brand-400">{t.tags || ''}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {t.type === 'transfer' ? 'Transfer Internal' : (categories.find((c) => c.id === t.categoryId)?.name ?? '-')}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-400">{amountIn > 0 ? '+' + formatRp(amountIn) : '-'}</td>
                  <td className="px-4 py-3 text-right font-mono text-rose-400">{amountOut > 0 ? '-' + formatRp(amountOut) : '-'}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-100">{formatRp(balance)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingTx(t)}
                        className="p-1 text-slate-500 hover:text-brand-400 transition"
                        title="Edit Transaksi"
                        aria-label="Edit Transaksi"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTransaction(t.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                        title="Hapus Transaksi"
                        aria-label="Hapus Transaksi"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Belum ada transaksi untuk akun ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionModal
        open={!!editingTx}
        onOpenChange={(open) => {
          if (!open) setEditingTx(null)
        }}
        transaction={editingTx}
      />
    </div>
  )
}
