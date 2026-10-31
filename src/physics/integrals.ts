import { MU0 } from './constants'
import { type BSource, type ESource, type World, chargeSamples, fieldB, fieldE, radialAt } from './sources'
import { type V3, basis, cross, dot, len, madd, norm, scale, sub } from './vec'

/* ───────────────────────── quadratura ───────────────────────── */

const glCache = new Map<number, { x: number[]; w: number[] }>()

/** Nós e pesos de Gauss-Legendre em [-1, 1] (Newton sobre P_n). */
export function gaussLegendre(n: number) {
  const hit = glCache.get(n)
  if (hit) return hit
  const x: number[] = Array.from({ length: n }, () => 0)
  const w: number[] = Array.from({ length: n }, () => 0)
  for (let i = 0; i < Math.ceil(n / 2); i++) {
    let z = Math.cos((Math.PI * (i + 0.75)) / (n + 0.5))
    let dp = 0
    for (let it = 0; it < 100; it++) {
      let p0 = 1
      let p1 = z
      for (let k = 2; k <= n; k++) {
        const p2 = ((2 * k - 1) * z * p1 - (k - 1) * p0) / k
        p0 = p1
        p1 = p2
      }
      dp = (n * (z * p1 - p0)) / (z * z - 1)
      const dz = p1 / dp
      z -= dz
      if (Math.abs(dz) < 1e-15) break
    }
    x[i] = -z
    x[n - 1 - i] = z
    w[i] = w[n - 1 - i] = 2 / ((1 - z * z) * dp * dp)
  }
  const out = { x, w }
  glCache.set(n, out)
  return out
}

/* ───────────────────────── superfícies gaussianas ───────────────────────── */

export type GaussShape =
  | { forma: 'esfera'; c: V3; R: number }
  | { forma: 'cubo'; c: V3; a: number }
  | { forma: 'cilindro'; c: V3; eixo: V3; R: number; H: number }

type Field = (p: V3) => V3

/** Percorre a superfície chamando `soma` com cada F·n̂ dA da quadratura. */
function somaFluxo(shape: GaussShape, F: Field, n: number, soma: (dPhi: number) => void) {
  const { x, w } = gaussLegendre(n)
  if (shape.forma === 'esfera') {
    const nphi = 2 * n
    for (let i = 0; i < n; i++) {
      const ct = x[i]
      const st = Math.sqrt(1 - ct * ct)
      for (let j = 0; j < nphi; j++) {
        const ph = ((j + 0.5) / nphi) * 2 * Math.PI
        const nh: V3 = [st * Math.cos(ph), st * Math.sin(ph), ct]
        const E = F(madd(shape.c, nh, shape.R))
        soma(dot(E, nh) * w[i] * ((2 * Math.PI) / nphi) * shape.R * shape.R)
      }
    }
    return
  }
  if (shape.forma === 'cubo') {
    const h = shape.a / 2
    for (let axis = 0; axis < 3; axis++)
      for (const sgn of [-1, 1]) {
        const a1 = (axis + 1) % 3
        const a2 = (axis + 2) % 3
        for (let i = 0; i < n; i++)
          for (let j = 0; j < n; j++) {
            const p = [shape.c[0], shape.c[1], shape.c[2]]
            p[axis] += sgn * h
            p[a1] += x[i] * h
            p[a2] += x[j] * h
            const E = F(p as unknown as V3)
            soma(sgn * E[axis] * w[i] * w[j] * h * h)
          }
      }
    return
  }
  const ax = norm(shape.eixo)
  const [u, v] = basis(ax)
  const nphi = 2 * n
  const dph = (2 * Math.PI) / nphi
  for (let j = 0; j < nphi; j++) {
    const ph = (j + 0.5) * dph
    const radial = madd([0, 0, 0], u, Math.cos(ph))
    const rh = madd(radial, v, Math.sin(ph))
    // lateral
    for (let i = 0; i < n; i++) {
      const z = (x[i] * shape.H) / 2
      const p = madd(madd(shape.c, ax, z), rh, shape.R)
      soma(dot(F(p), rh) * w[i] * (shape.H / 2) * shape.R * dph)
    }
    // tampas
    for (let i = 0; i < n; i++) {
      const r = ((x[i] + 1) / 2) * shape.R
      const dr = (w[i] * shape.R) / 2
      for (const sgn of [-1, 1]) {
        const p = madd(madd(shape.c, ax, (sgn * shape.H) / 2), rh, r)
        soma(sgn * dot(F(p), ax) * r * dr * dph)
      }
    }
  }
}

/** Fluxo por quadratura: Σ F·n̂ dA. Nunca usa Q_enc — é a medida "experimental". */
export function fluxThrough(shape: GaussShape, F: Field, n = 48): number {
  let phi = 0
  somaFluxo(shape, F, n, (d) => {
    phi += d
  })
  return phi
}

/**
 * O mesmo fluxo, separado no que sai e no que entra. O total pode ficar parado
 * quando a superfície se move (divergência uniforme, carga de fora); estes, não.
 */
