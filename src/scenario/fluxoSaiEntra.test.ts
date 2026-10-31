import { describe, expect, it } from 'vitest'
import { PROVAS } from '../content/provas'
import { fluxParts, fluxThrough, type GaussShape } from '../physics/integrals'
import { type World, fieldE } from '../physics/sources'
import type { V3 } from '../physics/vec'
import { compileScenario } from './compile'
import { evalNum } from './expr'
import { Prova } from './schema'

const perto = (a: number, b: number, tol = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(tol)

/** Cubo de aresta a e centro c no campo B = C r: em cada face, B·n̂ é constante. */
const saiCubo = (c: V3, a: number, C: number) => C * a * a * c.reduce((s, ci) => s + Math.max(ci + a / 2, 0) + Math.max(a / 2 - ci, 0), 0)
const entraCubo = (c: V3, a: number, C: number) => C * a * a * c.reduce((s, ci) => s + Math.max(-ci - a / 2, 0) + Math.max(ci - a / 2, 0), 0)

describe('fluxo separado no que sai e no que entra', () => {
  const pontos: V3[] = [[0.9, 0.7, 0.3], [0, 0, 0], [-1.5, 0.2, -0.8], [1.6, -1.2, 1]]

  it.each(pontos)('bate com a conta analítica no cubo em (%f, %f, %f)', (x, y, z) => {
    const c: V3 = [x, y, z]
    const C = 2
    const p = fluxParts({ forma: 'cubo', c, a: 1 }, ([px, py, pz]) => [C * px, C * py, C * pz])
    perto(p.sai, saiCubo(c, 1, C))
    perto(p.entra, entraCubo(c, 1, C))
  })

  const carga: World = { e: [{ k: 'point', q: 1e-9, p: [0.5, 0, 0] }], b: [] }
  const formas: GaussShape[] = [
    { forma: 'esfera', c: [0, 0, 0], R: 0.2 },
    { forma: 'cubo', c: [0, 0, 0], a: 0.3 },
    { forma: 'cilindro', c: [0, 0, 0], eixo: [0, 0, 1], R: 0.2, H: 0.3 },
  ]

  it.each(formas)('a diferença é o fluxo total, com carga de fora ($forma)', (shape) => {
    const F = (p: V3) => fieldE(carga, p)
    const { sai, entra } = fluxParts(shape, F)
    perto(sai - entra, fluxThrough(shape, F), 1e-6)
    // o total é nulo pela lei de Gauss, mas nada aqui é zero: passa fluxo pela superfície
    expect(sai).toBeGreaterThan(0.1)
    expect(Math.abs(sai - entra) / sai).toBeLessThan(1e-3)
  })
})

describe('mover o cubo na P2 2026.1, Q1', () => {
  const q = Prova.parse(PROVAS.find((p) => p.id === 'p2-2026-1-diurno')).questoes.find((x) => x.id === 'obj1')!
  const params = Object.fromEntries(q.parametros.map((p) => [p.id, p.valor]))
  const mede = (caso: number, S: V3) => {
    const r = compileScenario(q, { params: { ...params, caso }, t: 0, overrides: { S } })
    expect(r.errors).toEqual([])
    return { total: evalNum("fluxo('S')", r.env), sai: evalNum("fluxoSai('S')", r.env), entra: evalNum("fluxoEntra('S')", r.env) }
  }

  it('o total não sai de 3Ca³, e o que sai e o que entra mudam', () => {
    const a = mede(1, [0.9, 0.7, 0.3])
    const b = mede(1, [1.6, -1.2, 1])
    perto(a.total, 3, 1e-9)
    perto(b.total, 3, 1e-9)
    perto(a.sai, saiCubo([0.9, 0.7, 0.3], 1, 1))
    perto(b.entra, entraCubo([1.6, -1.2, 1], 1, 1))
    expect(b.sai).toBeGreaterThan(a.sai + 1)
    expect(b.entra).toBeGreaterThan(a.entra + 1)
  })

  it('no campo azimutal, sai tanto quanto entra, e os dois mudam', () => {
    const a = mede(2, [0.9, 0.7, 0.3])
    const b = mede(2, [1.6, -1.2, 1])
    perto(a.total, 0, 1e-9)
    perto(b.total, 0, 1e-9)
    perto(a.sai, a.entra, 1e-9)
    expect(Math.abs(a.sai - b.sai)).toBeGreaterThan(0.05)
  })

  it('a medida do painel usa as mesmas funções', () => {
    expect(q.medidas.map((m) => m.expr)).toEqual(expect.arrayContaining(["fluxoSai('S')", "fluxoEntra('S')"]))
  })
})
