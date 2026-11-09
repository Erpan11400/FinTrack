import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { AuthContext } from './AuthContext'
import {
  changeMasterPassword,
  clearAuthSession,
  getAutoLockMinutes,
  getLastActivity,
  isSessionAuthenticated,
  isUsingDefaultPassword,
  resetMasterPasswordToDefault,
  saveAuthSession,
  setAutoLockMinutes,
  updateLastActivity,
  verifyMasterPassword,
} from '../lib/auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isSessionAuthenticated())
  const [isDefaultPassword, setIsDefaultPassword] = useState<boolean>(() => isUsingDefaultPassword())
  const [autoLockMinutes, setAutoLockMinutesState] = useState<number>(() => getAutoLockMinutes())

  const lastActiveRef = useRef<number>(getLastActivity())

  const logout = useCallback(() => {
    clearAuthSession()
    setIsAuthenticated(false)
  }, [])

  const login = useCallback(async (password: string, remember = true) => {
    const isValid = await verifyMasterPassword(password)
    if (isValid) {
      saveAuthSession(remember)
      lastActiveRef.current = Date.now()
      setIsAuthenticated(true)
      setIsDefaultPassword(isUsingDefaultPassword())
      return true
    }
    return false
  }, [])

  const handleChangePassword = useCallback(async (currentPass: string, newPass: string) => {
    const res = await changeMasterPassword(currentPass, newPass)
    if (res.success) {
      setIsDefaultPassword(isUsingDefaultPassword())
    }
    return res
  }, [])

  const handleResetPassword = useCallback(() => {
    resetMasterPasswordToDefault()
    setIsDefaultPassword(true)
  }, [])

  const handleUpdateAutoLock = useCallback((minutes: number) => {
    setAutoLockMinutes(minutes)
    setAutoLockMinutesState(minutes)
  }, [])

  // Auto-lock idle tracker
  useEffect(() => {
    if (!isAuthenticated || autoLockMinutes <= 0) return

    const checkLock = () => {
      const maxIdleMs = autoLockMinutes * 60 * 1000
      const last = Math.max(lastActiveRef.current, getLastActivity())
      if (Date.now() - last >= maxIdleMs) {
        logout()
      }
    }

    const onUserActivity = () => {
      const now = Date.now()
      if (now - lastActiveRef.current > 3000) {
        updateLastActivity()
      }
      lastActiveRef.current = now
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkLock()
      }
    }

    // Check immediately on mount/load
    checkLock()

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach((ev) => window.addEventListener(ev, onUserActivity, { passive: true }))
    document.addEventListener('visibilitychange', onVisibilityChange)

    const intervalId = window.setInterval(checkLock, 5000)

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, onUserActivity))
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.clearInterval(intervalId)
    }
  }, [isAuthenticated, autoLockMinutes, logout])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isDefaultPassword,
        login,
        logout,
        changePassword: handleChangePassword,
        resetPasswordToDefault: handleResetPassword,
        autoLockMinutes,
        updateAutoLockMinutes: handleUpdateAutoLock,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
