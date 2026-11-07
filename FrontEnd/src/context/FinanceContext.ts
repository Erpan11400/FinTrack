import { createContext } from 'react'
import type { Account, Category, FinanceData, Preset, Transaction } from '../types'

export interface FinanceContextValue extends FinanceData {
  balances: Record<string, number>
  addTransaction: (tx: Omit<Transaction, 'id'>, saveAsPreset?: boolean) => void
  addTransactions: (txs: Omit<Transaction, 'id'>[]) => void
  updateTransaction: (tx: Transaction) => void
  deleteTransaction: (id: string) => void
  runPreset: (preset: Preset) => void
  addCategory: (c: Omit<Category, 'id'>) => void
  updateCategory: (c: Category) => void
  addAccount: (a: Omit<Account, 'id'>) => void
  updateAccount: (a: Account) => void
  exportJSON: () => void
  resetToDemo: () => void
}

export const FinanceContext = createContext<FinanceContextValue | null>(null)

