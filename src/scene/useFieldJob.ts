import { useEffect, useRef, useState } from 'react'
import type { V3 } from '../physics/vec'
import { compileScenario } from '../scenario/compile'
import type { Objeto, Scenario } from '../scenario/schema'
import { type FieldJob, type FieldResult, runJob } from './fieldCompute'

/** Contexto clonável enviado ao worker (sem estado de partículas). */
export interface JobCtx {
  params: Record<string, number>
  overrides: Record<string, V3>
  orient?: Record<string, V3>
  extras: Objeto[]
  t: number
  /** Estado de `dinamica`: um dipolo que gira leva o campo junto. */
  estado?: Record<string, number>
  mostrar?: string[]
  ocultar?: string[]
}

interface Req {
  version: number
  scenario: Scenario
  ctx: JobCtx
  ctxSig: string
  job: FieldJob
  done: (r: FieldResult, version: number) => void
}

interface Slot {
  version: number
  busy: boolean
  pending: Req | null
  worker: number
}

/* ───────────────────────── pool ───────────────────────── */

const POOL = typeof Worker === 'undefined' ? 0 : Math.max(1, Math.min(3, (navigator.hardwareConcurrency || 4) - 1))
const workers: Worker[] = []
const known: Set<number>[] = []
const inflight = new Map<number, { slot: Slot; req: Req }>()
const slots = new Map<string, Slot>()
const scenarioKeys = new WeakMap<Scenario, number>()
let nextKey = 1
let nextId = 1
let nextWorker = 0

/** Tempo da última tarefa por tipo, para o painel de diagnóstico e os testes de desempenho. */
export const lastJobMs: Record<string, number> = {}

function worker(i: number): Worker {
  if (!workers[i]) {
    const w = new Worker(new URL('./field.worker.ts', import.meta.url), { type: 'module' })
    w.onmessage = (ev: MessageEvent<{ id: number; result?: FieldResult; erro?: string; ms?: number }>) => {
      const f = inflight.get(ev.data.id)
      if (!f) return
      inflight.delete(ev.data.id)
      f.slot.busy = false
      if (ev.data.result) {
        lastJobMs[f.req.job.tipo] = ev.data.ms ?? 0
        f.req.done(ev.data.result, f.req.version)
      }
      if (f.slot.pending) {
        const p = f.slot.pending
        f.slot.pending = null
        dispatch(f.slot, p)
      }
    }
    workers[i] = w
    known[i] = new Set()
  }
  return workers[i]
}

function keyOf(s: Scenario) {
  let k = scenarioKeys.get(s)
  if (!k) {
    k = nextKey++
    scenarioKeys.set(s, k)
  }
  return k
}

function dispatch(slot: Slot, req: Req) {
  slot.busy = true
  if (POOL === 0) {
    // Sem Worker (testes, navegadores antigos): calcula no próximo tique.
    setTimeout(() => {
      const r = compileScenario(req.scenario, req.ctx)
      slot.busy = false
      req.done(runJob(r, req.job), req.version)
      if (slot.pending) {
        const p = slot.pending
        slot.pending = null
        dispatch(slot, p)
      }
    }, 0)
    return
  }
  const w = worker(slot.worker)
  const key = keyOf(req.scenario)
  if (!known[slot.worker].has(key)) {
    w.postMessage({ type: 'cenario', key, scenario: req.scenario })
    known[slot.worker].add(key)
  }
  const id = nextId++
  inflight.set(id, { slot, req })
  w.postMessage({ type: 'job', id, key, ctx: req.ctx, ctxSig: req.ctxSig, job: req.job })
}

/**
 * Pede um campo ao worker. Por "fila" (slot), só existe uma tarefa em voo: se
 * outra chega enquanto ela calcula, fica como pendente e substitui qualquer
 * pendente anterior. Durante um arrasto, o resultado acompanha a mão sem fila.
 */
export function requestField(slotId: string, req: Omit<Req, 'version'>): number {
  let slot = slots.get(slotId)
  if (!slot) {
    slot = { version: 0, busy: false, pending: null, worker: POOL ? nextWorker++ % POOL : 0 }
    slots.set(slotId, slot)
  }
  const full: Req = { ...req, version: ++slot.version }
  if (slot.busy) slot.pending = full
  else dispatch(slot, full)
  return full.version
}

/**
 * `ctxSig` identifica o contexto (o worker reaproveita a compilação entre jobs
 * com o mesmo contexto); o job inteiro entra na dependência pelo JSON.
 */
export function useFieldJob(slotId: string, scenario: Scenario | null, ctx: JobCtx, ctxSig: string, job: FieldJob | null): FieldResult | null {
  const [res, setRes] = useState<FieldResult | null>(null)
  const jobSig = job ? JSON.stringify(job) : ''
  const shown = useRef(0)
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])
  useEffect(() => {
    if (!job || !scenario) {
      setRes(null)
      return
    }
    requestField(slotId, {
      scenario,
      ctx,
      ctxSig,
      job,
      done: (r, version) => {
        // resultados antigos ainda servem enquanto o novo não chega, mas nunca
        // substituem um mais recente
        if (!alive.current || version < shown.current) return
        shown.current = version
        setRes(r)
      },
    })
    // ctx é derivado de ctxSig e job de jobSig: as assinaturas são as dependências reais.
    // Camada desligada não acompanha o relógio: limpar o estado a cada quadro, dentro de
    // um efeito, vira um laço de atualizações síncronas.
  }, [slotId, scenario, job ? ctxSig : '', jobSig]) // eslint-disable-line react-hooks/exhaustive-deps
  return job ? res : null
}
