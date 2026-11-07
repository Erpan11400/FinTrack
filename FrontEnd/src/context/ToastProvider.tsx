import { useCallback, useState, type ReactNode } from 'react'
import { Toast } from 'radix-ui'
import { CircleCheck, CircleX, Info, TriangleAlert } from 'lucide-react'
import { ToastContext, type ToastKind } from './ToastContext'

interface Item {
  id: number
  message: string
  kind: ToastKind
}

const ICONS = {
  success: <CircleCheck className="size-4 text-emerald-400" />,
  error: <CircleX className="size-4 text-rose-400" />,
  warning: <TriangleAlert className="size-4 text-amber-400" />,
  info: <Info className="size-4 text-brand-400" />,
}

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([])

  const toast = useCallback((message: string, kind: ToastKind = 'info') => {
    setItems((prev) => [...prev, { id: nextId++, message, kind }])
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <Toast.Provider duration={3500} swipeDirection="right">
        {children}
        {items.map((it) => (
          <Toast.Root
            key={it.id}
            onOpenChange={(open) => {
              if (!open) setItems((prev) => prev.filter((p) => p.id !== it.id))
            }}
            className="flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs text-white shadow-2xl data-[state=closed]:opacity-0 transition"
          >
            {ICONS[it.kind]}
            <Toast.Description>{it.message}</Toast.Description>
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed bottom-5 right-5 z-[100] flex w-80 max-w-[100vw] flex-col gap-2 outline-none" />
      </Toast.Provider>
    </ToastContext.Provider>
  )
}

