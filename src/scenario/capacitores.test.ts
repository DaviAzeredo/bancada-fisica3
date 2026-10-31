import { describe, expect, it } from 'vitest'
import { EPS0, K as k0 } from '../physics/constants'
import { compileScenario } from './compile'
import { evalNum } from './expr'
import { type ObjetoInput, Scenario } from './schema'

const perto = (a: number, b: number, tol = 1e-9) => expect(Math.abs(a - b) / Math.max(Math.abs(b), 1e-30)).toBeLessThan(tol)

function cena(objeto: ObjetoInput) {
  const s = Scenario.parse({ id: 'c', titulo: 'c', cena: { escala: 0.01, extensao: 12, unidade: 'cm' }, objetos: [objeto] })
  const r = compileScenario(s, { params: {}, t: 0, overrides: {} })
  expect(r.errors).toEqual([])
  return {
    C: evalNum("C('cap')", r.env),
    U: evalNum("U('cap')", r.env),
    E: (x: number) => evalNum(`mag(E(${x},0,0))`, r.env),
    ddp: (x0: number, x1: number) => evalNum(`V(${x0},0,0) - V(${x1},0,0)`, r.env),
  }
}

const a = 0.03
const b = 0.09
const Q = 2e-9
const raio = { id: 'cap', tipo: 'capacitorRadial' as const, centro: [0, 0, 0] as [number, number, number], a, b, Q }

describe('capacitor esférico', () => {
  const vazio = cena({ ...raio, forma: 'esfera' })
  const C0 = (4 * Math.PI * EPS0 * a * b) / (b - a)

  it('C = 4πε₀ab/(b − a), e a ddp simulada vale Q/C', () => {
    perto(vazio.C, C0)
    perto(vazio.ddp(a, b), Q / C0, 1e-6)
    perto(vazio.U, (Q * Q) / (2 * C0))
  })

  it('o campo só existe entre os condutores, e vale k₀Q/r²', () => {
    perto(vazio.E(0.05), (k0 * Q) / 0.05 ** 2, 1e-9)
    expect(vazio.E(0.02)).toBeLessThan(1e-6)
    expect(vazio.E(0.1)).toBeLessThan(1e-6)
  })

  it('b → ∞ dá a esfera isolada, C = 4πε₀a', () => {
    perto(cena({ ...raio, forma: 'esfera', b: 1e6 }).C, 4 * Math.PI * EPS0 * a, 1e-6)
  })

  it('b − a pequeno recai no capacitor plano, ε₀A/d', () => {
    const d = 1e-5
    perto(cena({ ...raio, forma: 'esfera', b: a + d }).C, (EPS0 * 4 * Math.PI * a * a) / d, 1e-3)
  })

  it('dielétrico em toda a região multiplica C por K e divide E por K', () => {
    const c = cena({ ...raio, forma: 'esfera', dieletrico: [{ K: 3, inicio: a, fim: b }] })
    perto(c.C, 3 * C0)
    perto(c.E(0.05), vazio.E(0.05) / 3, 1e-9)
  })

  it('duas cascas ficam em série: 1/C = Σ 1/Cᵢ, e a ddp soma as duas regiões', () => {
    const m = 0.05
    const c = cena({ ...raio, forma: 'esfera', dieletrico: [{ K: 2, inicio: a, fim: m }, { K: 4, inicio: m, fim: b }] })
    const C1 = (2 * 4 * Math.PI * EPS0 * a * m) / (m - a)
    const C2 = (4 * 4 * Math.PI * EPS0 * m * b) / (b - m)
    perto(c.C, 1 / (1 / C1 + 1 / C2))
    perto(c.ddp(a, b), Q / c.C, 1e-6)
    perto(c.E(0.04), (k0 * Q) / (2 * 0.04 ** 2), 1e-9)
    perto(c.E(0.07), (k0 * Q) / (4 * 0.07 ** 2), 1e-9)
  })

  it('casca parcial: o resto da região continua vácuo', () => {
    const m = 0.05
    const c = cena({ ...raio, forma: 'esfera', dieletrico: [{ K: 2, inicio: a, fim: m }] })
    const C1 = (2 * 4 * Math.PI * EPS0 * a * m) / (m - a)
    const C2 = (4 * Math.PI * EPS0 * m * b) / (b - m)
    perto(c.C, 1 / (1 / C1 + 1 / C2))
  })

  it('dois hemisférios ficam em paralelo: C soma, e E é o mesmo nos dois', () => {
    const c = cena({ ...raio, forma: 'esfera', setores: [{ K: 2, fracao: 0.5 }, { K: 4, fracao: 0.5 }] })
    perto(c.C, 3 * C0)
    perto(c.ddp(a, b), Q / c.C, 1e-6)
    perto(c.E(0.05), vazio.E(0.05) / 3, 1e-9)
  })

  it('setor parcial: o resto da área continua vácuo', () => {
    perto(cena({ ...raio, forma: 'esfera', setores: [{ K: 5, fracao: 0.25 }] }).C, C0 * (0.25 * 5 + 0.75))
  })
})

