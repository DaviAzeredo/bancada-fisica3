import { type Seed, traceElectricLines, traceSeeds } from '../physics/fieldlines'
import { isosurface, sampleGrid } from '../physics/iso'
import { type World, fieldB, fieldE, potentialV } from '../physics/sources'
import { type V3, basis, madd } from '../physics/vec'
import type { Resolved } from '../scenario/compile'

/**
 * Cálculo dos campos para visualização, sem three.js e sem React: roda tanto no
 * Web Worker quanto em teste. Tudo sai em Float32Array transferível.
 */

export type Plano = 'xy' | 'yz' | 'xz'

export type FieldJob =
  | { tipo: 'setas'; campo: 'E' | 'B'; half: number; n: number; plano: Plano | false; fontes?: string[] }
  | { tipo: 'linhas'; campo: 'E' | 'B'; half: number; fontes?: string[]; qualidade: number }
  | { tipo: 'plano'; half: number; normal: 'x' | 'y' | 'z'; at: number; N: number; fontes?: string[] }
  | { tipo: 'iso'; half: number; N: number; fontes?: string[] }
  | { tipo: 'textura'; campo: 'E' | 'B'; half: number; normal: 'x' | 'y' | 'z'; at: number; N: number; fontes?: string[] }

export interface ArrowsResult {
  tipo: 'setas'
  /** posição (3), direção unitária (3) e intensidade normalizada 0..1 (1) por seta */
  pos: Float32Array
  dir: Float32Array
  t: Float32Array
  /** 1 = entra na folha (⊗), −1 = sai (⊙), 0 = seta comum; só no plano xy */
  glifo: Int8Array
  cell: number
}
export interface LinesResult {
  tipo: 'linhas'
  /** pares de pontos (segmentos) e, por linha, o comprimento acumulado (para o fluxo animado) */
  segs: Float32Array
  dist: Float32Array
  /** pontas de seta: posição (3) e direção (3) */
  heads: Float32Array
}
export interface SliceResult {
  tipo: 'plano'
  N: number
  /** valor comprimido para cor (−1..1) e V/V0 para as isolinhas */
  s: Float32Array
  v: Float32Array
}
export interface IsoResult {
  tipo: 'iso'
  meshes: { pos: Float32Array; nrm: Float32Array; sign: number; mag: number }[]
}
export interface TextureResult {
  tipo: 'textura'
  N: number
  /** componentes no plano (u, v) normalizadas e intensidade 0..1, para a limalha */
  vec: Float32Array
}
export type FieldResult = ArrowsResult | LinesResult | SliceResult | IsoResult | TextureResult

export function visWorld(r: Resolved, fontes?: string[]): World {
  if (!fontes?.length) return r.world
  const w: World = { e: [], b: [] }
  for (const id of fontes) {
    const s = r.sourcesOf.get(id)
    if (s) {
      w.e.push(...s.e)
      w.b.push(...s.b)
    }
  }
  return w
}

const planePoint = (normal: 'x' | 'y' | 'z', at: number, a: number, b: number): V3 =>
  normal === 'z' ? [a, b, at] : normal === 'y' ? [a, at, -b] : [at, b, -a]

/* ───────────────────────── setas ───────────────────────── */

