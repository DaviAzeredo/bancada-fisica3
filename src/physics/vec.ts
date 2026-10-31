/** Vetor 3D como tupla: serializa em JSON igual a como aparece nos cenários. */
export type V3 = readonly [number, number, number]

export const ZERO: V3 = [0, 0, 0]
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
export const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s]
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
export const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
export const len = (a: V3) => Math.hypot(a[0], a[1], a[2])
export const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
export const norm = (a: V3): V3 => {
  const l = len(a)
  return l > 0 ? [a[0] / l, a[1] / l, a[2] / l] : [0, 0, 0]
}
export const madd = (a: V3, b: V3, s: number): V3 => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s]
export const lerp = (a: V3, b: V3, t: number): V3 => madd(a, sub(b, a), t)

/** Base ortonormal (u, v) perpendicular a n — usada por anéis, discos e placas. */
export function basis(n: V3): [V3, V3] {
  const nn = norm(n)
  const helper: V3 = Math.abs(nn[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]
  const u = norm(cross(helper, nn))
  return [u, cross(nn, u)]
}

/** Acumulador mutável para os laços quentes (evita alocar uma tupla por fonte). */
export class Acc {
  x = 0
  y = 0
  z = 0
  addS(v: V3, s: number) {
    this.x += v[0] * s
    this.y += v[1] * s
    this.z += v[2] * s
  }
  get v(): V3 {
    return [this.x, this.y, this.z]
  }
}
