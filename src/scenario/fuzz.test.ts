import { describe, expect, it } from 'vitest'
import { fieldB, fieldE, potentialV } from '../physics/sources'
import type { V3 } from '../physics/vec'
import { runJob } from '../scene/fieldCompute'
import { compileScenario } from './compile'
import { type Env, ExprError, compile, evaluate, mathFns } from './expr'
import { Scenario } from './schema'
import { checkProva } from './validate'

/** PRNG determinístico (mulberry32): a mesma semente reproduz a falha. */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const pick = <T,>(r: () => number, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)]

/* ───────────────────────── expressões ───────────────────────── */

const TOKENS = ['1', '0', '-1', '2.5e-3', '1e308', 'pi', 'x', 'y', 'z', 't', 'R', 'cm', 'mu0', '+', '-', '*', '/', '^', '(', ')', ',', '[', ']',
  '?', ':', '&&', '||', '<', '==', '!', 'sin(', 'sqrt(', 'ln(', 'mag(', 'cross(', 'vec(', 'E(', 'B(', 'V(', "'q1'", "'nada'", 'constructor',
  'toString', '__proto__', 'hasOwnProperty', 'valueOf', '$', '#', '"', "'", '1/0', '0/0', 'ç', 'λ']

const env = (): Env => ({
  vars: { pi: Math.PI, x: 0.1, y: -0.2, z: 0.3, t: 1, R: 0.05, cm: 0.01, mu0: 1.2566e-6 },
  fns: { ...mathFns, E: () => [1, 2, 3], B: () => [0, 0, 1], V: () => 4 },
})

function expectOnlyExprErrors(f: () => unknown, src: string) {
  try {
    f()
  } catch (e) {
    if (!(e instanceof ExprError)) throw new Error(`"${src}" lançou ${(e as Error).constructor.name}: ${(e as Error).message}`)
  }
}

describe('estresse: linguagem de expressões', () => {
  it('5000 expressões aleatórias só produzem valor ou ExprError', () => {
    const r = rng(42)
    for (let i = 0; i < 5000; i++) {
      const n = 1 + Math.floor(r() * 14)
      const src = Array.from({ length: n }, () => pick(r, TOKENS)).join(r() < 0.5 ? '' : ' ')
      expectOnlyExprErrors(() => evaluate(src, env()), src)
    }
  })

  it('nomes do protótipo do JavaScript não são variáveis nem funções', () => {
    for (const src of ['constructor', 'toString', '__proto__', 'hasOwnProperty(1)', 'toString()', 'valueOf()', 'constructor(1)']) {
      expect(() => evaluate(src, env()), src).toThrow(ExprError)
    }
  })

  it('aninhamento e tamanho extremos falham com ExprError, sem estourar a pilha', () => {
    const deep = '('.repeat(50000) + '1' + ')'.repeat(50000)
    expect(() => compile(deep)).toThrow(ExprError)
    const long = Array.from({ length: 20000 }, () => '1').join('+')
    expect(() => compile(long)).toThrow(ExprError)
    const unary = '-'.repeat(50000) + '1'
    expect(() => compile(unary)).toThrow(ExprError)
  })

  it('aritmética degenerada dá número (Infinity/NaN), nunca exceção de JS', () => {
    for (const src of ['1/0', '0/0', 'sqrt(-1)', 'ln(0)', '1e308*1e308', '(-8)^(1/3)', 'mag([0,0,0])', 'unit([0,0,0])']) {
      const v = evaluate(src, env())
      expect(typeof v === 'number' || Array.isArray(v), src).toBe(true)
    }
  })
})

/* ───────────────────────── cenários com geometria arbitrária ───────────────────────── */

const NUMS = ['0', '-0.05', '0.05', '1e-9', '1e9', '1/0', '0/0', 'sqrt(-1)', '-1e-12', '3*cm', 'R', '2*R', 't', 'sin(t)']
const AXES = ['x', 'y', 'z', '[0,0,0]', '[1,1,0]', '[0/0,1,0]']

