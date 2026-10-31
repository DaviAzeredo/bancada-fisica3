import { describe, expect, it } from 'vitest'
import { EPS0, E_CHARGE, K, M_PROTON, MU0 } from './constants'
import { borisStep, circuitAt } from './dynamics'
import {
  circlePoints,
  circulation,
  enclosedCharge,
  enclosedCurrent,
  fluxPatch,
  fluxThrough,
  type GaussShape,
} from './integrals'
import { type BSource, type World, fieldB, fieldE, forceOnSegment, potentialV, radialCurrent, radialSource } from './sources'
import { type V3, len, sub } from './vec'

const rel = (a: number, b: number) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-300)
const ring = (I: number, R: number, z: number, n = 256): BSource[] => {
  const out: BSource[] = []
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * 2 * Math.PI
    const a1 = ((i + 1) / n) * 2 * Math.PI
    out.push({ k: 'seg', I, a: [R * Math.cos(a0), R * Math.sin(a0), z], b: [R * Math.cos(a1), R * Math.sin(a1), z] })
  }
  return out
}

describe('eletrostática', () => {
  it('carga pontual: E = kq/r² e V = kq/r', () => {
    const w: World = { e: [{ k: 'point', q: 2e-9, p: [0, 0, 0] }], b: [] }
    expect(rel(len(fieldE(w, [0.3, 0, 0])), (K * 2e-9) / 0.09)).toBeLessThan(1e-12)
    expect(rel(potentialV(w, [0, 0.3, 0]), (K * 2e-9) / 0.3)).toBeLessThan(1e-12)
  })

  it('superposição é linear', () => {
    const a = { k: 'point' as const, q: 1e-9, p: [0.1, 0, 0] as V3 }
    const b = { k: 'point' as const, q: -3e-9, p: [-0.2, 0.1, 0] as V3 }
    const P: V3 = [0.05, 0.3, -0.1]
    const sum = fieldE({ e: [a, b], b: [] }, P)
    const ea = fieldE({ e: [a], b: [] }, P)
    const eb = fieldE({ e: [b], b: [] }, P)
    for (let i = 0; i < 3; i++) expect(sum[i]).toBeCloseTo(ea[i] + eb[i], 6)
  })

  it('E = −∇V para segmento, placa e esfera', () => {
    const w: World = {
      e: [
        { k: 'seg', lambda: 2e-9, a: [-0.2, 0, 0], b: [0.3, 0.1, 0] },
        { k: 'rect', sigma: 1e-9, c: [0, 0, 0.2], u: [1, 0, 0], v: [0, 1, 0], hw: 0.2, hh: 0.1 },
        { k: 'sphere', Q: 1e-9, c: [0, -0.3, 0], R: 0.1 },
      ],
      b: [],
    }
    for (const P of [[0.1, 0.2, 0.05], [-0.15, -0.05, 0.35], [0, -0.32, 0.02]] as V3[]) {
      const E = fieldE(w, P)
      const h = 1e-5
      for (let i = 0; i < 3; i++) {
        const p1 = [...P] as [number, number, number]
        const p2 = [...P] as [number, number, number]
        p1[i] += h
        p2[i] -= h
        const g = -(potentialV(w, p1) - potentialV(w, p2)) / (2 * h)
        expect(rel(g, E[i])).toBeLessThan(1e-4)
      }
    }
  })

  it('placa grande ≈ plano infinito σ/2ε₀; capacitor ideal σ/ε₀ dentro', () => {
    const sigma = 5e-9
    const plate = { k: 'rect' as const, sigma, c: [0, 0, 0] as V3, u: [1, 0, 0] as V3, v: [0, 1, 0] as V3, hw: 50, hh: 50 }
    expect(rel(fieldE({ e: [plate], b: [] }, [0, 0, 0.01])[2], sigma / (2 * EPS0))).toBeLessThan(1e-3)
    const cap: World = {
      e: [
        { ...plate, c: [0, 0, 0.005], sigma: -sigma },
        { ...plate, c: [0, 0, -0.005] },
      ],
      b: [],
    }
    expect(rel(fieldE(cap, [0, 0, 0])[2], sigma / EPS0)).toBeLessThan(1e-3)
    expect(Math.abs(fieldE(cap, [0, 0, 0.02])[2])).toBeLessThan((sigma / EPS0) * 1e-3)
  })

  it('anel: E no eixo = kQz/(z²+R²)^{3/2}', () => {
    const R = 0.1
    const Q = 3e-9
    const n = 360
    const e = []
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * 2 * Math.PI
      const a1 = ((i + 1) / n) * 2 * Math.PI
      const a: V3 = [R * Math.cos(a0), R * Math.sin(a0), 0]
      const b: V3 = [R * Math.cos(a1), R * Math.sin(a1), 0]
      e.push({ k: 'seg' as const, lambda: Q / (n * len(sub(b, a))), a, b })
    }
    const z = 0.07
    expect(rel(fieldE({ e, b: [] }, [0, 0, z])[2], (K * Q * z) / (z * z + R * R) ** 1.5)).toBeLessThan(1e-3)
  })
})

