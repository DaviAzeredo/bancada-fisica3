import { EPS0, K, MU0 } from './constants'
import { Acc, type V3, cross, dot, len, madd, norm, sub } from './vec'

/**
 * Fontes já resolvidas em SI. O cenário (JSON) é compilado para estas listas;
 * daqui para baixo não existe expressão, parâmetro nem render — só física.
 *
 * Todas as distribuições extensas usam fórmula fechada (segmento, placa
 * retangular, esfera, cilindro), não somas de pontos: assim o campo dentro de
 * um capacitor é uniforme de verdade e os testes comparam com a teoria do curso.
 */
export type ESource =
  | { k: 'point'; q: number; p: V3 }
  | { k: 'seg'; lambda: number; a: V3; b: V3 }
  | { k: 'rect'; sigma: number; c: V3; u: V3; v: V3; hw: number; hh: number }
  | { k: 'sphere'; Q: number; c: V3; R: number }
  | { k: 'shell'; Q: number; c: V3; R: number }
  | { k: 'iline'; lambda: number; p: V3; d: V3 }
  | { k: 'icyl'; lambda: number; p: V3; d: V3; R: number; shell: boolean }
  | { k: 'iplane'; sigma: number; p: V3; n: V3; mask?: { u: V3; v: V3; hw: number; hh: number; circular?: boolean } }
  | { k: 'uniformE'; E: V3 }
  /** Campo dado por expressão; `v`, se houver, é o potencial correspondente (E = −∇V). */
  | { k: 'fnE'; f: (p: V3) => V3; v?: (p: V3) => number }
  /** Densidade só radial, ρ(r), entre Rin e R: esfera (r ao centro) ou cilindro infinito (r ao eixo). */
  | RadialSource

export interface RadialSource {
  k: 'radial'
  geo: 'esf' | 'cil'
  c: V3
  /** Eixo do cilindro. */
  d: V3
  Rin: number
  R: number
  /** Carga total (C) na esfera; carga por comprimento (C/m) no cilindro. */
  Q: number
  /** Carga envolvida e potencial nos nós r_i = Rin + (R − Rin)·i/N. */
  qc: Float64Array
  vt: Float64Array
}

export type BSource =
  | { k: 'seg'; I: number; a: V3; b: V3 }
  /** Espira circular exata (integrais elípticas). Corrente anti-horária em torno de n. */
  | { k: 'ring'; I: number; c: V3; n: V3; R: number }
  | { k: 'iwire'; I: number; p: V3; d: V3; R?: number }
  /** Cilindro infinito com corrente axial e densidade só radial, J(r), entre Rin e R. */
  | RadialCurrent
  | { k: 'uniformB'; B: V3; min?: V3; max?: V3 }
  | { k: 'fnB'; f: (p: V3) => V3 }

export interface RadialCurrent {
  k: 'radialJ'
  c: V3
  d: V3
  Rin: number
  R: number
  I: number
  /** Corrente envolvida nos nós r_i = Rin + (R − Rin)·i/N. */
  ic: Float64Array
}

export interface World {
  e: ESource[]
  b: BSource[]
}

const TINY = 1e-12

/* ───────────────────────── segmento de carga ───────────────────────── */

function segE(acc: Acc, P: V3, A: V3, B: V3, lambda: number) {
  const t = sub(B, A)
  const L = len(t)
  if (L < TINY) return
  const th: V3 = [t[0] / L, t[1] / L, t[2] / L]
  const d = sub(P, A)
  const s = dot(d, th)
  const rv = madd(d, th, -s)
  const rho = Math.max(len(rv), 1e-9)
  const xa = -s
  const xb = L - s
  const ra = Math.hypot(rho, xa)
  const rb = Math.hypot(rho, xb)
  const perp = (K * lambda * (xb / rb - xa / ra)) / (rho * rho) // multiplica rv (não unitário)
  const par = K * lambda * (1 / rb - 1 / ra)
  acc.addS(rv, perp)
  acc.addS(th, par)
}

