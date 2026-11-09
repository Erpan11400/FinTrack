import { useState, type FormEvent } from 'react'
import {
  ShieldCheck,
  KeyRound,
  Timer,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Field, Input } from '../ui/Input'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'

const PRESET_TIMEOUTS = [
  { label: 'Nonaktif', value: 0 },
  { label: '1 Menit', value: 1 },
  { label: '5 Menit', value: 5 },
  { label: '15 Menit', value: 15 },
  { label: '30 Menit', value: 30 },
  { label: '60 Menit', value: 60 },
]

export function SecuritySettings() {
  const {
    isDefaultPassword,
    changePassword,
    resetPasswordToDefault,
    autoLockMinutes,
    updateAutoLockMinutes,
  } = useAuth()
  const { toast } = useToast()

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passLoading, setPassLoading] = useState(false)

  // Auto Lock state
  const [selectedMinutes, setSelectedMinutes] = useState<number>(autoLockMinutes)
  const [customMinutes, setCustomMinutes] = useState<string>(
    PRESET_TIMEOUTS.some((p) => p.value === autoLockMinutes) ? '' : String(autoLockMinutes),
  )

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()

    if (!currentPassword) {
      toast('Masukkan master password saat ini.', 'warning')
      return
    }

    if (!newPassword || newPassword.length < 4) {
      toast('Password baru minimal 4 karakter.', 'warning')
      return
    }

    if (newPassword !== confirmPassword) {
      toast('Konfirmasi password tidak cocok dengan password baru.', 'error')
      return
    }

    setPassLoading(true)
    try {
      const res = await changePassword(currentPassword, newPassword)
      if (res.success) {
        toast('Master password berhasil diperbarui!', 'success')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast(res.message || 'Gagal mengubah password.', 'error')
      }
    } catch {
      toast('Terjadi kesalahan saat memproses password.', 'error')
    } finally {
      setPassLoading(false)
    }
  }

  function handleResetPassword() {
    if (confirm('Kembalikan Master Password ke default demo ("admin123")?')) {
      resetPasswordToDefault()
      toast('Master Password dikembalikan ke default: admin123', 'info')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  function handleSaveAutoLock(e: FormEvent) {
    e.preventDefault()
    const targetMinutes = customMinutes !== '' ? parseInt(customMinutes, 10) : selectedMinutes
    if (isNaN(targetMinutes) || targetMinutes < 0) {
      toast('Masukkan angka menit yang valid (minimal 0).', 'warning')
      return
    }

    updateAutoLockMinutes(targetMinutes)
    if (targetMinutes === 0) {
      toast('Kunci otomatis dinonaktifkan.', 'info')
    } else {
      toast(`Kunci otomatis diatur setiap ${targetMinutes} menit tidak aktif.`, 'success')
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* PANEL 1: GANTI MASTER PASSWORD */}
      <div className="glass-panel space-y-5 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="size-5 text-brand-400" />
              <h3 className="text-base font-bold text-white">Ganti Master Password</h3>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Perbarui kunci pengaman utama untuk mengakses aplikasi single-user ini.
            </p>
          </div>

          {isDefaultPassword ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
              <AlertTriangle className="size-3 text-amber-400" />
              Demo (admin123)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
              <CheckCircle2 className="size-3" />
              Kustom Aktif
            </span>
          )}
        </div>

        {isDefaultPassword && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
            Aplikasi masih menggunakan password default demo: <code className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-amber-400">admin123</code>.
            Disarankan untuk menggantinya dengan password yang lebih kuat.
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Field label="Master Password Saat Ini" htmlFor="current-pass">
            <div className="relative">
              <Input
                id="current-pass"
                type={showCurrent ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>

          <Field label="Master Password Baru" htmlFor="new-pass">
            <div className="relative">
              <Input
                id="new-pass"
                type={showNew ? 'text' : 'password'}
                required
                placeholder="Minimal 4 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>

          <Field label="Konfirmasi Password Baru" htmlFor="confirm-pass">
            <div className="relative">
              <Input
                id="confirm-pass"
                type={showConfirm ? 'text' : 'password'}
                required
                placeholder="Ketik ulang password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button type="submit" disabled={passLoading}>
              <ShieldCheck className="size-4" /> Simpan Password Baru
            </Button>

            {!isDefaultPassword && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleResetPassword}
                className="text-slate-400 hover:text-amber-400"
              >
                <RotateCcw className="size-3.5" /> Reset ke admin123
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* PANEL 2: WAKTU KUNCI OTOMATIS (AUTO-LOCK) */}
      <div className="glass-panel space-y-5 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Timer className="size-5 text-brand-400" />
              <h3 className="text-base font-bold text-white">Waktu Kunci Otomatis (Auto-Lock)</h3>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Aplikasi akan terkunci otomatis jika tidak ada aktivitas pengguna dalam durasi yang ditentukan.
            </p>
          </div>

          <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 w-24 text-center text-[11px] font-mono text-brand-300 whitespace-nowrap shrink-0">
            {autoLockMinutes === 0 ? 'Nonaktif' : `${autoLockMinutes} Menit`}
          </span>
        </div>

        <form onSubmit={handleSaveAutoLock} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-300">
              Pilih Durasi Standar:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_TIMEOUTS.map((preset) => {
                const isSelected = customMinutes === '' && selectedMinutes === preset.value
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      setSelectedMinutes(preset.value)
                      setCustomMinutes('')
                    }}
                    className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${isSelected
                        ? 'border-brand-500 bg-brand-600/20 text-brand-300 shadow-sm shadow-brand-500/20'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
          </div>

          <Field
            label="Atau Masukkan Waktu Kustom (dalam menit, 0 = nonaktif):"
            htmlFor="custom-lock-minutes"
          >
            <Input
              id="custom-lock-minutes"
              type="number"
              min="0"
              max="1440"
              placeholder="Contoh: 3, 10, 45 menit"
              value={customMinutes}
              onChange={(e) => {
                setCustomMinutes(e.target.value)
              }}
            />
          </Field>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Catatan Keamanan:</p>
            <p>
              Timer idle mendeteksi interaksi mouse, keyboard, sentuhan, dan scroll. Jika tab berada di latar belakang atau browser ditutup dan dibuka kembali setelah batas waktu, akses akan langsung terkunci secara aman.
            </p>
          </div>

          <div className="pt-2">
            <Button type="submit">
              <Timer className="size-4" /> Simpan Pengaturan Kunci Otomatis
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