function arrows(r: Resolved, job: Extract<FieldJob, { tipo: 'setas' }>): ArrowsResult {
  const w = visWorld(r, job.fontes)
  const F = job.campo === 'E' ? (p: V3) => fieldE(w, p) : (p: V3) => fieldB(w, p)
  const exclude = r.ents.flatMap((e) => (e.tipo === 'carga' ? [{ p: e.p, r: job.half * 0.07 }] : []))
  const span = job.half * 0.92
  const n = job.n
  const step = (2 * span) / (n - 1)
  const layers = job.plano ? [0] : Array.from({ length: n }, (_, k) => -span + k * step)
  const pts: V3[] = []
  for (const z of layers)
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const a = -span + i * step
        const b = -span + j * step
        const q: V3 = job.plano === 'xy' ? [a, b, 0] : job.plano === 'yz' ? [0, b, a] : job.plano === 'xz' ? [a, 0, b] : [a, z, b]
        if (exclude.some((e) => Math.hypot(q[0] - e.p[0], q[1] - e.p[1], q[2] - e.p[2]) < e.r)) continue
        pts.push(q)
      }
  const vals = pts.map(F)
  const mags = vals.map((v) => Math.hypot(v[0], v[1], v[2]))
  // abaixo de 1e-10 do maior valor é arredondamento (o metal de um condutor,
  // o centro de uma simetria): sem seta, em vez de uma seta com direção ao acaso
  const top = mags.reduce((m, v) => (Number.isFinite(v) ? Math.max(m, v) : m), 0)
  const real = (m: number) => m > top * 1e-10 && Number.isFinite(m)
  const logs = mags.filter(real).map(Math.log10).sort((a, b) => a - b)
  const lo = logs[Math.floor(logs.length * 0.08)] ?? 0
  const hi = logs[Math.floor(logs.length * 0.97)] ?? 1
  const keep = mags.map(real)
  const count = keep.filter(Boolean).length
  const pos = new Float32Array(count * 3)
  const dir = new Float32Array(count * 3)
  const t = new Float32Array(count)
  const glifo = new Int8Array(count)
  let k = 0
  pts.forEach((p, i) => {
    if (!keep[i]) return
    const m = mags[i]
    const v = vals[i]
    pos.set(p, 3 * k)
    dir.set([v[0] / m, v[1] / m, v[2] / m], 3 * k)
    t[k] = hi > lo ? Math.min(1, Math.max(0, (Math.log10(m) - lo) / (hi - lo))) : 1
    if (job.plano === 'xy' && Math.abs(v[2]) > 0.85 * m) glifo[k] = v[2] < 0 ? 1 : -1
    k++
  })
  return { tipo: 'setas', pos, dir, t, glifo, cell: step }
}

/* ───────────────────────── linhas ───────────────────────── */

function bSeeds(r: Resolved, half: number, fontes?: string[]): Seed[] {
  const seeds: Seed[] = []
  for (const e of r.ents) {
    if (fontes?.length && !fontes.includes(e.id)) continue
    switch (e.tipo) {
      case 'bobina':
        for (const p of e.seeds) seeds.push({ p, dir: 0 })
        break
      case 'fioInfinito':
      case 'cilindroCorrente': {
        const [u] = basis(e.d)
        for (let i = 1; i <= 6; i++) seeds.push({ p: madd(e.p, u, (half * i) / 7.5), dir: 0 })
        break
      }
      case 'fio': {
        const mid: V3 = [(e.va[0] + e.vb[0]) / 2, (e.va[1] + e.vb[1]) / 2, (e.va[2] + e.vb[2]) / 2]
        const [u] = basis([e.vb[0] - e.va[0], e.vb[1] - e.va[1], e.vb[2] - e.va[2]])
        for (let i = 1; i <= 4; i++) seeds.push({ p: madd(mid, u, (half * i) / 10), dir: 0 })
        break
      }
      case 'ima': {
        const [u, v] = basis(e.n)
        seeds.push({ p: e.c, dir: 0 })
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * 2 * Math.PI
          for (const f of [0.45, 0.85]) seeds.push({ p: madd(madd(e.c, u, Math.cos(a) * e.R * f), v, Math.sin(a) * e.R * f), dir: 0 })
        }
        break
      }
      case 'campoB': {
        if (e.uniforme) {
          const n = e.uniforme
          const l = Math.hypot(n[0], n[1], n[2]) || 1
          const nn: V3 = [n[0] / l, n[1] / l, n[2] / l]
          const [u, v] = basis(nn)
          for (let i = -2; i <= 2; i++)
            for (let j = -2; j <= 2; j++)
              seeds.push({ p: madd(madd(madd([0, 0, 0], nn, -half * 0.97), u, (i * half) / 2.6), v, (j * half) / 2.6), dir: 1 })
        } else for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) seeds.push({ p: [(i * half) / 2.6, (j * half) / 2.6, 0], dir: 0 })
        break
      }
    }
  }
  return seeds
}

