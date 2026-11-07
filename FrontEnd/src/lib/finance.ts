import type { Account, CashflowPeriod, Category, Transaction } from '../types'

export function calculateAccountBalances(accounts: Account[], transactions: Transaction[]) {
  const balances: Record<string, number> = {}
  accounts.forEach((a) => (balances[a.id] = a.initialBalance || 0))

  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date))
  sorted.forEach((t) => {
    if (t.type === 'pemasukan') {
      balances[t.accountId] = (balances[t.accountId] || 0) + t.amount
    } else if (t.type === 'pengeluaran') {
      balances[t.accountId] = (balances[t.accountId] || 0) - t.amount
    } else {
      balances[t.accountId] = (balances[t.accountId] || 0) - (t.amount + (t.fee || 0))
      if (t.toAccountId) balances[t.toAccountId] = (balances[t.toAccountId] || 0) + t.amount
    }
  })
  return balances
}

export function calculateTotals(transactions: Transaction[]) {
  let inflow = 0
  let outflow = 0
  transactions.forEach((t) => {
    if (t.type === 'pemasukan') inflow += t.amount
    if (t.type === 'pengeluaran') outflow += t.amount
    if (t.type === 'transfer' && t.fee) outflow += t.fee
  })
  return { inflow, outflow, net: inflow - outflow }
}

function parseDate(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function weekStart(d: Date) {
  const r = new Date(d)
  const diff = (r.getDay() + 6) % 7 // Monday-based
  r.setDate(r.getDate() - diff)
  return r
}

/** Group inflow/outflow by period bucket (chronological). */
export function buildCashflowSeries(transactions: Transaction[], period: CashflowPeriod) {
  const buckets = new Map<string, { label: string; inflow: number; outflow: number }>()

  transactions.forEach((t) => {
    const d = parseDate(t.date)
    let key: string
    let label: string
    if (period === 'harian') {
      key = t.date
      label = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
    } else if (period === 'mingguan') {
      const ws = weekStart(d)
      key = `${ws.getFullYear()}-${pad(ws.getMonth() + 1)}-${pad(ws.getDate())}`
      label = `Mgg ${pad(ws.getDate())}/${pad(ws.getMonth() + 1)}`
    } else if (period === 'bulanan') {
      key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
      label = d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
    } else {
      key = String(d.getFullYear())
      label = key
    }
    const b = buckets.get(key) ?? { label, inflow: 0, outflow: 0 }
    if (t.type === 'pemasukan') b.inflow += t.amount
    if (t.type === 'pengeluaran') b.outflow += t.amount
    if (t.type === 'transfer') b.outflow += t.fee || 0
    buckets.set(key, b)
  })

  return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v)
}

export function buildCategoryBreakdown(transactions: Transaction[], categories: Category[]) {
  const totals = new Map<string, number>()
  transactions.forEach((t) => {
    if (t.type !== 'pengeluaran' || !t.categoryId) return
    totals.set(t.categoryId, (totals.get(t.categoryId) || 0) + t.amount)
  })
  const sum = [...totals.values()].reduce((a, b) => a + b, 0)
  return [...totals.entries()]
    .map(([id, amount]) => {
      const cat = categories.find((c) => c.id === id)
      return {
        id,
        name: cat?.name ?? 'Lainnya',
        color: cat?.color ?? '#6366f1',
        amount,
        percent: sum ? Math.round((amount / sum) * 100) : 0,
      }
    })
    .sort((a, b) => b.amount - a.amount)
}

/** Day of the week (and date) with the highest spending. */
export function findPeakSpendingDay(transactions: Transaction[]) {
  const byDate = new Map<string, number>()
  transactions.forEach((t) => {
    if (t.type === 'pengeluaran') byDate.set(t.date, (byDate.get(t.date) || 0) + t.amount)
  })
  let best: { date: string; amount: number } | null = null
  byDate.forEach((amount, date) => {
    if (!best || amount > best.amount) best = { date, amount }
  })
  return best as { date: string; amount: number } | null
}

