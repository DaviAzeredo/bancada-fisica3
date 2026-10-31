import { E_CHARGE, EPS0, K, M_ELECTRON, M_PROTON, MU0 } from '../physics/constants'
import { circuitAt, type CircuitParams } from '../physics/dynamics'
import {
  type Circle,
  circlePoints,
  circulation,
  enclosedCharge,
  enclosedCurrent,
  fluxParts,
  fluxPatch,
  fluxThrough,
  type GaussShape,
  type Patch,
} from '../physics/integrals'
import { type BSource, type ESource, type World, fieldB, fieldE, forceOnSegment, potentialV, radialCurrent, radialSource } from '../physics/sources'
import { type V3, basis, cross, dist, madd, norm, scale } from '../physics/vec'
import { type Env, ExprError, type Value, dependsOn, evalNum, evaluate, mathFns } from './expr'
import type { Objeto, Parametro, Scenario } from './schema'

/* ───────────────────────── entidades resolvidas ───────────────────────── */

export type Ent =
  | { tipo: 'carga'; id: string; rotulo?: string; arrastavel?: boolean; q: number; p: V3 }
  | { tipo: 'segmentoCarga'; id: string; rotulo?: string; lambda: number; a: V3; b: V3 }
  | {
      tipo: 'capacitorRadial'
      id: string
      rotulo?: string
      forma: 'esfera' | 'cilindro'
      c: V3
      n: V3
      a: number
      b: number
      L: number
      Q: number
      C: number
      camadas: { K: number; r0: number; r1: number }[]
      setores: { K: number; f: number }[]
    }
  | { tipo: 'anelCarga'; id: string; rotulo?: string; Q: number; pts: V3[]; closed: boolean }
  | { tipo: 'placa'; id: string; rotulo?: string; sigma: number; c: V3; u: V3; v: V3; hw: number; hh: number }
  | {
      tipo: 'capacitor'
      id: string
      rotulo?: string
      c: V3
      n: V3
      u: V3
      v: V3
      hw: number
      hh: number
      circular: boolean
      d: number
      Q: number
      C: number
      diels: { K: number; z0: number; z1: number; metal: boolean }[]
      /** Blocos lado a lado (em paralelo), com a fração da área de cada um. */
      lats: { K: number; f: number }[]
    }
  | { tipo: 'esfera'; id: string; rotulo?: string; arrastavel?: boolean; Q: number; c: V3; R: number; oca: boolean; Rin: number }
  | { tipo: 'linhaInfinita'; id: string; rotulo?: string; lambda: number; p: V3; d: V3 }
  | { tipo: 'cilindroInfinito'; id: string; rotulo?: string; lambda: number; p: V3; d: V3; R: number; oco: boolean; Rin: number }
  | { tipo: 'planoInfinito'; id: string; rotulo?: string; sigma: number; p: V3; n: V3 }
  | { tipo: 'campoE' | 'campoB'; id: string; rotulo?: string; uniforme: V3 | null; min?: V3; max?: V3 }
  /** `a` e `b` são os da física; `va` e `vb`, o trecho desenhado. */
  | { tipo: 'fio'; id: string; rotulo?: string; I: number; a: V3; b: V3; va: V3; vb: V3 }
  | { tipo: 'cilindroCorrente'; id: string; rotulo?: string; p: V3; d: V3; R: number; Rin: number; I: number }
  | { tipo: 'fioInfinito'; id: string; rotulo?: string; arrastavel?: boolean; I: number; p: V3; d: V3 }
  | {
      tipo: 'bobina'
      sub: 'espira' | 'solenoide' | 'toroide'
      id: string
      rotulo?: string
      arrastavel?: boolean
      I: number
      c: V3
      n: V3
      R: number
      /** Fio desenhado (hélice real, com no máximo ~80 voltas). */
      draw: V3[]
      seeds: V3[]
    }
  | { tipo: 'ima'; id: string; rotulo?: string; arrastavel?: boolean; c: V3; n: V3; L: number; R: number; M: number }
  | { tipo: 'particula'; id: string; rotulo?: string; q: number; m: number; p: V3; v: V3; rastro: number; parada?: string; cargaDeProva?: boolean }
  | { tipo: 'gaussiana'; id: string; rotulo?: string; arrastavel?: boolean; shape: GaussShape; campo: 'E' | 'B' }
  | { tipo: 'amperiana'; id: string; rotulo?: string; arrastavel?: boolean; circle: Circle }
  | { tipo: 'espiraSensora'; id: string; rotulo?: string; arrastavel?: boolean; patch: Patch; N: number; R: number; oculta: boolean }
  | { tipo: 'circuito'; id: string; rotulo?: string; c: V3; params: CircuitParams }
  | { tipo: 'condutor'; id: string; rotulo?: string; a: V3; b: V3; R: number; I: number }
  | { tipo: 'sonda'; id: string; rotulo?: string; arrastavel?: boolean; p: V3; campo: 'E' | 'B' }
  | { tipo: 'seta'; id: string; rotulo?: string; o: V3; vec: V3; comprimento?: number; papel: string }
  | { tipo: 'cota'; id: string; rotulo?: string; a: V3; b: V3; off: V3 }
  | { tipo: 'rotulo'; id: string; texto: string; p: V3 }
  | { tipo: 'caminho'; id: string; rotulo?: string; pts: V3[]; seta: number; tracejado: boolean }

export interface SimState {
  particles: Map<string, { p: V3; v: V3; trail: V3[]; parada?: boolean }>
  /** Variáveis de `dinamica`, por id. */
  vars: Record<string, number>
}

export interface Ctx {
  params: Record<string, number>
  t: number
  /** Posições arrastadas pelo aluno (SI), por id. */
  overrides: Record<string, V3>
  /** Cargas adicionadas pelo aluno no editor. */
  extras?: Objeto[]
  sim?: SimState
  /** Estado de `dinamica` sem a simulação inteira: é o que o worker recebe. */
  estado?: Record<string, number>
  /** Ids forçados a aparecer pelo passo atual (ignoram `ativo`). */
  mostrar?: string[]
  /** Orientações giradas pelo aluno (eixo/normal unitário), por id. */
  orient?: Record<string, V3>
  ocultar?: string[]
}

/** O que o aluno pode fazer com cada objeto. */
export interface Interativo {
  /** Arrasto livre (vira override de posição). */
  mover: boolean
  /** Arrasto que dirige um parâmetro ao longo de um eixo. */
  arraste?: { param: string; eixo: 'x' | 'y' | 'z'; fator: number }
  /** Tem eixo/normal que pode ser girado. */
  girar: boolean
}