function lines(r: Resolved, job: Extract<FieldJob, { tipo: 'linhas' }>): LinesResult {
  const w = visWorld(r, job.fontes)
  const q = job.qualidade
  const step = job.half / (70 * q)
  const found =
    job.campo === 'E'
      ? traceElectricLines((p) => fieldE(w, p), w.e, { half: job.half * 1.05, step, maxSteps: Math.round(900 * q) }, Math.round(14 * Math.max(0.6, q)))
      : traceSeeds((p) => fieldB(w, p), bSeeds(r, job.half, job.fontes), {
          half: job.half * 1.05,
          step: job.half / (55 * q),
          maxSteps: Math.round(900 * q),
          closes: true,
        })
  let nSeg = 0
  let nHead = 0
  for (const l of found)
    if (l.pts.length >= 3) {
      nSeg += l.pts.length - 1
      nHead += l.pts.length > 120 ? 2 : 1
    }
  const segs = new Float32Array(nSeg * 6)
  const dist = new Float32Array(nSeg * 2)
  const heads = new Float32Array(nHead * 6)
  let s = 0
  let h = 0
  for (const l of found) {
    const pts = l.pts
    if (pts.length < 3) continue
    let acc = 0
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i]
      const b = pts[i + 1]
      segs.set(a, 6 * s)
      segs.set(b, 6 * s + 3)
      dist[2 * s] = acc
      acc += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2])
      dist[2 * s + 1] = acc
      s++
    }
    for (const f of pts.length > 120 ? [0.33, 0.66] : [0.5]) {
      const i = Math.floor(pts.length * f)
      const a = pts[i]
      const b = pts[Math.min(pts.length - 1, i + 1)]
      heads.set(a, 6 * h)
      heads.set([b[0] - a[0], b[1] - a[1], b[2] - a[2]], 6 * h + 3)
      h++
    }
  }
  return { tipo: 'linhas', segs, dist, heads }
}

/* ───────────────────────── plano de potencial ───────────────────────── */

function slice(r: Resolved, job: Extract<FieldJob, { tipo: 'plano' }>): SliceResult {
  const w = visWorld(r, job.fontes)
  const N = job.N
  const vals = new Float32Array(N * N)
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const a = -job.half + ((i + 0.5) / N) * 2 * job.half
      const b = -job.half + ((j + 0.5) / N) * 2 * job.half
      vals[j * N + i] = potentialV(w, planePoint(job.normal, job.at, a, b))
    }
  const sorted = Array.from(vals, Math.abs)
    .filter(Number.isFinite)
    .sort((a, b) => a - b)
  const V0 = sorted[Math.floor(sorted.length * 0.6)] || 1
  const s = new Float32Array(N * N)
  const v = new Float32Array(N * N)
  for (let k = 0; k < N * N; k++) {
    const x = vals[k] / V0
    s[k] = Math.max(-1, Math.min(1, Math.asinh(x * 2) / Math.asinh(8)))
    v[k] = Math.max(-60000, Math.min(60000, x))
  }
  return { tipo: 'plano', N, s, v }
}

/* ───────────────────────── textura vetorial (limalha) ───────────────────────── */