describe('lei de Gauss', () => {
  const shapes: GaussShape[] = [
    { forma: 'esfera', c: [0.02, -0.01, 0.03], R: 0.3 },
    { forma: 'cubo', c: [0, 0.01, 0], a: 0.5 },
    { forma: 'cilindro', c: [0, 0, 0], eixo: [0, 0, 1], R: 0.25, H: 0.6 },
  ]
  const w: World = {
    e: [
      { k: 'point', q: 2e-9, p: [0.05, 0.02, -0.04] },
      { k: 'point', q: -0.7e-9, p: [-0.08, 0.05, 0.06] },
      { k: 'point', q: 5e-9, p: [1.5, 0, 0] }, // fora
    ],
    b: [],
  }
  for (const s of shapes)
    it(`fluxo em ${s.forma} = Q_enc/ε₀`, () => {
      const qenc = enclosedCharge(w.e, s)
      expect(rel(qenc, 1.3e-9)).toBeLessThan(1e-9)
      expect(rel(fluxThrough(s, (p) => fieldE(w, p)), qenc / EPS0)).toBeLessThan(5e-3)
    })

  it('carga externa dá fluxo ≈ 0', () => {
    const only: World = { e: [{ k: 'point', q: 5e-9, p: [0.6, 0, 0] }], b: [] }
    const phi = fluxThrough({ forma: 'esfera', c: [0, 0, 0], R: 0.3 }, (p) => fieldE(only, p))
    expect(Math.abs(phi)).toBeLessThan((5e-9 / EPS0) * 1e-6)
  })

  it('linha infinita dentro do cilindro: Φ = λH/ε₀', () => {
    const lw: World = { e: [{ k: 'iline', lambda: 1e-9, p: [0, 0, 0], d: [0, 0, 1] }], b: [] }
    const s: GaussShape = { forma: 'cilindro', c: [0, 0, 0], eixo: [0, 0, 1], R: 0.1, H: 0.4 }
    expect(rel(fluxThrough(s, (p) => fieldE(lw, p)), (1e-9 * 0.4) / EPS0)).toBeLessThan(1e-3)
    expect(rel(enclosedCharge(lw.e, s), 0.4e-9)).toBeLessThan(1e-3)
  })

  it('casca grossa com ρ = Cr: E, V e Q_enc batem com a integral analítica', () => {
    const C = 2e-6
    const a = 0.1
    const b = 0.3
    const s = radialSource('esf', [0, 0, 0], [0, 0, 1], a, b, (r) => C * r)
    const w: World = { e: [s], b: [] }
    expect(rel(s.Q, Math.PI * C * (b ** 4 - a ** 4))).toBeLessThan(1e-9)
    expect(len(fieldE(w, [0.05, 0, 0]))).toBe(0)
    const r = 0.2
    expect(rel(len(fieldE(w, [0, r, 0])), (C * (r ** 4 - a ** 4)) / (4 * EPS0 * r * r))).toBeLessThan(1e-6)
    // V(r) − V(0) = C/(12ε₀)(4a³ − r³ − 3a⁴/r) dentro da camada
    const dV = potentialV(w, [r, 0, 0]) - potentialV(w, [0, 0, 0])
    expect(rel(dV, (C / (12 * EPS0)) * (4 * a ** 3 - r ** 3 - (3 * a ** 4) / r))).toBeLessThan(1e-5)
    expect(rel(potentialV(w, [0, 0, 0.5]), (K * s.Q) / 0.5)).toBeLessThan(1e-12)
    const g: GaussShape = { forma: 'esfera', c: [0, 0, 0], R: r }
    expect(rel(enclosedCharge(w.e, g), Math.PI * C * (r ** 4 - a ** 4))).toBeLessThan(1e-2)
    expect(rel(fluxThrough(g, (p) => fieldE(w, p)), (Math.PI * C * (r ** 4 - a ** 4)) / EPS0)).toBeLessThan(1e-3)
  })

  it('cilindro com ρ = αs: E = αs²/3ε₀ dentro e λ/2πε₀s fora', () => {
    const al = 1e-6
    const R = 0.2
    const s = radialSource('cil', [0, 0, 0], [0, 0, 1], 0, R, (r) => al * r)
    const w: World = { e: [s], b: [] }
    expect(rel(s.Q, (2 * Math.PI * al * R ** 3) / 3)).toBeLessThan(1e-9)
    expect(rel(len(fieldE(w, [0.1, 0, 0.7])), (al * 0.01) / (3 * EPS0))).toBeLessThan(1e-6)
    expect(rel(len(fieldE(w, [0, 0.5, 0])), s.Q / (2 * Math.PI * EPS0 * 0.5))).toBeLessThan(1e-9)
    const dV = potentialV(w, [0, 0, 0]) - potentialV(w, [R, 0, 0])
    expect(rel(dV, (al * R ** 3) / (9 * EPS0))).toBeLessThan(1e-5)
    const g: GaussShape = { forma: 'cilindro', c: [0, 0, 0], eixo: [0, 0, 1], R: 0.1, H: 0.4 }
    expect(rel(enclosedCharge(w.e, g), ((2 * Math.PI * al * 0.1 ** 3) / 3) * 0.4)).toBeLessThan(2e-2)
  })

  it('∮E·dl = 0 (campo conservativo)', () => {
    const pts = circlePoints({ c: [0.02, 0, 0], n: [0.3, 1, 0.2], R: 0.2 }, 720)
    const c = circulation(pts, (p) => fieldE(w, p))
    expect(Math.abs(c)).toBeLessThan(1e-6 * Math.abs((K * 2e-9) / 0.05))
  })
})

