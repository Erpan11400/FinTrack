import type { FinanceData } from '../types'
import { createDefaultData } from './defaults'

const STORAGE_KEY = 'dompetku_state'

export function loadFinanceData(): FinanceData {
  const defaults = createDefaultData()
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return defaults
  try {
    const parsed = JSON.parse(saved) as Partial<FinanceData>
    return {
      accounts: parsed.accounts ?? defaults.accounts,
      categories: (parsed.categories ?? defaults.categories).map((c) => ({
        ...c,
        active: c.active !== false,
      })),
      presets: parsed.presets ?? defaults.presets,
      transactions: parsed.transactions ?? defaults.transactions,
    }
  } catch {
    return defaults
  }
}

export function saveFinanceData(data: FinanceData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function clearFinanceData() {
  localStorage.removeItem(STORAGE_KEY)
}