function segV(P: V3, A: V3, B: V3, lambda: number) {
  const t = sub(B, A)
  const L = len(t)
  if (L < TINY) return 0
  const th: V3 = [t[0] / L, t[1] / L, t[2] / L]
  const d = sub(P, A)
  const s = dot(d, th)
  const rho = Math.max(len(madd(d, th, -s)), 1e-9)
  return K * lambda * (Math.asinh((L - s) / rho) - Math.asinh(-s / rho))
}

/* ───────────────────────── placa retangular ───────────────────────── */

/** ln(a + sqrt(a² + b²)) sem cancelamento catastrófico quando a < 0. */
function lnPlus(a: number, r: number, rest2: number) {
  if (a >= 0) return Math.log(a + r)
  return Math.log(Math.max(rest2, 1e-30) / (r - a))
}

function rectLocal(P: V3, s: Extract<ESource, { k: 'rect' }>) {
  const n = cross(s.u, s.v)
  const d = sub(P, s.c)
  let Z = dot(d, n)
  if (Math.abs(Z) < 1e-12) Z = Z < 0 ? -1e-12 : 1e-12
  return { X: dot(d, s.u), Y: dot(d, s.v), Z, n }
}

function rectE(acc: Acc, P: V3, s: Extract<ESource, { k: 'rect' }>) {
  const { X, Y, Z, n } = rectLocal(P, s)
  let ex = 0
  let ey = 0
  let ez = 0
  const us = [-s.hw - X, s.hw - X]
  const vs = [-s.hh - Y, s.hh - Y]
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 2; j++) {
      const sg = i === j ? 1 : -1
      const u = us[i]
      const v = vs[j]
      const r = Math.sqrt(u * u + v * v + Z * Z)
      ex += sg * lnPlus(v, r, u * u + Z * Z)
      ey += sg * lnPlus(u, r, v * v + Z * Z)
      ez += sg * Math.atan((u * v) / (Z * r))
    }
  const f = K * s.sigma
  acc.addS(s.u, f * ex)
  acc.addS(s.v, f * ey)
  acc.addS(n, f * ez)
}

function rectV(P: V3, s: Extract<ESource, { k: 'rect' }>) {
  const { X, Y, Z } = rectLocal(P, s)
  const az = Math.abs(Z)
  let acc = 0
  const us = [-s.hw - X, s.hw - X]
  const vs = [-s.hh - Y, s.hh - Y]
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 2; j++) {
      const sg = i === j ? 1 : -1
      const u = us[i]
      const v = vs[j]
      const r = Math.sqrt(u * u + v * v + Z * Z)
      acc +=
        sg *
        (u * lnPlus(v, r, u * u + Z * Z) + v * lnPlus(u, r, v * v + Z * Z) - az * Math.atan((u * v) / (az * r)))
    }
  return K * s.sigma * acc
}

/* ───────────────────────── densidade radial ρ(r) ───────────────────────── */

/**
 * Tabela da carga envolvida (Simpson em cada intervalo) e do potencial
 * (trapézio de E de fora para dentro). Com N = 512 o erro relativo fica
 * abaixo de 1e-5 para densidades suaves; fora de [Rin, R] tudo é exato.
 */
