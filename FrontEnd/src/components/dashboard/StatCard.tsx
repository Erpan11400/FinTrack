import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Props {
  title: string
  value: string
  icon: LucideIcon
  iconClass: string
  valueClass: string
  footer: ReactNode
}

export function StatCard({ title, value, icon: Icon, iconClass, valueClass, footer }: Props) {
  return (
    <div className="glass-panel relative overflow-hidden rounded-2xl p-5">
      <div className="mb-2 flex items-center justify-between text-slate-400">
        <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
        <div className={cn('flex size-8 items-center justify-center rounded-lg', iconClass)}>
          <Icon className="size-4" />
        </div>
      </div>
      <div className={cn('text-2xl font-extrabold', valueClass)}>{value}</div>
      <div className="mt-1 text-xs text-slate-500">{footer}</div>
    </div>
  )
}

