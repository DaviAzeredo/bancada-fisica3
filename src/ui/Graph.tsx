import { useEffect, useMemo, useRef, useState } from 'react'
import { formatInline } from '../lib/format'
import type { Resolved } from '../scenario/compile'
import { type Env, evalNum } from '../scenario/expr'
import type { Grafico } from '../scenario/schema'
import { useRun } from '../store'

const SERIES = ['oklch(0.82 0.13 160)', 'oklch(0.74 0.16 55)', 'oklch(0.7 0.13 245)', 'oklch(0.88 0.11 90)']

interface Data {
  xs: number[]
  ys: (number | null)[][]
  /** Posição atual da cena sobre o eixo x. */
  marca?: number
}

function sampleProfile(g: Grafico, env: Env): Data {
  const x = g.x!
  const a = evalNum(x.de, env)
  const b = evalNum(x.ate, env)
  const N = 160
  const xs: number[] = []
  const ys: (number | null)[][] = g.series.map(() => [])
  const local: Env = { vars: { ...env.vars }, fns: env.fns }
  for (let i = 0; i <= N; i++) {
    const xv = a + ((b - a) * i) / N
    xs.push(xv)
    local.vars[x.variavel] = xv
    g.series.forEach((s, k) => {
      try {
        const v = evalNum(s.expr, local)
        ys[k].push(Number.isFinite(v) ? v : null)
      } catch {
        ys[k].push(null)
      }
    })
  }
  return { xs, ys, marca: x.marca === undefined ? undefined : evalNum(x.marca, env) }
}

const QUASE_CONSTANTE = 0.005

function niceTicks(lo: number, hi: number, n = 4) {
  if (!(hi > lo)) return [lo]
  const raw = (hi - lo) / n
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw
  const out: number[] = []
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v)
  return out
}

