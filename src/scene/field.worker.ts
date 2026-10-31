/// <reference lib="webworker" />
import { type Resolved, compileScenario } from '../scenario/compile'
import type { Scenario } from '../scenario/schema'
import { type FieldJob, runJob, transferables } from './fieldCompute'
import type { JobCtx } from './useFieldJob'

/**
 * Worker de campos: recebe o cenário uma vez e, a cada job, o contexto
 * (parâmetros, posições arrastadas, t). Compila o cenário aqui mesmo, o que
 * cobre também os campos definidos por expressão, e devolve buffers.
 */
type Msg =
  | { type: 'cenario'; key: number; scenario: Scenario }
  | { type: 'job'; id: number; key: number; ctx: JobCtx; ctxSig: string; job: FieldJob }

const scenarios = new Map<number, Scenario>()
let cache: { key: number; sig: string; r: Resolved } | null = null

self.onmessage = (ev: MessageEvent<Msg>) => {
  const m = ev.data
  if (m.type === 'cenario') {
    scenarios.set(m.key, m.scenario)
    return
  }
  const scenario = scenarios.get(m.key)
  if (!scenario) {
    self.postMessage({ id: m.id, erro: 'cenário desconhecido' })
    return
  }
  try {
    if (!cache || cache.key !== m.key || cache.sig !== m.ctxSig)
      cache = { key: m.key, sig: m.ctxSig, r: compileScenario(scenario, { ...m.ctx, overrides: m.ctx.overrides }) }
    const t0 = performance.now()
    const result = runJob(cache.r, m.job)
    self.postMessage({ id: m.id, result, ms: performance.now() - t0 }, { transfer: transferables(result) })
  } catch (e) {
    self.postMessage({ id: m.id, erro: (e as Error).message })
  }
}