describe('magnetostática', () => {
  it('fio infinito: B = μ₀I/2πd', () => {
    const w: World = { e: [], b: [{ k: 'iwire', I: 3, p: [0, 0, 0], d: [0, 0, 1] }] }
    const B = fieldB(w, [0.05, 0, 0])
    expect(rel(len(B), (MU0 * 3) / (2 * Math.PI * 0.05))).toBeLessThan(1e-6)
    expect(B[1]).toBeGreaterThan(0) // regra da mão direita: ẑ × x̂ = ŷ
  })

  it('segmento longo ≈ fio infinito', () => {
    const w: World = { e: [], b: [{ k: 'seg', I: 2, a: [0, 0, -100], b: [0, 0, 100] }] }
    expect(rel(len(fieldB(w, [0.1, 0, 0])), (MU0 * 2) / (2 * Math.PI * 0.1))).toBeLessThan(1e-4)
  })

  it('espira: centro μ₀I/2R e eixo μ₀IR²/2(R²+z²)^{3/2}', () => {
    const R = 0.1
    const w: World = { e: [], b: ring(5, R, 0) }
    expect(rel(fieldB(w, [0, 0, 0])[2], (MU0 * 5) / (2 * R))).toBeLessThan(1e-3)
    const z = 0.08
    expect(rel(fieldB(w, [0, 0, z])[2], (MU0 * 5 * R * R) / (2 * (R * R + z * z) ** 1.5))).toBeLessThan(1e-3)
  })

  it('cilindro com J = Cs/2π: Ampère dentro, fora e com caminho fora do eixo', () => {
    const C = 1e6
    const a = 0.04
    const s = radialCurrent([0, 0, 0], [0, 0, 1], 0, a, (r) => (C * r) / (2 * Math.PI))
    const b: BSource[] = [s]
    const w: World = { e: [], b }
    expect(rel(s.I, (C * a ** 3) / 3)).toBeLessThan(1e-9)
    // φ̂ em (s, 0, 0) é ŷ
    expect(rel(fieldB(w, [0.02, 0, 0.3])[1], (MU0 * C * 0.02 ** 2) / (6 * Math.PI))).toBeLessThan(1e-6)
    expect(rel(fieldB(w, [0.1, 0, 0])[1], (MU0 * C * a ** 3) / (6 * Math.PI * 0.1))).toBeLessThan(1e-9)
    const dentro = { c: [0, 0, 0] as V3, n: [0, 0, 1] as V3, R: 0.03 }
    expect(rel(enclosedCurrent(b, dentro), (C * 0.03 ** 3) / 3)).toBeLessThan(1e-6)
    expect(rel(circulation(circlePoints(dentro, 720), (p) => fieldB(w, p)), (MU0 * C * 0.03 ** 3) / 3)).toBeLessThan(1e-4)
    // fora do eixo a tabela não serve: a grade polar tem de bater com a circulação
    const torto = { c: [0.015, 0.005, 0] as V3, n: [0, 0, 1] as V3, R: 0.012 }
    const Ig = enclosedCurrent(b, torto)
    expect(rel(circulation(circlePoints(torto, 720), (p) => fieldB(w, p)), MU0 * Ig)).toBeLessThan(2e-3)
  })

  it('fio semi-infinito: metade do fio infinito no pé da perpendicular', () => {
    const b: BSource[] = [{ k: 'seg', I: 10, a: [-1e3, 0.03, 0], b: [0, 0.03, 0] }]
    expect(rel(len(fieldB({ e: [], b }, [0, 0, 0])), (MU0 * 10) / (4 * Math.PI * 0.03))).toBeLessThan(2e-5) // amolecimento de 0,1 mm: erro ~ (1e-4/d)²
  })

  it('solenoide longo: B ≈ μ₀nI no centro', () => {
    const Lz = 1
    const N = 200
    const b: BSource[] = []
    for (let i = 0; i < N; i++) b.push(...ring(2, 0.03, -Lz / 2 + (i + 0.5) * (Lz / N), 48))
    expect(rel(fieldB({ e: [], b }, [0, 0, 0])[2], MU0 * (N / Lz) * 2)).toBeLessThan(5e-3)
  })

  it('Ampère: ∮B·dl = μ₀I_enc', () => {
    const b: BSource[] = [
      { k: 'iwire', I: 4, p: [0.02, 0, 0], d: [0, 0, 1] },
      { k: 'iwire', I: -1.5, p: [-0.03, 0.01, 0], d: [0, 0, 1] },
      { k: 'iwire', I: 7, p: [0.5, 0, 0], d: [0, 0, 1] }, // fora
    ]
    const circle = { c: [0, 0, 0] as V3, n: [0, 0, 1] as V3, R: 0.1 }
    const I = enclosedCurrent(b, circle)
    expect(I).toBeCloseTo(2.5, 12)
    const c = circulation(circlePoints(circle, 1440), (p) => fieldB({ e: [], b }, p))
    expect(rel(c, MU0 * I)).toBeLessThan(1e-4)
  })

  it('espira exata (elípticas) = polígono de 720 lados em pontos arbitrários', () => {
    const n: V3 = [0.3, 0.9, -0.2]
    const nn = n.map((x) => x / Math.hypot(...n)) as unknown as V3
    const exact: World = { e: [], b: [{ k: 'ring', I: 3, c: [0.01, -0.02, 0.03], n: nn, R: 0.05 }] }
    // o mesmo círculo como polígono fino, orientado anti-horário em torno de n
    const ax = Math.abs(nn[0]) < 0.9 ? ([1, 0, 0] as V3) : ([0, 1, 0] as V3)
    const cr = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
    const u0 = cr(ax, nn)
    const u = u0.map((x) => x / Math.hypot(...u0)) as unknown as V3
    const v = cr(nn, u)
    const N = 720
    const poly: BSource[] = []
    for (let i = 0; i < N; i++) {
      const p = (k: number): V3 => {
        const t = (k / N) * 2 * Math.PI
        return [0.01 + 0.05 * (u[0] * Math.cos(t) + v[0] * Math.sin(t)), -0.02 + 0.05 * (u[1] * Math.cos(t) + v[1] * Math.sin(t)), 0.03 + 0.05 * (u[2] * Math.cos(t) + v[2] * Math.sin(t))]
      }
      poly.push({ k: 'seg', I: 3, a: p(i), b: p(i + 1) })
    }
    for (const P of [[0.01, -0.02, 0.03], [0.08, 0.02, -0.01], [-0.03, 0.06, 0.04], [0.02, -0.015, 0.035]] as V3[]) {
      const a = fieldB(exact, P)
      const b = fieldB({ e: [], b: poly }, P)
      const err = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) / Math.hypot(...b)
      expect(err, JSON.stringify(P)).toBeLessThan(2e-4)
    }
  })

  it('espira exata: centro μ₀I/2R e eixo μ₀IR²/2(R²+z²)^{3/2}', () => {
    const w: World = { e: [], b: [{ k: 'ring', I: 5, c: [0, 0, 0], n: [0, 0, 1], R: 0.1 }] }
    expect(rel(fieldB(w, [0, 0, 0])[2], (MU0 * 5) / 0.2)).toBeLessThan(1e-12)
    expect(rel(fieldB(w, [0, 0, 0.08])[2], (MU0 * 5 * 0.01) / (2 * (0.01 + 0.0064) ** 1.5))).toBeLessThan(1e-12)
  })

  it('solenoide de espiras exatas: μ₀nI e Ampère contando espiras', () => {
    const b: BSource[] = []
    for (let i = 0; i < 400; i++) b.push({ k: 'ring', I: 2, c: [0, 0, -0.5 + (i + 0.5) / 400], n: [0, 0, 1], R: 0.03 })
    expect(rel(fieldB({ e: [], b }, [0, 0, 0])[2], MU0 * 400 * 2)).toBeLessThan(5e-3)
    // caminho no plano y-z cortando a parede do solenoide em y = R: envolve as espiras com |z| < 0.02
    const circle = { c: [0, 0.03, 0] as V3, n: [1, 0, 0] as V3, R: 0.02 }
    const I = enclosedCurrent(b, circle)
    expect(Math.abs(I)).toBeCloseTo(16 * 2, 9)
    expect(rel(circulation(circlePoints(circle, 2880), (p) => fieldB({ e: [], b }, p)), MU0 * I)).toBeLessThan(2e-3)
  })

  it('Ampère com espira de segmentos atravessando o disco', () => {
    const b = ring(3, 0.1, 0) // espira no plano z=0
    const circle = { c: [0.1, 0, 0] as V3, n: [0, 1, 0] as V3, R: 0.04 } // abraça o fio em x=0.1
    expect(Math.abs(enclosedCurrent(b, circle))).toBeCloseTo(3, 9)
  })
})

