export type TxType = 'pengeluaran' | 'pemasukan' | 'transfer'
export type CategoryType = 'pengeluaran' | 'pemasukan'
export type AccountType = 'Bank' | 'E-Wallet' | 'Tunai' | 'Investasi'
export type CashflowPeriod = 'harian' | 'mingguan' | 'bulanan' | 'tahunan'

export interface Account {
  id: string
  name: string
  type: AccountType
  initialBalance: number
  icon: string
  color: string
  active: boolean
}

export interface Category {
  id: string
  type: CategoryType
  name: string
  subs: string[]
  color: string
}

export interface Transaction {
  id: string
  date: string // YYYY-MM-DD
  type: TxType
  amount: number
  accountId: string
  toAccountId?: string | null
  fee?: number
  categoryId?: string | null
  subCategory?: string | null
  description: string
  tags: string
}

export interface Preset {
  id: string
  label: string
  amount: number
  accountId: string
  toAccountId?: string
  categoryId?: string
  subCategory?: string
  type: TxType
  fee?: number
  icon?: string
}

export interface FinanceData {
  accounts: Account[]
  categories: Category[]
  presets: Preset[]
  transactions: Transaction[]
}

