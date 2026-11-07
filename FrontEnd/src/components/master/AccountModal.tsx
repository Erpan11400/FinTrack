import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Field, Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Checkbox } from '../ui/Checkbox'
import { useFinance } from '../../hooks/useFinance'
import type { Account, AccountType } from '../../types'

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'Bank', label: 'Bank' },
  { value: 'E-Wallet', label: 'E-Wallet' },
  { value: 'Tunai', label: 'Tunai / Cash' },
  { value: 'Investasi', label: 'Investasi' },
]

interface AccountModalProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  account?: Account | null
}

function AccountForm({ account, onClose }: { account?: Account | null; onClose: () => void }) {
  const { addAccount, updateAccount } = useFinance()
  const isEdit = !!account

  const [name, setName] = useState(account?.name ?? '')
  const [type, setType] = useState<AccountType>(account?.type ?? 'Bank')
  const [initial, setInitial] = useState(account ? String(account.initialBalance) : '')
  const [active, setActive] = useState(account ? account.active : true)

  return (
    <form
      className="space-y-3 text-xs"
      onSubmit={(e) => {
        e.preventDefault()
        const initialBalance = parseInt(initial) || 0
        if (isEdit && account) {
          updateAccount({
            ...account,
            name,
            type,
            initialBalance,
            icon: account.type === type ? account.icon : (type === 'Tunai' ? 'banknote' : type === 'E-Wallet' ? 'wallet' : 'landmark'),
            active,
          })
        } else {
          addAccount({
            name,
            type,
            initialBalance,
            icon: type === 'Tunai' ? 'banknote' : type === 'E-Wallet' ? 'wallet' : 'landmark',
            color: '',
            active,
          })
        }
        onClose()
      }}
    >
      <Field label="Nama Akun" htmlFor="acc-name">
        <Input id="acc-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Misal: Bank Jago / Gopay" />
      </Field>
      <Field label="Jenis Akun">
        <Select value={type} onValueChange={(v) => setType(v as AccountType)} options={ACCOUNT_TYPES} />
      </Field>
      <Field label="Saldo Awal (Initial Balance)" htmlFor="acc-initial">
        <Input id="acc-initial" type="number" required value={initial} onChange={(e) => setInitial(e.target.value)} placeholder="0" className="font-mono" />
      </Field>
      <Checkbox
        id="acc-active"
        checked={active}
        onCheckedChange={setActive}
        label="Akun Aktif (Dihitung dalam Total Aset & Pilihan Transaksi)"
      />
      <div className="flex justify-end gap-2 pt-2">
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
      title={isEdit ? 'Edit Akun Penyimpanan' : 'Tambah Akun Penyimpanan Baru'}
      description={isEdit ? 'Form ubah akun penyimpanan' : 'Form tambah akun'}
    >
      {open && <AccountForm account={account} onClose={() => onOpenChange(false)} />}
    </Modal>
  )
}