describe('dinâmica', () => {
  it('Boris: |v| conservado e raio = mv/qB', () => {
    const B0 = 0.5
    const v0 = 1e5
    const F0 = (): V3 => [0, 0, 0]
    const Fb = (): V3 => [0, 0, B0]
    let s = { p: [0, 0, 0] as V3, v: [v0, 0, 0] as V3 }
    const T = (2 * Math.PI * M_PROTON) / (E_CHARGE * B0)
    const dt = T / 400
    let maxY = 0
    for (let i = 0; i < 10000; i++) {
      s = borisStep(s, E_CHARGE, M_PROTON, dt, F0, Fb)
      maxY = Math.max(maxY, Math.abs(s.p[1]))
    }
    expect(rel(len(s.v), v0)).toBeLessThan(1e-12)
    expect(rel(maxY / 2, (M_PROTON * v0) / (E_CHARGE * B0))).toBeLessThan(1e-3)
  })

  it('deriva E×B tem velocidade E/B', () => {
    const E: V3 = [0, 1e3, 0]
    const B: V3 = [0, 0, 0.1]
    let s = { p: [0, 0, 0] as V3, v: [0, 0, 0] as V3 }
    const T = (2 * Math.PI * M_PROTON) / (E_CHARGE * 0.1)
    const dt = T / 200
    const steps = 200 * 20
    for (let i = 0; i < steps; i++) s = borisStep(s, E_CHARGE, M_PROTON, dt, () => E, () => B)
    expect(rel(s.p[0] / (steps * dt), 1e3 / 0.1)).toBeLessThan(2e-3)
  })
})

