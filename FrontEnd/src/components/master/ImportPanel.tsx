import { useRef, useState } from 'react'
import { CloudUpload } from 'lucide-react'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { useFinance } from '../../hooks/useFinance'
import { useToast } from '../../hooks/useToast'
import { todayStr } from '../../lib/utils'

/** Simulated CSV import (same behaviour as the original prototype). */
export function ImportPanel() {
  const { accounts, addTransactions } = useFinance()
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [mapping, setMapping] = useState(false)
  const [target, setTarget] = useState(accounts[0]?.id ?? '')

  function onPick() {
    setMapping(true)
    toast('File CSV berhasil dibaca. Silakan konfirmasi pemetaan kolom.', 'info')
  }

  function runImport() {
    const date = todayStr()
    addTransactions([
      { date, type: 'pengeluaran', amount: 85000, accountId: target, categoryId: 'cat-1', subCategory: 'Restoran & Cafe', description: '[Import CSV] Restoran Senayan', tags: '#ImportCSV' },
      { date, type: 'pengeluaran', amount: 45000, accountId: target, categoryId: 'cat-2', subCategory: 'Bensin', description: '[Import CSV] SPBU Pertamina', tags: '#ImportCSV' },
    ])
    setMapping(false)
    toast('2 Transaksi dari CSV Berhasil Di-import!', 'success')
  }

  const mappingSelect = (label: string, option: string) => (
    <div>
      <label className="mb-1 block text-xs text-slate-400">{label}</label>
      <select className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-200">
        <option>{option}</option>
      </select>
    </div>
  )

  return (
    <div className="glass-panel space-y-6 rounded-2xl p-6">
      <div>
        <h3 className="text-base font-bold text-white">Import File CSV / Excel Mandiri</h3>
        <p className="text-xs text-slate-400">Unggah berkas mutasi perbankan/e-wallet untuk dimetakan secara otomatis</p>
      </div>

      <input ref={fileRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={onPick} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="w-full rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/40 p-8 text-center transition hover:border-brand-500"
      >
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-brand-500/10 text-brand-400">
          <CloudUpload className="size-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200">Klik untuk memilih file CSV / Excel</h4>
        <p className="mt-1 text-xs text-slate-500">atau drag & drop file mutasi bank (.csv, .xlsx)</p>
      </button>

      {mapping && (
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-brand-400">Simulasi Pemetaan Kolom Data CSV:</h4>
            <span className="text-xs text-slate-400">Ditemukan 2 transaksi sampel</span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {mappingSelect('Kolom Tanggal', 'Kolom A (Date)')}
            {mappingSelect('Kolom Deskripsi', 'Kolom B (Desc)')}
            {mappingSelect('Kolom Nominal', 'Kolom C (Amount)')}
            <div>
              <label className="mb-1 block text-slate-400">Target Akun</label>
              <Select value={target} onValueChange={setTarget} options={accounts.map((a) => ({ value: a.id, label: a.name }))} className="py-1" />
            </div>
          </div>
          <Button variant="success" size="lg" onClick={runImport}>
            Proses & Import Ke Catatan Transaksi
          </Button>
        </div>
      )}
    </div>
  )
}

