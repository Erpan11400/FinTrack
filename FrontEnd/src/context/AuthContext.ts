import { createContext } from 'react'

export interface AuthContextValue {
  isAuthenticated: boolean
  isDefaultPassword: boolean
  login: (password: string, remember?: boolean) => Promise<boolean>
  logout: () => void
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ success: boolean; message?: string }>
  resetPasswordToDefault: () => void
  autoLockMinutes: number
  updateAutoLockMinutes: (minutes: number) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