function randomObjeto(r: () => number, i: number): Record<string, unknown> {
  const n = () => pick(r, NUMS)
  const v = (): (string | number)[] | string => (r() < 0.2 ? pick(r, ['[1,2,3]', '[R,0,0]', '[0/0,0,0]', 'nada']) : [n(), n(), n()])
  const ax = () => pick(r, AXES)
  const id = `o${i}`
  const tipo = pick(r, [
    'carga', 'segmentoCarga', 'anelCarga', 'placa', 'capacitor', 'esfera', 'linhaInfinita', 'cilindroInfinito', 'planoInfinito',
    'campoE', 'campoB', 'fio', 'fioInfinito', 'espira', 'solenoide', 'toroide', 'ima', 'particula', 'gaussiana', 'amperiana',
    'espiraSensora', 'circuito', 'condutor', 'sonda', 'seta', 'cota', 'rotulo',
  ] as const)
  const base = { id, tipo, arrastavel: r() < 0.5 }
  switch (tipo) {
    case 'carga':
      return { ...base, q: n(), pos: v() }
    case 'segmentoCarga':
      return { ...base, lambda: n(), a: v(), b: v() }
    case 'anelCarga':
      return { ...base, Q: n(), centro: v(), raio: n(), normal: ax(), ...(r() < 0.5 ? { arco: [n(), n()] } : {}) }
    case 'placa':
      return { ...base, sigma: n(), centro: v(), normal: ax(), largura: n(), altura: n() }
    case 'capacitor':
      return { ...base, centro: v(), eixo: ax(), lado: n(), d: n(), Q: n(), bordas: r() < 0.5, ...(r() < 0.5 ? { dieletrico: { K: n(), inicio: n(), fim: n() } } : {}) }
    case 'esfera':
      return { ...base, Q: n(), centro: v(), raio: n(), oca: r() < 0.5 }
    case 'linhaInfinita':
      return { ...base, lambda: n(), ponto: v(), direcao: ax() }
    case 'cilindroInfinito':
      return { ...base, lambda: n(), ponto: v(), direcao: ax(), raio: n() }
    case 'planoInfinito':
      return { ...base, sigma: n(), ponto: v(), normal: ax() }
    case 'campoE':
    case 'campoB':
      return { ...base, valor: r() < 0.5 ? v() : pick(r, ['[x,y,z]', '[1/x, 0, 0]', '[0,0,0]', 'x']) }
    case 'fio':
      return { ...base, I: n(), a: v(), b: v() }
    case 'fioInfinito':
      return { ...base, I: n(), ponto: v(), direcao: ax() }
    case 'espira':
      return { ...base, I: n(), centro: v(), raio: n(), normal: ax(), N: n() }
    case 'solenoide':
      return { ...base, I: n(), centro: v(), eixo: ax(), raio: n(), comprimento: n(), N: n() }
    case 'toroide':
      return { ...base, I: n(), centro: v(), eixo: ax(), raioMaior: n(), raioMenor: n(), N: n() }
    case 'ima':
      return { ...base, centro: v(), eixo: ax(), comprimento: n(), raio: n(), intensidade: n() }
    case 'particula':
      return { ...base, q: n(), m: n(), pos: v(), v: v() }
    case 'gaussiana':
      return { ...base, forma: pick(r, ['esfera', 'cubo', 'cilindro']), centro: v(), raio: n(), lado: n(), altura: n(), eixo: ax(), campo: pick(r, ['E', 'B']) }
    case 'amperiana':
      return { ...base, centro: v(), normal: ax(), raio: n() }
    case 'espiraSensora':
      return { ...base, centro: v(), normal: ax(), raio: n(), N: n(), R: n() }
    case 'circuito':
      return { ...base, modelo: pick(r, ['RC', 'RL', 'LC', 'RLC']), R: n(), C: n(), L: n(), fem: n(), q0: n() }
    case 'condutor':
      return { ...base, a: v(), b: v(), raio: n(), I: n() }
    case 'sonda':
      return { ...base, pos: v(), campo: pick(r, ['E', 'B']) }
    case 'seta':
      return { ...base, origem: v(), vetor: r() < 0.5 ? v() : pick(r, ["F('o0')", "forca('o1','o2')", "E(pos('o0'))"]), comprimento: n() }
    case 'cota':
      return { ...base, a: v(), b: v() }
    case 'rotulo':
      return { ...base, pos: v(), texto: 'rótulo' }
  }
}