export function fluxParts(shape: GaussShape, F: Field, n = 48) {
  let sai = 0
  let entra = 0
  somaFluxo(shape, F, n, (d) => {
    if (d > 0) sai += d
    else entra -= d
  })
  return { sai, entra }
}

export function insideShape(shape: GaussShape, p: V3): boolean {
  const d = sub(p, shape.c)
  if (shape.forma === 'esfera') return len(d) < shape.R
  if (shape.forma === 'cubo') {
    const h = shape.a / 2
    return Math.abs(d[0]) < h && Math.abs(d[1]) < h && Math.abs(d[2]) < h
  }
  const ax = norm(shape.eixo)
  const t = dot(d, ax)
  return Math.abs(t) < shape.H / 2 && len(madd(d, ax, -t)) < shape.R
}

function shapeHalfSize(shape: GaussShape) {
  if (shape.forma === 'esfera') return shape.R
  if (shape.forma === 'cubo') return (shape.a * Math.sqrt(3)) / 2
  return Math.hypot(shape.R, shape.H / 2)
}

/** Carga envolvida, contada elemento a elemento — a "teoria" do lado direito de Gauss. */
/** Gaussiana concêntrica (ou coaxial) a uma distribuição radial: a tabela dá a carga exata. */
function radialEnclosed(s: Extract<ESource, { k: 'radial' }>, shape: GaussShape): number | null {
  if (s.geo === 'esf' && shape.forma === 'esfera' && len(sub(shape.c, s.c)) < 1e-12) return radialAt(s, shape.R, s.qc)
  if (s.geo === 'cil' && shape.forma === 'cilindro') {
    const coaxial = Math.abs(dot(norm(shape.eixo), s.d)) > 1 - 1e-9 && len(cross(sub(shape.c, s.c), s.d)) < 1e-12
    if (coaxial) return radialAt(s, shape.R, s.qc) * shape.H
  }
  return null
}

/** Cilindro ou casca infinita dentro de uma gaussiana cilíndrica coaxial: carga exata. */
function cylinderEnclosed(s: Extract<ESource, { k: 'icyl' }>, shape: GaussShape): number | null {
  if (shape.forma !== 'cilindro') return null
  const d = norm(s.d)
  const coaxial = Math.abs(dot(norm(shape.eixo), d)) > 1 - 1e-9 && len(cross(sub(shape.c, s.p), d)) < 1e-12
  if (!coaxial) return null
  const fracao = s.shell ? (shape.R >= s.R ? 1 : 0) : Math.min(1, (shape.R / s.R) ** 2)
  return s.lambda * fracao * shape.H
}

/** Plano sem máscara cortando esfera, cilindro coaxial à normal ou cubo alinhado: área exata. */
function planeEnclosed(s: Extract<ESource, { k: 'iplane' }>, shape: GaussShape): number | null {
  if (s.mask) return null
  const n = norm(s.n)
  const h = Math.abs(dot(sub(shape.c, s.p), n))
  if (shape.forma === 'esfera') return h < shape.R ? s.sigma * Math.PI * (shape.R ** 2 - h ** 2) : 0
  if (shape.forma === 'cilindro') {
    if (Math.abs(dot(norm(shape.eixo), n)) < 1 - 1e-9) return null
    return h < shape.H / 2 ? s.sigma * Math.PI * shape.R ** 2 : 0
  }
  if (Math.max(Math.abs(n[0]), Math.abs(n[1]), Math.abs(n[2])) < 1 - 1e-9) return null
  return h < shape.a / 2 ? s.sigma * shape.a ** 2 : 0
}

export function enclosedCharge(sources: ESource[], shape: GaussShape): number {
  const hs = shapeHalfSize(shape)
  let q = 0
  for (const s of sources) {
    // as três formas são convexas: segmento com as duas pontas dentro está todo dentro
    const noInterior = s.k === 'seg' && insideShape(shape, s.a) && insideShape(shape, s.b)
    const exata = noInterior
      ? s.lambda * len(sub(s.b, s.a))
      : s.k === 'radial'
        ? radialEnclosed(s, shape)
        : s.k === 'iplane'
          ? planeEnclosed(s, shape)
          : s.k === 'icyl'
            ? cylinderEnclosed(s, shape)
            : null
    if (exata !== null) {
      q += exata
      continue
    }
    for (const el of chargeSamples(s, shape.c, hs, 20000)) if (insideShape(shape, el.p)) q += el.dq
  }
  return q
}

/* ───────────────────────── circulação (Ampère) ───────────────────────── */

export interface Circle {
  c: V3
  n: V3
  R: number
}

export function circlePoints(circle: Circle, N: number): V3[] {
  const [u, v] = basis(circle.n)
  const pts: V3[] = []
  for (let i = 0; i < N; i++) {
    const a = (i / N) * 2 * Math.PI
    pts.push(madd(madd(circle.c, u, circle.R * Math.cos(a)), v, circle.R * Math.sin(a)))
  }
  return pts
}

/** ∮F·dl ao longo de um polígono fechado (regra do ponto médio). */
export function circulation(points: V3[], F: Field): number {
  let c = 0
  for (let i = 0; i < points.length; i++) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    const m: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]
    c += dot(F(m), sub(b, a))
  }
  return c
}

