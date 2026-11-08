import type { Account, Category, FinanceData, Preset, Transaction } from '../types'
import { todayStr } from './utils'

export const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'bca', name: 'Bank BCA', type: 'Bank', initialBalance: 12500000, icon: 'landmark', color: '#2563eb', active: true },
  { id: 'mandiri', name: 'Bank Mandiri', type: 'Bank', initialBalance: 7500000, icon: 'landmark', color: '#0284c7', active: true },
  { id: 'dana', name: 'E-Wallet DANA', type: 'E-Wallet', initialBalance: 850000, icon: 'wallet', color: '#0ea5e9', active: true },
  { id: 'ovo', name: 'E-Wallet OVO', type: 'E-Wallet', initialBalance: 450000, icon: 'smartphone', color: '#7c3aed', active: true },
  { id: 'cash', name: 'Cash (Uang Tunai)', type: 'Tunai', initialBalance: 1200000, icon: 'banknote', color: '#10b981', active: true },
]

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', type: 'pengeluaran', name: 'Makanan & Minuman', color: '#f43f5e', active: true },
  { id: 'cat-2', type: 'pengeluaran', name: 'Transportasi', color: '#f59e0b', active: true },
  { id: 'cat-3', type: 'pengeluaran', name: 'Tagihan & Utilitas', color: '#6366f1', active: true },
  { id: 'cat-4', type: 'pengeluaran', name: 'Gaya Hidup & Hobi', color: '#ec4899', active: true },
  { id: 'cat-5', type: 'pemasukan', name: 'Gaji & Utama', color: '#10b981', active: true },
  { id: 'cat-6', type: 'pemasukan', name: 'Investasi & Side Job', color: '#14b8a6', active: true },
]

export const DEFAULT_PRESETS: Preset[] = [
  { id: 'p1', name: 'Kopi Pagi', label: 'Kopi Pagi', amount: 25000, accountId: 'ovo', categoryId: 'cat-1', type: 'pengeluaran', description: 'Kopi Pagi Break Kerja', icon: 'coffee' },
  { id: 'p2', name: 'Makan Siang', label: 'Makan Siang', amount: 35000, accountId: 'cash', categoryId: 'cat-1', type: 'pengeluaran', description: 'Makan Siang Restoran', icon: 'utensils' },
  { id: 'p3', name: 'Bensin Mobil', label: 'Bensin Mobil', amount: 200000, accountId: 'bca', categoryId: 'cat-2', type: 'pengeluaran', description: 'Bensin Mobil SPBU', icon: 'fuel' },
  { id: 'p4', name: 'TopUp DANA', label: 'TopUp DANA', amount: 500000, accountId: 'mandiri', toAccountId: 'dana', type: 'transfer', fee: 1000, description: 'Top Up Saldo E-Wallet DANA', icon: 'arrow-left-right' },
]

export function generateSampleTransactions(): Transaction[] {
  const today = todayStr()
  return [
    { id: 'tx-1', date: today, type: 'pemasukan', amount: 15000000, accountId: 'bca', categoryId: 'cat-5', description: 'Gaji Bulanan Perusahaan' },
    { id: 'tx-2', date: today, type: 'pengeluaran', amount: 115000, accountId: 'bca', categoryId: 'cat-1', description: 'Groceries Mingguan Supermarket' },
    { id: 'tx-3', date: today, type: 'pengeluaran', amount: 25000, accountId: 'ovo', categoryId: 'cat-1', description: 'Kopi Kekinian Break Kerja' },
    { id: 'tx-4', date: today, type: 'pengeluaran', amount: 350000, accountId: 'mandiri', categoryId: 'cat-3', description: 'Tagihan Wi-Fi Rumah' },
    { id: 'tx-5', date: today, type: 'transfer', amount: 500000, accountId: 'mandiri', toAccountId: 'dana', fee: 1000, description: 'Top Up Saldo E-Wallet DANA' },
  ]
}

export function createDefaultData(): FinanceData {
  return {
    accounts: structuredClone(DEFAULT_ACCOUNTS),
    categories: structuredClone(DEFAULT_CATEGORIES),
    presets: structuredClone(DEFAULT_PRESETS),
    transactions: generateSampleTransactions(),
  }
}