export interface Resolved {
  interativos: Map<string, Interativo>
  world: World
  ents: Ent[]
  byId: Map<string, Ent>
  /** Fontes de cada objeto, para "campo de X sobre Y". */
  sourcesOf: Map<string, { e: ESource[]; b: BSource[] }>
  env: Env
  half: number
  timeDependent: boolean
  errors: string[]
}

/* ───────────────────────── ambiente base ───────────────────────── */

export const CONSTS: Record<string, number> = {
  pi: Math.PI,
  k0: K,
  eps0: EPS0,
  mu0: MU0,
  qe: E_CHARGE,
  me: M_ELECTRON,
  mp: M_PROTON,
  km: 1e3,
  cm: 1e-2,
  mm: 1e-3,
  um: 1e-6,
  nm: 1e-9,
  mC: 1e-3,
  uC: 1e-6,
  nC: 1e-9,
  pC: 1e-12,
  mA: 1e-3,
  uA: 1e-6,
  kV: 1e3,
  mV: 1e-3,
  uF: 1e-6,
  nF: 1e-9,
  pF: 1e-12,
  mH: 1e-3,
  uH: 1e-6,
  mT: 1e-3,
  uT: 1e-6,
  kohm: 1e3,
  Mohm: 1e6,
  ms: 1e-3,
  us: 1e-6,
  ns: 1e-9,
}

/** Caminho do primeiro número não finito (ignora funções e o rastro, que pode ser ∞). */
function naoFinito(v: unknown, path: string): string | null {
  if (typeof v === 'number') return Number.isFinite(v) ? null : path
  if (Array.isArray(v)) {
    for (let i = 0; i < v.length; i++) {
      const bad = naoFinito(v[i], `${path}[${i}]`)
      if (bad) return bad
    }
    return null
  }
  if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) {
      if (k === 'rastro' || typeof x === 'function') continue
      const bad = naoFinito(x, `${path}.${k}`)
      if (bad) return bad
    }
  }
  return null
}

function axisOf(a: unknown, env: Env): V3 {
  const n = axisRaw(a, env)
  if (!(Math.hypot(n[0], n[1], n[2]) > 0)) throw new ExprError('eixo nulo ou inválido')
  return n
}

function axisRaw(a: unknown, env: Env): V3 {
  if (a === 'x') return [1, 0, 0]
  if (a === 'y') return [0, 1, 0]
  if (a === 'z') return [0, 0, 1]
  if (typeof a === 'string') {
    // expressão que escolhe um eixo: "fonte==3 ? 'z' : 'y'"
    const v = evaluate(a, env)
    if (v === 'x' || v === 'y' || v === 'z') return axisRaw(v, env)
    if (Array.isArray(v)) return norm(v as V3)
    throw new ExprError(`"${a}" deveria ser um eixo ou vetor`)
  }
  return norm(vecOf(a as [string | number, string | number, string | number], env))
}

export function vecOf(v: string | readonly (string | number)[], env: Env): V3 {
  if (typeof v === 'string') {
    const r = evaluate(v, env)
    if (!Array.isArray(r)) throw new ExprError(`"${v}" deveria ser um vetor`)
    return r as V3
  }
  return [evalNum(v[0], env), evalNum(v[1], env), evalNum(v[2], env)]
}

/** Base do ângulo polar de um anel: com normal z, θ = 0 em x e θ = 90° em y. */
function polarBasis(n: V3): [V3, V3] {
  const nn = norm(n)
  const ref: V3 = Math.abs(nn[2]) > 0.9 ? [1, 0, 0] : Math.abs(nn[0]) > 0.9 ? [0, 1, 0] : [0, 0, 1]
  const u = norm(madd(ref, nn, -(ref[0] * nn[0] + ref[1] * nn[1] + ref[2] * nn[2])))
  return [u, cross(nn, u)]
}

function ringPts(c: V3, n: V3, R: number, segs: number, a0 = 0, a1 = 2 * Math.PI): V3[] {
  const [u, v] = polarBasis(n)
  const pts: V3[] = []
  const closed = Math.abs(a1 - a0 - 2 * Math.PI) < 1e-9
  const count = closed ? segs : segs + 1
  for (let i = 0; i < count; i++) {
    const a = a0 + ((a1 - a0) * i) / segs
    pts.push(madd(madd(c, u, R * Math.cos(a)), v, R * Math.sin(a)))
  }
  if (closed) pts.push(pts[0])
  return pts
}

/* ───────────────────────── compilação ───────────────────────── */

/** Vai e volta sem tranco: parte de `de` com velocidade zero. */
function varrido(p: Parametro, t: number) {
  const de = p.varre?.de ?? p.min ?? p.valor
  const ate = p.varre?.ate ?? p.max ?? p.valor
  return de + ((ate - de) * (1 - Math.cos((2 * Math.PI * t) / (p.varre?.periodo ?? 1)))) / 2
}