/** Corrente que atravessa o disco limitado pelo círculo, com sinal pela regra da mão direita. */
export function enclosedCurrent(sources: BSource[], circle: Circle): number {
  const n = norm(circle.n)
  let I = 0
  const throughDisk = (p: V3) => len(sub(p, circle.c)) < circle.R
  for (const s of sources) {
    if (s.k === 'seg') {
      const da = dot(sub(s.a, circle.c), n)
      const db = dot(sub(s.b, circle.c), n)
      if ((da > 0 && db <= 0) || (da <= 0 && db > 0)) {
        const t = da / (da - db)
        if (throughDisk(madd(s.a, sub(s.b, s.a), t))) I += s.I * Math.sign(db - da)
      }
    } else if (s.k === 'ring') {
      // Pontos onde o círculo da espira fura o plano do caminho: A cosθ + B sinθ = −D.
      const [u, v] = basis(s.n)
      const A = s.R * dot(u, n)
      const B = s.R * dot(v, n)
      const D = dot(sub(s.c, circle.c), n)
      const M = Math.hypot(A, B)
      if (M < 1e-15 || Math.abs(D) >= M) continue
      const phi = Math.atan2(B, A)
      const delta = Math.acos(-D / M)
      for (const th of [phi + delta, phi - delta]) {
        const p = madd(madd(s.c, u, s.R * Math.cos(th)), v, s.R * Math.sin(th))
        const tangent = madd(scale(u, -Math.sin(th)), v, Math.cos(th))
        if (throughDisk(p)) I += s.I * Math.sign(dot(tangent, n))
      }
    } else if (s.k === 'iwire') {
      const dn = norm(s.d)
      const den = dot(dn, n)
      if (Math.abs(den) < 1e-12) continue
      const t = dot(sub(circle.c, s.p), n) / den
      if (throughDisk(madd(s.p, dn, t))) I += s.I * Math.sign(den)
    } else if (s.k === 'radialJ') {
      const sg = dot(s.d, n)
      if (Math.abs(sg) < 1e-12) continue
      // caminho coaxial: a tabela dá a resposta exata
      if (len(cross(sub(circle.c, s.c), s.d)) < 1e-12 && Math.abs(Math.abs(sg) - 1) < 1e-9) {
        I += Math.sign(sg) * radialAt(s, circle.R, s.ic)
        continue
      }
      // fora do eixo ou inclinado: fluxo de J pelo disco, em grade polar
      const [u, v] = basis(n)
      const nr = 96
      const nth = 192
      const h = (s.R - s.Rin) / 512
      for (let i = 0; i < nr; i++) {
        const rr = ((i + 0.5) / nr) * circle.R
        const dA = (circle.R / nr) * rr * ((2 * Math.PI) / nth)
        for (let k = 0; k < nth; k++) {
          const a = ((k + 0.5) / nth) * 2 * Math.PI
          const p = madd(madd(circle.c, u, rr * Math.cos(a)), v, rr * Math.sin(a))
          const w = sub(p, s.c)
          const r = len(madd(w, s.d, -dot(w, s.d)))
          if (r <= s.Rin || r >= s.R) continue
          const J = (radialAt(s, r + h, s.ic) - radialAt(s, r - h, s.ic)) / (2 * h * 2 * Math.PI * r)
          I += J * dA * sg
        }
      }
    }
  }
  return I
}

export const ampereRHS = (Ienc: number) => MU0 * Ienc

/* ───────────────────────── fluxo magnético ───────────────────────── */

export type Patch =
  | { forma: 'disco'; c: V3; n: V3; R: number }
  | { forma: 'retangulo'; c: V3; u: V3; v: V3; hw: number; hh: number }

export function fluxPatch(patch: Patch, F: Field, n = 24): number {
  const { x, w } = gaussLegendre(n)
  let phi = 0
  if (patch.forma === 'disco') {
    const nn = norm(patch.n)
    const [u, v] = basis(nn)
    const nphi = 2 * n
    const dph = (2 * Math.PI) / nphi
    for (let i = 0; i < n; i++) {
      const r = ((x[i] + 1) / 2) * patch.R
      const dr = (w[i] * patch.R) / 2
      for (let j = 0; j < nphi; j++) {
        const a = (j + 0.5) * dph
        const p = madd(madd(patch.c, u, r * Math.cos(a)), v, r * Math.sin(a))
        phi += dot(F(p), nn) * r * dr * dph
      }
    }
    return phi
  }
  const nn = cross(patch.u, patch.v)
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const p = madd(madd(patch.c, patch.u, x[i] * patch.hw), patch.v, x[j] * patch.hh)
      phi += dot(F(p), nn) * w[i] * w[j] * patch.hw * patch.hh
    }
  return phi
}

/* ───────────────────────── atalhos ───────────────────────── */

export const Efield = (world: World): Field => (p) => fieldE(world, p)
export const Bfield = (world: World): Field => (p) => fieldB(world, p)
