import { borisStep } from '../physics/dynamics'
import { fieldB, fieldE } from '../physics/sources'
import { type V3, dist, dot, madd, sub } from '../physics/vec'
import { type Ctx, type SimState, compileScenario, timeStep } from './compile'
import { type Env, type Value, evalNum } from './expr'
import type { Scenario } from './schema'

export const MAX_TRAIL = 4000
/** Raio de contato com uma carga pontual, em frações de `half`: o tamanho com que ela é desenhada. */
const CONTATO = 0.03

export function createSim(): SimState {
  return { particles: new Map(), vars: {} }
}

/** Menor distância de `c` ao trecho ab: perto da fonte, um passo vale mais que o raio de contato. */
function distTrecho(c: V3, a: V3, b: V3) {
  const ab = sub(b, a)
  const u = Math.max(0, Math.min(1, dot(sub(c, a), ab) / Math.max(dot(ab, ab), 1e-30)))
  return dist(c, madd(a, ab, u))
}

/** Euler semi-implícito: com a velocidade antes da posição na lista, a energia não deriva. */
function integraDinamica(scn: Scenario, env: Env, sim: SimState, h: number) {
  const local: Env = { vars: { ...env.vars }, fns: env.fns }
  for (const d of scn.dinamica) {
    const v = evalNum(d.id, local) + h * evalNum(d.derivada, local)
    local.vars[d.id] = v
    sim.vars[d.id] = v
  }
}

/**
 * Avança o tempo de simulação em `dt` (s), em subpassos de Boris. O mundo é
 * recompilado a cada subpasso só se o cenário depende de t; senão, uma vez.
 * Partícula que sai do cubo visível recomeça do estado inicial (laço didático).
 * Carga de prova não recomeça: acaba ali, ou ao bater numa fonte de sinal oposto.
 */
export function stepSim(scn: Scenario, ctx: Ctx, sim: SimState, dt: number): number {
  const h = timeStep(scn)
  const n = Math.max(1, Math.min(2000, Math.ceil(dt / h)))
  const sub = dt / n
  let t = ctx.t
  let r = compileScenario(scn, { ...ctx, t, sim })
  for (let i = 0; i < n; i++) {
    if (r.timeDependent && i > 0) r = compileScenario(scn, { ...ctx, t, sim })
    integraDinamica(scn, r.env, sim, sub)
    const E = (p: V3) => fieldE(r.world, p)
    const B = (p: V3) => fieldB(r.world, p)
    for (const ent of r.ents) {
      if (ent.tipo !== 'particula') continue
      let st = sim.particles.get(ent.id)
      if (!st) {
        st = { p: ent.p, v: ent.v, trail: [ent.p] }
        sim.particles.set(ent.id, st)
      }
      if (st.parada) continue
      const next = borisStep(st, ent.q, ent.m, sub, E, B)
      const lim = r.half * 1.15
      const fora = Math.abs(next.p[0]) > lim || Math.abs(next.p[1]) > lim || Math.abs(next.p[2]) > lim
      const contato = r.half * CONTATO
      if (ent.cargaDeProva && (fora || r.world.e.some((s) => s.k === 'point' && s.q * ent.q < 0 && distTrecho(s.p, st.p, next.p) < contato))) {
        // a velocidade fica: a energia da carga não some porque a cena acabou
        st.parada = true
        continue
      }
      if (fora) {
        sim.particles.delete(ent.id)
        continue
      }
      st.p = next.p
      st.v = next.v
      if (ent.parada !== undefined) {
        const vars: Record<string, Value> = { ...r.env.vars, x: st.p[0], y: st.p[1], z: st.p[2] }
        const env: Env = { vars, fns: r.env.fns }
        if (evalNum(ent.parada, env)) {
          st.parada = true
          st.v = [0, 0, 0]
        }
      }
      const last = st.trail[st.trail.length - 1]
      if (dist(last, st.p) > r.half / 500) {
        st.trail.push(st.p)
        if (st.trail.length > MAX_TRAIL) st.trail.shift()
      }
    }
    t += sub
  }
  return t
}
