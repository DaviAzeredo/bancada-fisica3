import { describe, expect, it } from 'vitest'
import { type Ctx, compileScenario } from '../../scenario/compile'
import { evalNum } from '../../scenario/expr'
import { Scenario } from '../../scenario/schema'
import { createSim, stepSim } from '../../scenario/sim'
import { fimDasProvas, simRef, useRun } from '../../store'
import { LABS } from './index'

const cena = (id: string) => Scenario.parse(LABS.find((l) => l.cenario.id === id)!.cenario)
const padroes = (s: Scenario) => Object.fromEntries(s.parametros.map((p) => [p.id, p.valor]))
const com = (s: Scenario, mudancas: Record<string, number>): Record<string, number> => ({ ...padroes(s), ...mudancas })

function modos(s: Scenario) {
  let out = [padroes(s)]
  for (const p of s.parametros.filter((p) => p.opcoes && p.id !== 'auto' && !/^(ext|terra|ligacao|tipoE|n|ligada)$/.test(p.id))) out = out.flatMap((v) => p.opcoes!.map((o) => ({ ...v, [p.id]: o.valor })))
  return out
}

/** Roda em quadros de 1/60 s, com o relógio de cada cena, e devolve o valor a cada quadro. */
function roda(s: Scenario, params: Record<string, number>, segundos: number, medir?: (env: ReturnType<typeof compileScenario>['env'], sim: Ctx['sim']) => number) {
  const sim = createSim()
  const escala = s.cena.tempo!.escala
  const valores: number[] = []
  let t = 0
  for (let i = 0; i < segundos * 60; i++) {
    t = stepSim(s, { params, t, overrides: {} }, sim, escala / 60)
    if (medir) valores.push(medir(compileScenario(s, { params, t, overrides: {}, sim }).env, sim))
  }
  return { sim, t, valores }
}

/** O que dá para ver e ler: posições, formas e medidas. */
function retrato(s: Scenario, params: Record<string, number>, t: number, sim: Ctx['sim']) {
  const r = compileScenario(s, { params, t, overrides: {}, sim })
  const medidas = s.medidas.filter((m) => m.ativo === undefined || evalNum(m.ativo, r.env)).map((m) => evalNum(m.expr, r.env))
  return JSON.stringify([r.ents.filter((e) => e.tipo !== 'campoE' && e.tipo !== 'campoB'), medidas])
}

/** Períodos entre cruzamentos de zero no mesmo sentido, com interpolação. */
function periodo(valores: number[], dt: number) {
  const cruzamentos: number[] = []
  for (let i = 1; i < valores.length; i++)
    if (valores[i - 1] < 0 && valores[i] >= 0) cruzamentos.push((i - 1 + -valores[i - 1] / (valores[i] - valores[i - 1])) * dt)
  return (cruzamentos[cruzamentos.length - 1] - cruzamentos[0]) / (cruzamentos.length - 1)
}

describe('todo laboratório é uma simulação ao vivo', () => {
  for (const lab of LABS) {
    const s = Scenario.parse(lab.cenario)
    it(`${lab.numero} ${s.titulo}: abre andando, em todos os modos`, () => {
      expect(s.cena.tempo, 'sem relógio, o lab abre parado').toBeDefined()
      for (const params of modos(s)) {
        const { sim, t } = roda(s, params, 1.5)
        const antes = retrato(s, params, t, sim)
        const { sim: sim2, t: t2 } = roda(s, params, 0.5)
        expect(retrato(s, params, t2, sim2), JSON.stringify(params)).not.toBe(antes)
      }
    })
  }

  it('o marcador dos gráficos é avaliável em todos os modos', () => {
    for (const lab of LABS) {
      const s = Scenario.parse(lab.cenario)
      for (const params of modos(s)) {
        const { sim, t } = roda(s, params, 0.2)
        const r = compileScenario(s, { params, t, overrides: {}, sim })
        for (const g of s.graficos) {
          if (g.x?.marca === undefined || (g.ativo !== undefined && !evalNum(g.ativo, r.env))) continue
          expect(Number.isFinite(evalNum(g.x.marca, r.env)), `${s.id}: ${g.titulo}`).toBe(true)
        }
      }
    }
  })
})

