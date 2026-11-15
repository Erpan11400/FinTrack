import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Field, Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Checkbox } from '../ui/Checkbox'
import { useFinance } from '../../hooks/useFinance'
import { AVAILABLE_ACCOUNT_ICONS, getIcon } from '../../lib/icons'
import { cn } from '../../lib/utils'
import type { Account, AccountType } from '../../types'

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'Bank', label: 'Bank' },
  { value: 'E-Wallet', label: 'E-Wallet' },
  { value: 'Tunai', label: 'Tunai / Cash' },
  { value: 'Investasi', label: 'Investasi' },
]

const PRESET_COLORS = [
  '#2563eb', // Blue
  '#0284c7', // Sky
  '#0ea5e9', // Light Blue
  '#10b981', // Emerald
  '#14b8a6', // Teal
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#ec4899', // Pink
  '#7c3aed', // Purple
  '#6366f1', // Indigo
]

interface AccountModalProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  account?: Account | null
}

const getDefaultIconForType = (type: AccountType) => {
  switch (type) {
    case 'Tunai':
      return 'banknote'
    case 'E-Wallet':
      return 'wallet'
    case 'Investasi':
      return 'trending-up'
    default:
      return 'landmark'
  }
}

function AccountForm({ account, onClose }: { account?: Account | null; onClose: () => void }) {
  const { addAccount, updateAccount } = useFinance()
  const isEdit = !!account

  const [name, setName] = useState(account?.name ?? '')
  const [type, setType] = useState<AccountType>(account?.type ?? 'Bank')
  const [initial, setInitial] = useState(account ? String(account.initialBalance) : '')
  const [color, setColor] = useState(account?.color || '#2563eb')
  const [icon, setIcon] = useState(account?.icon || getDefaultIconForType(account?.type ?? 'Bank'))
  const [active, setActive] = useState(account ? account.active : true)

  const handleTypeChange = (newType: AccountType) => {
    setType(newType)
    const prevDefault = getDefaultIconForType(type)
    if (icon === prevDefault) {
      setIcon(getDefaultIconForType(newType))
    }
  }

  return (
    <form
      className="flex min-h-0 flex-1 flex-col text-xs"
      onSubmit={(e) => {
        e.preventDefault()
        const initialBalance = parseInt(initial) || 0
        const formattedColor = color.trim().startsWith('#')
          ? color.trim()
          : color.trim() ? `#${color.trim()}` : '#2563eb'

        const selectedIcon = icon || getDefaultIconForType(type)

        if (isEdit && account) {
          updateAccount({
            ...account,
            name,
            type,
            initialBalance,
            color: formattedColor,
            icon: selectedIcon,
            active,
          })
        } else {
          addAccount({
            name,
            type,
            initialBalance,
            icon: selectedIcon,
            color: formattedColor,
            active,
          })
        }
        onClose()
      }}
    >
      <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 max-h-[calc(85vh-9rem)]">
        <Field label="Nama Akun" htmlFor="acc-name">
          <Input id="acc-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Misal: Bank Jago / Gopay" />
        </Field>
        <Field label="Jenis Akun">
          <Select value={type} onValueChange={(v) => handleTypeChange(v as AccountType)} options={ACCOUNT_TYPES} />
        </Field>
        <Field label="Saldo Awal (Initial Balance)" htmlFor="acc-initial">
          <Input id="acc-initial" type="number" required value={initial} onChange={(e) => setInitial(e.target.value)} placeholder="0" className="font-mono" />
        </Field>
        <Field label="Pilih Ikon Akun">
          <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1.5 rounded-xl border border-slate-800/80 bg-slate-950/40">
            {AVAILABLE_ACCOUNT_ICONS.map((item) => {
              const IconComp = getIcon(item.id)
              const isSelected = icon === item.id
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setIcon(item.id)}
                  className={cn(
                    'flex-col gap-1 rounded-xl border p-2 text-xs cursor-pointer',
                    isSelected
                      ? 'border-brand-500 bg-brand-500/20 text-brand-300 font-semibold shadow-sm hover:text-brand-200'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  )}
                  title={item.label}
                >
                  <IconComp className="size-4" />
                  <span className="text-[10px] truncate max-w-full">{item.label}</span>
                </Button>
              )
            })}
          </div>
        </Field>
        <Field label="Warna Akun (Kode Hex)" htmlFor="acc-color">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative size-8 shrink-0 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-sm">
                <input
                  type="color"
                  value={/^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#2563eb'}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute -inset-2 size-14 cursor-pointer appearance-none border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none"
                  title="Pilih warna"
                />
              </div>
              <Input
                id="acc-color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#2563eb"
                className="font-mono uppercase"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {PRESET_COLORS.map((preset) => (
                <Button
                  key={preset}
                  variant="ghost"
                  size="icon"
                  onClick={() => setColor(preset)}
                  className={cn(
                    'size-5 rounded-full border p-0 hover:scale-110 cursor-pointer m-1',
                    color.toLowerCase() === preset.toLowerCase()
                      ? 'border-white ring-2 ring-brand-500 scale-110'
                      : 'border-transparent hover:border-slate-400',
                  )}
                  style={{ backgroundColor: preset }}
                  title={preset}
                  aria-label={preset}
                />
              ))}
            </div>
          </div>
        </Field>
        <Checkbox
          id="acc-active"
          checked={active}
          onCheckedChange={setActive}
          label="Akun Aktif (Dihitung dalam Total Aset & Pilihan Transaksi)"
        />
      </div>
      <div className="flex shrink-0 justify-end gap-2 pt-3 border-t border-slate-800 mt-2">
        <Button variant="secondary" size="sm" onClick={onClose}>Batal</Button>
        <Button type="submit" size="sm" className="px-4">
          <Check className="size-3.5" /> {isEdit ? 'Simpan Perubahan' : 'Simpan Akun'}
        </Button>
      </div>
    </form>
  )
}

export function AccountModal({ open, onOpenChange, account }: AccountModalProps) {
  const isEdit = !!account
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      className="max-w-lg max-h-[85vh] flex flex-col"
      title={isEdit ? 'Edit Akun Penyimpanan' : 'Tambah Akun Penyimpanan Baru'}
      description={isEdit ? 'Form ubah akun penyimpanan' : 'Form tambah akun'}
    >
      {open && <AccountForm account={account} onClose={() => onOpenChange(false)} />}
    </Modal>
  )
}

