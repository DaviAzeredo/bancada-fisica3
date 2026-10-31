import { describe, expect, it } from 'vitest'
import { compileScenario } from '../../scenario/compile'
import { evalNum } from '../../scenario/expr'
import { Scenario } from '../../scenario/schema'
import { createSim, stepSim } from '../../scenario/sim'
import { LABS } from './index'

const close = (a: number, b: number) => Math.abs(a - b) <= Math.max(1e-2 * Math.abs(b), 1e-8)

/** Todas as combinações dos parâmetros com opções discretas (os "modos" de cada lab). */
function variants(s: Scenario): Record<string, number>[] {
  const base = Object.fromEntries(s.parametros.map((p) => [p.id, p.valor]))
  let out = [base]
  for (const p of s.parametros.filter((p) => p.opcoes))
    out = out.flatMap((v) => p.opcoes!.map((o) => ({ ...v, [p.id]: o.valor })))
  return out
}

describe('laboratórios', () => {
  for (const lab of LABS) {
    const s = Scenario.parse(lab.cenario)
    it(`${lab.numero} ${s.titulo}: compila e bate com a teoria em todos os modos`, () => {
      for (const params of variants(s)) {
        const sim = createSim()
        let t = 0
        if (s.cena.tempo) {
          const total = s.objetos.some((o) => o.tipo === 'particula') ? 9e-7 : 1.3
          for (let i = 0; i < 20; i++) t = stepSim(s, { params, t, overrides: {} }, sim, total / 20)
        }
        const r = compileScenario(s, { params, t, overrides: {}, sim })
        expect(r.errors, JSON.stringify(params)).toEqual([])
        for (const m of s.medidas) {
          if (m.ativo !== undefined && !evalNum(m.ativo, r.env)) continue
          const v = evalNum(m.expr, r.env)
          expect(Number.isFinite(v), `${m.rotulo} ${JSON.stringify(params)}`).toBe(true)
          if (m.teoria === undefined) continue
          const th = evalNum(m.teoria, r.env)
          expect(close(v, th), `${m.rotulo}: ${v} vs ${th} ${JSON.stringify(params)}`).toBe(true)
        }
        for (const d of s.desafios) evalNum(d.condicao, r.env)
        for (const g of s.graficos.filter((g) => g.ativo === undefined || evalNum(g.ativo, r.env)))
          for (const se of g.series) {
            const env = { vars: { ...r.env.vars, ...(g.x ? { [g.x.variavel]: evalNum(g.x.de, r.env) } : {}) }, fns: r.env.fns }
            expect(Number.isFinite(evalNum(se.expr, env)), `${g.titulo}/${se.rotulo}`).toBe(true)
          }
      }
    })
  }
})
