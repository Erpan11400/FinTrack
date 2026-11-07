import { Select as RadixSelect } from 'radix-ui'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onValueChange: (v: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  id?: string
  'aria-label'?: string
}

export function Select({ value, onValueChange, options, placeholder, className, id, ...rest }: SelectProps) {
  return (
    <RadixSelect.Root value={value || undefined} onValueChange={onValueChange}>
      <RadixSelect.Trigger
        id={id}
        aria-label={rest['aria-label']}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-left text-xs text-white focus:border-brand-500 focus:outline-none data-[placeholder]:text-slate-500',
          className,
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronDown className="size-4 text-slate-400" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="z-[60] max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-slate-700 bg-slate-900 text-xs text-white shadow-2xl"
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((o) => (
              <RadixSelect.Item
                key={o.value}
                value={o.value}
                className="relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-7 pr-3 outline-none data-[highlighted]:bg-brand-600/30"
              >
                <RadixSelect.ItemIndicator className="absolute left-2">
                  <Check className="size-3.5 text-brand-400" />
                </RadixSelect.ItemIndicator>
                <RadixSelect.ItemText>{o.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}

