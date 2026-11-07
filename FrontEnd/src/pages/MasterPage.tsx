import { useState } from 'react'
import { Database, Download, FileSpreadsheet, Landmark, Pencil, Plus, RotateCcw, Tags } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs'
import { AccountModal } from '../components/master/AccountModal'
import { CategoryModal } from '../components/master/CategoryModal'
import { ImportPanel } from '../components/master/ImportPanel'
import { useFinance } from '../hooks/useFinance'
import { getIcon } from '../lib/icons'
import { cn, formatRp } from '../lib/utils'
import type { Account, Category } from '../types'

export default function MasterPage() {
  const { categories, accounts, balances, exportJSON, resetToDemo } = useFinance()
  const [catOpen, setCatOpen] = useState(false)
  const [accOpen, setAccOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)

  return (
    <Tabs defaultValue="categories" className="space-y-6">
      <div className="glass-panel rounded-2xl p-5">
        <h2 className="text-xl font-bold text-white">Pengaturan System & Master Data</h2>
        <p className="mt-0.5 text-xs text-slate-400">Kelola kategori, akun penyimpanan, serta import/export data</p>
        <TabsList>
          <TabsTrigger value="categories"><Tags className="size-3.5" /> Master Kategori</TabsTrigger>
          <TabsTrigger value="accounts"><Landmark className="size-3.5" /> Master Akun</TabsTrigger>
          <TabsTrigger value="import"><FileSpreadsheet className="size-3.5" /> Import CSV/Excel</TabsTrigger>
          <TabsTrigger value="backup"><Database className="size-3.5" /> Backup & Reset</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="categories" className="glass-panel space-y-6 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Manajemen Kategori & Sub-Kategori</h3>
            <p className="text-xs text-slate-400">Atur hirarki kategori pengeluaran & pemasukan</p>
          </div>
          <Button size="sm" onClick={() => { setEditingCategory(null); setCatOpen(true); }}><Plus className="size-3.5" /> Tambah Kategori</Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {categories.map((c) => (
            <div key={c.id} className="glass-panel space-y-2 rounded-xl p-4 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="font-bold text-slate-100">{c.name}</span>
                </div>
                <div className="flex items-center gap-2">
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
              <div className="text-xs text-slate-400">Sub: {c.subs.join(', ') || '-'}</div>
            </div>
          ))}
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
              <div key={a.id} className="glass-panel space-y-3 rounded-xl p-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Icon className="size-5 text-brand-400" />
                    <div>
                      <h4 className="font-bold text-slate-200">{a.name}</h4>
                      <span className="text-xs text-slate-400">{a.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('size-2 rounded-full', a.active ? 'bg-emerald-500' : 'bg-slate-600')} title={a.active ? 'Akun Aktif' : 'Akun Non-aktif'} />
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
    </Tabs>
  )
}

