import { useState } from 'react'
import { ArrowRight, Database, Download, FileSpreadsheet, Landmark, Pencil, Plus, RotateCcw, ShieldCheck, Tag, Tags, Trash2, Wallet, Zap } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs'
import { AccountModal } from '../components/master/AccountModal'
import { CategoryModal } from '../components/master/CategoryModal'
import { PresetModal } from '../components/master/PresetModal'
import { ImportPanel } from '../components/master/ImportPanel'
import { SecuritySettings } from '../components/master/SecuritySettings'
import { useFinance } from '../hooks/useFinance'
import { getIcon } from '../lib/icons'
import { cn, formatRp } from '../lib/utils'
import type { Account, Category, Preset } from '../types'

export default function MasterPage() {
  const { categories, accounts, presets, exportJSON, resetToDemo, updateCategory, updateAccount, deletePreset } = useFinance()
  const [catOpen, setCatOpen] = useState(false)
  const [accOpen, setAccOpen] = useState(false)
  const [presetOpen, setPresetOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null)

  return (
    <Tabs defaultValue="accounts" className="space-y-6">
      <div className="glass-panel rounded-2xl p-5">
        <h2 className="text-xl font-bold text-white">Pengaturan System & Master Data</h2>
        <p className="mt-0.5 text-xs text-slate-400">Kelola kategori, akun penyimpanan, preset transaksi, keamanan kunci, serta import/export data</p>
        <TabsList>
          <TabsTrigger value="accounts"><Landmark className="size-3.5" /> Master Akun</TabsTrigger>
          <TabsTrigger value="categories"><Tags className="size-3.5" /> Master Kategori</TabsTrigger>
          <TabsTrigger value="presets"><Zap className="size-3.5" /> Master Preset</TabsTrigger>
          <TabsTrigger value="security"><ShieldCheck className="size-3.5" /> Keamanan & Kunci</TabsTrigger>
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
                    <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: c.color || '#6366f1' }} />
                    <span className={cn('font-bold', !isActive ? 'text-slate-400 line-through' : 'text-slate-100')}>
                      {c.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateCategory({ ...c, active: !isActive })}
                      className={cn(
                        'gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium cursor-pointer border',
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25 hover:text-emerald-300'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/50 hover:text-slate-300'
                      )}
                      title={isActive ? 'Klik untuk non-aktifkan kategori' : 'Klik untuk aktifkan kategori'}
                    >
                      <span className={cn('size-1.5 rounded-full', isActive ? 'bg-emerald-400' : 'bg-slate-500')} />
                      {isActive ? 'Aktif' : 'Non-aktif'}
                    </Button>
                    <span className={cn('rounded px-2 py-0.5 text-xs font-medium', c.type === 'pemasukan' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400')}>
                      {c.type}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingCategory(c)}
                      className="text-slate-500 hover:text-brand-400"
                      title="Edit Kategori"
                      aria-label="Edit Kategori"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
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
              <div key={a.id} className={cn('glass-panel rounded-xl p-4 text-xs transition-opacity', !a.active && 'opacity-60 bg-slate-900/40')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: a.color || '#6366f1' }} />
                    <Icon className="size-5 text-brand-400" />
                    <div>
                      <h4 className={cn('font-bold', !a.active ? 'text-slate-400 line-through' : 'text-slate-200')}>{a.name}</h4>
                      <span className="text-xs text-slate-400">{a.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateAccount({ ...a, active: !a.active })}
                      className={cn(
                        'gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium cursor-pointer border',
                        a.active
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25 hover:text-emerald-300'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/50 hover:text-slate-300'
                      )}
                      title={a.active ? 'Klik untuk non-aktifkan akun' : 'Klik untuk aktifkan akun'}
                    >
                      <span className={cn('size-1.5 rounded-full', a.active ? 'bg-emerald-400' : 'bg-slate-500')} />
                      {a.active ? 'Aktif' : 'Non-aktif'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingAccount(a)}
                      className="text-slate-500 hover:text-brand-400"
                      title="Edit Akun"
                      aria-label="Edit Akun"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  </div>
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
            const isTransfer = p.type === 'transfer'

            return (
              <div
                key={p.id}
                className={cn(
                  'relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-4 pl-5 transition hover:border-slate-700',
                  'before:absolute before:inset-y-0 before:left-0 before:w-1',
                  p.type === 'pemasukan'
                    ? 'before:bg-emerald-500'
                    : isTransfer
                      ? 'before:bg-sky-500'
                      : 'before:bg-rose-500',
                )}
              >
                <div>
                  {/* Bagian Atas */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className="size-4 shrink-0 text-brand-400" />
                      <h4 className="truncate text-sm font-bold text-white">{presetTitle}</h4>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingPreset(p)
                          setPresetOpen(true)
                        }}
                        className="text-slate-500 hover:text-brand-400"
                        title="Edit Preset"
                        aria-label="Edit Preset"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Hapus preset "${presetTitle}"?`)) deletePreset(p.id)
                        }}
                        className="text-slate-500 hover:text-rose-400"
                        title="Hapus Preset"
                        aria-label="Hapus Preset"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Nominal & Tipe */}
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="font-mono text-base font-bold text-brand-400">
                      {formatRp(p.amount)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">
                      {p.type}
                    </span>
                  </div>

                  {/* Catatan / Deskripsi */}
                  {p.description && (
                    <p className="mt-1.5 truncate text-[11px] text-slate-400">
                      {p.description}
                    </p>
                  )}
                </div>

                <div>
                  {/* Pemisah Struk */}
                  <div className="my-3 border-t border-dashed border-slate-800" />

                  {/* Footer Metadata Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-300">
                    {isTransfer ? (
                      <p className="inline-flex items-center gap-1 rounded-md bg-slate-800/90 px-2 py-1">
                        <Wallet className="size-3 text-sky-400" />
                        {acc?.name ?? '-'} <ArrowRight className="size-2.5 text-slate-500" /> {toAcc?.name ?? '-'}
                        <span className='text-xs text-yellow-500'>{p.fee ? ` (+${formatRp(p.fee)})` : ''}</span>
                      </p>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-800/90 px-2 py-1">
                          <Wallet className="size-3 text-slate-400" />
                          {acc?.name ?? '-'}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-800/90 px-2 py-1">
                          <Tag className="size-3 text-slate-400" />
                          {cat?.name ?? 'Tanpa Kategori'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {presets.length === 0 && (
            <div className="col-span-full py-8 text-center text-xs text-slate-500">
              Belum ada preset transaksi. Klik "Tambah Preset Baru" untuk membuat shortcut.
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="security">
        <SecuritySettings />
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

