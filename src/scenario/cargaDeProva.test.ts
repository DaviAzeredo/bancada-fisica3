import { beforeEach, describe, expect, it } from 'vitest'
import { dist } from '../physics/vec'
import { MAX_CARGAS_PROVA, fimDasProvas, simRef, useRun } from '../store'
import { type Objeto, Scenario } from './schema'
import { createSim, stepSim } from './sim'

/** Cena sem relógio próprio: é o caso em que a carga de prova traz o tempo. */
const coulomb = Scenario.parse({
  id: 'duas',
  titulo: 'Duas cargas',
  cena: { escala: 0.01, extensao: 12, unidade: 'cm' },
  parametros: [
    { id: 'q1', rotulo: 'q₁', valor: 2e-9 },
    { id: 'q2', rotulo: 'q₂', valor: 1e-9 },
  ],
  objetos: [
    { id: 'q1', tipo: 'carga', q: 'q1', pos: [-0.04, 0, 0] },
    { id: 'q2', tipo: 'carga', q: 'q2', pos: [0.04, 0, 0] },
  ],
})
const params = Object.fromEntries(coulomb.parametros.map((p) => [p.id, p.valor]))
const half = coulomb.cena.extensao * coulomb.cena.escala

const prova = (extra: Partial<Objeto> = {}) =>
  ({ id: 'p', tipo: 'particula', q: 1e-10, m: 1e-7, pos: [0, 0.012, 0.054], v: [0, 0, 0], cargaDeProva: true, ...extra }) as Objeto
const fonte = (q: number, pos: number[]) => ({ id: 'f', tipo: 'carga', q, pos }) as Objeto

/** Roda `segundos` de simulação em quadros de `dt` e devolve o estado de cada quadro. */
function roda(extras: Objeto[], segundos: number, dt = 1 / 60) {
  const sim = createSim()
  const estados = []
  let t = 0
  for (let i = 0; i < segundos / dt; i++) {
    t = stepSim(coulomb, { params, t, overrides: {}, extras }, sim, dt)
    estados.push(sim.particles.get('p'))
  }
  return estados
}

describe('carga de prova na simulação', () => {
  it('sai da cena e acaba ali, com o rastro inteiro, sem recomeçar', () => {
    const estados = roda([prova()], 5)
    const fim = estados.at(-1)!
    expect(fim.parada).toBe(true)
    expect(new Set(estados).size).toBe(1)
    expect(fim.trail.length).toBeGreaterThan(50)
    expect(Math.max(...fim.p.map(Math.abs))).toBeGreaterThan(half)
  })

  it('não muda a partícula de uma questão: ela segue em laço', () => {
    const estados = roda([prova({ cargaDeProva: undefined } as Partial<Objeto>)], 5)
    expect(new Set(estados).size).toBeGreaterThan(3)
    expect(estados.at(-1)?.parada).toBeUndefined()
  })

  it('atraída por uma fonte negativa, acaba nela em vez de ser ejetada', () => {
    const f = [0, 0.012, 0.03]
    const estados = roda([fonte(-2e-9, f), prova()], 5)
    const fim = estados.at(-1)!
    expect(fim.parada).toBe(true)
    expect(dist(fim.p, f as [number, number, number])).toBeLessThan(half * 0.2)
    expect(Math.max(...fim.p.map(Math.abs))).toBeLessThan(half)
  })

  it('não atravessa a fonte mesmo com o passo maior que o raio de contato', () => {
    // velocidade 4×: quadros de 0,2 s, com a carga chegando a metros por segundo
    const f = [0, 0.012, 0.03]
    const fim = roda([fonte(-2e-9, f), prova()], 5, 0.2).at(-1)!
    expect(fim.parada).toBe(true)
    expect(dist(fim.p, f as [number, number, number])).toBeLessThan(half * 0.2)
  })

  it('solta dentro do raio de contato de uma fonte de mesmo sinal, é repelida e não acaba nela', () => {
    const fim = roda([fonte(2e-9, [0, 0.012, 0.051]), prova()], 1).at(-1)!
    expect(fim.trail.length).toBeGreaterThan(3)
    expect(Math.max(...fim.p.map(Math.abs))).toBeGreaterThan(half)
  })
})

describe('cargas de prova na bancada', () => {
  beforeEach(() => useRun.getState().load(coulomb))
  const provas = () => useRun.getState().extras.filter((e) => e.tipo === 'particula')
  const roda = (segundos: number) => {
    const st = useRun.getState()
    let t = st.t
    for (let i = 0; i < segundos * 60; i++) t = stepSim(coulomb, { params: st.params, t, overrides: {}, extras: st.extras }, simRef.current, 1 / 60)
    useRun.getState().advance(t)
  }

  it('tem um teto, por mais que se clique', () => {
    const { addTestCharge } = useRun.getState()
    for (let i = 0; i < 50; i++) addTestCharge()
    expect(provas()).toHaveLength(MAX_CARGAS_PROVA)
  })

  it('cada carga sai de um ponto diferente, dentro da cena', () => {
    const { addTestCharge } = useRun.getState()
    for (let i = 0; i < MAX_CARGAS_PROVA; i++) addTestCharge()
    const pontos = provas().map((e) => (e as Extract<Objeto, { tipo: 'particula' }>).pos as [number, number, number])
    expect(new Set(pontos.map(String)).size).toBe(MAX_CARGAS_PROVA)
    for (const p of pontos) expect(Math.max(...p.map(Math.abs))).toBeLessThan(half)
  })

  it('o relógio para quando todas acabam, e dar play recomeça', () => {
    const st = useRun.getState()
    st.addTestCharge()
    expect(fimDasProvas(useRun.getState())).toBe(false)
    roda(5)
    expect(fimDasProvas(useRun.getState())).toBe(true)
    useRun.getState().setPlaying(false)
    useRun.getState().setPlaying(true)
    expect(useRun.getState().t).toBe(0)
    expect(useRun.getState().playing).toBe(true)
    expect(fimDasProvas(useRun.getState())).toBe(false)
  })

  it('recomeçar depois do fim volta a andar sozinho', () => {
    useRun.getState().addTestCharge()
    roda(5)
    useRun.getState().setPlaying(false)
    useRun.getState().resetSim()
    expect(useRun.getState().playing).toBe(true)
  })

  it('limpar tira as cargas de prova, mas não as fontes que o aluno pôs', () => {
    const st = useRun.getState()
    st.addCharge(2e-9)
    st.addTestCharge()
    roda(1)
    useRun.getState().clearTestCharges()
    const fim = useRun.getState()
    expect(provas()).toHaveLength(0)
    expect(fim.extras).toHaveLength(1)
    expect(simRef.current.particles.size).toBe(0)
    expect({ t: fim.t, tMax: fim.tMax, playing: fim.playing }).toEqual({ t: 0, tMax: 0, playing: false })
  })

  it('depois de limpar, a conta recomeça', () => {
    const { addTestCharge, clearTestCharges } = useRun.getState()
    for (let i = 0; i < MAX_CARGAS_PROVA; i++) addTestCharge()
    clearTestCharges()
    useRun.getState().addTestCharge()
    expect(provas()).toHaveLength(1)
  })
})