describe('capacitor cilíndrico', () => {
  const L = 0.4
  const cil = { ...raio, forma: 'cilindro' as const, comprimento: L }
  const C0 = (2 * Math.PI * EPS0 * L) / Math.log(b / a)

  it('C = 2πε₀L/ln(b/a), com ddp simulada Q/C e E = λ/2πε₀s', () => {
    const c = cena(cil)
    perto(c.C, C0)
    perto(c.ddp(a, b), Q / C0, 1e-6)
    perto(c.E(0.05), Q / L / (2 * Math.PI * EPS0 * 0.05), 1e-9)
    expect(c.E(0.02)).toBeLessThan(1e-6)
    expect(c.E(0.1)).toBeLessThan(1e-6)
  })

  it('cascas em série e setores em paralelo', () => {
    const m = 0.05
    const s = cena({ ...cil, dieletrico: [{ K: 2, inicio: a, fim: m }, { K: 4, inicio: m, fim: b }] })
    const C1 = (2 * 2 * Math.PI * EPS0 * L) / Math.log(m / a)
    const C2 = (4 * 2 * Math.PI * EPS0 * L) / Math.log(b / m)
    perto(s.C, 1 / (1 / C1 + 1 / C2))
    perto(s.ddp(a, b), Q / s.C, 1e-6)
    const p = cena({ ...cil, setores: [{ K: 2, fracao: 0.5 }, { K: 4, fracao: 0.5 }] })
    perto(p.C, 3 * C0)
    perto(p.ddp(a, b), Q / p.C, 1e-6)
  })
})

describe('capacitor plano com blocos lado a lado', () => {
  const lado = 0.1
  const d = 0.02
  const plano = { id: 'cap', tipo: 'capacitor' as const, centro: [0, 0, 0] as [number, number, number], eixo: 'x', lado, d, Q }
  const C0 = (EPS0 * lado * lado) / d

  it('ficam em paralelo: C = (ε₀A/d) Σ fᵢKᵢ, e a ddp vale Q/C', () => {
    const c = cena({ ...plano, lateral: [{ K: 2, fracao: 0.5 }, { K: 4, fracao: 0.5 }] })
    perto(c.C, 3 * C0)
    perto(c.ddp(-d / 2, d / 2), Q / c.C, 1e-6)
    perto(c.E(0), Q / c.C / d, 1e-6)
  })

  it('o mesmo K nos dois lados é um dielétrico inteiro, em paralelo ou em série', () => {
    const p = cena({ ...plano, lateral: [{ K: 3, fracao: 0.4 }, { K: 3, fracao: 0.6 }] })
    const s = cena({ ...plano, dieletrico: [{ K: 3, inicio: 0, fim: d / 2 }, { K: 3, inicio: d / 2, fim: d }] })
    perto(p.C, 3 * C0)
    perto(s.C, 3 * C0)
  })

  it('sem blocos, nada muda', () => {
    perto(cena(plano).C, C0)
  })
})