function texture(r: Resolved, job: Extract<FieldJob, { tipo: 'textura' }>): TextureResult {
  const w = visWorld(r, job.fontes)
  const F = job.campo === 'E' ? (p: V3) => fieldE(w, p) : (p: V3) => fieldB(w, p)
  const N = job.N
  // eixos do plano na mesma convenção de planePoint: (a, b) -> mundo
  const ua: V3 = job.normal === 'z' ? [1, 0, 0] : job.normal === 'y' ? [1, 0, 0] : [0, 0, -1]
  const ub: V3 = job.normal === 'z' ? [0, 1, 0] : job.normal === 'y' ? [0, 0, -1] : [0, 1, 0]
  const vec = new Float32Array(N * N * 3)
  const mags = new Float32Array(N * N)
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const a = -job.half + ((i + 0.5) / N) * 2 * job.half
      const b = -job.half + ((j + 0.5) / N) * 2 * job.half
      const f = F(planePoint(job.normal, job.at, a, b))
      const fa = f[0] * ua[0] + f[1] * ua[1] + f[2] * ua[2]
      const fb = f[0] * ub[0] + f[1] * ub[1] + f[2] * ub[2]
      const m = Math.hypot(fa, fb)
      const k = j * N + i
      vec[3 * k] = m > 0 ? fa / m : 0
      vec[3 * k + 1] = m > 0 ? fb / m : 0
      mags[k] = Number.isFinite(m) ? m : 0
    }
  const logs = Array.from(mags)
    .filter((m) => m > 0)
    .map(Math.log10)
    .sort((a, b) => a - b)
  const lo = logs[Math.floor(logs.length * 0.05)] ?? 0
  const hi = logs[Math.floor(logs.length * 0.98)] ?? 1
  for (let k = 0; k < N * N; k++)
    vec[3 * k + 2] = mags[k] > 0 && hi > lo ? Math.min(1, Math.max(0, (Math.log10(mags[k]) - lo) / (hi - lo))) : 0
  return { tipo: 'textura', N, vec }
}

/* ───────────────────────── equipotenciais ───────────────────────── */

function iso(r: Resolved, job: Extract<FieldJob, { tipo: 'iso' }>): IsoResult {
  const w = visWorld(r, job.fontes)
  const g = sampleGrid(job.N, job.half * 0.95, (x, y, z) => potentialV(w, [x, y, z]))
  const abs = Array.from(g.values, Math.abs)
    .filter(Number.isFinite)
    .sort((a, b) => a - b)
  const V0 = abs[Math.floor(abs.length * 0.5)] || 1
  const meshes: IsoResult['meshes'] = []
  for (const k of [-4, -2, -1, 1, 2, 4]) {
    const pos = isosurface(g, k * V0)
    if (!pos.length) continue
    const nrm = new Float32Array(pos.length)
    for (let i = 0; i < pos.length; i += 3) {
      const e = fieldE(w, [pos[i], pos[i + 1], pos[i + 2]])
      const l = Math.hypot(e[0], e[1], e[2]) || 1
      nrm[i] = -e[0] / l
      nrm[i + 1] = -e[1] / l
      nrm[i + 2] = -e[2] / l
    }
    meshes.push({ pos, nrm, sign: Math.sign(k), mag: Math.abs(k) })
  }
  return { tipo: 'iso', meshes }
}

export function runJob(r: Resolved, job: FieldJob): FieldResult {
  switch (job.tipo) {
    case 'setas':
      return arrows(r, job)
    case 'linhas':
      return lines(r, job)
    case 'plano':
      return slice(r, job)
    case 'iso':
      return iso(r, job)
    case 'textura':
      return texture(r, job)
  }
}

/** Buffers a transferir de volta ao thread principal (sem cópia). */
export function transferables(res: FieldResult): ArrayBuffer[] {
  switch (res.tipo) {
    case 'setas':
      return [res.pos.buffer, res.dir.buffer, res.t.buffer, res.glifo.buffer] as ArrayBuffer[]
    case 'linhas':
      return [res.segs.buffer, res.dist.buffer, res.heads.buffer] as ArrayBuffer[]
    case 'plano':
      return [res.s.buffer, res.v.buffer] as ArrayBuffer[]
    case 'iso':
      return res.meshes.flatMap((m) => [m.pos.buffer, m.nrm.buffer]) as ArrayBuffer[]
    case 'textura':
      return [res.vec.buffer] as ArrayBuffer[]
  }
}
