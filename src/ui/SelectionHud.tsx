import { useEffect, useState } from 'react'
import type { V3 } from '../physics/vec'
import type { Resolved } from '../scenario/compile'
import { orientOf, rotate } from '../scene/Interaction'
import { useRun } from '../store'
import { Icon, IconButton } from './kit'

const FATOR = { m: 1, cm: 100, mm: 1000 } as const

/** Campo numérico que só confirma no Enter ou ao sair, para não brigar com a digitação. */
function CoordInput({ label, value, onCommit }: { label: string; value: number; onCommit: (v: number) => void }) {
  const [text, setText] = useState(value.toLocaleString('pt-BR', { maximumFractionDigits: 3 }))
  useEffect(() => setText(value.toLocaleString('pt-BR', { maximumFractionDigits: 3 })), [value])
  const commit = () => {
    const v = Number(text.replace(/\s/g, '').replace(',', '.'))
    if (Number.isFinite(v)) onCommit(v)
    else setText(value.toLocaleString('pt-BR', { maximumFractionDigits: 3 }))
  }
  return (
    <label className="grid gap-0.5">
      <span className="text-[11px] text-text-3">{label}</span>
      <input
        inputMode="decimal"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
          if (e.key === 'Escape') {
            setText(value.toLocaleString('pt-BR', { maximumFractionDigits: 3 }))
            ;(e.target as HTMLInputElement).blur()
          }
        }}
        className="num h-7 w-full rounded-[5px] border border-line bg-bg px-2 text-[12.5px] text-text focus:border-accent focus:outline-none"
      />
    </label>
  )
}

/**
 * Cartão do objeto selecionado: coordenadas exatas (digitáveis), o parâmetro
 * que o arrasto controla, rotação e remoção. Espelha os atalhos de teclado,
 * para quem usa toque ou leitor de tela.
 */
export function SelectionHud({ r }: { r: Resolved }) {
  const selected = useRun((s) => s.selected)
  const scenario = useRun((s) => s.scenario)!
  const params = useRun((s) => s.params)
  const isExtra = useRun((s) => !!s.selected && s.extras.some((e) => e.id === s.selected))
  if (!selected) return null
  const inter = r.interativos.get(selected)
  const ent = r.byId.get(selected)
  if (!inter || !ent) return null
  const st = useRun.getState()
  const unidade = scenario.cena.unidade
  const f = FATOR[unidade]
  const p = r.env.fns.pos(selected) as V3
  const n = inter.girar ? orientOf(ent) : null
  const planoXY = scenario.cena.plano === 'xy'
  const up: V3 = planoXY ? [0, 0, 1] : [0, 1, 0]
  const tilt: V3 = [1, 0, 0]
  const turn = (axis: V3, deg: number) => n && st.setOrient(selected, rotate(n, axis, (deg * Math.PI) / 180))
  const def = inter.arraste ? scenario.parametros.find((x) => x.id === inter.arraste!.param) : undefined
  const nome = ('rotulo' in ent && ent.rotulo) || selected
  // numa varredura, o valor da cena não é o guardado no slider
  const vivo = def ? r.env.vars[def.id] : undefined
  const atual = typeof vivo === 'number' ? vivo : def ? (params[def.id] ?? 0) : 0

  return (
    <div
      className="pointer-events-auto w-[248px] rounded-[var(--radius-panel)] border border-line bg-surface/95 p-3 shadow-[0_8px_24px_-12px_oklch(0_0_0/0.6)]"
      role="region"
      aria-label={`Objeto selecionado: ${nome}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0 truncate text-[13px] font-medium text-text">{nome}</div>
        <IconButton label="Soltar seleção (Esc)" onClick={() => st.select(null)} className="h-6 w-6">
          {Icon.close}
        </IconButton>
      </div>

      {inter.mover && (
        <div className="grid grid-cols-3 gap-1.5">
          {(['x', 'y', 'z'] as const).map((k, i) => (
            <CoordInput
              key={k}
              label={`${k} (${unidade})`}
              value={p[i] * f}
              onCommit={(v) => {
                const q = [...p] as [number, number, number]
                q[i] = v / f
                st.setOverride(selected, q)
              }}
            />
          ))}
        </div>
      )}

      {inter.arraste && def && (
        <div className="flex items-center justify-between gap-2 text-[12.5px] text-text-2">
          <span>{def.rotulo}</span>
          <span className="flex items-center gap-1">
            <IconButton label={`Diminuir ${def.rotulo}`} className="h-6 w-6" onClick={() => st.setParam(def.id, Math.max(def.min ?? -Infinity, atual - (def.passo ?? 0.001)))}>
              −
            </IconButton>
            <span className="num w-16 text-center text-text">{(atual * (def.unidade === 'm' ? f : 1)).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {def.unidade === 'm' ? unidade : def.unidade}</span>
            <IconButton label={`Aumentar ${def.rotulo}`} className="h-6 w-6" onClick={() => st.setParam(def.id, Math.min(def.max ?? Infinity, atual + (def.passo ?? 0.001)))}>
              +
            </IconButton>
          </span>
        </div>
      )}

      {n && (
        <div className="mt-2 flex items-center justify-between gap-2 text-[12px] text-text-3">
          <span className="num">
            eixo ({n.map((x) => x.toLocaleString('pt-BR', { maximumFractionDigits: 2 })).join('; ')})
          </span>
          <span className="flex gap-0.5">
            <IconButton label="Girar à esquerda (Q)" className="h-6 w-6" onClick={() => turn(up, 15)}>
              ⟲
            </IconButton>
            <IconButton label="Girar à direita (E)" className="h-6 w-6" onClick={() => turn(up, -15)}>
              ⟳
            </IconButton>
            <IconButton label="Inclinar (Z)" className="h-6 w-6" onClick={() => turn(tilt, 15)}>
              ⤒
            </IconButton>
            <IconButton label="Inclinar ao contrário (X)" className="h-6 w-6" onClick={() => turn(tilt, -15)}>
              ⤓
            </IconButton>
          </span>
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line-soft pt-2 text-[11px] leading-snug text-text-3">
        <span>
          {inter.arraste ? '← → ajustam' : '← → ↑ ↓ movem · PgUp/PgDn altura'} · Shift fino{n ? ' · Q/E/Z/X giram' : ''}
        </span>
        {isExtra && (
          <button type="button" className="shrink-0 text-text-2 hover:text-danger" onClick={() => st.removeExtra(selected)}>
            Remover
          </button>
        )}
      </div>
    </div>
  )
}
