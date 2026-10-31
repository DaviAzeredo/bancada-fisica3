/**
 * Superfícies de nível por tetraedros marchantes (6 tetraedros por cubo).
 * Mais simples que marching cubes — sem tabela de 256 casos — e sem as
 * ambiguidades de face; o custo é ~2× mais triângulos, irrelevante aqui.
 */
const CORNERS = [
  [0, 0, 0],
  [1, 0, 0],
  [1, 1, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [1, 1, 1],
  [0, 1, 1],
] as const

const TETS = [
  [0, 5, 1, 6],
  [0, 1, 2, 6],
  [0, 2, 3, 6],
  [0, 3, 7, 6],
  [0, 7, 4, 6],
  [0, 4, 5, 6],
] as const

/** Grade amostrada: values[(k*n + j)*n + i] no ponto min + (i,j,k)*h. */
export interface Grid {
  n: number
  min: number
  h: number
  values: Float32Array
}

export function sampleGrid(n: number, half: number, f: (x: number, y: number, z: number) => number): Grid {
  const h = (2 * half) / (n - 1)
  const values = new Float32Array(n * n * n)
  for (let k = 0; k < n; k++)
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) values[(k * n + j) * n + i] = f(-half + i * h, -half + j * h, -half + k * h)
  return { n, min: -half, h, values }
}

export function isosurface(g: Grid, iso: number): Float32Array {
  const out: number[] = []
  const { n, min, h, values } = g
  const pv: number[] = Array.from({ length: 8 }, () => 0)
  const pp: number[][] = Array.from({ length: 8 }, () => [0, 0, 0])
  for (let k = 0; k < n - 1; k++)
    for (let j = 0; j < n - 1; j++)
      for (let i = 0; i < n - 1; i++) {
        let above = 0
        for (let c = 0; c < 8; c++) {
          const [di, dj, dk] = CORNERS[c]
          const v = values[((k + dk) * n + (j + dj)) * n + (i + di)]
          pv[c] = v
          pp[c] = [min + (i + di) * h, min + (j + dj) * h, min + (k + dk) * h]
          if (v > iso) above++
        }
        if (above === 0 || above === 8) continue
        for (const t of TETS) polygonizeTet(t, pv, pp, iso, out)
      }
  return new Float32Array(out)
}

function interp(a: number[], b: number[], va: number, vb: number, iso: number) {
  const d = vb - va
  const t = Math.abs(d) < 1e-30 || !Number.isFinite(d) ? 0.5 : Math.min(1, Math.max(0, (iso - va) / d))
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function polygonizeTet(t: readonly number[], pv: number[], pp: number[][], iso: number, out: number[]) {
  const ins: number[] = []
  const outs: number[] = []
  for (const c of t) (pv[c] > iso ? ins : outs).push(c)
  if (ins.length === 0 || ins.length === 4) return
  const e = (a: number, b: number) => interp(pp[a], pp[b], pv[a], pv[b], iso)
  if (ins.length === 1 || ins.length === 3) {
    const lone = ins.length === 1 ? ins[0] : outs[0]
    const others = ins.length === 1 ? outs : ins
    const tri = others.map((o) => e(lone, o))
    out.push(...tri[0], ...tri[1], ...tri[2])
  } else {
    const [a, b] = ins
    const [c, d] = outs
    const p1 = e(a, c)
    const p2 = e(a, d)
    const p3 = e(b, d)
    const p4 = e(b, c)
    out.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4)
  }
}
