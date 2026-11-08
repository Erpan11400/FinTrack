import { useState } from 'react'
import { Calculator, Check, PenLine, TriangleAlert } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Checkbox } from '../ui/Checkbox'
import { Field, Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { useFinance } from '../../hooks/useFinance'
import { useToast } from '../../hooks/useToast'
import { evaluateMathExpression } from '../../lib/math'
import { cn, formatRp, todayStr } from '../../lib/utils'
import type { Transaction, TxType } from '../../types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction | null
}

const TYPES: { value: TxType; label: string }[] = [
  { value: 'pengeluaran', label: 'Pengeluaran' },
  { value: 'pemasukan', label: 'Pemasukan' },
  { value: 'transfer', label: 'Transfer Akun' },
]

/** Mounted only while open, so form state resets on every open. */
function TransactionForm({
  transaction,
  onClose,
}: {
  transaction?: Transaction | null
  onClose: () => void
}) {
  const { accounts, categories, addTransaction, updateTransaction } = useFinance()
  const { toast } = useToast()

  const isEdit = !!transaction

  const [type, setType] = useState<TxType>(transaction?.type ?? 'pengeluaran')
  const [nominal, setNominal] = useState(transaction ? String(transaction.amount) : '')
  const [accountId, setAccountId] = useState(transaction?.accountId ?? (accounts[0]?.id ?? ''))
  const [fromId, setFromId] = useState(
    transaction?.type === 'transfer' ? transaction.accountId : (transaction?.accountId ?? accounts[0]?.id ?? '')
  )
  const [toId, setToId] = useState(
    transaction?.type === 'transfer'
      ? (transaction.toAccountId ?? accounts[1]?.id ?? accounts[0]?.id ?? '')
      : (accounts.find((a) => a.id !== (transaction?.accountId ?? accounts[0]?.id))?.id ?? accounts[1]?.id ?? accounts[0]?.id ?? '')
  )
  const [fee, setFee] = useState(transaction?.fee ? String(transaction.fee) : '')
  const [mainCat, setMainCat] = useState(transaction?.categoryId ?? '')
  const [date, setDate] = useState(transaction?.date ?? todayStr())
  const [desc, setDesc] = useState(transaction?.description ?? '')
  const [savePreset, setSavePreset] = useState(false)

  const accountOptions = accounts
    .filter((a) => a.active || a.id === transaction?.accountId || a.id === transaction?.toAccountId)
    .map((a) => ({ value: a.id, label: `${a.name} (${a.type})` }))
  const catList = categories.filter((c) => c.type === type && (c.active !== false || c.id === transaction?.categoryId))
  const activeCat = catList.find((c) => c.id === mainCat) ?? catList[0]

  const result = nominal.trim() ? evaluateMathExpression(nominal) : null

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = evaluateMathExpression(nominal)
    if (!res.valid) {
      toast(`Form tidak dapat disimpan: ${res.error}`, 'error')
      return
    }
    const isTransfer = type === 'transfer'
    if (isTransfer && fromId === toId) {
      toast('Akun asal dan tujuan tidak boleh sama', 'error')
      return
    }
    const txData = {
      date,
      type,
      amount: res.value,
      accountId: isTransfer ? fromId : accountId,
      toAccountId: isTransfer ? toId : null,
      fee: isTransfer ? parseInt(fee) || 0 : 0,
      categoryId: isTransfer ? null : (activeCat?.id ?? null),
      description: desc,
    }

    if (isEdit && transaction) {
      updateTransaction({
        ...txData,
        id: transaction.id,
      })
    } else {
      addTransaction(txData, savePreset)
    }
    onClose()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-xs">
      <Field label="Tipe Arus Kas">
        <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-800 bg-slate-900 p-1">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setType(t.value)
                if (t.value !== type) {
                  setMainCat('')
                }
              }}
              className={cn(
                'rounded-lg py-2 font-semibold transition',
                type === t.value
                  ? 'border border-brand-500/30 bg-brand-500/10 text-brand-400'
                  : 'text-slate-400',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Field>

      <div>
        <label htmlFor="tx-nominal-math" className="mb-1 block font-semibold text-slate-300">
          Nominal Transaksi (Mendukung Evaluasi Matematika)
        </label>
        <Input
          id="tx-nominal-math"
          required
          autoComplete="off"
          value={nominal}
          placeholder="Contoh: (50000 * 2) + 15000"
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
        <p className="mt-1 text-xs text-slate-500">
          Dukung operator: <code className="text-brand-300">+ - * / ( )</code>. Contoh:{' '}
          <code className="text-slate-400">125000 - 15000</code>
        </p>
      </div>

      {type !== 'transfer' ? (
        <>
          <Field label="Akun Storage">
            <Select value={accountId} onValueChange={setAccountId} options={accountOptions} />
          </Field>
          <Field label="Kategori">
            <Select
              value={activeCat?.id ?? ''}
              onValueChange={(v) => {
                setMainCat(v)
              }}
              options={catList.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Pilih kategori"
            />
          </Field>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Akun Asal (Pengirim)">
            <Select value={fromId} onValueChange={setFromId} options={accountOptions} />
          </Field>
          <Field label="Akun Tujuan (Penerima)">
            <Select value={toId} onValueChange={setToId} options={accountOptions} />
          </Field>
          <div className="col-span-2">
            <Field label="Biaya Admin (Opsional memotong Akun Asal)" htmlFor="tx-transfer-fee">
              <Input
                id="tx-transfer-fee"
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Tanggal Transaksi" htmlFor="tx-date">
          <Input id="tx-date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Deskripsi / Catatan" htmlFor="tx-desc">
          <Input
            id="tx-desc"
            required
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Misal: Makan Siang Nasi Padang"
          />
        </Field>
      </div>

      {!isEdit && (
        <Checkbox
          id="tx-save-preset"
          checked={savePreset}
          onCheckedChange={setSavePreset}
          label="Simpan sebagai Template Transaksi Cepat Favorit (1-Click Shortcut)"
        />
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>
          Batal
        </Button>
        <Button type="submit" className="px-5">
          <Check className="size-4" /> {isEdit ? 'Simpan Perubahan' : 'Simpan Transaksi'}
        </Button>
      </div>
    </form>
  )
}

export function TransactionModal({ open, onOpenChange, transaction }: Props) {
  const isEdit = !!transaction
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      className="max-w-lg"
      description={isEdit ? 'Form perbarui data transaksi' : 'Form pencatatan transaksi baru'}
      title={
        <>
          <PenLine className="size-4 text-brand-500" />
          <span>{isEdit ? 'Edit Transaksi Financial' : 'Catat Transaksi Financial'}</span>
        </>
      }
    >
      {open && <TransactionForm transaction={transaction} onClose={() => onOpenChange(false)} />}
    </Modal>
  )
}

