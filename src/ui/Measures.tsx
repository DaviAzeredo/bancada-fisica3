import { formatSI, relErr } from '../lib/format'
import type { Resolved } from '../scenario/compile'
import { evalNum } from '../scenario/expr'
import type { Medida } from '../scenario/schema'
import { Tex } from './Rich'

function safe(expr: string | number, r: Resolved): number | Error {
  try {
    return evalNum(expr, r.env)
  } catch (e) {
    return e as Error
  }
}

export function Measures({ medidas, r, focus }: { medidas: Medida[]; r: Resolved; focus?: number[] }) {
  const rows = medidas
    .map((m, i) => ({ m, i }))
    .filter(({ m }) => {
      if (m.ativo === undefined) return true
      const a = safe(m.ativo, r)
      return typeof a === 'number' && a !== 0
    })
  if (!rows.length) return <p className="text-[13px] text-text-3">Nenhuma medida neste cenário.</p>
  return (
    <div className="grid gap-px overflow-hidden rounded-[var(--radius-ctl)] border border-line-soft bg-line-soft" role="table" aria-label="Medidas ao vivo">
      {rows.map(({ m, i }) => {
        const v = safe(m.expr, r)
        const th = m.teoria !== undefined ? safe(m.teoria, r) : undefined
        // ruído de quadratura em torno de um zero teórico aparece como "≈ 0"
        const nearZero = typeof v === 'number' && th === 0 && Math.abs(v) < 1e-8
        const fv = typeof v === 'number' ? (nearZero ? { value: '≈ 0', unit: m.unidade } : formatSI(v, m.unidade, m.casas ?? 4)) : null
        const ft = typeof th === 'number' ? formatSI(th, m.unidade, m.casas ?? 4) : null
        const err = typeof v === 'number' && typeof th === 'number' ? relErr(v, th) : null
        const on = focus?.includes(i)
        return (
          <div
            key={i}
            role="row"
            className={`grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 px-3 py-2.5 transition-colors duration-200 ${on ? 'bg-surface-3' : 'bg-surface'}`}
          >
            <div role="cell" className="min-w-0 text-[13px] text-text-2">
              {on && <span className="mr-1.5 inline-block h-1.5 w-1.5 -translate-y-px rounded-full bg-accent align-middle" aria-hidden />}
              {m.rotulo}
              {m.simbolo && (
                <div className="mt-0.5 text-[12.5px] text-text-3">
                  <Tex src={m.simbolo} />
                </div>
              )}
            </div>
            <div role="cell" className="text-right">
              {fv ? (
                <div className="num text-[14px] text-text">
                  {fv.value}
                  {fv.unit && <span className="ml-1 text-text-3">{fv.unit}</span>}
                </div>
              ) : (
                <div className="text-[12px] text-danger" title={(v as Error).message}>
                  erro na expressão
                </div>
              )}
              {ft && (
                <div className="num mt-0.5 text-[12px] text-text-3">
                  teoria {ft.value} {ft.unit}
                  {err !== null && (
                    <span className={`ml-2 ${err < 0.01 ? 'text-accent' : 'text-pos'}`}>
                      {err < 0.0001 ? '✓' : `${(err * 100).toLocaleString('pt-BR', { maximumFractionDigits: err < 0.1 ? 2 : 0 })}%`}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
