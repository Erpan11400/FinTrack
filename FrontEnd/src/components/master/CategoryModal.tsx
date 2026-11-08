import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Field, Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Checkbox } from '../ui/Checkbox'
import { useFinance } from '../../hooks/useFinance'
import type { Category, CategoryType } from '../../types'

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
  const [active, setActive] = useState(category ? category.active !== false : true)

  return (
    <form
      className="space-y-3 text-xs"
      onSubmit={(e) => {
        e.preventDefault()
        if (isEdit && category) {
          updateCategory({
            ...category,
            type,
            name,
            active,
          })
        } else {
          addCategory({
            type,
            name,
            color: '',
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

