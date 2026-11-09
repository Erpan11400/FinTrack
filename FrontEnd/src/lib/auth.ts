export const DEFAULT_PASS_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'
export const AUTH_STORAGE_KEY = 'dompetku_auth_session'
export const MASTER_HASH_KEY = 'dompetku_master_hash'
export const AUTOLOCK_STORAGE_KEY = 'dompetku_autolock_minutes'
export const LAST_ACTIVITY_KEY = 'dompetku_last_activity'

export const DEFAULT_AUTOLOCK_MINUTES = 5

export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function getMasterPasswordHash(): string {
  return localStorage.getItem(MASTER_HASH_KEY) || DEFAULT_PASS_HASH
}

export function isUsingDefaultPassword(): boolean {
  return getMasterPasswordHash() === DEFAULT_PASS_HASH
}

export async function verifyMasterPassword(inputPassword: string): Promise<boolean> {
  const activeHash = getMasterPasswordHash()
  if (activeHash === DEFAULT_PASS_HASH && inputPassword === 'admin123') {
    return true
  }
  const inputHash = await sha256(inputPassword)
  return inputHash === activeHash
}

export async function changeMasterPassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; message?: string }> {
  const isCurrentValid = await verifyMasterPassword(currentPassword)
  if (!isCurrentValid) {
    return { success: false, message: 'Password saat ini salah.' }
  }

  if (!newPassword || newPassword.length < 4) {
    return { success: false, message: 'Password baru minimal 4 karakter.' }
  }

  const newHash = await sha256(newPassword)
  localStorage.setItem(MASTER_HASH_KEY, newHash)
  return { success: true }
}

export function resetMasterPasswordToDefault(): void {
  localStorage.removeItem(MASTER_HASH_KEY)
}

export function getAutoLockMinutes(): number {
  const saved = localStorage.getItem(AUTOLOCK_STORAGE_KEY)
  if (saved === null) return DEFAULT_AUTOLOCK_MINUTES
  const parsed = parseInt(saved, 10)
  return isNaN(parsed) ? DEFAULT_AUTOLOCK_MINUTES : Math.max(0, parsed)
}

export function setAutoLockMinutes(minutes: number): void {
  const clean = Math.max(0, Math.floor(minutes))
  localStorage.setItem(AUTOLOCK_STORAGE_KEY, String(clean))
}

export function updateLastActivity(): void {
  localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
}

export function getLastActivity(): number {
  const val = localStorage.getItem(LAST_ACTIVITY_KEY)
  if (!val) return Date.now()
  const num = parseInt(val, 10)
  return isNaN(num) ? Date.now() : num
}

export function isSessionAuthenticated(): boolean {
  return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true' || localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
}

export function saveAuthSession(persist = true): void {
  updateLastActivity()
  if (persist) {
    localStorage.setItem(AUTH_STORAGE_KEY, 'true')
  } else {
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'true')
  }
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
  localStorage.removeItem(LAST_ACTIVITY_KEY)
}