export function radialSource(geo: 'esf' | 'cil', c: V3, d: V3, Rin: number, R: number, rho: (r: number) => number, N = 512): RadialSource {
  const w = (r: number) => (geo === 'esf' ? 4 * Math.PI * r * r : 2 * Math.PI * r)
  const f = (r: number) => rho(r) * w(r)
  const h = (R - Rin) / N
  const qc = new Float64Array(N + 1)
  for (let i = 0; i < N; i++) {
    const a = Rin + i * h
    qc[i + 1] = qc[i] + (h / 6) * (f(a) + 4 * f(a + h / 2) + f(a + h))
  }
  const Q = qc[N]
  const Er = (i: number) => {
    const r = Math.max(Rin + i * h, 1e-12)
    return geo === 'esf' ? (K * qc[i]) / (r * r) : qc[i] / (2 * Math.PI * EPS0 * r)
  }
  const vt = new Float64Array(N + 1)
  vt[N] = geo === 'esf' ? (K * Q) / R : (-Q / (2 * Math.PI * EPS0)) * Math.log(R)
  for (let i = N - 1; i >= 0; i--) vt[i] = vt[i + 1] + (h / 2) * (Er(i) + Er(i + 1))
  return { k: 'radial', geo, c, d: norm(d), Rin, R, Q, qc, vt }
}

/** Corrente envolvida por Simpson, como em radialSource. */
export function radialCurrent(c: V3, d: V3, Rin: number, R: number, J: (r: number) => number, N = 512): RadialCurrent {
  const f = (r: number) => J(r) * 2 * Math.PI * r
  const h = (R - Rin) / N
  const ic = new Float64Array(N + 1)
  for (let i = 0; i < N; i++) {
    const a = Rin + i * h
    ic[i + 1] = ic[i] + (h / 6) * (f(a) + 4 * f(a + h / 2) + f(a + h))
  }
  return { k: 'radialJ', c, d: norm(d), Rin, R, I: ic[N], ic }
}

export function radialAt(s: { Rin: number; R: number }, r: number, tab: Float64Array) {
  const N = tab.length - 1
  const x = ((r - s.Rin) / (s.R - s.Rin)) * N
  if (!(x > 0)) return tab[0]
  if (x >= N) return tab[N]
  const i = Math.floor(x)
  return tab[i] + (tab[i + 1] - tab[i]) * (x - i)
}

function radialE(acc: Acc, P: V3, s: RadialSource) {
  if (s.geo === 'esf') {
    const d = sub(P, s.c)
    const r = Math.max(len(d), 1e-12)
    if (r <= s.Rin) return
    const q = r >= s.R ? s.Q : radialAt(s, r, s.qc)
    acc.addS(d, (K * q) / (r * r * r))
  } else {
    const { rv, rho } = axial(P, s.c, s.d)
    const r = Math.max(rho, 1e-12)
    if (r <= s.Rin) return
    const q = r >= s.R ? s.Q : radialAt(s, r, s.qc)
    acc.addS(rv, q / (2 * Math.PI * EPS0 * r * r))
  }
}

function radialV(P: V3, s: RadialSource) {
  const r = s.geo === 'esf' ? len(sub(P, s.c)) : axial(P, s.c, s.d).rho
  if (r >= s.R) return s.geo === 'esf' ? (K * s.Q) / r : (-s.Q / (2 * Math.PI * EPS0)) * Math.log(Math.max(r, 1e-9))
  return radialAt(s, r, s.vt)
}

/* ───────────────────────── campo e potencial ───────────────────────── */

function axial(P: V3, p: V3, d: V3) {
  const dn = norm(d)
  const w = sub(P, p)
  const rv = madd(w, dn, -dot(w, dn))
  return { rv, rho: len(rv) }
}

