import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { FinanceData, Preset, Transaction } from '../types'
import { FinanceContext, type FinanceContextValue } from './FinanceContext'
import { clearFinanceData, loadFinanceData, saveFinanceData } from '../lib/storage'
import { createDefaultData } from '../lib/defaults'
import { calculateAccountBalances } from '../lib/finance'
import { todayStr } from '../lib/utils'
import { useToast } from '../hooks/useToast'

let idCounter = 0
const uid = (prefix: string) => `${prefix}-${Date.now()}-${idCounter++}`

function randomColor() {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FinanceData>(() => loadFinanceData())
  const { toast } = useToast()

  useEffect(() => {
    saveFinanceData(data)
  }, [data])

  const balances = useMemo(
    () => calculateAccountBalances(data.accounts, data.transactions),
    [data.accounts, data.transactions],
  )

  const addTransaction = useCallback<FinanceContextValue['addTransaction']>(
    (tx, saveAsPreset) => {
      const newTx: Transaction = { ...tx, id: uid('tx') }
      setData((d) => ({
        ...d,
        transactions: [newTx, ...d.transactions],
        presets: saveAsPreset
          ? [
              ...d.presets,
              {
                id: uid('p'),
                label: newTx.description,
                amount: newTx.amount,
                accountId: newTx.accountId,
                toAccountId: newTx.toAccountId ?? undefined,
                categoryId: newTx.categoryId ?? undefined,
                subCategory: newTx.subCategory ?? undefined,
                fee: newTx.fee,
                type: newTx.type,
                icon: 'star',
              },
            ]
          : d.presets,
      }))
      toast('Transaksi Berhasil Disimpan!', 'success')
    },
    [toast],
  )

  const addTransactions = useCallback<FinanceContextValue['addTransactions']>((txs) => {
    setData((d) => ({
      ...d,
      transactions: [...txs.map((t) => ({ ...t, id: uid('imp') })), ...d.transactions],
    }))
  }, [])

  const updateTransaction = useCallback<FinanceContextValue['updateTransaction']>(
    (tx) => {
      setData((d) => ({
        ...d,
        transactions: d.transactions.map((t) => (t.id === tx.id ? tx : t)),
      }))
      toast('Transaksi Berhasil Diperbarui!', 'success')
    },
    [toast],
  )

  const deleteTransaction = useCallback(
    (id: string) => {
      setData((d) => ({ ...d, transactions: d.transactions.filter((t) => t.id !== id) }))
      toast('Transaksi Berhasil Dihapus', 'info')
    },
    [toast],
  )

  const runPreset = useCallback(
    (p: Preset) => {
      const newTx: Transaction = {
        id: uid('tx'),
        date: todayStr(),
        type: p.type,
        amount: p.amount,
        accountId: p.accountId,
        toAccountId: p.toAccountId ?? null,
        fee: p.fee || 0,
        categoryId: p.type === 'transfer' ? null : (p.categoryId ?? null),
        subCategory: p.subCategory ?? '',
        description: `[Quick Preset] ${p.label}`,
        tags: '#Preset',
      }
      setData((d) => ({ ...d, transactions: [newTx, ...d.transactions] }))
      toast(`Preset "${p.label}" Berhasil Dieksekusi!`, 'success')
    },
    [toast],
  )

  const addCategory = useCallback<FinanceContextValue['addCategory']>(
    (c) => {
      setData((d) => ({ ...d, categories: [...d.categories, { ...c, id: uid('cat'), color: c.color || randomColor() }] }))
      toast('Kategori Master Berhasil Ditambahkan', 'success')
    },
    [toast],
  )

  const updateCategory = useCallback<FinanceContextValue['updateCategory']>(
    (c) => {
      setData((d) => ({
        ...d,
        categories: d.categories.map((cat) => (cat.id === c.id ? c : cat)),
      }))
      toast('Kategori Berhasil Diperbarui!', 'success')
    },
    [toast],
  )

  const addAccount = useCallback<FinanceContextValue['addAccount']>(
    (a) => {
      setData((d) => ({ ...d, accounts: [...d.accounts, { ...a, id: uid('acc'), color: a.color || randomColor() }] }))
      toast('Akun Storage Berhasil Ditambahkan', 'success')
    },
    [toast],
  )

  const updateAccount = useCallback<FinanceContextValue['updateAccount']>(
    (a) => {
      setData((d) => ({
        ...d,
        accounts: d.accounts.map((acc) => (acc.id === a.id ? a : acc)),
      }))
      toast('Akun Berhasil Diperbarui!', 'success')
    },
    [toast],
  )

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dompetku_backup_${todayStr()}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast('File Cadangan JSON Berhasil Di-download', 'success')
  }, [data, toast])

  const resetToDemo = useCallback(() => {
    clearFinanceData()
    setData(createDefaultData())
    toast('Aplikasi berhasil di-reset ke data awal demo', 'info')
  }, [toast])

  const value: FinanceContextValue = {
    ...data,
    balances,
    addTransaction,
    addTransactions,
    updateTransaction,
    deleteTransaction,
    runPreset,
    addCategory,
    updateCategory,
    addAccount,
    updateAccount,
    exportJSON,
    resetToDemo,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

