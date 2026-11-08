import { Dialog as RadixDialog } from 'radix-ui'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onOpenChange, title, description, children, className }: ModalProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm" />
        <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <RadixDialog.Content
            aria-describedby={description ? undefined : undefined}
            className={cn(
              'glass-panel pointer-events-auto my-auto w-full max-w-md space-y-4 rounded-2xl p-6 shadow-2xl focus:outline-none',
              className,
            )}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-800 pb-3">
              <RadixDialog.Title className="flex items-center gap-2 text-base font-bold text-white">
                {title}
              </RadixDialog.Title>
              <RadixDialog.Close className="p-1 text-slate-400 hover:text-white" aria-label="Tutup">
                <X className="size-5" />
              </RadixDialog.Close>
            </div>
            {description && (
              <RadixDialog.Description className="sr-only">{description}</RadixDialog.Description>
            )}
            {children}
          </RadixDialog.Content>
        </div>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

