import { describe, expect, it } from 'vitest'
import { compileScenario } from '../../scenario/compile'
import { evalNum } from '../../scenario/expr'
import { Prova, type Scenario } from '../../scenario/schema'
import { createSim, stepSim } from '../../scenario/sim'
import { PROVAS } from './index'

const close = (a: number, b: number) => Math.abs(a - b) <= Math.max(1e-2 * Math.abs(b), 1e-9)

function defaults(s: Scenario) {
  return Object.fromEntries(s.parametros.map((p) => [p.id, p.valor]))
}

for (const raw of PROVAS) {
  const prova = Prova.parse(raw)
  describe(prova.titulo, () => {
    for (const q of prova.questoes) {
      const paramSets = [defaults(q), ...q.passos.map((p) => ({ ...defaults(q), ...p.parametros }))]
      it(`questão ${q.numero}: simulação bate com a resolução`, () => {
        for (const params of paramSets) {
          const sim = createSim()
          let t = 0
          const ctx = { params, t, overrides: {}, sim }
          if (q.objetos.some((o) => o.tipo === 'particula')) {
            // uma volta e meia de ciclotron, o bastante para o rastro ter o diâmetro
            const T = 2 * Math.PI * 1.67262192369e-27 / (1.602176634e-19 * (params.B0 ?? 1))
            for (let i = 0; i < 30; i++) t = stepSim(q, { ...ctx, t }, sim, (1.5 * T) / 30)
          }
          const r = compileScenario(q, { ...ctx, t })
          expect(r.errors).toEqual([])
          for (const m of q.medidas) {
            if (m.ativo !== undefined && !evalNum(m.ativo, r.env)) continue
            const v = evalNum(m.expr, r.env)
            expect(Number.isFinite(v), `${m.rotulo} finito`).toBe(true)
            if (m.teoria === undefined) continue
            const th = evalNum(m.teoria, r.env)
            expect(close(v, th), `${q.numero} · ${m.rotulo}: ${v} vs ${th} (${JSON.stringify(params)})`).toBe(true)
          }
        }
      })
    }
    it('campos por expressão com potencial: E = −∇V', () => {
      for (const q of prova.questoes) {
        const pots = q.objetos.filter((o) => o.tipo === 'campoE' && o.potencial)
        if (!pots.length) continue
        for (const params of [defaults(q), ...q.passos.map((p) => ({ ...defaults(q), ...p.parametros }))]) {
          const r = compileScenario(q, { params, t: 0, overrides: {} })
          for (const o of pots) {
            const s = r.sourcesOf.get(o.id)?.e[0]
            if (!s || s.k !== 'fnE' || !s.v) continue
            const half = q.cena.extensao * q.cena.escala
            let seed = 7
            const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 1.8 - 0.9
            for (let i = 0; i < 40; i++) {
              const p = [rnd() * half, rnd() * half, rnd() * half] as [number, number, number]
              const h = half * 1e-6
              const E = s.f(p)
              const g = [0, 1, 2].map((k) => {
                const a = [...p] as typeof p
                const b = [...p] as typeof p
                a[k] += h
                b[k] -= h
                return -(s.v!(a) - s.v!(b)) / (2 * h)
              })
              const m = Math.hypot(...E)
              for (let k = 0; k < 3; k++)
                expect(Math.abs(g[k] - E[k]), `${q.numero} · ${o.id} em ${p}: E=${E} −∇V=${g}`).toBeLessThan(1e-4 * m + 1e-9)
            }
          }
        }
      }
    })
    it('objetivas têm exatamente uma alternativa correta', () => {
      for (const q of prova.questoes)
        if (q.alternativas) expect(q.alternativas.filter((a) => a.correta).length).toBe(1)
    })
  })
}
