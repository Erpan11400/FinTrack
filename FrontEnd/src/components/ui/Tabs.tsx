import { Tabs as RadixTabs } from 'radix-ui'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export const Tabs = RadixTabs.Root
export const TabsContent = RadixTabs.Content

export function TabsList({ children }: { children: ReactNode }) {
  return (
    <RadixTabs.List className="mt-5 flex flex-wrap gap-6 border-b border-slate-800 text-xs font-medium">
      {children}
    </RadixTabs.List>
  )
}

export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  return (
    <RadixTabs.Trigger
      value={value}
      className={cn(
        'flex items-center gap-1.5 border-b-2 border-transparent pb-3 text-slate-400 hover:text-slate-200',
        'data-[state=active]:border-brand-500 data-[state=active]:text-brand-400',
      )}
    >
      {children}
    </RadixTabs.Trigger>
  )
}