export function fieldE(world: World, P: V3): V3 {
  const acc = new Acc()
  for (const s of world.e) {
    switch (s.k) {
      case 'point': {
        const d = sub(P, s.p)
        const r2 = Math.max(dot(d, d), 1e-18)
        acc.addS(d, (K * s.q) / (r2 * Math.sqrt(r2)))
        break
      }
      case 'seg':
        segE(acc, P, s.a, s.b, s.lambda)
        break
      case 'rect':
        rectE(acc, P, s)
        break
      case 'sphere':
      case 'shell': {
        const d = sub(P, s.c)
        const r = Math.max(len(d), 1e-12)
        if (r >= s.R) acc.addS(d, (K * s.Q) / (r * r * r))
        else if (s.k === 'sphere') acc.addS(d, (K * s.Q) / (s.R * s.R * s.R))
        break
      }
      case 'iline': {
        const { rv, rho } = axial(P, s.p, s.d)
        const r = Math.max(rho, 1e-12)
        acc.addS(rv, s.lambda / (2 * Math.PI * EPS0 * r * r))
        break
      }
      case 'icyl': {
        const { rv, rho } = axial(P, s.p, s.d)
        const r = Math.max(rho, 1e-12)
        if (r >= s.R) acc.addS(rv, s.lambda / (2 * Math.PI * EPS0 * r * r))
        else if (!s.shell) acc.addS(rv, s.lambda / (2 * Math.PI * EPS0 * s.R * s.R))
        break
      }
      case 'iplane': {
        const n = norm(s.n)
        if (s.mask) {
          const w = sub(P, s.p)
          const a = dot(w, s.mask.u)
          const b = dot(w, s.mask.v)
          if (s.mask.circular ? Math.hypot(a, b) > s.mask.hw : Math.abs(a) > s.mask.hw || Math.abs(b) > s.mask.hh) break
        }
        const side = Math.sign(dot(sub(P, s.p), n)) || 1
        acc.addS(n, (side * s.sigma) / (2 * EPS0))
        break
      }
      case 'uniformE':
        acc.addS(s.E, 1)
        break
      case 'fnE':
        acc.addS(s.f(P), 1)
        break
      case 'radial':
        radialE(acc, P, s)
        break
    }
  }
  return acc.v
}

/**
 * Potencial com referência no infinito para fontes finitas. Fontes infinitas
 * (linha, cilindro, plano, campo uniforme) não admitem essa referência; para
 * elas V = 0 a 1 m do eixo, no próprio plano e na origem, respectivamente —
 * só diferenças de potencial têm sentido físico nesses casos.
 */
export function potentialV(world: World, P: V3): number {
  let V = 0
  for (const s of world.e) {
    switch (s.k) {
      case 'point':
        V += (K * s.q) / Math.max(len(sub(P, s.p)), 1e-9)
        break
      case 'seg':
        V += segV(P, s.a, s.b, s.lambda)
        break
      case 'rect':
        V += rectV(P, s)
        break
      case 'sphere': {
        const r = len(sub(P, s.c))
        V += r >= s.R ? (K * s.Q) / r : (K * s.Q * (3 * s.R * s.R - r * r)) / (2 * s.R ** 3)
        break
      }
      case 'shell': {
        const r = len(sub(P, s.c))
        V += (K * s.Q) / Math.max(r, s.R)
        break
      }
      case 'iline': {
        const { rho } = axial(P, s.p, s.d)
        V += (-s.lambda / (2 * Math.PI * EPS0)) * Math.log(Math.max(rho, 1e-9))
        break
      }
      case 'icyl': {
        const { rho } = axial(P, s.p, s.d)
        const c = s.lambda / (2 * Math.PI * EPS0)
        if (rho >= s.R) V += -c * Math.log(rho)
        else V += -c * Math.log(s.R) - (s.shell ? 0 : (c * (rho * rho - s.R * s.R)) / (2 * s.R * s.R))
        break
      }
      case 'iplane':
        V += (-s.sigma / (2 * EPS0)) * Math.abs(dot(sub(P, s.p), norm(s.n)))
        break
      case 'uniformE':
        V += -dot(s.E, P)
        break
      case 'fnE':
        if (s.v) V += s.v(P)
        break
      case 'radial':
        V += radialV(P, s)
        break
    }
  }
  return V
}

/* ───────────────────────── campo magnético ───────────────────────── */

/** Raio de amolecimento: evita a singularidade sobre o fio sem mudar o campo fora dele. */
const WIRE_SOFT = 1e-4

