import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { type Env, evalNum, mathFns } from '../scenario/expr'

/**
 * Gráfico de funções para a Física II: curvas dadas por expressão, parâmetros
 * com controle deslizante e, se for o caso, um parâmetro que anda sozinho
 * (o tempo de uma onda). Tudo em SVG, sem a bancada 3D.
 */
export interface Curva {
  expr: string
  rotulo?: string
  cor?: 'accent' | 'pos' | 'neg' | 'mute'
  tracejada?: boolean
}
export interface ParametroPlot {
  id: string
  rotulo: string
  valor: number
  min: number
  max: number
  passo: number
  unidade?: string
  /** Avança sozinho quando o aluno aperta "animar", voltando ao mínimo no fim. */
  anima?: number
}
export interface Grafico {
  titulo: string
  x: { variavel: string; de: number; ate: number; rotulo: string }
  y: { de: number; ate: number; rotulo: string }
  curvas: Curva[]
  parametros?: ParametroPlot[]
  /** Setas verticais saindo da primeira curva, de comprimento proporcional à expressão. */
  setas?: { expr: string; quantas: number; escala: number; rotulo: string }
  marcas?: { x: number; rotulo: string }[]
  pontos?: { x: number; y: number; rotulo: string }[]
  amostras?: number
}

const W = 640
const H = 300
const M = { l: 52, r: 14, t: 14, b: 38 }
const COR: Record<NonNullable<Curva['cor']>, string> = { accent: 'text-accent', pos: 'text-pos', neg: 'text-neg', mute: 'text-text-3' }

function passoBonito(faixa: number, alvo = 6) {
  const bruto = faixa / alvo
  const p = 10 ** Math.floor(Math.log10(bruto))
  const n = bruto / p
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * p
}

function marcasDoEixo(de: number, ate: number) {
  const p = passoBonito(ate - de)
  const out: number[] = []
  for (let v = Math.ceil(de / p) * p; v <= ate + p * 1e-9; v += p) out.push(Math.abs(v) < p * 1e-9 ? 0 : v)
  return out
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { maximumSignificantDigits: 4 })

export function envDe(vars: Record<string, number>): Env {
  return { vars: { pi: Math.PI, e: Math.E, ...vars }, fns: mathFns }
}

/** Valor da expressão, ou NaN se ela falhar num ponto. */
export function avaliar(expr: string, vars: Record<string, number>) {
  try {
    return evalNum(expr, envDe(vars))
  } catch {
    return NaN
  }
}

