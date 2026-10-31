import { create } from 'zustand'
import type { V3 } from './physics/vec'
import { type SimState, compileScenario } from './scenario/compile'
import type { Objeto, Scenario, Visual } from './scenario/schema'
import { createSim, stepSim } from './scenario/sim'

export type Layer = 'linhasE' | 'linhasB' | 'setasE' | 'setasB' | 'planoV' | 'equipotenciais' | 'limalha'

export interface RunState {
  scenario: Scenario | null
  params: Record<string, number>
  /** Posições arrastadas pelo aluno (SI), por id. */
  overrides: Record<string, V3>
  /** Orientações giradas pelo aluno (vetor unitário do eixo/normal), por id. */
  orient: Record<string, V3>
  extras: Objeto[]
  t: number
  /** Maior t já simulado: limite da linha do tempo. */
  tMax: number
  playing: boolean
  speed: number
  step: number
  /** Resposta dada à previsão de cada passo (índice da opção). */
  previsoes: Record<number, number>
  layers: Record<Layer, boolean>
  /** Sonda que segue o cursor sobre o plano da cena. */
  sondaLivre: boolean
  selected: string | null
  dragging: boolean
  /** Incrementa a cada quadro simulado: força o recálculo das medidas. */
  tick: number
  /** Incrementa quando o aluno pede para reenquadrar a câmera. */
  frameReq: number
  load: (s: Scenario) => void
  setParam: (id: string, v: number) => void
  /** Passa ao aluno um parâmetro em varredura, no valor em que ele está agora. */
  assumir: (id: string) => void
  setOverride: (id: string, p: V3) => void
  setOrient: (id: string, n: V3) => void
  setStep: (i: number) => void
  answerPrevisao: (step: number, opcao: number) => void
  toggleLayer: (l: Layer) => void
  toggleSonda: () => void
  setPlaying: (p: boolean) => void
  setSpeed: (s: number) => void
  resetSim: () => void
  resetAll: () => void
  advance: (t: number) => void
  select: (id: string | null) => void
  setDragging: (d: boolean) => void
  addCharge: (q: number) => void
  addTestCharge: (pos?: V3) => void
  clearTestCharges: () => void
  addProbe: (pos: V3, campo: 'E' | 'B') => void
  removeExtra: (id: string) => void
  requestFrame: () => void
  /** Volta ou avança a simulação até `t`, re-simulando desde 0 (é determinística). */
  scrubTo: (t: number) => void
}

/** Ids escondidos no passo atual: os do passo e os da previsão ainda não respondida. */
export function ocultosDoPasso(s: Scenario | null, step: number, previsoes: Record<number, number>): string[] | undefined {
  const passo = s && step >= 0 ? s.passos[step] : undefined
  if (!passo) return undefined
  const pendente = passo.previsao && previsoes[step] === undefined ? (passo.previsao.oculta ?? []) : []
  const all = [...(passo.ocultar ?? []), ...pendente]
  return all.length ? all : undefined
}

/** Estado das partículas fica fora do React: muda a cada subpasso. */
export const simRef: { current: SimState } = { current: createSim() }

const defaultsOf = (s: Scenario) => Object.fromEntries(s.parametros.map((p) => [p.id, p.valor]))

export const layersFrom = (v: Visual): Record<Layer, boolean> => ({
  linhasE: !!v.linhasE,
  linhasB: !!v.linhasB,
  setasE: !!v.setasE,
  setasB: !!v.setasB,
  planoV: !!v.planoV,
  equipotenciais: !!v.equipotenciais,
  limalha: !!v.limalha,
})

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Cena com estado: mudar um parâmetro muda a condição inicial, e ela recomeça. */
const temEstado = (s: Scenario | null, extras: Objeto[] = []) =>
  !!s && (s.dinamica.length > 0 || s.objetos.some((o) => o.tipo === 'particula') || extras.some((o) => o.tipo === 'particula'))

export const MAX_CARGAS_PROVA = 8

/** Sem relógio próprio, ou com `ateParar`, o tempo só corre enquanto alguma carga de prova anda. */
export function fimDasProvas({ scenario, extras }: Pick<RunState, 'scenario' | 'extras'>) {
  const tempo = scenario?.cena.tempo
  if (tempo && !tempo.ateParar) return false
  const { particles } = simRef.current
  const dele = tempo ? (scenario?.objetos ?? []).filter((o) => o.tipo === 'particula' && o.cargaDeProva && particles.has(o.id)) : []
  const provas = [...dele, ...extras.filter((e) => e.tipo === 'particula')]
  return provas.length > 0 && provas.every((e) => particles.get(e.id)?.parada)
}