export function fieldB(world: World, P: V3): V3 {
  const acc = new Acc()
  for (const s of world.b) {
    switch (s.k) {
      case 'seg': {
        // Laço quente (bobinas têm ~1000 segmentos): só escalares, sem alocar.
        const a = s.a
        let tx = s.b[0] - a[0]
        let ty = s.b[1] - a[1]
        let tz = s.b[2] - a[2]
        const L = Math.sqrt(tx * tx + ty * ty + tz * tz)
        if (L < TINY) break
        tx /= L
        ty /= L
        tz /= L
        const dx = P[0] - a[0]
        const dy = P[1] - a[1]
        const dz = P[2] - a[2]
        const sp = dx * tx + dy * ty + dz * tz
        const rx = dx - tx * sp
        const ry = dy - ty * sp
        const rz = dz - tz * sp
        const rho2 = rx * rx + ry * ry + rz * rz + WIRE_SOFT * WIRE_SOFT
        const xa = -sp
        const xb = L - sp
        const g = xb / Math.sqrt(rho2 + xb * xb) - xa / Math.sqrt(rho2 + xa * xa)
        const f = ((MU0 * s.I) / (4 * Math.PI * rho2)) * g
        acc.x += (ty * rz - tz * ry) * f
        acc.y += (tz * rx - tx * rz) * f
        acc.z += (tx * ry - ty * rx) * f
        break
      }
      case 'iwire': {
        const dn = norm(s.d)
        const { rv, rho } = axial(P, s.p, s.d)
        const R = s.R ?? 0
        // Dentro de um fio de raio R com corrente uniforme: B ∝ ρ (Ampère).
        const denom = rho < R ? R * R : Math.max(rho * rho, 1e-18)
        acc.addS(cross(dn, rv), (MU0 * s.I) / (2 * Math.PI * denom))
        break
      }
      case 'radialJ': {
        const { rv, rho } = axial(P, s.c, s.d)
        const r = Math.max(rho, 1e-12)
        if (r <= s.Rin) break
        const i = r >= s.R ? s.I : radialAt(s, r, s.ic)
        acc.addS(cross(s.d, rv), (MU0 * i) / (2 * Math.PI * r * r))
        break
      }
      case 'uniformB': {
        if (s.min && s.max) {
          if (P[0] < s.min[0] || P[1] < s.min[1] || P[2] < s.min[2]) break
          if (P[0] > s.max[0] || P[1] > s.max[1] || P[2] > s.max[2]) break
        }
        acc.addS(s.B, 1)
        break
      }
      case 'fnB':
        acc.addS(s.f(P), 1)
        break
      case 'ring':
        ringB(acc, P, s)
        break
    }
  }
  return acc.v
}

/* ───────────────────────── espira circular exata ───────────────────────── */

/**
 * Integrais elípticas completas K(m) e E(m) pela média aritmético-geométrica:
 * converge quadraticamente (5 a 6 iterações em precisão dupla).
 */
export function ellipticKE(m: number): [number, number] {
  let a = 1
  let b = Math.sqrt(Math.max(0, 1 - m))
  let c = Math.sqrt(Math.max(0, m))
  let sum = 0.5 * c * c
  let pow = 0.5
  for (let i = 0; i < 40 && Math.abs(c) > 1e-16; i++) {
    const an = (a + b) / 2
    c = (a - b) / 2
    b = Math.sqrt(a * b)
    a = an
    pow *= 2
    sum += pow * c * c
  }
  const K = Math.PI / (2 * a)
  return [K, K * (1 - sum)]
}

/**
 * Campo de uma espira circular de raio R (Simpson et al., forma fechada):
 *   α² = R² + r² − 2Rρ, β² = R² + r² + 2Rρ, m = 1 − α²/β²
 *   B_z = μ₀I/(2πα²β) [(R² − r²)E + α²K]
 *   B_ρ = μ₀I z/(2πα²βρ) [(R² + r²)E − α²K]
 * Substitui 32 segmentos de Biot-Savart por uma avaliação, sem erro de polígono.
 */
