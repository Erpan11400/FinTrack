import { useState, useEffect, Fragment } from 'react'
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pencil, Search, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { TransactionModal } from '../components/transaction/TransactionModal'
import { useFinance } from '../hooks/useFinance'
import { cn, formatRp } from '../lib/utils'
import type { Transaction } from '../types'

function formatMonthYear(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00')
    const formatted = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  } catch {
    return dateStr
  }
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  if (current <= 3) {
    return [1, 2, 3, 4, '...', total]
  }
  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total]
  }
  return [1, '...', current - 1, current, current + 1, '...', total]
}

export default function LedgerPage() {
  const { accounts, transactions, categories, deleteTransaction } = useFinance()
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '')
  const [search, setSearch] = useState('')
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Reset page when account or search changes
  useEffect(() => {
    setPage(1)
  }, [accountId, search])

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
    ({ t }) => !q || t.description.toLowerCase().includes(q),
  )

  const sortedRows = [...rows].reverse()

  const totalItems = sortedRows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedRows = sortedRows.slice(startIndex, endIndex)
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  // Group paginated items by Month & Year
  interface RowItem {
    t: Transaction
    amountIn: number
    amountOut: number
    balance: number
  }

  const groupedRows: { monthLabel: string; items: RowItem[] }[] = []
  let currentGroup: { monthLabel: string; items: RowItem[] } | null = null

  for (const row of paginatedRows) {
    const label = formatMonthYear(row.t.date)
    if (!currentGroup || currentGroup.monthLabel !== label) {
      currentGroup = { monthLabel: label, items: [] }
      groupedRows.push(currentGroup)
    }
    currentGroup.items.push(row)
  }

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
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari deskripsi..."
              className="py-1.5 pl-8 pr-3 bg-slate-950 border-slate-800"
            />
          </div>
          <div className="text-xs text-slate-400">
            Dikelompokkan per bulan · Saldo berjalan terhitung otomatis
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Deskripsi</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3 text-right">Masuk (In)</th>
                <th className="px-4 py-3 text-right">Keluar (Out)</th>
                <th className="px-4 py-3 text-right font-semibold">Saldo Berjalan</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {groupedRows.map((group) => (
                <Fragment key={group.monthLabel}>
                  {/* Group Header: Month & Year */}
                  <tr className="border-y border-slate-800/90 bg-slate-900/95 font-semibold">
                    <td colSpan={7} className="px-4 py-2 text-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-3.5 text-brand-400" />
                          <span className="font-bold text-white tracking-wide">{group.monthLabel}</span>
                          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-normal text-slate-400">
                            {group.items.length} transaksi
                          </span>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono font-medium">
                          <span className="text-emerald-400">
                            +{formatRp(group.items.reduce((acc, curr) => acc + curr.amountIn, 0))}
                          </span>
                          <span className="text-rose-400">
                            -{formatRp(group.items.reduce((acc, curr) => acc + curr.amountOut, 0))}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Transaction Rows within this Month */}
                  {group.items.map(({ t, amountIn, amountOut, balance }) => (
                    <tr key={t.id} className="transition hover:bg-slate-900/40">
                      <td className="px-4 py-3 font-mono text-slate-400">{t.date}</td>
                      <td className="px-4 py-3 font-medium text-slate-200">
                        {t.description}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {t.type === 'transfer' ? 'Transfer Internal' : (categories.find((c) => c.id === t.categoryId)?.name ?? '-')}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-400">{amountIn > 0 ? '+' + formatRp(amountIn) : '-'}</td>
                      <td className="px-4 py-3 text-right font-mono text-rose-400">{amountOut > 0 ? '-' + formatRp(amountOut) : '-'}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-100">{formatRp(balance)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingTx(t)}
                            className="size-7 text-slate-500 hover:text-brand-400"
                            title="Edit Transaksi"
                            aria-label="Edit Transaksi"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTransaction(t.id)}
                            className="size-7 text-slate-500 hover:text-rose-400"
                            title="Hapus Transaksi"
                            aria-label="Hapus Transaksi"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}

              {groupedRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    {search ? 'Tidak ada transaksi yang cocok dengan pencarian.' : 'Belum ada transaksi untuk akun ini.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 bg-slate-900/60 px-4 py-3 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-3">
              <span>
                Menampilkan <strong className="text-slate-200">{startIndex + 1}</strong>–
                <strong className="text-slate-200">{endIndex}</strong> dari{' '}
                <strong className="text-slate-200">{totalItems}</strong> transaksi
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Per halaman:</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(val) => {
                    setPageSize(Number(val))
                    setPage(1)
                  }}
                  className="w-20 px-2 py-1 text-xs border-slate-800 bg-slate-950 rounded-lg"
                  options={[
                    { value: '10', label: '10' },
                    { value: '25', label: '25' },
                    { value: '50', label: '50' },
                    { value: '100', label: '100' },
                  ]}
                />
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setPage(1)}
                disabled={currentPage <= 1}
                className="size-7 rounded-lg border-slate-800 bg-slate-900"
                title="Halaman Pertama"
                aria-label="Halaman Pertama"
              >
                <ChevronsLeft className="size-3.5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="size-7 rounded-lg border-slate-800 bg-slate-900"
                title="Halaman Sebelumnya"
                aria-label="Halaman Sebelumnya"
              >
                <ChevronLeft className="size-3.5" />
              </Button>

              <div className="flex items-center gap-1 mx-1">
                {pageNumbers.map((p, idx) =>
                  typeof p === 'number' ? (
                    <Button
                      key={p}
                      variant={currentPage === p ? 'primary' : 'secondary'}
                      size="icon"
                      onClick={() => setPage(p)}
                      className={cn(
                        'size-7 rounded-lg text-xs font-semibold',
                        currentPage !== p && 'border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white',
                      )}
                    >
                      {p}
                    </Button>
                  ) : (
                    <span key={`dots-${idx}`} className="px-1 text-slate-600 select-none">
                      ...
                    </span>
                  ),
                )}
              </div>

              <Button
                variant="secondary"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="size-7 rounded-lg border-slate-800 bg-slate-900"
                title="Halaman Selanjutnya"
                aria-label="Halaman Selanjutnya"
              >
                <ChevronRight className="size-3.5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setPage(totalPages)}
                disabled={currentPage >= totalPages}
                className="size-7 rounded-lg border-slate-800 bg-slate-900"
                title="Halaman Terakhir"
                aria-label="Halaman Terakhir"
              >
                <ChevronsRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
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