let tween = 0
const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - 2 ** (-10 * x))
let extraSeq = 0
const extraId = (p: string) => `${p}${Date.now().toString(36)}${++extraSeq}`

export const useRun = create<RunState>((set, get) => ({
  scenario: null,
  params: {},
  overrides: {},
  orient: {},
  extras: [],
  t: 0,
  tMax: 0,
  playing: false,
  speed: 1,
  step: -1,
  previsoes: {},
  layers: layersFrom({}),
  sondaLivre: false,
  selected: null,
  dragging: false,
  tick: 0,
  frameReq: 0,
  load: (s) => {
    tween++
    simRef.current = createSim()
    const passo = s.passos.length ? 0 : -1
    set({
      scenario: s,
      params: { ...defaultsOf(s), ...(passo >= 0 ? s.passos[0].parametros : {}) },
      overrides: {},
      orient: {},
      extras: [],
      t: 0,
      tMax: 0,
      playing: !!s.cena.tempo && !prefersReducedMotion(),
      speed: 1,
      step: passo,
      previsoes: {},
      layers: layersFrom({ ...s.visual, ...(passo >= 0 ? s.passos[0].visual : {}) }),
      sondaLivre: false,
      selected: null,
      tick: 0,
    })
  },
  setParam: (id, v) => {
    // mexer num parâmetro em varredura passa o controle dele para o aluno
    const solta = get().scenario?.parametros.find((p) => p.id === id)?.varre && get().params.auto === 1
    set((st) => ({ params: { ...st.params, ...(solta ? { auto: 0 } : {}), [id]: v } }))
    if (temEstado(get().scenario, get().extras)) get().resetSim()
  },
  assumir: (id) => {
    const { scenario, params, t, overrides, orient, extras, setParam } = get()
    if (!scenario?.parametros.find((p) => p.id === id)?.varre || params.auto !== 1) return
    const v = compileScenario(scenario, { params, t, overrides, orient, extras, sim: simRef.current }).env.vars[id]
    if (typeof v === 'number') setParam(id, v)
  },
  setOverride: (id, p) => set((st) => ({ overrides: { ...st.overrides, [id]: p } })),
  setOrient: (id, n) => set((st) => ({ orient: { ...st.orient, [id]: n } })),
  setStep: (i) => {
    const s = get().scenario
    if (!s || i < 0 || i >= s.passos.length) return
    const passo = s.passos[i]
    const id = ++tween
    set((st) => ({
      step: i,
      layers: passo.visual ? { ...st.layers, ...layersFrom({ ...s.visual, ...passo.visual }) } : st.layers,
    }))
    const target = passo.parametros ?? {}
    // Parâmetros contínuos deslizam até o valor do passo (o aluno vê a causa
    // virar efeito); opções discretas trocam na hora.
    const from = { ...get().params }
    const discrete: Record<string, number> = {}
    const cont: [string, number, number][] = []
    for (const [k, v] of Object.entries(target)) {
      const def = s.parametros.find((p) => p.id === k)
      if (!def || def.opcoes || prefersReducedMotion() || from[k] === undefined) discrete[k] = v
      else if (from[k] !== v) cont.push([k, from[k], v])
    }
    set((st) => ({ params: { ...st.params, ...discrete } }))
    const finish = () => {
      if (Object.keys(target).length && temEstado(s, get().extras)) get().resetSim()
    }
    if (!cont.length) return finish()
    const t0 = performance.now()
    const frame = () => {
      if (id !== tween) return
      const x = easeOutExpo(Math.min(1, (performance.now() - t0) / 600))
      set((st) => ({ params: { ...st.params, ...Object.fromEntries(cont.map(([k, a, b]) => [k, a + (b - a) * x])) } }))
      if (x < 1) requestAnimationFrame(frame)
      else finish()
    }
    requestAnimationFrame(frame)
  },
  answerPrevisao: (step, opcao) => set((st) => ({ previsoes: { ...st.previsoes, [step]: opcao } })),
  toggleLayer: (l) => set((st) => ({ layers: { ...st.layers, [l]: !st.layers[l] } })),
  toggleSonda: () => set((st) => ({ sondaLivre: !st.sondaLivre })),
  setPlaying: (p) => {
    // como um vídeo que acabou: dar play recomeça
    if (p && fimDasProvas(get())) get().resetSim()
    set({ playing: p })
  },
  setSpeed: (s) => set({ speed: s }),
  resetSim: () => {
    const fim = fimDasProvas(get())
    simRef.current = createSim()
    set((st) => ({ t: 0, tick: st.tick + 1, playing: st.playing || fim }))
  },
  resetAll: () => {
    const s = get().scenario
    if (s) get().load(s)
  },
  advance: (t) => set((st) => ({ t, tMax: Math.max(st.tMax, t), tick: st.tick + 1 })),
  select: (id) => set({ selected: id }),
  setDragging: (d) => {
    set({ dragging: d })
    // mexer numa fonte depois do fim muda a resposta: a carga corre de novo
    if (!d && fimDasProvas(get())) get().resetSim()
  },
  addCharge: (q) =>
    set((st) => {
      const n = st.extras.filter((e) => e.tipo === 'carga').length + 1
      const half = st.scenario ? st.scenario.cena.extensao * st.scenario.cena.escala : 1
      const a = n * 2.399
      const id = extraId('carga')
      const pos: [number, number, number] = [Math.cos(a) * half * 0.35, 0, Math.sin(a) * half * 0.35]
      const base = st.scenario?.objetos.filter((o) => o.tipo === 'carga').length ?? 0
      return { extras: [...st.extras, { id, tipo: 'carga', q, pos, arrastavel: true, rotulo: `q${n + base}` }], selected: id }
    }),
  addTestCharge: (pos) =>
    set((st) => {
      const n = st.extras.filter((e) => e.tipo === 'particula').length
      if (n >= MAX_CARGAS_PROVA) return st
      const half = st.scenario ? st.scenario.cena.extensao * st.scenario.cena.escala : 1
      const id = extraId('prova')
      // cada uma sai de um ponto: do mesmo lugar, fariam todas o mesmo caminho
      const a = n * 2.399
      const p: [number, number, number] = pos ? [pos[0], pos[1], pos[2]] : [Math.sin(a) * half * 0.45, half * 0.1, Math.cos(a) * half * 0.45]
      // carga de prova leve: 0,1 nC e 0,1 mg, para mover-se em décimos de segundo
      const particula: Objeto = { id, tipo: 'particula', q: 1e-10, m: 1e-7, pos: p, v: [0, 0, 0], rotulo: 'carga de prova', cargaDeProva: true }
      return { extras: [...st.extras, particula], playing: true }
    }),
  clearTestCharges: () =>
    set((st) => {
      for (const e of st.extras) if (e.tipo === 'particula') simRef.current.particles.delete(e.id)
      return { extras: st.extras.filter((e) => e.tipo !== 'particula'), tick: st.tick + 1, ...(st.scenario?.cena.tempo ? {} : { t: 0, tMax: 0, playing: false }) }
    }),
  addProbe: (pos, campo) =>
    set((st) => {
      const id = extraId('sonda')
      const n = st.extras.filter((e) => e.tipo === 'sonda').length + 1
      const sonda: Objeto = { id, tipo: 'sonda', campo, pos: [pos[0], pos[1], pos[2]], arrastavel: true, rotulo: `S${n}` }
      return { extras: [...st.extras, sonda], selected: id }
    }),
  removeExtra: (id) => set((st) => ({ extras: st.extras.filter((e) => e.id !== id), selected: null })),
  requestFrame: () => set((st) => ({ frameReq: st.frameReq + 1 })),
  scrubTo: (target) => {
    const st = get()
    const s = st.scenario
    if (!s) return
    simRef.current = createSim()
    const ctx = { params: st.params, t: 0, overrides: st.overrides, orient: st.orient, extras: st.extras }
    let t = 0
    // em fatias, para não recompilar o cenário a cada subpasso
    const chunk = Math.max(target / 200, 1e-30)
    while (t < target - chunk * 1e-6) t = stepSim(s, { ...ctx, t }, simRef.current, Math.min(chunk, target - t))
    set((x) => ({ playing: false, t: target, tick: x.tick + 1 }))
  },
}))