function ringB(acc: Acc, P: V3, s: Extract<BSource, { k: 'ring' }>) {
  const n = s.n
  const dx = P[0] - s.c[0]
  const dy = P[1] - s.c[1]
  const dz = P[2] - s.c[2]
  const z = dx * n[0] + dy * n[1] + dz * n[2]
  const rx = dx - n[0] * z
  const ry = dy - n[1] * z
  const rz = dz - n[2] * z
  const rho = Math.sqrt(rx * rx + ry * ry + rz * rz)
  const R = s.R
  const r2 = rho * rho + z * z
  // α é a distância ao ponto mais próximo do fio: o piso só age a menos de
  // WIRE_SOFT dele, onde o campo de um fio ideal diverge.
  const alpha2 = Math.max(R * R + r2 - 2 * R * rho, WIRE_SOFT * WIRE_SOFT)
  const beta2 = R * R + r2 + 2 * R * rho
  const beta = Math.sqrt(beta2)
  const [K, E] = ellipticKE(1 - alpha2 / beta2)
  const f = (MU0 * s.I) / (2 * Math.PI * alpha2 * beta)
  const Bz = f * ((R * R - r2) * E + alpha2 * K)
  acc.x += n[0] * Bz
  acc.y += n[1] * Bz
  acc.z += n[2] * Bz
  if (rho > 1e-12 * R) {
    const Brho = (f * z * ((R * R + r2) * E - alpha2 * K)) / rho
    acc.x += (rx / rho) * Brho
    acc.y += (ry / rho) * Brho
    acc.z += (rz / rho) * Brho
  }
}

/** Força total I∫dl×B sobre um segmento reto de corrente, no campo B dado. */
export function forceOnSegment(B: (p: V3) => V3, a: V3, b: V3, I: number, n = 400): V3 {
  const acc = new Acc()
  const dl: V3 = [(b[0] - a[0]) / n, (b[1] - a[1]) / n, (b[2] - a[2]) / n]
  for (let i = 0; i < n; i++) acc.addS(cross(dl, B(madd(a, dl, i + 0.5))), I)
  return acc.v
}

/* ───────────────── amostragem de carga (para Q_enc) ───────────────── */

export interface ChargeSample {
  p: V3
  dq: number
}

/**
 * Discretiza cada fonte em elementos de carga, só para contar a carga
 * envolvida por uma superfície gaussiana. Fontes infinitas são amostradas
 * dentro de uma caixa que contém a superfície (o resto não está envolvido).
 */
