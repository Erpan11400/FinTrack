import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Field, Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Checkbox } from '../ui/Checkbox'
import { useFinance } from '../../hooks/useFinance'
import { cn } from '../../lib/utils'
import type { Category, CategoryType } from '../../types'

const PRESET_COLORS = [
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#14b8a6', // Teal
  '#0284c7', // Sky
  '#2563eb', // Blue
  '#6366f1', // Indigo
  '#7c3aed', // Purple
  '#ec4899', // Pink
  '#8b5cf6', // Violet
]

interface CategoryModalProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  category?: Category | null
}

function CategoryForm({ category, onClose }: { category?: Category | null; onClose: () => void }) {
  const { addCategory, updateCategory } = useFinance()
  const isEdit = !!category
  const [type, setType] = useState<CategoryType>(category?.type ?? 'pengeluaran')
  const [name, setName] = useState(category?.name ?? '')
  const [color, setColor] = useState(category?.color || '#6366f1')
  const [active, setActive] = useState(category ? category.active !== false : true)

  return (
    <form
      className="space-y-3.5 text-xs"
      onSubmit={(e) => {
        e.preventDefault()
        const formattedColor = color.trim().startsWith('#')
          ? color.trim()
          : color.trim() ? `#${color.trim()}` : '#6366f1'

        if (isEdit && category) {
          updateCategory({
            ...category,
            type,
            name,
            color: formattedColor,
            active,
          })
        } else {
          addCategory({
            type,
            name,
            color: formattedColor,
            active,
          })
        }
        onClose()
      }}
    >
      <Field label="Tipe Kategori">
        <Select
          value={type}
          onValueChange={(v) => setType(v as CategoryType)}
          options={[
            { value: 'pengeluaran', label: 'Pengeluaran' },
            { value: 'pemasukan', label: 'Pemasukan' },
          ]}
        />
      </Field>
      <Field label="Nama Kategori" htmlFor="cat-name">
        <Input id="cat-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Misal: Tagihan & Utilities" />
      </Field>
      <Field label="Warna Kategori (Kode Hex)" htmlFor="cat-color">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative size-8 shrink-0 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-sm">
              <input
                type="color"
                value={/^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#6366f1'}
                onChange={(e) => setColor(e.target.value)}
                className="absolute -inset-2 size-14 cursor-pointer appearance-none border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none"
                title="Pilih warna"
              />
            </div>
            <Input
              id="cat-color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#6366f1"
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
        id="cat-active"
        checked={active}
        onCheckedChange={setActive}
        label="Kategori Aktif (Dapat dipilih dalam pencatatan transaksi)"
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" size="sm" onClick={onClose}>Batal</Button>
        <Button type="submit" size="sm" className="px-4">
          <Check className="size-3.5" /> {isEdit ? 'Simpan Perubahan' : 'Simpan Kategori'}
        </Button>
      </div>
    </form>
  )
}

export function CategoryModal({ open, onOpenChange, category }: CategoryModalProps) {
  const isEdit = !!category
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Kategori Master' : 'Tambah Kategori Master'}
      description={isEdit ? 'Form ubah kategori master' : 'Form tambah kategori'}
    >
      {open && <CategoryForm category={category} onClose={() => onOpenChange(false)} />}
    </Modal>
  )
}