export function Plot({ g }: { g: Grafico }) {
  const [vals, setVals] = useState<Record<string, number>>(() => Object.fromEntries((g.parametros ?? []).map((p) => [p.id, p.valor])))
  const [tocando, setTocando] = useState(false)
  const animado = (g.parametros ?? []).filter((p) => p.anima)
  const raf = useRef(0)
  const seta = `seta${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  useEffect(() => {
    if (!tocando) return
    let antes = performance.now()
    const passo = (agora: number) => {
      const dt = Math.min(0.1, (agora - antes) / 1000)
      antes = agora
      setVals((v) => {
        const n = { ...v }
        for (const p of animado) {
          let x = (n[p.id] ?? p.valor) + p.anima! * dt
          if (x > p.max) x = p.min + ((x - p.min) % (p.max - p.min))
          n[p.id] = x
        }
        return n
      })
      raf.current = requestAnimationFrame(passo)
    }
    raf.current = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(raf.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tocando])

  const sx = (x: number) => M.l + ((x - g.x.de) / (g.x.ate - g.x.de)) * (W - M.l - M.r)
  const sy = (y: number) => H - M.b - ((y - g.y.de) / (g.y.ate - g.y.de)) * (H - M.t - M.b)
  const n = g.amostras ?? 400

  const caminhos = useMemo(
    () =>
      g.curvas.map((c) => {
        let d = ''
        let caneta = false
        for (let i = 0; i <= n; i++) {
          const x = g.x.de + ((g.x.ate - g.x.de) * i) / n
          const y = avaliar(c.expr, { ...vals, [g.x.variavel]: x })
          if (!Number.isFinite(y)) {
            caneta = false
            continue
          }
          const Y = Math.max(-H, Math.min(2 * H, sy(y)))
          d += `${caneta ? 'L' : 'M'}${sx(x).toFixed(1)} ${Y.toFixed(1)}`
          caneta = true
        }
        return d
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [g, vals, n],
  )

  const setas = useMemo(() => {
    if (!g.setas) return []
    const s = g.setas
    return Array.from({ length: s.quantas }, (_, i) => {
      const x = g.x.de + ((g.x.ate - g.x.de) * (i + 0.5)) / s.quantas
      const env = { ...vals, [g.x.variavel]: x }
      const y0 = avaliar(g.curvas[0].expr, env)
      const v = avaliar(s.expr, env)
      return { x, y0, y1: y0 + s.escala * v }
    }).filter((a) => Number.isFinite(a.y0) && Number.isFinite(a.y1))
  }, [g, vals])

  const tx = marcasDoEixo(g.x.de, g.x.ate)
  const ty = marcasDoEixo(g.y.de, g.y.ate)

  return (
    <figure className="grid gap-2">
      <figcaption className="text-[13px] font-medium text-text">{g.titulo}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-[var(--radius-ctl)] border border-line-soft bg-surface" role="img" aria-label={g.titulo}>
        <defs>
          <marker id={seta} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill="currentColor" className="text-pos" />
          </marker>
        </defs>
        <g className="text-line-soft" stroke="currentColor" strokeWidth="1">
          {tx.map((v) => (
            <line key={`gx${v}`} x1={sx(v)} x2={sx(v)} y1={M.t} y2={H - M.b} />
          ))}
          {ty.map((v) => (
            <line key={`gy${v}`} x1={M.l} x2={W - M.r} y1={sy(v)} y2={sy(v)} />
          ))}
        </g>
        <g className="text-text-3" stroke="currentColor" strokeWidth="1.2">
          {g.y.de <= 0 && g.y.ate >= 0 && <line x1={M.l} x2={W - M.r} y1={sy(0)} y2={sy(0)} />}
          <line x1={M.l} x2={M.l} y1={M.t} y2={H - M.b} />
        </g>
        <g className="fill-current text-text-3" fontSize="11">
          {tx.map((v) => (
            <text key={`lx${v}`} x={sx(v)} y={H - M.b + 15} textAnchor="middle">
              {fmt(v)}
            </text>
          ))}
          {ty.map((v) => (
            <text key={`ly${v}`} x={M.l - 6} y={sy(v) + 4} textAnchor="end">
              {fmt(v)}
            </text>
          ))}
          <text x={(M.l + W - M.r) / 2} y={H - 4} textAnchor="middle">
            {g.x.rotulo}
          </text>
          <text x={12} y={(M.t + H - M.b) / 2} textAnchor="middle" transform={`rotate(-90 12 ${(M.t + H - M.b) / 2})`}>
            {g.y.rotulo}
          </text>
        </g>
        {(g.marcas ?? []).map((m) => (
          <g key={m.rotulo} className="text-text-3">
            <line x1={sx(m.x)} x2={sx(m.x)} y1={M.t} y2={H - M.b} stroke="currentColor" strokeDasharray="4 4" />
            <text
              x={sx(m.x) > W - 90 ? sx(m.x) - 4 : sx(m.x) + 4}
              y={M.t + 11}
              fontSize="11"
              textAnchor={sx(m.x) > W - 90 ? 'end' : 'start'}
              className="fill-current"
            >
              {m.rotulo}
            </text>
          </g>
        ))}
        {caminhos.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={i === 0 ? 2.2 : 1.6}
            strokeDasharray={g.curvas[i].tracejada ? '6 5' : undefined}
            strokeLinejoin="round"
            className={COR[g.curvas[i].cor ?? (i === 0 ? 'accent' : 'mute')]}
          />
        ))}
        {setas.map((a) => (
          <line
            key={a.x}
            x1={sx(a.x)}
            x2={sx(a.x)}
            y1={sy(a.y0)}
            y2={sy(a.y1)}
            stroke="currentColor"
            strokeWidth="1.6"
            className="text-pos"
            markerEnd={Math.abs(sy(a.y1) - sy(a.y0)) > 3 ? `url(#${seta})` : undefined}
          />
        ))}
        {(g.pontos ?? []).map((p) => (
          <g key={p.rotulo} className="text-text">
            <circle cx={sx(p.x)} cy={sy(p.y)} r="4" className="fill-current" />
            <text x={sx(p.x) + 7} y={sy(p.y) - 7} fontSize="11.5" className="fill-current">
              {p.rotulo}
            </text>
          </g>
        ))}
      </svg>
      {(g.curvas.some((c) => c.rotulo) || g.setas) && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-text-3">
          {g.curvas.map(
            (c, i) =>
              c.rotulo && (
                <li key={c.expr} className="inline-flex items-center gap-1.5">
                  <span className={`inline-block h-0.5 w-4 bg-current ${COR[c.cor ?? (i === 0 ? 'accent' : 'mute')]}`} aria-hidden />
                  {c.rotulo}
                </li>
              ),
          )}
          {g.setas && (
            <li className="inline-flex items-center gap-1.5">
              <span className="text-pos" aria-hidden>
                ↑
              </span>
              {g.setas.rotulo}
            </li>
          )}
        </ul>
      )}
      {(g.parametros ?? []).length > 0 && (
        <div className="grid gap-2 pt-1">
          {animado.length > 0 && (
            <button
              type="button"
              onClick={() => setTocando((v) => !v)}
              aria-pressed={tocando}
              className="inline-flex h-8 w-fit items-center rounded-[var(--radius-ctl)] border border-line px-3 text-[13px] text-text-2 hover:border-text-3 hover:text-text"
            >
              {tocando ? 'Pausar' : 'Animar'}
            </button>
          )}
          {(g.parametros ?? []).map((p) => (
            <label key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-[12.5px] text-text-2">
              <span>{p.rotulo}</span>
              <span className="num text-text">
                {fmt(vals[p.id] ?? p.valor)}
                {p.unidade ? ` ${p.unidade}` : ''}
              </span>
              <input
                type="range"
                className="slider col-span-2"
                min={p.min}
                max={p.max}
                step={p.passo}
                value={vals[p.id] ?? p.valor}
                onChange={(e) => setVals((v) => ({ ...v, [p.id]: Number(e.target.value) }))}
              />
            </label>
          ))}
        </div>
      )}
    </figure>
  )
}
