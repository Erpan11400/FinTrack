import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl text-xs font-semibold transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20',
        secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
        danger: 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60',
        success: 'bg-emerald-600 hover:bg-emerald-500 text-white',
        ghost: 'text-slate-400 hover:text-white',
      },
      size: {
        sm: 'px-3 py-1.5',
        md: 'px-4 py-2',
        lg: 'px-4 py-3 w-full',
        icon: 'p-1',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

