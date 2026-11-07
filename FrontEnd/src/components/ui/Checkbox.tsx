import { Checkbox as RadixCheckbox } from 'radix-ui'
import { Check } from 'lucide-react'

interface Props {
  id: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
  label: string
}

export function Checkbox({ id, checked, onCheckedChange, label }: Props) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <RadixCheckbox.Root
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        className="flex size-4 items-center justify-center rounded border border-slate-700 bg-slate-900 data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600"
      >
        <RadixCheckbox.Indicator>
          <Check className="size-3 text-white" />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <label htmlFor={id} className="text-xs text-slate-300">
        {label}
      </label>
    </div>
  )
}