export function chargeSamples(s: ESource, center: V3, halfSize: number, n = 4000): ChargeSample[] {
  const out: ChargeSample[] = []
  switch (s.k) {
    case 'point':
      out.push({ p: s.p, dq: s.q })
      break
    case 'seg': {
      const L = len(sub(s.b, s.a))
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n
        out.push({ p: madd(s.a, sub(s.b, s.a), t), dq: (s.lambda * L) / n })
      }
      break
    }
    case 'rect': {
      const m = Math.ceil(Math.sqrt(n * 8))
      const dA = (4 * s.hw * s.hh) / (m * m)
      for (let i = 0; i < m; i++)
        for (let j = 0; j < m; j++) {
          const x = -s.hw + ((i + 0.5) / m) * 2 * s.hw
          const y = -s.hh + ((j + 0.5) / m) * 2 * s.hh
          out.push({ p: madd(madd(s.c, s.u, x), s.v, y), dq: s.sigma * dA })
        }
      break
    }
    case 'sphere':
    case 'shell': {
      const m = Math.round(Math.cbrt(n * 2))
      if (s.k === 'shell') {
        const N = n
        const ga = Math.PI * (3 - Math.sqrt(5))
        for (let i = 0; i < N; i++) {
          const z = 1 - (2 * (i + 0.5)) / N
          const r = Math.sqrt(1 - z * z)
          out.push({ p: madd(s.c, [r * Math.cos(ga * i), r * Math.sin(ga * i), z], s.R), dq: s.Q / N })
        }
      } else {
        const pts: V3[] = []
        for (let i = 0; i < m; i++)
          for (let j = 0; j < m; j++)
            for (let k = 0; k < m; k++) {
              const q: V3 = [((i + 0.5) / m) * 2 - 1, ((j + 0.5) / m) * 2 - 1, ((k + 0.5) / m) * 2 - 1]
              if (dot(q, q) <= 1) pts.push(madd(s.c, q, s.R))
            }
        for (const p of pts) out.push({ p, dq: s.Q / pts.length })
      }
      break
    }
    case 'iline':
    case 'icyl': {
      const dn = norm(s.d)
      const t0 = dot(sub(center, s.p), dn)
      const span = halfSize * 2
      for (let i = 0; i < n; i++) {
        const t = t0 - span + ((i + 0.5) / n) * 2 * span
        out.push({ p: madd(s.p, dn, t), dq: (s.lambda * 2 * span) / n })
      }
      break
    }
    case 'iplane': {
      const nn = norm(s.n)
      const foot = madd(center, nn, -dot(sub(center, s.p), nn))
      const [u, v] = basisOf(nn)
      // grade fina só sobre a caixa que contém a superfície: o erro de contar
      // área por pontos é ~ espaçamento/tamanho, então a grade tem de ser densa
      const m = 720
      const span = halfSize * 1.02
      const dA = (2 * span) ** 2 / (m * m)
      for (let i = 0; i < m; i++)
        for (let j = 0; j < m; j++) {
          const x = -span + ((i + 0.5) / m) * 2 * span
          const y = -span + ((j + 0.5) / m) * 2 * span
          out.push({ p: madd(madd(foot, u, x), v, y), dq: s.sigma * dA })
        }
      break
    }
    case 'radial': {
      // cascas finas no meio de cada intervalo radial, pontos de Fibonacci em cada uma
      const nr = s.geo === 'esf' ? 200 : 50
      const ga = Math.PI * (3 - Math.sqrt(5))
      const dn = s.d
      const [u, v] = basisOf(dn)
      const span = halfSize * 2
      const t0 = dot(sub(center, s.c), dn)
      const nz = 80
      const na = s.geo === 'esf' ? Math.max(1, Math.floor(n / nr)) : Math.max(1, Math.floor(n / (nr * nz)))
      for (let i = 0; i < nr; i++) {
        const r0 = s.Rin + ((s.R - s.Rin) * i) / nr
        const r1 = s.Rin + ((s.R - s.Rin) * (i + 1)) / nr
        const dq = radialAt(s, r1, s.qc) - radialAt(s, r0, s.qc)
        if (dq === 0) continue
        const rm = (r0 + r1) / 2
        if (s.geo === 'esf') {
          for (let j = 0; j < na; j++) {
            const z = 1 - (2 * (j + 0.5)) / na
            const rr = Math.sqrt(1 - z * z)
            const a = ga * (j + i * 7)
            out.push({ p: madd(s.c, [rr * Math.cos(a), rr * Math.sin(a), z], rm), dq: dq / na })
          }
        } else {
          for (let k = 0; k < nz; k++) {
            const t = t0 - span + ((k + 0.5) / nz) * 2 * span
            const foot = madd(s.c, dn, t)
            for (let j = 0; j < na; j++) {
              const a = ga * (j + i * 7 + k * 3)
              out.push({ p: madd(madd(foot, u, rm * Math.cos(a)), v, rm * Math.sin(a)), dq: (dq * 2 * span) / (nz * na) })
            }
          }
        }
      }
      break
    }
    case 'uniformE':
    case 'fnE':
      break
  }
  return out
}

function basisOf(n: V3): [V3, V3] {
  const helper: V3 = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]
  const u = norm(cross(helper, n))
  return [u, cross(n, u)]
}
