import { describe, expect, it } from 'vitest'
import { LABS } from '../content/labs'
import { PROVAS } from '../content/provas'
import { compileScenario } from '../scenario/compile'
import { Prova, Scenario } from '../scenario/schema'
import { runJob } from './fieldCompute'

/** Mediana de algumas execuções: menos sensível a ruído da máquina. */
function timed(f: () => void, runs = 5) {
  f() // aquece o JIT
  const ts: number[] = []
  for (let i = 0; i < runs; i++) {
    const t0 = performance.now()
    f()
    ts.push(performance.now() - t0)
  }
  return ts.sort((a, b) => a - b)[Math.floor(runs / 2)]
}

/** Máquinas de CI são mais lentas e ruidosas: lá o orçamento ganha folga. */
const SLACK = process.env.CI ? 4 : 1

const lab = (id: string) => Scenario.parse(LABS.find((l) => l.cenario.id === id)!.cenario)
const defaults = (s: Scenario) => Object.fromEntries(s.parametros.map((p) => [p.id, p.valor]))

describe('orçamento de desempenho', () => {
  it('linhas de B do solenoide em ≤ 120 ms', () => {
    const s = lab('ampere')
    const r = compileScenario(s, { params: { ...defaults(s), fonte: 3 }, t: 0, overrides: {} })
    const ms = timed(() => runJob(r, { tipo: 'linhas', campo: 'B', half: 0.12, qualidade: 1 }))
    expect(ms).toBeLessThan(120 * SLACK)
  })

  it('linhas de B do toroide em ≤ 120 ms', () => {
    const s = lab('ampere')
    const r = compileScenario(s, { params: { ...defaults(s), fonte: 4 }, t: 0, overrides: {} })
    expect(timed(() => runJob(r, { tipo: 'linhas', campo: 'B', half: 0.12, qualidade: 1 }))).toBeLessThan(120 * SLACK)
  })

  it('recompilar a questão D2 (o que acontece a cada arrasto) em ≤ 5 ms', () => {
    const q = Prova.parse(PROVAS[0]).questoes.find((x) => x.id === 'disc2')!
    expect(timed(() => compileScenario(q, { params: defaults(q), t: 0, overrides: {} }), 21)).toBeLessThan(5 * SLACK)
  })

  it('limalha 256² do lab de Ampère em ≤ 250 ms', () => {
    const s = lab('ampere')
    const r = compileScenario(s, { params: { ...defaults(s), fonte: 3 }, t: 0, overrides: {} })
    expect(timed(() => runJob(r, { tipo: 'textura', campo: 'B', half: 0.12, normal: 'z', at: 0, N: 256 }), 3)).toBeLessThan(250 * SLACK)
  })
})
