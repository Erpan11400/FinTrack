import { Zap } from 'lucide-react'
import { useFinance } from '../../hooks/useFinance'
import { getIcon } from '../../lib/icons'
import { formatRp } from '../../lib/utils'

export function PresetBar() {
  const { presets, runPreset } = useFinance()
  return (
    <div className="glass-panel space-y-3 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-amber-400" />
          <h3 className="text-base font-bold text-slate-100">Preset Transaksi Cepat (1-2 Klik)</h3>
        </div>
        <span className="text-xs text-slate-400">Klik shortcut untuk pencatatan instan</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((p) => {
          const Icon = getIcon(p.icon)
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => runPreset(p)}
              className="group flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 transition hover:border-brand-500 hover:bg-brand-600/20"
            >
              <div className="flex size-6 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400 transition group-hover:scale-110">
                <Icon className="size-3.5" />
              </div>
              <div className="text-left">
                <div className="font-semibold leading-tight text-slate-200">{p.label}</div>
                <div className="font-mono text-xs text-slate-400">{formatRp(p.amount)}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