describe('varredura', () => {
  const s = cena('ampereJ')

  it('leva o parâmetro de ponta a ponta, e o valor guardado fica intacto', () => {
    const params = padroes(s)
    const em = (t: number) => compileScenario(s, { params, t, overrides: {} }).env.vars.ra
    expect(em(0)).toBeCloseTo(0.004, 9)
    expect(em(6)).toBeCloseTo(0.09, 9)
    expect(em(12)).toBeCloseTo(0.004, 9)
    expect(params.ra).toBe(0.03)
  })

  it('no manual, vale o slider', () => {
    const params = com(s, { auto: 0 })
    expect(compileScenario(s, { params, t: 3, overrides: {} }).env.vars.ra).toBe(0.03)
  })

  it('mexer no slider passa para o manual', () => {
    useRun.getState().load(s)
    useRun.getState().setParam('ra', 0.05)
    expect(useRun.getState().params).toMatchObject({ ra: 0.05, auto: 0 })
  })

  it('mexer em outro parâmetro não desliga o movimento', () => {
    useRun.getState().load(s)
    useRun.getState().setParam('Ic', 60)
    expect(useRun.getState().params.auto).toBe(1)
  })
})

describe('dinâmica', () => {
  it('dipolo: período das pequenas oscilações, 2π√(md/2qE)', () => {
    const s = cena('dipolo')
    const params = com(s, { modo: 2, th: 5, amort: 0 })
    const { valores } = roda(s, params, 12, (env) => evalNum('ang', env))
    const teoria = 2 * Math.PI * Math.sqrt((3e-5 * params.d) / (2 * params.q * params.E0))
    expect(periodo(valores, 1 / 60)).toBeCloseTo(teoria, 1)
    expect(Math.abs(periodo(valores, 1 / 60) / teoria - 1)).toBeLessThan(0.01)
  })

  it('dipolo sem atrito: K + U não deriva, mesmo em grande amplitude', () => {
    const s = cena('dipolo')
    const params = com(s, { modo: 2, th: 150, amort: 0 })
    const total = (env: Parameters<typeof evalNum>[1]) => evalNum('3e-5*d^2/4*om^2 - q*d*E0*cos(ang)', env)
    const { valores } = roda(s, params, 20, total)
    const inicial = valores[0]
    for (const v of valores) expect(Math.abs(v / inicial - 1)).toBeLessThan(0.01)
  })

  it('dipolo com atrito: termina alinhado com o campo', () => {
    const s = cena('dipolo')
    const { sim } = roda(s, com(s, { modo: 2, amort: 0.8 }), 25)
    expect(Math.abs(sim!.vars.ang)).toBeLessThan(0.02)
  })

  it('espira: o torque medido nos quatro lados puxa para o alinhamento', () => {
    const s = cena('forcas')
    const params = com(s, { modo: 3, amort: 0 })
    const { valores } = roda(s, params, 1, (env) => evalNum('ang', env))
    expect(Math.min(...valores)).toBeLessThan(valores[0])
    expect(Math.max(...valores)).toBeLessThanOrEqual((60 * Math.PI) / 180 + 1e-9)
    const r = compileScenario(s, { params, t: 0, overrides: {}, sim: createSim() })
    // torque em +y gira m de z para x, isto é, reduz θ
    const y = evalNum("y(cross(pos('g1'), forca('g1','Bu')) + cross(pos('g2'), forca('g2','Bu')) + cross(pos('g3'), forca('g3','Bu')) + cross(pos('g4'), forca('g4','Bu')))", r.env)
    expect(y).toBeGreaterThan(0)
  })

  it('espira: período das pequenas oscilações, 2π√(I/mB)', () => {
    const s = cena('forcas')
    const params = com(s, { modo: 3, th: 5, amort: 0 })
    const { valores } = roda(s, params, 10, (env) => evalNum('ang', env))
    const teoria = 2 * Math.PI * Math.sqrt(3.3e-4 / (params.I2 * params.a * params.b * params.B0))
    expect(Math.abs(periodo(valores, 1 / 60) / teoria - 1)).toBeLessThan(0.01)
  })

  it('recomeçar devolve o estado inicial', () => {
    const s = cena('dipolo')
    useRun.getState().load(s)
    useRun.getState().setParam('modo', 2)
    simRef.current.vars.ang = 0.3
    useRun.getState().resetSim()
    expect(simRef.current.vars).toEqual({})
  })
})