export function compileScenario(scn: Scenario, ctx: Ctx): Resolved {
  const vars: Record<string, Value> = { ...CONSTS, t: ctx.t, ...ctx.params }
  const env: Env = { vars, fns: { ...mathFns } }
  const world: World = { e: [], b: [] }
  const ents: Ent[] = []
  const byId = new Map<string, Ent>()
  const sourcesOf = new Map<string, { e: ESource[]; b: BSource[] }>()
  const errors: string[] = []
  const half = scn.cena.extensao * scn.cena.escala
  let timeDependent = scn.dinamica.length > 0
  const fluxos = new Map<string, number>()

  for (const d of scn.dinamica) vars[d.id] = ctx.estado?.[d.id] ?? ctx.sim?.vars[d.id] ?? evalNum(d.inicial, env)
  for (const p of scn.parametros) {
    if (!p.varre || (p.varre.ativo !== undefined && !evalNum(p.varre.ativo, env))) continue
    vars[p.id] = varrido(p, ctx.t)
    timeDependent = true
  }

  const push = (ent: Ent, e: ESource[] = [], b: BSource[] = []) => {
    // Nada não-finito chega à cena nem à física: 0/0 num raio vira erro listado
    // no painel, não um objeto quebrado no three.js.
    const bad = naoFinito(ent, ent.id) ?? naoFinito(e, `${ent.id}.fontes`) ?? naoFinito(b, `${ent.id}.fontes`)
    if (bad) throw new ExprError(`valor não finito em ${bad}`)
    ents.push(ent)
    byId.set(ent.id, ent)
    sourcesOf.set(ent.id, { e, b })
    world.e.push(...e)
    world.b.push(...b)
  }

  const objetos = [...scn.objetos, ...(ctx.extras ?? [])]
  const late: Objeto[] = []

  for (const o of objetos) {
    if (JSON.stringify(o).match(/\bt\b/) && dependsOnT(o)) timeDependent = true
    try {
      if (ctx.ocultar?.includes(o.id)) continue
      if (o.ativo !== undefined && !ctx.mostrar?.includes(o.id) && !evalNum(o.ativo, env)) continue
      if (o.tipo === 'seta' || o.tipo === 'cota' || o.tipo === 'rotulo' || o.tipo === 'sonda' || o.tipo === 'caminho') {
        late.push(o)
        continue
      }
      buildObject(o)
    } catch (err) {
      errors.push(`${o.id}: ${(err as Error).message}`)
    }
  }

  function P(o: Objeto, v: Parameters<typeof vecOf>[0]): V3 {
    return ctx.overrides[o.id] ?? vecOf(v, env)
  }

  /** Orientação girada pelo aluno, ou a do cenário. */
  function O(o: Objeto, a: unknown): V3 {
    return ctx.orient?.[o.id] ?? axisOf(a, env)
  }

  /** Esfera ou cilindro com ρ(r): a expressão `rho` vê `r` além dos parâmetros. */
  function radial(
    geo: 'esf' | 'cil',
    o: { raioInterno?: string | number; rho?: string },
    c: V3,
    d: V3,
    R: number,
    Qtot: number,
  ) {
    const Rin = o.raioInterno === undefined ? 0 : evalNum(o.raioInterno, env)
    if (!(Rin >= 0 && Rin < R)) throw new ExprError('raioInterno deve ficar entre 0 e o raio')
    let rho: (r: number) => number
    if (o.rho !== undefined) {
      const src = o.rho
      const local: Record<string, Value> = { ...vars }
      const fenv: Env = { vars: local, fns: env.fns }
      rho = (r) => {
        local.r = r
        return evalNum(src, fenv)
      }
    } else {
      const vol = geo === 'esf' ? (4 / 3) * Math.PI * (R ** 3 - Rin ** 3) : Math.PI * (R * R - Rin * Rin)
      const k = Qtot / vol
      rho = () => k
    }
    return radialSource(geo, c, d, Rin, R, rho)
  }

  /** Fonte ligada: a ddp é fixa, e a carga sai da capacitância. */
  function cargaDe(o: { V?: string | number; ligado: string | number; Q: string | number }, C: number) {
    return o.V !== undefined && evalNum(o.ligado, env) ? evalNum(o.V, env) * C : evalNum(o.Q, env)
  }

  function buildObject(o: Objeto) {
    const rot = o.rotulo
    switch (o.tipo) {
      case 'carga': {
        const p = P(o, o.pos)
        const q = evalNum(o.q, env)
        push({ tipo: 'carga', id: o.id, rotulo: rot, arrastavel: o.arrastavel, q, p }, [{ k: 'point', q, p }])
        break
      }
      case 'segmentoCarga': {
        const a = vecOf(o.a, env)
        const b = vecOf(o.b, env)
        const lambda = evalNum(o.lambda, env)
        push({ tipo: 'segmentoCarga', id: o.id, rotulo: rot, lambda, a, b }, [{ k: 'seg', lambda, a, b }])
        break
      }
      case 'anelCarga': {
        const c = P(o, o.centro)
        const n = O(o, o.normal)
        const R = evalNum(o.raio, env)
        const Q = evalNum(o.Q, env)
        const a0 = o.arco ? (evalNum(o.arco[0], env) * Math.PI) / 180 : 0
        const a1 = o.arco ? (evalNum(o.arco[1], env) * Math.PI) / 180 : 2 * Math.PI
        const pts = ringPts(c, n, R, 96, a0, a1)
        const e: ESource[] = []
        let Qtot = Q
        if (o.densidade !== undefined) {
          // λ(θ) constante em cada um dos 96 trechos, avaliada no meio do trecho
          const local: Record<string, Value> = { ...vars }
          const fenv: Env = { vars: local, fns: env.fns }
          const dth = (a1 - a0) / 96
          Qtot = 0
          for (let i = 0; i < pts.length - 1; i++) {
            local.theta = a0 + (i + 0.5) * dth
            const lam = evalNum(o.densidade, fenv)
            Qtot += lam * R * Math.abs(dth)
            e.push({ k: 'seg', lambda: lam, a: pts[i], b: pts[i + 1] })
          }
        } else {
          const lambda = Q / (R * Math.abs(a1 - a0))
          for (let i = 0; i < pts.length - 1; i++) e.push({ k: 'seg', lambda, a: pts[i], b: pts[i + 1] })
        }
        push({ tipo: 'anelCarga', id: o.id, rotulo: rot, Q: Qtot, pts, closed: !o.arco }, e)
        break
      }
      case 'placa': {
        const c = P(o, o.centro)
        const n = O(o, o.normal)
        const [u, v] = basis(n)
        const sigma = evalNum(o.sigma, env)
        const hw = evalNum(o.largura, env) / 2
        const hh = evalNum(o.altura, env) / 2
        push({ tipo: 'placa', id: o.id, rotulo: rot, sigma, c, u, v, hw, hh }, [{ k: 'rect', sigma, c, u, v, hw, hh }])
        break
      }
      case 'capacitor': {
        const c = P(o, o.centro)
        const n = O(o, o.eixo)
        const [u, v] = basis(n)
        const hw = evalNum(o.lado, env) / 2
        const hh = o.altura !== undefined ? evalNum(o.altura, env) / 2 : hw
        const d = evalNum(o.d, env)
        const A = o.circular ? Math.PI * hw * hw : 4 * hw * hh
        // em paralelo, E é o mesmo nos blocos e só a densidade livre muda: entre as
        // placas, vale a carga líquida (livre mais ligada), que é uniforme
        const lats = (o.lateral ?? []).map((l) => ({ K: evalNum(l.K, env), f: evalNum(l.fracao, env) }))
        const Kmed = lats.length ? lats.reduce((s, l) => s + l.f * l.K, 1 - lats.reduce((s, l) => s + l.f, 0)) : 1
        const mask = { u, v, hw, hh, circular: o.circular }
        const plate = (s: number, at: V3): ESource =>
          o.bordas ? { k: 'rect', sigma: s, c: at, u, v, hw, hh } : { k: 'iplane', sigma: s, p: at, n, mask }
        const diels: { K: number; z0: number; z1: number; metal: boolean }[] = []
        let gap = d
        for (const camada of o.dieletrico ? [o.dieletrico].flat() : []) {
          // metal como K enorme: as cargas induzidas cancelam o campo por dentro
          const Kd = camada.condutora ? 1e15 : evalNum(camada.K, env)
          const z0 = Math.max(0, evalNum(camada.inicio, env))
          const z1 = Math.min(d, evalNum(camada.fim, env))
          if (z1 > z0 && Kd > 0) {
            diels.push({ K: Kd, z0, z1, metal: camada.condutora })
            gap += (z1 - z0) / Kd - (z1 - z0)
          }
        }
        const C = (Kmed * EPS0 * A) / gap
        const Q = cargaDe(o, C)
        const sigma = Q / A / Kmed
        const e: ESource[] = [plate(sigma, madd(c, n, -d / 2)), plate(-sigma, madd(c, n, d / 2))]
        for (const m of diels) {
          const sb = sigma * (1 - 1 / m.K)
          if (Math.abs(sb) > 0) {
            e.push(plate(-sb, madd(c, n, -d / 2 + m.z0)))
            e.push(plate(sb, madd(c, n, -d / 2 + m.z1)))
          }
        }
        push({ tipo: 'capacitor', id: o.id, rotulo: rot, c, n, u, v, hw, hh, circular: o.circular, d, Q, C, diels, lats }, e)
        break
      }
      case 'capacitorRadial': {
        const c = P(o, o.centro)
        const n = O(o, o.eixo)
        const a = evalNum(o.a, env)
        const b = evalNum(o.b, env)
        if (!(a > 0 && b > a)) throw new ExprError(`${o.id}: exige 0 < a < b`)
        const L = evalNum(o.comprimento, env)
        const esf = o.forma === 'esfera'
        /** Inverso da capacitância de uma camada de vácuo entre dois raios. */
        const G = (r0: number, r1: number) => (esf ? (1 / r0 - 1 / r1) / (4 * Math.PI * EPS0) : Math.log(r1 / r0) / (2 * Math.PI * EPS0 * L))
        const casca = (q: number, R: number): ESource => (esf ? { k: 'shell', Q: q, c, R } : { k: 'icyl', lambda: q / L, p: c, d: n, R, shell: true })
        const setores = (o.setores ?? []).map((s) => ({ K: evalNum(s.K, env), f: evalNum(s.fracao, env) }))
        const Kmed = setores.length ? setores.reduce((s, x) => s + x.f * x.K, 1 - setores.reduce((s, x) => s + x.f, 0)) : 1
        const camadas: { K: number; r0: number; r1: number }[] = []
        let inverso = G(a, b)
        for (const m of o.dieletrico ?? []) {
          const K = evalNum(m.K, env)
          const r0 = Math.max(a, evalNum(m.inicio, env))
          const r1 = Math.min(b, evalNum(m.fim, env))
          if (r1 > r0 && K > 0) {
            camadas.push({ K, r0, r1 })
            inverso += G(r0, r1) * (1 / K - 1)
          }
        }
        const C = Kmed / inverso
        const Q = cargaDe(o, C)
        const e: ESource[] = [casca(Q / Kmed, a), casca(-Q / Kmed, b)]
        for (const m of camadas) {
          const ligada = Q * (1 - 1 / m.K)
          e.push(casca(-ligada, m.r0), casca(ligada, m.r1))
        }
        push({ tipo: 'capacitorRadial', id: o.id, rotulo: rot, forma: o.forma, c, n, a, b, L, Q, C, camadas, setores }, e)
        break
      }
      case 'esfera': {
        const c = P(o, o.centro)
        const R = evalNum(o.raio, env)
        if (o.rho !== undefined || o.raioInterno !== undefined) {
          const s = radial('esf', o, c, [0, 0, 1], R, evalNum(o.Q, env))
          push({ tipo: 'esfera', id: o.id, rotulo: rot, arrastavel: o.arrastavel, Q: s.Q, c, R, oca: false, Rin: s.Rin }, [s])
          break
        }
        const Q = evalNum(o.Q, env)
        push({ tipo: 'esfera', id: o.id, rotulo: rot, arrastavel: o.arrastavel, Q, c, R, oca: o.oca, Rin: o.oca ? R : 0 }, [
          { k: o.oca ? 'shell' : 'sphere', Q, c, R },
        ])
        break
      }
      case 'linhaInfinita': {
        const p = P(o, o.ponto)
        const d = O(o, o.direcao)
        const lambda = evalNum(o.lambda, env)
        push({ tipo: 'linhaInfinita', id: o.id, rotulo: rot, lambda, p, d }, [{ k: 'iline', lambda, p, d }])
        break
      }
      case 'cilindroInfinito': {
        const p = P(o, o.ponto)
        const d = O(o, o.direcao)
        const R = evalNum(o.raio, env)
        if (o.rho !== undefined || o.raioInterno !== undefined) {
          const s = radial('cil', o, p, d, R, evalNum(o.lambda, env))
          push({ tipo: 'cilindroInfinito', id: o.id, rotulo: rot, lambda: s.Q, p, d, R, oco: false, Rin: s.Rin }, [s])
          break
        }
        const lambda = evalNum(o.lambda, env)
        push({ tipo: 'cilindroInfinito', id: o.id, rotulo: rot, lambda, p, d, R, oco: o.oco, Rin: o.oco ? R : 0 }, [
          { k: 'icyl', lambda, p, d, R, shell: o.oco },
        ])
        break
      }
      case 'planoInfinito': {
        const p = P(o, o.ponto)
        const n = O(o, o.normal)
        const sigma = evalNum(o.sigma, env)
        push({ tipo: 'planoInfinito', id: o.id, rotulo: rot, sigma, p, n }, [{ k: 'iplane', sigma, p, n }])
        break
      }
      case 'campoE':
      case 'campoB': {
        const spatial = dependsOn(typeof o.valor === 'string' ? o.valor : o.valor.join(','), ['x', 'y', 'z'])
          || (Array.isArray(o.valor) && o.valor.some((c) => dependsOn(c, ['x', 'y', 'z'])))
        const region =
          o.tipo === 'campoB' && o.regiao ? { min: vecOf(o.regiao.min, env), max: vecOf(o.regiao.max, env) } : undefined
        if (spatial) {
          const local: Record<string, Value> = { ...vars }
          const fenv: Env = { vars: local, fns: env.fns }
          const f = (p: V3): V3 => {
            local.x = p[0]
            local.y = p[1]
            local.z = p[2]
            return vecOf(o.valor, fenv)
          }
          // avalia num ponto de prova: uma expressão que não dá vetor vira erro
          // listado aqui, e não uma falha no meio do cálculo das linhas
          f([half * 0.31, half * 0.17, half * 0.23])
          let v: ((p: V3) => number) | undefined
          if (o.tipo === 'campoE' && o.potencial !== undefined) {
            const src = o.potencial
            v = (p: V3) => {
              local.x = p[0]
              local.y = p[1]
              local.z = p[2]
              return evalNum(src, fenv)
            }
            v([half * 0.31, half * 0.17, half * 0.23])
          }
          if (o.tipo === 'campoE') push({ tipo: 'campoE', id: o.id, rotulo: rot, uniforme: null }, [{ k: 'fnE', f, v }])
          else push({ tipo: 'campoB', id: o.id, rotulo: rot, uniforme: null }, [], [{ k: 'fnB', f }])
        } else {
          const val = vecOf(o.valor, env)
          if (o.tipo === 'campoE') push({ tipo: 'campoE', id: o.id, rotulo: rot, uniforme: val }, [{ k: 'uniformE', E: val }])
          else
            push({ tipo: 'campoB', id: o.id, rotulo: rot, uniforme: val, ...region }, [], [
              { k: 'uniformB', B: val, ...region },
            ])
        }
        break
      }
      case 'fio': {
        const va = vecOf(o.a, env)
        const vb = vecOf(o.b, env)
        const I = evalNum(o.I, env)
        // 1 km contra escalas de centímetros: o erro relativo fica abaixo de 1e-8
        const u = norm([vb[0] - va[0], vb[1] - va[1], vb[2] - va[2]])
        const a = o.infinito === 'a' ? madd(vb, u, -1e3) : va
        const b = o.infinito === 'b' ? madd(va, u, 1e3) : vb
        push({ tipo: 'fio', id: o.id, rotulo: rot, I, a, b, va, vb }, [], [{ k: 'seg', I, a, b }])
        break
      }
      case 'cilindroCorrente': {
        const p = P(o, o.ponto)
        const d = norm(O(o, o.direcao))
        const R = evalNum(o.raio, env)
        const Rin = o.raioInterno === undefined ? 0 : evalNum(o.raioInterno, env)
        if (!(Rin >= 0 && Rin < R)) throw new ExprError('raioInterno deve ficar entre 0 e o raio')
        let J: (r: number) => number
        if (o.J !== undefined) {
          const src = o.J
          const local: Record<string, Value> = { ...vars }
          const fenv: Env = { vars: local, fns: env.fns }
          J = (r) => {
            local.r = r
            return evalNum(src, fenv)
          }
        } else {
          const k = evalNum(o.I, env) / (Math.PI * (R * R - Rin * Rin))
          J = () => k
        }
        const s = radialCurrent(p, d, Rin, R, J)
        push({ tipo: 'cilindroCorrente', id: o.id, rotulo: rot, p, d, R, Rin, I: s.I }, [], [s])
        break
      }
      case 'fioInfinito': {
        const p = P(o, o.ponto)
        const d = O(o, o.direcao)
        const I = evalNum(o.I, env)
        push({ tipo: 'fioInfinito', id: o.id, rotulo: rot, arrastavel: o.arrastavel, I, p, d }, [], [
          { k: 'iwire', I, p, d },
        ])
        break
      }
      case 'espira': {
        const c = P(o, o.centro)
        const n = O(o, o.normal)
        const R = evalNum(o.raio, env)
        const I = evalNum(o.I, env)
        const N = evalNum(o.N, env)
        const pts = ringPts(c, n, R, 72)
        const seeds = diskSeeds(c, n, R * 0.85, 10)
        push(
          { tipo: 'bobina', sub: 'espira', id: o.id, rotulo: rot, arrastavel: o.arrastavel, I, c, n, R, draw: pts, seeds },
          [],
          [{ k: 'ring', I: I * N, c, n, R }],
        )
        break
      }
      case 'solenoide': {
        const c = P(o, o.centro)
        const n = O(o, o.eixo)
        const R = evalNum(o.raio, env)
        const Lz = evalNum(o.comprimento, env)
        const N = Math.max(1, Math.round(evalNum(o.N, env)))
        const I = evalNum(o.I, env)
        const rings = Math.min(N, 120)
        const b: BSource[] = []
        for (let i = 0; i < rings; i++) {
          const z = -Lz / 2 + ((i + 0.5) * Lz) / rings
          b.push({ k: 'ring', I: (I * N) / rings, c: madd(c, n, z), n, R })
        }
        const turns = Math.min(N, 80)
        const [u, v] = basis(n)
        const draw: V3[] = []
        const steps = turns * 24
        for (let i = 0; i <= steps; i++) {
          const a = (i / 24) * 2 * Math.PI
          const z = -Lz / 2 + (i / steps) * Lz
          draw.push(madd(madd(madd(c, n, z), u, R * Math.cos(a)), v, R * Math.sin(a)))
        }
        const seeds = diskSeeds(c, n, R * 0.8, 6)
        push({ tipo: 'bobina', sub: 'solenoide', id: o.id, rotulo: rot, arrastavel: o.arrastavel, I, c, n, R, draw, seeds }, [], b)
        break
      }
      case 'toroide': {
        const c = P(o, o.centro)
        const n = O(o, o.eixo)
        const Rm = evalNum(o.raioMaior, env)
        const r = evalNum(o.raioMenor, env)
        const N = Math.max(1, Math.round(evalNum(o.N, env)))
        const I = evalNum(o.I, env)
        const [u, v] = basis(n)
        const loops = Math.min(N, 120)
        const b: BSource[] = []
        for (let i = 0; i < loops; i++) {
          const a = ((i + 0.5) / loops) * 2 * Math.PI
          const radial = madd(scale(u, Math.cos(a)), v, Math.sin(a))
          const tangent = madd(scale(u, -Math.sin(a)), v, Math.cos(a))
          b.push({ k: 'ring', I: (I * N) / loops, c: madd(c, radial, Rm), n: tangent, R: r })
        }
        const turns = Math.min(N, 80)
        const draw: V3[] = []
        const steps = turns * 16
        for (let i = 0; i <= steps; i++) {
          const a = (i / steps) * 2 * Math.PI
          const ph = (i / 16) * 2 * Math.PI
          const radial = madd(scale(u, Math.cos(a)), v, Math.sin(a))
          draw.push(madd(madd(c, radial, Rm + r * Math.cos(ph)), n, r * Math.sin(ph)))
        }
        const seeds: V3[] = []
        for (let i = 0; i < 3; i++) seeds.push(madd(c, u, Rm - r * 0.6 + i * r * 0.6))
        push({ tipo: 'bobina', sub: 'toroide', id: o.id, rotulo: rot, I, c, n, R: Rm, draw, seeds }, [], b)
        break
      }
      case 'ima': {
        const c = P(o, o.centro)
        const n = O(o, o.eixo)
        const L = evalNum(o.comprimento, env)
        const R = evalNum(o.raio, env)
        const M = evalNum(o.intensidade, env)
        const rings = 16
        const b: BSource[] = []
        for (let i = 0; i < rings; i++)
          b.push({ k: 'ring', I: M / rings, c: madd(c, n, -L / 2 + ((i + 0.5) * L) / rings), n, R })
        push({ tipo: 'ima', id: o.id, rotulo: rot, arrastavel: o.arrastavel, c, n, L, R, M }, [], b)
        break
      }
      case 'particula': {
        const st = ctx.sim?.particles.get(o.id)
        const p0 = vecOf(o.pos, env)
        const v0 = vecOf(o.v, env)
        push({
          tipo: 'particula',
          id: o.id,
          rotulo: rot,
          q: evalNum(o.q, env),
          m: evalNum(o.m, env),
          p: st?.p ?? p0,
          v: st?.v ?? v0,
          rastro: o.rastro !== undefined ? evalNum(o.rastro, env) : Infinity,
          parada: o.parada,
          cargaDeProva: o.cargaDeProva,
        })
        break
      }
      case 'gaussiana': {
        const c = P(o, o.centro)
        let shape: GaussShape
        if (o.forma === 'esfera') shape = { forma: 'esfera', c, R: evalNum(o.raio ?? 1, env) }
        else if (o.forma === 'cubo') shape = { forma: 'cubo', c, a: evalNum(o.lado ?? 1, env) }
        else
          shape = {
            forma: 'cilindro',
            c,
            eixo: O(o, o.eixo ?? 'z'),
            R: evalNum(o.raio ?? 1, env),
            H: evalNum(o.altura ?? 1, env),
          }
        push({ tipo: 'gaussiana', id: o.id, rotulo: rot, arrastavel: o.arrastavel, shape, campo: o.campo })
        break
      }
      case 'amperiana': {
        const c = P(o, o.centro)
        push({
          tipo: 'amperiana',
          id: o.id,
          rotulo: rot,
          arrastavel: o.arrastavel,
          circle: { c, n: O(o, o.normal), R: evalNum(o.raio, env) },
        })
        break
      }
      case 'espiraSensora': {
        const c = P(o, o.centro)
        const n = O(o, o.normal)
        let patch: Patch
        if (o.largura !== undefined && o.altura !== undefined) {
          let u = o.eixoU ? axisOf(o.eixoU, env) : basis(n)[0]
          u = norm(madd(u, n, -(u[0] * n[0] + u[1] * n[1] + u[2] * n[2])))
          const v = cross(n, u)
          patch = { forma: 'retangulo', c, u, v, hw: evalNum(o.largura, env) / 2, hh: evalNum(o.altura, env) / 2 }
        } else patch = { forma: 'disco', c, n, R: evalNum(o.raio ?? 1, env) }
        push({
          tipo: 'espiraSensora',
          id: o.id,
          rotulo: rot,
          arrastavel: o.arrastavel,
          patch,
          N: evalNum(o.N, env),
          R: evalNum(o.R, env),
          oculta: o.oculta,
        })
        break
      }
      case 'circuito': {
        push({
          tipo: 'circuito',
          id: o.id,
          rotulo: rot,
          c: vecOf(o.centro, env),
          params: {
            modelo: o.modelo,
            R: evalNum(o.R, env),
            C: evalNum(o.C, env),
            L: evalNum(o.L, env),
            fem: evalNum(o.fem, env),
            q0: evalNum(o.q0, env),
            I0: evalNum(o.I0, env),
          },
        })
        break
      }
      case 'condutor':
        push({
          tipo: 'condutor',
          id: o.id,
          rotulo: rot,
          a: vecOf(o.a, env),
          b: vecOf(o.b, env),
          R: evalNum(o.raio, env),
          I: evalNum(o.I, env),
        })
        break
      default:
        break
    }
  }

  /* ─────────── funções de medida, ligadas a este mundo ─────────── */

  const point = (args: Value[]): V3 => {
    if (args.length === 3) return [args[0] as number, args[1] as number, args[2] as number]
    if (Array.isArray(args[0])) return args[0] as V3
    if (typeof args[0] === 'string') return posOf(args[0])
    throw new ExprError('esperava um ponto: E(x,y,z), E(vetor) ou E(\'id\')')
  }
  const entOf = (id: Value) => {
    const e = byId.get(String(id))
    if (!e) throw new ExprError(`objeto "${String(id)}" não existe`)
    return e
  }
  const posOf = (id: string): V3 => {
    const e = entOf(id)
    switch (e.tipo) {
      case 'carga':
      case 'particula':
      case 'sonda':
        return e.p
      case 'esfera':
      case 'capacitor':
      case 'capacitorRadial':
      case 'bobina':
      case 'ima':
      case 'circuito':
        return e.c
      case 'gaussiana':
        return e.shape.c
      case 'amperiana':
        return e.circle.c
      case 'espiraSensora':
        return e.patch.c
      case 'fio':
      case 'condutor':
      case 'segmentoCarga':
        return scale(madd(e.a, e.b, 1), 0.5)
      case 'fioInfinito':
      case 'cilindroCorrente':
      case 'linhaInfinita':
      case 'cilindroInfinito':
      case 'planoInfinito':
        return e.p
      default:
        return [0, 0, 0]
    }
  }
  const without = (id: string): World => {
    const own = sourcesOf.get(id)
    if (!own) return world
    return { e: world.e.filter((s) => !own.e.includes(s)), b: world.b.filter((s) => !own.b.includes(s)) }
  }
  const only = (id: string): World => {
    const own = sourcesOf.get(id)
    if (!own) throw new ExprError(`objeto "${id}" não existe`)
    return own
  }
  const gauss = (id: Value) => {
    const e = entOf(id)
    if (e.tipo !== 'gaussiana') throw new ExprError(`"${String(id)}" não é uma superfície gaussiana`)
    return e
  }
  const sensor = (id: Value) => {
    const e = entOf(id)
    if (e.tipo !== 'espiraSensora') throw new ExprError(`"${String(id)}" não é uma espira sensora`)
    return e
  }
  const circ = (id: Value) => {
    const e = entOf(id)
    if (e.tipo !== 'circuito') throw new ExprError(`"${String(id)}" não é um circuito`)
    return circuitAt(e.params, ctx.t)
  }
  const cap = (id: Value) => {
    const e = entOf(id)
    if (e.tipo !== 'capacitor' && e.tipo !== 'capacitorRadial') throw new ExprError(`"${String(id)}" não é um capacitor`)
    return e
  }
  const path = (id: Value) => {
    const e = entOf(id)
    if (e.tipo !== 'caminho') throw new ExprError(`"${String(id)}" não é um caminho`)
    return e.pts
  }
  const amp = (id: Value) => {
    const e = entOf(id)
    if (e.tipo !== 'amperiana') throw new ExprError(`"${String(id)}" não é um caminho amperiano`)
    return e
  }
  const femCache = new Map<string, number>()
  const partesCache = new Map<string, { sai: number; entra: number }>()
  const partesDe = (id: Value) => {
    const g = gauss(id)
    let p = partesCache.get(g.id)
    if (!p) {
      p = fluxParts(g.shape, g.campo === 'E' ? (x) => fieldE(world, x) : (x) => fieldB(world, x))
      partesCache.set(g.id, p)
    }
    return p
  }
  const sensorFlux = (r: Resolved, id: string, campo: 'E' | 'B' = 'B') => {
    const s = r.byId.get(id)
    if (!s || s.tipo !== 'espiraSensora') return 0
    return fluxPatch(s.patch, (p) => (campo === 'E' ? fieldE(r.world, p) : fieldB(r.world, p)))
  }

  Object.assign(env.fns, {
    E: (...a: Value[]) => fieldE(world, point(a)),
    B: (...a: Value[]) => fieldB(world, point(a)),
    V: (...a: Value[]) => potentialV(world, point(a)),
    /** Campo de um objeto só: Ede('q1', ponto). */
    Ede: (id: Value, ...a: Value[]) => fieldE(only(String(id)), point(a)),
    Bde: (id: Value, ...a: Value[]) => fieldB(only(String(id)), point(a)),
    Vde: (id: Value, ...a: Value[]) => potentialV(only(String(id)), point(a)),
    pos: (id: Value) => posOf(String(id)),
    /** Extensão (máx − mín) do rastro de uma partícula numa coordenada. */
    rastroSpan: (id: Value, eixo: Value) => {
      const tr = ctx.sim?.particles.get(String(id))?.trail
      if (!tr || tr.length < 2) return 0
      const k = eixo === 'x' ? 0 : eixo === 'y' ? 1 : 2
      let lo = Infinity
      let hi = -Infinity
      for (const p of tr) {
        lo = Math.min(lo, p[k])
        hi = Math.max(hi, p[k])
      }
      return hi - lo
    },
    vel: (id: Value) => {
      const e = entOf(id)
      return e.tipo === 'particula' ? e.v : [0, 0, 0]
    },
    dist: (a: Value, b: Value) => dist(typeof a === 'string' ? posOf(a) : (a as V3), typeof b === 'string' ? posOf(b) : (b as V3)),
    /** Força de Coulomb sobre uma carga pontual, devida a todas as outras fontes. */
    F: (id: Value) => {
      const e = entOf(id)
      if (e.tipo !== 'carga') throw new ExprError(`F('${String(id)}'): só para cargas pontuais`)
      return scale(fieldE(without(e.id), e.p), e.q)
    },
    /** Força magnética I∫dl×B sobre um fio, devida a um objeto (ou a todos os outros). */
    forca: (alvo: Value, fonte?: Value) => {
      const e = entOf(alvo)
      if (e.tipo !== 'fio') throw new ExprError(`forca('${String(alvo)}'): o alvo deve ser um fio`)
      const w = fonte !== undefined ? only(String(fonte)) : without(e.id)
      return forceOnSegment((p) => fieldB(w, p), e.a, e.b, e.I)
    },
    fluxo: (id: Value) => {
      // várias medidas costumam partir do mesmo fluxo, e cada quadratura custa caro
      const salvo = fluxos.get(String(id))
      if (salvo !== undefined) return salvo
      const g = gauss(id)
      const v = fluxThrough(g.shape, g.campo === 'E' ? (p) => fieldE(world, p) : (p) => fieldB(world, p))
      fluxos.set(String(id), v)
      return v
    },
    /** Parcelas de `fluxo`: fluxo = fluxoSai - fluxoEntra. */
    fluxoSai: (id: Value) => partesDe(id).sai,
    fluxoEntra: (id: Value) => partesDe(id).entra,
    Qenc: (id: Value) => enclosedCharge(world.e, gauss(id).shape),
    /** Energia do campo, ∫ε₀E²/2 dV, em cascas centradas na origem: exige simetria esférica. */
    energiaCampo: () => {
      const N = 2400
      const a = Math.log(1e-5)
      const h = (Math.log(1e4) - a) / N
      let soma = 0
      for (let i = 0; i < N; i++) {
        const r = Math.exp(a + (i + 0.5) * h)
        const f = fieldE(world, [r, 0, 0])
        soma += 2 * Math.PI * EPS0 * (f[0] * f[0] + f[1] * f[1] + f[2] * f[2]) * r * r * r * h
      }
      return soma
    },
    /** Fluxo de E por uma superfície aberta (use uma espiraSensora como moldura). */
    fluxoE: (id: Value) => fluxPatch(sensor(id).patch, (p) => fieldE(world, p)),
    /** dΦ_E/dt: multiplicada por ε₀, é a corrente de deslocamento pela moldura. */
    dfluxoE: (id: Value) => {
      const s = sensor(id)
      if (!timeDependent) return 0
      const chave = `E:${s.id}`
      const hit = femCache.get(chave)
      if (hit !== undefined) return hit
      const h = timeStep(scn)
      const a = compileScenario(scn, { ...ctx, t: ctx.t + h })
      const b = compileScenario(scn, { ...ctx, t: ctx.t - h })
      const v = (sensorFlux(a, s.id, 'E') - sensorFlux(b, s.id, 'E')) / (2 * h)
      femCache.set(chave, v)
      return v
    },
    circ: (id: Value) => circulation(circlePoints(amp(id).circle, 720), (p) => fieldB(world, p)),
    Ienc: (id: Value) => enclosedCurrent(world.b, amp(id).circle),
    fluxoB: (id: Value) => {
      sensor(id)
      return sensorFlux(resolvedSelf, String(id))
    },
    fem: (id: Value) => {
      const s = sensor(id)
      if (!timeDependent) return 0
      const hit = femCache.get(s.id)
      if (hit !== undefined) return hit
      const h = timeStep(scn)
      const a = compileScenario(scn, { ...ctx, t: ctx.t + h })
      const b = compileScenario(scn, { ...ctx, t: ctx.t - h })
      const v = (-s.N * (sensorFlux(a, s.id) - sensorFlux(b, s.id))) / (2 * h)
      femCache.set(s.id, v)
      return v
    },
    Iind: (id: Value) => {
      const s = sensor(id)
      return (env.fns.fem(id) as number) / s.R
    },
    C: (id: Value) => cap(id).C,
    Q: (id: Value) => cap(id).Q,
    U: (id: Value) => {
      const c = cap(id)
      return (c.Q * c.Q) / (2 * c.C)
    },
    Vcap: (id: Value) => {
      const c = cap(id)
      return c.Q / c.C
    },
    /** Carga de um objeto: total (C), ou por metro (C/m) em linha e cilindro infinitos. */
    carga: (id: Value) => {
      const e = entOf(id)
      switch (e.tipo) {
        case 'carga':
          return e.q
        case 'anelCarga':
        case 'esfera':
        case 'capacitor':
          return e.Q
        case 'segmentoCarga':
          return e.lambda * dist(e.a, e.b)
        case 'linhaInfinita':
        case 'cilindroInfinito':
          return e.lambda
        case 'placa':
          return e.sigma * 4 * e.hw * e.hh
        default:
          throw new ExprError(`carga('${String(id)}'): o objeto não tem carga`)
      }
    },
    /** ∫E·dl e ∫B·dl ao longo de um caminho (32 pontos por trecho, regra do ponto médio). */
    intE: (id: Value) => lineIntegral(path(id), (p) => fieldE(world, p)),
    intB: (id: Value) => lineIntegral(path(id), (p) => fieldB(world, p)),
    q: (id: Value) => circ(id).q,
    I: (id: Value) => circ(id).I,
    UC: (id: Value) => circ(id).UC,
    UL: (id: Value) => circ(id).UL,
  })

  const interativos = new Map<string, Interativo>()
  const resolvedSelf: Resolved = { interativos, world, ents, byId, sourcesOf, env, half, timeDependent, errors }

  for (const o of late) {
    try {
      switch (o.tipo) {
        case 'sonda':
          push({ tipo: 'sonda', id: o.id, rotulo: o.rotulo, arrastavel: o.arrastavel, p: P(o, o.pos), campo: o.campo })
          break
        case 'seta': {
          const vec = vecOf(o.vetor, env)
          push({
            tipo: 'seta',
            id: o.id,
            rotulo: o.rotulo,
            o: vecOf(o.origem, env),
            vec,
            comprimento: o.comprimento !== undefined ? evalNum(o.comprimento, env) : undefined,
            papel: o.papel,
          })
          break
        }
        case 'cota':
          push({
            tipo: 'cota',
            id: o.id,
            rotulo: o.rotulo,
            a: vecOf(o.a, env),
            b: vecOf(o.b, env),
            off: o.deslocamento ? vecOf(o.deslocamento, env) : [0, 0, 0],
          })
          break
        case 'rotulo':
          push({ tipo: 'rotulo', id: o.id, texto: o.texto, p: vecOf(o.pos, env) })
          break
        case 'caminho':
          push({ tipo: 'caminho', id: o.id, rotulo: o.rotulo, pts: o.pontos.map((p) => vecOf(p, env)), seta: o.seta, tracejado: o.tracejado })
          break
      }
    } catch (err) {
      errors.push(`${o.id}: ${(err as Error).message}`)
    }
  }

  // depois dos objetos tardios (sondas), para que eles também entrem
  for (const o of objetos) {
    if (!byId.has(o.id)) continue
    const girar = 'normal' in o || 'eixo' in o || 'direcao' in o
    if (o.arrastavel || o.arraste) interativos.set(o.id, { mover: !!o.arrastavel, arraste: o.arraste, girar: girar && !!o.arrastavel })
  }
  return resolvedSelf
}

