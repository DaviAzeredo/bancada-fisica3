import type { ESource } from './sources'
import { type V3, basis, dist, len, madd, norm, sub } from './vec'

export interface Seed {
  p: V3
  /** +1 segue o campo, −1 vai contra, 0 traça os dois sentidos. */
  dir: 1 | -1 | 0
}

export interface Sink {
  p: V3
  r: number
}

export interface TraceOpts {
  /** Meia-aresta do cubo de visualização, em m. */
  half: number
  step: number
  maxSteps: number
  sinks?: Sink[]
  /** Linhas de B fecham: parar quando voltar perto do início. */
  closes?: boolean
}

export interface FieldLine {
  pts: V3[]
  /** Índice do sumidouro em que a linha terminou, ou −1. */
  sink: number
}

/** RK4 sobre a direção do campo (passo em comprimento de arco, não em tempo). */
export function traceLine(F: (p: V3) => V3, start: V3, dir: 1 | -1, o: TraceOpts): FieldLine {
  const pts: V3[] = [start]
  let p = start
  const h = o.step * dir
  const dirAt = (q: V3): V3 | null => {
    const e = F(q)
    const l = len(e)
    if (!(l > 0) || !Number.isFinite(l)) return null
    return [e[0] / l, e[1] / l, e[2] / l]
  }
  let traveled = 0
  for (let i = 0; i < o.maxSteps; i++) {
    const k1 = dirAt(p)
    if (!k1) break
    const k2 = dirAt(madd(p, k1, h / 2))
    if (!k2) break
    const k3 = dirAt(madd(p, k2, h / 2))
    if (!k3) break
    const k4 = dirAt(madd(p, k3, h))
    if (!k4) break
    const next: V3 = [
      p[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
      p[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
      p[2] + (h / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
    ]
    p = next
    pts.push(p)
    traveled += o.step
    if (Math.abs(p[0]) > o.half || Math.abs(p[1]) > o.half || Math.abs(p[2]) > o.half) break
    if (o.sinks) {
      const si = o.sinks.findIndex((s) => dist(s.p, p) < s.r)
      if (si >= 0) {
        pts.push(o.sinks[si].p)
        return { pts, sink: si }
      }
    }
    if (o.closes && traveled > o.step * 12 && dist(p, start) < o.step * 1.2) {
      pts.push(start)
      break
    }
  }
  return { pts, sink: -1 }
}

export function traceSeeds(F: (p: V3) => V3, seeds: Seed[], o: TraceOpts): FieldLine[] {
  const out: FieldLine[] = []
  for (const s of seeds) {
    if (s.dir === 0) {
      const a = traceLine(F, s.p, 1, o)
      const closed = o.closes && a.pts.length > 2 && dist(a.pts[a.pts.length - 1], s.p) < 1e-12
      if (closed) out.push(a)
      else {
        const b = traceLine(F, s.p, -1, o)
        out.push({ pts: [...b.pts.reverse(), ...a.pts.slice(1)], sink: a.sink })
      }
    } else out.push(traceLine(F, s.p, s.dir, o))
  }
  return out
}

export function fibonacciSphere(n: number): V3[] {
  const ga = Math.PI * (3 - Math.sqrt(5))
  const out: V3[] = []
  for (let i = 0; i < n; i++) {
    const z = 1 - (2 * (i + 0.5)) / n
    const r = Math.sqrt(1 - z * z)
    out.push([r * Math.cos(ga * i), r * Math.sin(ga * i), z])
  }
  return out
}

/**
 * Linhas de E: número de linhas ∝ carga (a convenção de Faraday que o curso usa).
 * Cargas positivas emitem; negativas que recebem menos do que deveriam
 * emitem as que faltam para trás.
 */
export function traceElectricLines(
  F: (p: V3) => V3,
  sources: ESource[],
  o: Omit<TraceOpts, 'sinks'>,
  density = 14,
): FieldLine[] {
  const points = sources.filter((s): s is Extract<ESource, { k: 'point' }> => s.k === 'point' && s.q !== 0)
  const maxQ = Math.max(1e-30, ...points.map((s) => Math.abs(s.q)))
  const r0 = o.step * 1.5
  const sinks: Sink[] = points.map((s) => ({ p: s.p, r: s.q < 0 ? r0 * 0.9 : 0 }))
  const opts: TraceOpts = { ...o, sinks }
  const lines: FieldLine[] = []
  const nFor = (q: number) => Math.max(4, Math.round((density * Math.abs(q)) / maxQ))

  points.forEach((s) => {
    if (s.q <= 0) return
    for (const d of fibonacciSphere(nFor(s.q))) lines.push(traceLine(F, madd(s.p, d, r0), 1, opts))
  })
  points.forEach((s, i) => {
    if (s.q >= 0) return
    const arrived = lines.filter((l) => l.sink === i).length
    const missing = nFor(s.q) - arrived
    if (missing <= 0) return
    const noSelf = { ...opts, sinks: sinks.map((k, j) => (j === i ? { ...k, r: 0 } : k)) }
    for (const d of fibonacciSphere(missing)) lines.push(traceLine(F, madd(s.p, d, r0), -1, noSelf))
  })

  // Distribuições extensas: sementes sobre a própria distribuição.
  for (const s of sources) {
    const seeds = extendedSeeds(s, o.half)
    for (const sd of seeds) lines.push(...traceSeeds(F, [sd], opts))
  }
  return lines
}

function extendedSeeds(s: ESource, half: number): Seed[] {
  const out: Seed[] = []
  switch (s.k) {
    case 'seg': {
      const sg = (Math.sign(s.lambda) || 1) as 1 | -1
      const t = norm(sub(s.b, s.a))
      const [u, v] = basis(t)
      const L = len(sub(s.b, s.a))
      const nAlong = Math.max(3, Math.min(9, Math.round(L / (half * 0.2))))
      for (let i = 0; i < nAlong; i++) {
        const c = madd(s.a, sub(s.b, s.a), (i + 0.5) / nAlong)
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * 2 * Math.PI
          out.push({ p: madd(madd(c, u, Math.cos(a) * half * 0.02), v, Math.sin(a) * half * 0.02), dir: sg })
        }
      }
      break
    }
    case 'rect': {
      const sg = (Math.sign(s.sigma) || 1) as 1 | -1
      const n = norm([
        s.u[1] * s.v[2] - s.u[2] * s.v[1],
        s.u[2] * s.v[0] - s.u[0] * s.v[2],
        s.u[0] * s.v[1] - s.u[1] * s.v[0],
      ])
      const m = 4
      for (let i = 0; i < m; i++)
        for (let j = 0; j < m; j++) {
          const x = -s.hw + ((i + 0.5) / m) * 2 * s.hw
          const y = -s.hh + ((j + 0.5) / m) * 2 * s.hh
          const c = madd(madd(s.c, s.u, x), s.v, y)
          for (const side of [-1, 1]) out.push({ p: madd(c, n, side * half * 0.01), dir: sg })
        }
      break
    }
    case 'sphere':
    case 'shell': {
      const sg = (Math.sign(s.Q) || 1) as 1 | -1
      for (const d of fibonacciSphere(18)) out.push({ p: madd(s.c, d, s.R * 1.02), dir: sg })
      break
    }
    case 'radial': {
      const sg = (Math.sign(s.Q) || 1) as 1 | -1
      if (s.geo === 'esf') {
        for (const d of fibonacciSphere(18)) out.push({ p: madd(s.c, d, s.R * 1.02), dir: sg })
        break
      }
      const [u, v] = basis(s.d)
      for (let i = -2; i <= 2; i++)
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * 2 * Math.PI
          const c = madd(s.c, s.d, (i * half) / 3)
          out.push({ p: madd(madd(c, u, Math.cos(a) * s.R * 1.02), v, Math.sin(a) * s.R * 1.02), dir: sg })
        }
      break
    }
    case 'iline':
    case 'icyl': {
      const sg = (Math.sign(s.lambda) || 1) as 1 | -1
      const t = norm(s.d)
      const [u, v] = basis(t)
      const r = s.k === 'icyl' ? s.R * 1.02 : half * 0.02
      for (let i = -2; i <= 2; i++)
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * 2 * Math.PI
          const c = madd(s.p, t, (i * half) / 3)
          out.push({ p: madd(madd(c, u, Math.cos(a) * r), v, Math.sin(a) * r), dir: sg })
        }
      break
    }
    case 'iplane': {
      const sg = (Math.sign(s.sigma) || 1) as 1 | -1
      const n = norm(s.n)
      const [u, v] = s.mask ? [s.mask.u, s.mask.v] : basis(n)
      const su = s.mask ? s.mask.hw * 0.4 : half / 3
      const sv = s.mask ? s.mask.hh * 0.4 : half / 3
      for (let i = -2; i <= 2; i++)
        for (let j = -2; j <= 2; j++) {
          const c = madd(madd(s.p, u, i * su), v, j * sv)
          for (const side of [-1, 1]) out.push({ p: madd(c, n, side * half * 0.01), dir: sg })
        }
      break
    }
    case 'uniformE': {
      const n = norm(s.E)
      const [u, v] = basis(n)
      for (let i = -2; i <= 2; i++)
        for (let j = -2; j <= 2; j++)
          out.push({ p: madd(madd(madd([0, 0, 0], n, -half * 0.98), u, (i * half) / 2.5), v, (j * half) / 2.5), dir: 1 })
      break
    }
    case 'point':
      break
  }
  return out
}