describe('partículas no campo da própria cena', () => {
  it('carga no eixo do anel: oscila com o período da fórmula', () => {
    const s = cena('distribuicoes')
    // amplitude pequena comparada ao raio, para valer a aproximação harmônica
    const pequena = { ...lab('distribuicoes'), objetos: lab('distribuicoes').objetos.map((o) => (o.id === 'pa' ? { ...o, pos: [0, 0, 0.004] } : o)) }
    const params = padroes(s)
    const { valores } = roda(Scenario.parse(pequena), params, 14, (env) => evalNum("z(pos('pa'))", env))
    const teoria = 2 * Math.PI * Math.sqrt((5.4e-6 * params.R ** 3) / (8.9875e9 * 1e-10 * params.Qt))
    expect(Math.abs(periodo(valores, 1 / 60) / teoria - 1)).toBeLessThan(0.01)
  })

  it('potencial: K + U fica constante na descida', () => {
    const s = cena('potencial')
    const total = (env: Parameters<typeof evalNum>[1]) => evalNum("5e-4*mag(vel('pl'))^2 + qt*V(pos('pl'))", env)
    const { valores, sim } = roda(s, padroes(s), 8, total)
    expect(Math.hypot(...sim!.particles.get('pl')!.v)).toBeGreaterThan(0)
    for (const v of valores) expect(Math.abs(v / valores[0] - 1)).toBeLessThan(0.01)
  })

  it('lançamento: o projétil para onde K = 0, e volta', () => {
    const s = cena('energia')
    const params = com(s, { modo: 3 })
    const { valores } = roda(s, params, 12, (env) => evalNum("mag(pos('pj'))", env))
    const rmin = 1 / (params.K0 / (8.9875e9 * params.Qe * 1e-9) + 1 / 0.1)
    expect(Math.abs(Math.min(...valores) / rmin - 1)).toBeLessThan(0.01)
    expect(valores.indexOf(Math.min(...valores))).toBeLessThan(valores.length - 1)
  })

  it('planos: velocidade constante na região sem campo, e aceleração depois', () => {
    const s = cena('planos')
    const { valores } = roda(s, padroes(s), 1, (env) => evalNum("x(vel('pv'))", env))
    for (const v of valores) expect(v).toBeCloseTo(0.03, 6)
    const { valores: depois } = roda(s, padroes(s), 3.2, (env) => evalNum("x(vel('pv'))", env))
    expect(Math.max(...depois)).toBeGreaterThan(0.05)
  })

  it('a carga livre de Coulomb não recomeça: o relógio para quando ela sai', () => {
    const s = cena('coulomb')
    useRun.getState().load(s)
    expect(useRun.getState().playing).toBe(true)
    const { sim } = roda(s, padroes(s), 8)
    expect(sim!.particles.get('livre')?.parada).toBe(true)
    simRef.current = sim!
    expect(fimDasProvas(useRun.getState())).toBe(true)
  })
})

describe('a carga que acaba', () => {
  it('guarda a velocidade: K + U não despenca no fim da cena', () => {
    const s = cena('potencial')
    const { sim } = roda(s, padroes(s), 30)
    const p = sim!.particles.get('pl')!
    expect(p.parada).toBe(true)
    expect(Math.hypot(...p.v)).toBeGreaterThan(0)
  })
})

describe('capacitores carregando', () => {
  const s = cena('associacao')

  it('depois de muitos τ, chega ao regime de cada arranjo', () => {
    for (const modo of [1, 2, 3]) {
      const params = com(s, { modo, tau: 0.2 })
      const r = compileScenario(s, { params, t: 6, overrides: {} })
      expect(evalNum(modo === 2 ? "Vcap('c1')" : "Vcap('c1') + Vcap('c2')" + (modo === 1 ? " + Vcap('c3')" : ''), r.env) / params.fem).toBeCloseTo(1, 6)
    }
  })

  it('em t = 0 está tudo descarregado, sem valor inválido', () => {
    const r = compileScenario(s, { params: padroes(s), t: 0, overrides: {} })
    expect(r.errors).toEqual([])
    expect(evalNum("Q('c1')", r.env)).toBe(0)
  })

  it('ligar o carregado ao vazio conserva a carga a cada instante e perde metade da energia', () => {
    const params = com(s, { modo: 4, C2: 2e-12, tau: 0.5 })
    for (const t of [0, 0.3, 1, 3]) {
      const r = compileScenario(s, { params, t, overrides: {} })
      expect(evalNum("Q('c1') + Q('c2')", r.env) / (params.C1 * params.fem)).toBeCloseTo(1, 9)
    }
    const fim = compileScenario(s, { params, t: 8, overrides: {} })
    expect(evalNum("U('c1') + U('c2')", fim.env) / ((params.C1 * params.fem ** 2) / 2)).toBeCloseTo(0.5, 6)
  })
})

function lab(id: string) {
  return LABS.find((l) => l.cenario.id === id)!.cenario
}