function lineIntegral(pts: V3[], F: (p: V3) => V3): number {
  let s = 0
  const m = 32
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]
    const d: V3 = [(pts[i + 1][0] - a[0]) / m, (pts[i + 1][1] - a[1]) / m, (pts[i + 1][2] - a[2]) / m]
    for (let k = 0; k < m; k++) {
      const f = F(madd(a, d, k + 0.5))
      s += f[0] * d[0] + f[1] * d[1] + f[2] * d[2]
    }
  }
  return s
}

function dependsOnT(o: Objeto): boolean {
  const walk = (v: unknown): boolean => {
    if (typeof v === 'string') return dependsOn(v, ['t'])
    if (Array.isArray(v)) return v.some(walk)
    if (v && typeof v === 'object') return Object.entries(v).some(([k, x]) => k !== 'id' && k !== 'rotulo' && walk(x))
    return false
  }
  return walk(o)
}

export function timeStep(scn: Scenario): number {
  return scn.cena.tempo?.passo ?? (scn.cena.tempo?.escala ?? 1) / 600
}

function diskSeeds(c: V3, n: V3, R: number, count: number): V3[] {
  const [u] = basis(n)
  const out: V3[] = [c]
  for (let i = 1; i < count; i++) out.push(madd(c, u, (R * i) / (count - 1)))
  for (let i = 1; i < count; i++) out.push(madd(c, u, -(R * i) / (count - 1)))
  return out
}
