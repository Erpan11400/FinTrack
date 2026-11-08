import { useState } from 'react'
import { Database, Download, FileSpreadsheet, Landmark, Pencil, Plus, RotateCcw, Tags, Trash2, Zap } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs'
import { AccountModal } from '../components/master/AccountModal'
import { CategoryModal } from '../components/master/CategoryModal'
import { PresetModal } from '../components/master/PresetModal'
import { ImportPanel } from '../components/master/ImportPanel'
import { useFinance } from '../hooks/useFinance'
import { getIcon } from '../lib/icons'
import { cn, formatRp } from '../lib/utils'
import type { Account, Category, Preset } from '../types'

export default function MasterPage() {
  const { categories, accounts, presets, balances, exportJSON, resetToDemo, updateCategory, updateAccount, deletePreset } = useFinance()
  const [catOpen, setCatOpen] = useState(false)
  const [accOpen, setAccOpen] = useState(false)
  const [presetOpen, setPresetOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null)

  return (
    <Tabs defaultValue="categories" className="space-y-6">
      <div className="glass-panel rounded-2xl p-5">
        <h2 className="text-xl font-bold text-white">Pengaturan System & Master Data</h2>
        <p className="mt-0.5 text-xs text-slate-400">Kelola kategori, akun penyimpanan, preset transaksi, serta import/export data</p>
        <TabsList>
          <TabsTrigger value="categories"><Tags className="size-3.5" /> Master Kategori</TabsTrigger>
          <TabsTrigger value="accounts"><Landmark className="size-3.5" /> Master Akun</TabsTrigger>
          <TabsTrigger value="presets"><Zap className="size-3.5" /> Master Preset</TabsTrigger>
          <TabsTrigger value="import"><FileSpreadsheet className="size-3.5" /> Import CSV/Excel</TabsTrigger>
          <TabsTrigger value="backup"><Database className="size-3.5" /> Backup & Reset</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="categories" className="glass-panel space-y-6 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Manajemen Kategori</h3>
            <p className="text-xs text-slate-400">Atur kategori pengeluaran & pemasukan (aktif / non-aktif)</p>
          </div>
          <Button size="sm" onClick={() => { setEditingCategory(null); setCatOpen(true); }}><Plus className="size-3.5" /> Tambah Kategori</Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {categories.map((c) => {
            const isActive = c.active !== false
            return (
              <div
                key={c.id}
                className={cn(
                  'glass-panel rounded-xl p-4 text-xs transition-opacity',
                  !isActive && 'opacity-60 bg-slate-900/40'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className={cn('font-bold', !isActive ? 'text-slate-400 line-through' : 'text-slate-100')}>
                      {c.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateCategory({ ...c, active: !isActive })}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium transition cursor-pointer border',
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/50'
                      )}
                      title={isActive ? 'Klik untuk non-aktifkan kategori' : 'Klik untuk aktifkan kategori'}
                    >
                      <span className={cn('size-1.5 rounded-full', isActive ? 'bg-emerald-400' : 'bg-slate-500')} />
                      {isActive ? 'Aktif' : 'Non-aktif'}
                    </button>
                    <span className={cn('rounded px-2 py-0.5 text-xs font-medium', c.type === 'pemasukan' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400')}>
                      {c.type}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingCategory(c)}
                      className="p-1 text-slate-500 hover:text-brand-400 transition"
                      title="Edit Kategori"
                      aria-label="Edit Kategori"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </TabsContent>

      <TabsContent value="accounts" className="glass-panel space-y-6 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Akun Penyimpanan & Saldo Awal</h3>
            <p className="text-xs text-slate-400">Kelola Bank, E-Wallet, dan Tunai (Preset & Custom)</p>
          </div>
          <Button size="sm" onClick={() => { setEditingAccount(null); setAccOpen(true); }}><Plus className="size-3.5" /> Tambah Akun Baru</Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => {
            const Icon = getIcon(a.icon)
            return (
              <div key={a.id} className={cn('glass-panel space-y-3 rounded-xl p-4 text-xs transition-opacity', !a.active && 'opacity-60 bg-slate-900/40')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Icon className="size-5 text-brand-400" />
                    <div>
                      <h4 className={cn('font-bold', !a.active ? 'text-slate-400 line-through' : 'text-slate-200')}>{a.name}</h4>
                      <span className="text-xs text-slate-400">{a.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateAccount({ ...a, active: !a.active })}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium transition cursor-pointer border',
                        a.active
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/50'
                      )}
                      title={a.active ? 'Klik untuk non-aktifkan akun' : 'Klik untuk aktifkan akun'}
                    >
                      <span className={cn('size-1.5 rounded-full', a.active ? 'bg-emerald-400' : 'bg-slate-500')} />
                      {a.active ? 'Aktif' : 'Non-aktif'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingAccount(a)}
                      className="p-1 text-slate-500 hover:text-brand-400 transition"
                      title="Edit Akun"
                      aria-label="Edit Akun"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 font-mono">
                  <span className="text-slate-400">Saldo Saat Ini:</span>
                  <strong className="text-white">{formatRp(balances[a.id] || 0)}</strong>
                </div>
              </div>
            )
          })}
        </div>
      </TabsContent>

      <TabsContent value="presets" className="glass-panel space-y-6 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Manajemen Preset Transaksi</h3>
            <p className="text-xs text-slate-400">Kelola tombol shortcut transaksi cepat untuk pencatatan instan di Dashboard</p>
          </div>
          <Button size="sm" onClick={() => { setEditingPreset(null); setPresetOpen(true); }}>
            <Plus className="size-3.5" /> Tambah Preset Baru
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {presets.map((p) => {
            const Icon = getIcon(p.icon)
            const acc = accounts.find((a) => a.id === p.accountId)
            const toAcc = accounts.find((a) => a.id === p.toAccountId)
            const cat = categories.find((c) => c.id === p.categoryId)
            const presetTitle = p.name || p.label || 'Preset'
            return (
              <div key={p.id} className="glass-panel space-y-3 rounded-xl p-4 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100">{presetTitle}</h4>
                      <div className="mt-0.5 font-mono text-sm font-bold text-brand-400">
                        {formatRp(p.amount)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={cn(
                        'rounded px-2 py-0.5 text-[10px] font-medium capitalize',
                        p.type === 'pemasukan'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : p.type === 'transfer'
                            ? 'bg-sky-500/20 text-sky-400'
                            : 'bg-rose-500/20 text-rose-400',
                      )}
                    >
                      {p.type}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPreset(p)
                        setPresetOpen(true)
                      }}
                      className="p-1 text-slate-500 hover:text-brand-400 transition"
                      title="Edit Preset"
                      aria-label="Edit Preset"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus preset "${presetTitle}"?`)) {
                          deletePreset(p.id)
                        }
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                      title="Hapus Preset"
                      aria-label="Hapus Preset"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-2.5 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Deskripsi:</span>
                    <span className="text-slate-200 font-medium truncate max-w-[180px]">{p.description || '-'}</span>
                  </div>
                  {p.type === 'transfer' ? (
                    <div className="flex items-center justify-between">
                      <span>Rute Transfer:</span>
                      <span className="text-slate-200 font-medium">
                        {acc?.name ?? '-'} &rarr; {toAcc?.name ?? '-'}
                        {p.fee ? ` (Biaya: ${formatRp(p.fee)})` : ''}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span>Akun Storage:</span>
                        <span className="text-slate-200 font-medium">{acc?.name ?? '-'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Kategori:</span>
                        <span className="text-slate-200 font-medium">{cat?.name ?? 'Tanpa Kategori'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
          {presets.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-500 text-xs">
              Belum ada preset transaksi. Klik "Tambah Preset Baru" untuk membuat shortcut.
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="import">
        <ImportPanel />
      </TabsContent>

      <TabsContent value="backup" className="glass-panel max-w-xl space-y-6 rounded-2xl p-6">
        <div>
          <h3 className="text-base font-bold text-white">Cadangan Data (Backup / Restore)</h3>
          <p className="text-xs text-slate-400">Seluruh data keuangan disimpan lokal pada browser (LocalStorage)</p>
        </div>
        <div className="space-y-3">
          <Button variant="secondary" size="lg" onClick={exportJSON}>
            <Download className="size-4 text-brand-400" /> Ekspor Seluruh Data Ke JSON File
          </Button>
          <Button
            variant="danger"
            size="lg"
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin mereset seluruh data ke versi demo awal?')) resetToDemo()
            }}
          >
            <RotateCcw className="size-4" /> Reset Ke Data Contoh Demo Awal
          </Button>
        </div>
      </TabsContent>

      <CategoryModal
        open={catOpen || !!editingCategory}
        category={editingCategory}
        onOpenChange={(open) => {
          if (!open) {
            setCatOpen(false)
            setEditingCategory(null)
          } else {
            setCatOpen(true)
          }
        }}
      />
      <AccountModal
        open={accOpen || !!editingAccount}
        account={editingAccount}
        onOpenChange={(open) => {
          if (!open) {
            setAccOpen(false)
            setEditingAccount(null)
          } else {
            setAccOpen(true)
          }
        }}
      />
      <PresetModal
        open={presetOpen || !!editingPreset}
        preset={editingPreset}
        onOpenChange={(open) => {
          if (!open) {
            setPresetOpen(false)
            setEditingPreset(null)
          } else {
            setPresetOpen(true)
          }
        }}
      />
    </Tabs>
  )
}