export function Graph({ g, r }: { g: Grafico; r: Resolved }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [width, setWidth] = useState(340)
  const history = useRef<{ t: number; v: (number | null)[] }[]>([])
  const curva = useRef<{ em: number; data: Data } | null>(null)
  const vivo = useRun((s) => s.playing)
  // o tempo vem do mundo compilado do painel (10 Hz), não do relógio a 60 Hz
  const t = typeof r.env.vars.t === 'number' ? r.env.vars.t : 0

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const data: Data = useMemo(() => {
    if (g.tipo === 'perfil' && g.x) {
      try {
        // com a cena andando, o ponto anda a cada quadro do painel e a curva, três vezes por segundo
        const em = performance.now()
        if (vivo && r.timeDependent && curva.current && em - curva.current.em < 300 && g.x.marca !== undefined)
          return { ...curva.current.data, marca: evalNum(g.x.marca, r.env) }
        const data = sampleProfile(g, r.env)
        curva.current = { em, data }
        return data
      } catch {
        return { xs: [], ys: [] }
      }
    }
    const h = history.current
    if (h.length && t < h[h.length - 1].t) h.length = 0
    const v = g.series.map((s) => {
      try {
        const x = evalNum(s.expr, r.env)
        return Number.isFinite(x) ? x : null
      } catch {
        return null
      }
    })
    if (!h.length || t > h[h.length - 1].t) h.push({ t, v })
    const win = g.janela
    while (h.length > 600 || (win && h.length > 1 && h[h.length - 1].t - h[0].t > win)) h.shift()
    return { xs: h.map((p) => p.t), ys: g.series.map((_, k) => h.map((p) => p.v[k])) }
  }, [g, r, t, vivo])

  const H = 168
  // cabe "−2,0 × 10⁻⁷" nos rótulos do eixo
  const pad = { l: 76, r: 12, t: 12, b: 26 }

  // Séries com unidades diferentes ganham escala própria (normalizadas ao eixo da primeira).
  const units = g.series.map((s) => s.unidade)
  const mixed = new Set(units).size > 1

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    c.width = width * dpr
    c.height = H * dpr
    const ctx = c.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, H)
    const { xs, ys } = data
    if (xs.length < 2) {
      ctx.fillStyle = 'oklch(0.62 0.012 255)'
      ctx.font = '12px Inter Variable, sans-serif'
      ctx.fillText(g.tipo === 'tempo' ? 'Dê play para registrar.' : 'Sem dados.', pad.l, H / 2)
      return
    }
    const x0 = xs[0]
    const x1 = xs[xs.length - 1]
    const ranges = ys.map((s) => {
      const f = s.filter((v): v is number => v !== null)
      return f.length ? [Math.min(...f), Math.max(...f)] : [0, 1]
    })
    const prim = ranges[0]
    let lo = mixed ? prim[0] : Math.min(...ranges.map((q) => q[0]))
    let hi = mixed ? prim[1] : Math.max(...ranges.map((q) => q[1]))
    if (lo > 0 && lo < hi * 0.6) lo = 0
    if (hi < 0 && hi > lo * 0.6) hi = 0
    // quase constante é constante: ampliar a escala só mostraria arredondamento
    if (hi - lo < Math.abs(hi) * QUASE_CONSTANTE || hi === lo) {
      const m = Math.abs(hi) || 1
      lo -= m * 0.5
      hi += m * 0.5
    }
    const span = hi - lo
    lo -= span * 0.06
    hi += span * 0.06
    const W = width - pad.l - pad.r
    const Hh = H - pad.t - pad.b
    const X = (x: number) => pad.l + ((x - x0) / (x1 - x0 || 1)) * W
    const Y = (y: number) => pad.t + (1 - (y - lo) / (hi - lo)) * Hh

    ctx.font = '11px JetBrains Mono Variable, monospace'
    ctx.textBaseline = 'middle'
    ctx.strokeStyle = 'oklch(0.27 0.012 255)'
    ctx.lineWidth = 1
    ctx.fillStyle = 'oklch(0.62 0.012 255)'
    for (const v of niceTicks(lo, hi)) {
      const y = Math.round(Y(v)) + 0.5
      ctx.beginPath()
      ctx.moveTo(pad.l, y)
      ctx.lineTo(width - pad.r, y)
      ctx.stroke()
      ctx.textAlign = 'right'
      ctx.fillText(formatInline(v, '', 2), pad.l - 6, y)
    }
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    for (const v of niceTicks(x0, x1, 4)) {
      const x = Math.round(X(v)) + 0.5
      ctx.beginPath()
      ctx.moveTo(x, pad.t)
      ctx.lineTo(x, H - pad.b)
      ctx.stroke()
      ctx.fillText(formatInline(v, '', 2), x, H - pad.b + 6)
    }
    if (lo < 0 && hi > 0) {
      ctx.strokeStyle = 'oklch(0.4 0.012 255)'
      ctx.beginPath()
      ctx.moveTo(pad.l, Math.round(Y(0)) + 0.5)
      ctx.lineTo(width - pad.r, Math.round(Y(0)) + 0.5)
      ctx.stroke()
    }

    const pontos: { x: number; y: number; cor: string }[] = []
    const indice = data.marca === undefined ? -1 : Math.round(((data.marca - x0) / (x1 - x0 || 1)) * (xs.length - 1))
    ys.forEach((s, k) => {
      let [slo, shi] = ranges[k]
      const map = mixed && k > 0 ? (v: number) => lo + ((v - slo) / (shi - slo || 1)) * (hi - lo) * 0.88 + (hi - lo) * 0.06 : (v: number) => v
      if (!(shi - slo > Math.max(Math.abs(slo), Math.abs(shi)) * QUASE_CONSTANTE)) {
        const m = Math.abs(shi) || 1
        slo -= m
        shi += m
      }
      ctx.strokeStyle = SERIES[k % SERIES.length]
      ctx.lineWidth = k === 0 ? 2 : 1.6
      ctx.setLineDash(k === 1 && !mixed ? [5, 4] : [])
      ctx.beginPath()
      let pen = false
      s.forEach((v, i) => {
        if (v === null) {
          pen = false
          return
        }
        const px = X(xs[i])
        const py = Y(map(v))
        if (!pen) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
        pen = true
      })
      ctx.stroke()
      ctx.setLineDash([])
      const v = s[indice]
      if (v !== null && v !== undefined) pontos.push({ x: X(xs[indice]), y: Y(map(v)), cor: SERIES[k % SERIES.length] })
    })

    if (pontos.length) {
      ctx.strokeStyle = 'oklch(0.76 0.01 255 / 0.45)'
      ctx.beginPath()
      ctx.moveTo(Math.round(pontos[0].x) + 0.5, pad.t)
      ctx.lineTo(Math.round(pontos[0].x) + 0.5, H - pad.b)
      ctx.stroke()
      for (const p of pontos) {
        ctx.fillStyle = p.cor
        ctx.strokeStyle = 'oklch(0.155 0.012 255)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
      }
    }

    if (hover !== null) {
      const i = Math.round(hover * (xs.length - 1))
      const x = X(xs[i])
      ctx.strokeStyle = 'oklch(0.76 0.01 255 / 0.6)'
      ctx.beginPath()
      ctx.moveTo(Math.round(x) + 0.5, pad.t)
      ctx.lineTo(Math.round(x) + 0.5, H - pad.b)
      ctx.stroke()
    }
  }, [data, width, hover, mixed, g.tipo])

  const readout = (() => {
    if (hover === null || data.xs.length < 2) return null
    const i = Math.round(hover * (data.xs.length - 1))
    return { x: data.xs[i], ys: data.ys.map((s) => s[i]) }
  })()

  const xLabel = g.tipo === 'tempo' ? 't' : g.x?.rotulo ?? 'x'
  const xUnit = g.tipo === 'tempo' ? 's' : g.x?.unidade ?? ''

  return (
    <figure className="grid gap-2">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[13px]">
        <span className="text-text-2">{g.titulo}</span>
        <span className="flex flex-wrap gap-3 text-[12px] text-text-3">
          {g.series.map((s, k) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span className="inline-block h-[2px] w-3.5 rounded" style={{ background: SERIES[k % SERIES.length] }} aria-hidden />
              {s.rotulo}
              {mixed && s.unidade && <span className="num">({s.unidade})</span>}
            </span>
          ))}
        </span>
      </figcaption>
      <div
        ref={wrapRef}
        className="relative rounded-[var(--radius-ctl)] border border-line-soft bg-bg"
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const f = (e.clientX - rect.left - pad.l) / (rect.width - pad.l - pad.r)
          setHover(f >= 0 && f <= 1 ? f : null)
        }}
        onPointerLeave={() => setHover(null)}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: H, display: 'block' }} role="img" aria-label={`Gráfico: ${g.titulo}`} />
        {readout && (
          <div className="num pointer-events-none absolute top-2 right-2 rounded-[5px] border border-line bg-surface/95 px-2 py-1.5 text-[11.5px] leading-[1.45]">
            <div className="text-text-3">
              {xLabel} = {formatInline(readout.x, xUnit)}
            </div>
            {readout.ys.map((v, k) => (
              <div key={k} style={{ color: SERIES[k % SERIES.length] }}>
                {v === null ? '—' : formatInline(v, g.series[k].unidade)}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="num -mt-1 text-right text-[11.5px] text-text-3">
        {xLabel} {xUnit && `(${xUnit})`}
      </div>
    </figure>
  )
}
