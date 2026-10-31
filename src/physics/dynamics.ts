import { type V3, add, cross, dot, madd, scale } from './vec'

/* ───────────────────────── Lorentz (Boris) ───────────────────────── */

export interface ParticleState {
  p: V3
  v: V3
}

/**
 * Integrador de Boris: o padrão de física de plasmas. Em B puro ele gira a
 * velocidade sem mudar o módulo, então a órbita ciclotrônica não espirala para
 * fora com o tempo, como aconteceria com Euler ou mesmo RK4.
 */
export function borisStep(
  s: ParticleState,
  q: number,
  m: number,
  dt: number,
  E: (p: V3) => V3,
  B: (p: V3) => V3,
): ParticleState {
  const qm = (q / m) * (dt / 2)
  const e = E(s.p)
  const vMinus = madd(s.v, e, qm)
  const t = scale(B(s.p), qm)
  const sf = 2 / (1 + dot(t, t))
  const vPrime = add(vMinus, cross(vMinus, t))
  const vPlus = add(vMinus, scale(cross(vPrime, t), sf))
  const v = madd(vPlus, e, qm)
  return { p: madd(s.p, v, dt), v }
}

/* ───────────────────────── circuitos ───────────────────────── */

export interface CircuitParams {
  modelo: 'R' | 'RC' | 'RL' | 'LC' | 'RLC'
  R: number
  C: number
  L: number
  fem: number
  q0: number
  I0: number
}

export interface CircuitState {
  q: number
  I: number
  /** Energias em J: capacitor, indutor, dissipada no resistor desde t=0. */
  UC: number
  UL: number
}

/**
 * Solução analítica de L q'' + R q' + q/C = ε com q(0)=q0, q'(0)=I0.
 * RC e RL são os limites de primeira ordem (L=0 e C→∞, respectivamente).
 */
export function circuitAt(c: CircuitParams, t: number): CircuitState {
  let q = 0
  let I = 0
  if (c.modelo === 'R') {
    I = c.fem / c.R
  } else if (c.modelo === 'RC') {
    const tau = c.R * c.C
    const qf = c.C * c.fem
    q = qf + (c.q0 - qf) * Math.exp(-t / tau)
    I = (-(c.q0 - qf) / tau) * Math.exp(-t / tau)
  } else if (c.modelo === 'RL') {
    const tau = c.L / c.R
    const If = c.fem / c.R
    I = If + (c.I0 - If) * Math.exp(-t / tau)
  } else {
    const R = c.modelo === 'LC' ? 0 : c.R
    const qf = c.C * c.fem
    const x0 = c.q0 - qf
    const v0 = c.I0
    const g = R / (2 * c.L)
    const w0 = 1 / Math.sqrt(c.L * c.C)
    if (g < w0 * (1 - 1e-9)) {
      const wd = Math.sqrt(w0 * w0 - g * g)
      const A = x0
      const B = (v0 + g * x0) / wd
      const e = Math.exp(-g * t)
      const cs = Math.cos(wd * t)
      const sn = Math.sin(wd * t)
      q = qf + e * (A * cs + B * sn)
      I = e * (-g * (A * cs + B * sn) + (-A * wd * sn + B * wd * cs))
    } else if (g > w0 * (1 + 1e-9)) {
      const s = Math.sqrt(g * g - w0 * w0)
      const r1 = -g + s
      const r2 = -g - s
      const A = (v0 - r2 * x0) / (r1 - r2)
      const B = x0 - A
      q = qf + A * Math.exp(r1 * t) + B * Math.exp(r2 * t)
      I = A * r1 * Math.exp(r1 * t) + B * r2 * Math.exp(r2 * t)
    } else {
      const A = x0
      const B = v0 + g * x0
      const e = Math.exp(-g * t)
      q = qf + (A + B * t) * e
      I = (B - g * (A + B * t)) * e
    }
  }
  return {
    q,
    I,
    UC: c.modelo === 'RL' ? 0 : (q * q) / (2 * c.C),
    UL: c.modelo === 'RC' ? 0 : 0.5 * c.L * I * I,
  }
}

export function timeConstant(c: CircuitParams): number {
  if (c.modelo === 'RC') return c.R * c.C
  if (c.modelo === 'RL') return c.L / c.R
  return 2 * Math.PI * Math.sqrt(c.L * c.C)
}