describe('circuitos e indução', () => {
  const base = { R: 1e3, C: 1e-6, L: 0.1, fem: 10, q0: 0, I0: 0 }
  it('RC: q(τ) = Cε(1 − 1/e)', () => {
    expect(rel(circuitAt({ ...base, modelo: 'RC' }, 1e-3).q, 1e-5 * (1 - Math.exp(-1)))).toBeLessThan(1e-12)
  })
  it('RL: I(τ) = (ε/R)(1 − 1/e)', () => {
    expect(rel(circuitAt({ ...base, modelo: 'RL' }, 1e-4).I, 1e-2 * (1 - Math.exp(-1)))).toBeLessThan(1e-12)
  })
  it('LC conserva energia', () => {
    const c = { ...base, modelo: 'LC' as const, fem: 0, q0: 1e-5 }
    const U0 = circuitAt(c, 0).UC
    for (const t of [1e-4, 3.3e-4, 7e-4]) {
      const s = circuitAt(c, t)
      expect(rel(s.UC + s.UL, U0)).toBeLessThan(1e-9)
    }
  })
  it('RLC: I = dq/dt nos três regimes', () => {
    for (const R of [50, 632.4555, 3000]) {
      const c = { ...base, R, modelo: 'RLC' as const, fem: 0, q0: 1e-5 }
      const t = 2e-4
      const h = 1e-9
      const dq = (circuitAt(c, t + h).q - circuitAt(c, t - h).q) / (2 * h)
      expect(rel(circuitAt(c, t).I, dq)).toBeLessThan(1e-4)
    }
  })
  it('força entre fio longo e lado de malha: μ₀I₀Ia/2πL, atrativa', () => {
    const w: World = { e: [], b: [{ k: 'iwire', I: 10, p: [0, 0, 0], d: [0, 1, 0] }] }
    const F = forceOnSegment((p) => fieldB(w, p), [0.05, 0, 0], [0.05, 0.2, 0], 2)
    expect(rel(F[0], -(MU0 * 10 * 2 * 0.2) / (2 * Math.PI * 0.05))).toBeLessThan(1e-9)
  })
  it('Faraday: fluxo de B uniforme num disco = BπR²', () => {
    const w: World = { e: [], b: [{ k: 'uniformB', B: [0, 0, 0.2] }] }
    expect(rel(fluxPatch({ forma: 'disco', c: [0, 0, 0], n: [0, 0, 1], R: 0.1 }, (p) => fieldB(w, p)), 0.2 * Math.PI * 0.01)).toBeLessThan(1e-12)
  })
})