/** Todos os números de uma entidade compilada precisam ser finitos para o three.js. */
function finite(v: unknown, path: string): string | null {
  if (typeof v === 'number') return Number.isFinite(v) ? null : path
  if (Array.isArray(v)) {
    for (let i = 0; i < v.length; i++) {
      const bad = finite(v[i], `${path}[${i}]`)
      if (bad) return bad
    }
    return null
  }
  if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) {
      if (k === 'rastro' || typeof x === 'function') continue
      const bad = finite(x, `${path}.${k}`)
      if (bad) return bad
    }
  }
  return null
}

describe('estresse: cenários com geometria arbitrária', () => {
  it('300 cenários aleatórios: schema ou compilação apontam o erro; nada lança, nada não-finito chega à cena', () => {
    const r = rng(7)
    let compilados = 0
    for (let k = 0; k < 300; k++) {
      const objetos = Array.from({ length: 1 + Math.floor(r() * 6) }, (_, i) => randomObjeto(r, i))
      const raw = {
        id: `fuzz${k}`,
        titulo: 'fuzz',
        cena: { escala: pick(r, [0.01, 1, 0.002]), extensao: pick(r, [5, 12, 30]) },
        parametros: [{ id: 'R', rotulo: 'R', valor: pick(r, [0.05, 0, -1, 1e6]) }],
        objetos,
        medidas: [{ rotulo: 'm', expr: pick(r, ["fluxo('o0')", "C('o1')", 'E(0,0,0)', "Qenc('o0')", "circ('o0')", '1/0']) }],
      }
      const parsed = Scenario.safeParse(raw)
      if (!parsed.success) continue
      const s = parsed.data
      compilados++
      for (const t of [0, 0.37]) {
        const res = compileScenario(s, { params: { R: s.parametros[0].valor }, t, overrides: {} })
        for (const e of res.ents) expect(finite(e, e.id), `cenário ${k}, ${e.tipo}`).toBeNull()
        const half = s.cena.extensao * s.cena.escala
        for (const P of [[0, 0, 0], [half * 0.3, -half * 0.2, half * 0.1]] as V3[]) {
          fieldE(res.world, P)
          fieldB(res.world, P)
          potentialV(res.world, P)
        }
        for (const m of s.medidas) expectOnlyExprErrors(() => evaluate(m.expr, res.env), String(m.expr))
        // o caminho que o worker executa
        runJob(res, { tipo: 'setas', campo: 'E', half, n: 4, plano: false })
        runJob(res, { tipo: 'linhas', campo: 'B', half, qualidade: 0.3 })
        runJob(res, { tipo: 'plano', half, normal: 'z', at: 0, N: 12 })
      }
    }
    expect(compilados).toBeGreaterThan(50)
  })

  it('JSON de prova arbitrário: checkProva devolve erros, nunca lança', () => {
    const r = rng(99)
    const junk: unknown[] = [null, 1, 'x', [], {}, { questoes: 'x' }, { id: 1, titulo: [], questoes: [{}] }]
    for (let k = 0; k < 60; k++)
      junk.push({
        id: 'p',
        titulo: 't',
        questoes: [{ id: 'q', numero: '1', titulo: 'q', objetos: Array.from({ length: 3 }, (_, i) => randomObjeto(r, i)), alternativas: [{ letra: 'a', texto: 'x' }] }],
      })
    for (const j of junk) {
      const out = checkProva(j)
      expect(Array.isArray(out.errors)).toBe(true)
    }
  })
})
