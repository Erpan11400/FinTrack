import { useState } from 'react'
import { Calculator, Check, TriangleAlert } from 'lucide-react'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Field, Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { useFinance } from '../../hooks/useFinance'
import { useToast } from '../../hooks/useToast'
import { AVAILABLE_PRESET_ICONS, getIcon } from '../../lib/icons'
import { evaluateMathExpression } from '../../lib/math'
import { cn, formatRp } from '../../lib/utils'
import type { Preset, TxType } from '../../types'

interface PresetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preset?: Preset | null
}

const TYPES: { value: TxType; label: string }[] = [
  { value: 'pengeluaran', label: 'Pengeluaran' },
  { value: 'pemasukan', label: 'Pemasukan' },
  { value: 'transfer', label: 'Transfer Akun' },
]

function PresetForm({ preset, onClose }: { preset?: Preset | null; onClose: () => void }) {
  const { accounts, categories, addPreset, updatePreset } = useFinance()
  const { toast } = useToast()
  const isEdit = !!preset

  const [type, setType] = useState<TxType>(preset?.type ?? 'pengeluaran')
  const [name, setName] = useState(preset?.name ?? preset?.label ?? '')
  const [nominal, setNominal] = useState(preset ? String(preset.amount) : '')
  const [accountId, setAccountId] = useState(preset?.accountId ?? (accounts[0]?.id ?? ''))
  const [toAccountId, setToAccountId] = useState(
    preset?.toAccountId ?? (accounts.find((a) => a.id !== (preset?.accountId ?? accounts[0]?.id))?.id ?? accounts[1]?.id ?? accounts[0]?.id ?? '')
  )
  const [fee, setFee] = useState(preset?.fee ? String(preset.fee) : '')
  const [categoryId, setCategoryId] = useState(preset?.categoryId ?? '')
  const [desc, setDesc] = useState(preset?.description ?? '')
  const [icon, setIcon] = useState(preset?.icon ?? 'zap')

  const accountOptions = accounts
    .filter((a) => a.active || a.id === preset?.accountId || a.id === preset?.toAccountId)
    .map((a) => ({ value: a.id, label: `${a.name} (${a.type})` }))

  const catList = categories.filter((c) => c.type === type && (c.active !== false || c.id === preset?.categoryId))
  const activeCat = catList.find((c) => c.id === categoryId) ?? catList[0]

  const result = nominal.trim() ? evaluateMathExpression(nominal) : null

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    const mathResult = nominal.trim() ? evaluateMathExpression(nominal) : { valid: false, value: 0, error: 'Nominal wajib diisi' }
    if (!mathResult.valid || mathResult.value <= 0) {
      toast(`Nominal tidak valid: ${mathResult.error || 'Harus lebih besar dari 0'}`, 'error')
      return
    }

    const isTransfer = type === 'transfer'
    if (isTransfer && accountId === toAccountId) {
      toast('Akun asal dan akun tujuan tidak boleh sama', 'error')
      return
    }

    const trimmedName = name.trim()
    const trimmedDesc = desc.trim() || trimmedName

    const presetData = {
      name: trimmedName,
      label: trimmedName,
      type,
      amount: mathResult.value,
      accountId,
      toAccountId: isTransfer ? toAccountId : undefined,
      categoryId: isTransfer ? undefined : (activeCat?.id ?? undefined),
      fee: isTransfer ? parseInt(fee) || 0 : undefined,
      description: trimmedDesc,
      icon,
    }

    if (isEdit && preset) {
      updatePreset({
        ...presetData,
        id: preset.id,
      })
    } else {
      addPreset(presetData)
    }

    onClose()
  }

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col text-xs">
      <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 max-h-[calc(85vh-9rem)]">
        <Field label="Tipe Arus Kas">
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-800 bg-slate-900 p-1">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setType(t.value)
                  if (t.value !== type) {
                    setCategoryId('')
                  }
                }}
                className={cn(
                  'rounded-lg py-2 font-semibold transition',
                  type === t.value
                    ? 'border border-brand-500/30 bg-brand-500/10 text-brand-400'
                    : 'text-slate-400 hover:text-slate-200',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Nama Preset" htmlFor="preset-name">
          <Input
            id="preset-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Misal: Kopi Pagi, Makan Siang, Bensin"
          />
        </Field>

        <div>
          <label htmlFor="preset-nominal-math" className="mb-1 block font-semibold text-slate-300">
            Nominal Transaksi (Mendukung Evaluasi Matematika)
          </label>
          <Input
            id="preset-nominal-math"
            required
            autoComplete="off"
            value={nominal}
            placeholder="Contoh: 25000 atau (50000 * 2) + 15000"
            onChange={(e) => setNominal(e.target.value)}
            className={cn(
              'font-mono text-sm',
              result && (result.valid ? 'border-emerald-500' : 'border-rose-500'),
            )}
          />
          {result && (
            <div
              className={cn(
                'mt-1.5 flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs',
                result.valid
                  ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
                  : 'border-rose-500/40 bg-rose-950/60 text-rose-300',
              )}
            >
              <span className="flex items-center gap-1 font-mono">
                {result.valid ? (
                  <>
                    <Calculator className="size-3" /> Hasil: <strong>{formatRp(result.value)}</strong>
                  </>
                ) : (
                  <>
                    <TriangleAlert className="size-3" /> {result.error}
                  </>
                )}
              </span>
              <span className="font-semibold">{result.valid ? '✓ Format Valid' : '✗ Syntax Error'}</span>
            </div>
          )}
        </div>

        {type !== 'transfer' ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Akun Storage">
              <Select value={accountId} onValueChange={setAccountId} options={accountOptions} />
            </Field>
            <Field label="Kategori">
              <Select
                value={activeCat?.id ?? ''}
                onValueChange={setCategoryId}
                options={catList.map((c) => ({ value: c.id, label: c.name }))}
                placeholder="Pilih kategori"
              />
            </Field>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Akun Asal (Pengirim)">
              <Select value={accountId} onValueChange={setAccountId} options={accountOptions} />
            </Field>
            <Field label="Akun Tujuan (Penerima)">
              <Select value={toAccountId} onValueChange={setToAccountId} options={accountOptions} />
            </Field>
            <div className="col-span-2">
              <Field label="Biaya Admin (Opsional)" htmlFor="preset-fee">
                <Input
                  id="preset-fee"
                  type="number"
                  min={0}
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="0"
                  className="py-1.5 font-mono"
                />
              </Field>
            </div>
          </div>
        )}

        <Field label="Deskripsi / Catatan Transaksi" htmlFor="preset-desc">
          <Input
            id="preset-desc"
            required
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Misal: Kopi Americano Pagi Hari"
          />
        </Field>

        <div>
          <label className="mb-1.5 block font-semibold text-slate-300">Pilih Ikon Preset</label>
          <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1.5 rounded-xl border border-slate-800/80 bg-slate-950/40">
            {AVAILABLE_PRESET_ICONS.map((item) => {
              const IconComp = getIcon(item.id)
              const isSelected = icon === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIcon(item.id)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 rounded-xl border p-2 text-xs transition cursor-pointer',
                    isSelected
                      ? 'border-brand-500 bg-brand-500/20 text-brand-300 font-semibold shadow-sm'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  )}
                  title={item.label}
                >
                  <IconComp className="size-4" />
                  <span className="text-[10px] truncate max-w-full">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 justify-end gap-2 pt-3 border-t border-slate-800 mt-2">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Batal
        </Button>
        <Button type="submit" size="sm" className="px-4">
          <Check className="size-3.5" /> {isEdit ? 'Simpan Perubahan' : 'Simpan Preset'}
        </Button>
      </div>
    </form>
  )
}

export function PresetModal({ open, onOpenChange, preset }: PresetModalProps) {
  const isEdit = !!preset
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      className="max-w-lg max-h-[85vh] flex flex-col"
      title={isEdit ? 'Edit Preset Transaksi' : 'Tambah Preset Transaksi'}
      description={isEdit ? 'Ubah konfigurasi shortcut preset' : 'Buat shortcut transaksi cepat baru'}
    >
      {open && <PresetForm preset={preset} onClose={() => onOpenChange(false)} />}
    </Modal>
  )
}
