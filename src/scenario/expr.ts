import type { V3 } from '../physics/vec'

/**
 * Linguagem de expressões dos cenários. Existe para que um cenário (inclusive
 * um gerado por IA a partir de um PDF) seja DADO, nunca código: nada aqui chama
 * eval ou Function, e só as funções explicitamente registradas existem.
 *
 * Valores são números, vetores (tuplas de 3) ou strings (ids de objetos).
 */
export type Value = number | V3 | string

export type Env = {
  vars: Record<string, Value>
  fns: Record<string, (...args: Value[]) => Value>
}

type Node =
  | { t: 'num'; v: number }
  | { t: 'str'; v: string }
  | { t: 'id'; name: string }
  | { t: 'un'; op: string; a: Node }
  | { t: 'bin'; op: string; a: Node; b: Node }
  | { t: 'call'; name: string; args: Node[] }
  | { t: 'vec'; items: Node[] }
  | { t: 'tern'; c: Node; a: Node; b: Node }

export class ExprError extends Error {}

type Tok = { k: 'num' | 'id' | 'str' | 'op'; v: string; pos: number }

function tokenize(src: string): Tok[] {
  const out: Tok[] = []
  let i = 0
  while (i < src.length) {
    const c = src[i]
    if (/\s/.test(c)) {
      i++
      continue
    }
    const num = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(src.slice(i))
    if (num) {
      out.push({ k: 'num', v: num[0], pos: i })
      i += num[0].length
      continue
    }
    const id = /^[A-Za-z_À-ɏͰ-Ͽ][\wÀ-ɏͰ-Ͽ]*/.exec(src.slice(i))
    if (id) {
      out.push({ k: 'id', v: id[0], pos: i })
      i += id[0].length
      continue
    }
    if (c === "'" || c === '"') {
      const end = src.indexOf(c, i + 1)
      if (end < 0) throw new ExprError(`string sem fechamento na posição ${i}`)
      out.push({ k: 'str', v: src.slice(i + 1, end), pos: i })
      i = end + 1
      continue
    }
    const two = src.slice(i, i + 2)
    if (['<=', '>=', '==', '!=', '&&', '||', '**'].includes(two)) {
      out.push({ k: 'op', v: two === '**' ? '^' : two, pos: i })
      i += 2
      continue
    }
    if ('+-*/^(),<>[]!?:'.includes(c)) {
      out.push({ k: 'op', v: c, pos: i })
      i++
      continue
    }
    throw new ExprError(`caractere inesperado "${c}" na posição ${i}`)
  }
  return out
}

const BP: Record<string, number> = {
  '?': 1,
  '||': 2,
  '&&': 3,
  '==': 4,
  '!=': 4,
  '<': 5,
  '>': 5,
  '<=': 5,
  '>=': 5,
  '+': 6,
  '-': 6,
  '*': 7,
  '/': 7,
  '^': 9,
}

/** Limites que impedem uma expressão hostil de estourar a pilha ou travar. */
const MAX_LEN = 4000
const MAX_DEPTH = 64

function parse(src: string): Node {
  if (src.length > MAX_LEN) throw new ExprError(`expressão longa demais (${src.length} caracteres; máximo ${MAX_LEN})`)
  let depth = 0
  const enter = () => {
    if (++depth > MAX_DEPTH) throw new ExprError(`expressão aninhada demais (máximo ${MAX_DEPTH} níveis)`)
  }
  const toks = tokenize(src)
  let p = 0
  const peek = () => toks[p]
  const take = (v?: string) => {
    const t = toks[p]
    if (!t || (v !== undefined && t.v !== v)) throw new ExprError(`esperava "${v ?? 'algo'}" em "${src}"`)
    p++
    return t
  }
  const prefix = (): Node => {
    enter()
    try {
      return prefixInner()
    } finally {
      depth--
    }
  }
  const prefixInner = (): Node => {
    const t = take()
    if (t.k === 'num') return { t: 'num', v: Number(t.v) }
    if (t.k === 'str') return { t: 'str', v: t.v }
    if (t.k === 'id') {
      if (peek()?.v === '(') {
        take('(')
        const args: Node[] = []
        if (peek()?.v !== ')') {
          args.push(expr(0))
          while (peek()?.v === ',') {
            take(',')
            args.push(expr(0))
          }
        }
        take(')')
        return { t: 'call', name: t.v, args }
      }
      return { t: 'id', name: t.v }
    }
    if (t.v === '(') {
      const e = expr(0)
      take(')')
      return e
    }
    if (t.v === '[') {
      const items = [expr(0)]
      while (peek()?.v === ',') {
        take(',')
        items.push(expr(0))
      }
      take(']')
      return { t: 'vec', items }
    }
    if (t.v === '-' || t.v === '+' || t.v === '!') return { t: 'un', op: t.v, a: expr(8) }
    throw new ExprError(`símbolo inesperado "${t.v}" em "${src}"`)
  }
  const expr = (minBp: number): Node => {
    let left = prefix()
    for (;;) {
      const t = peek()
      if (!t || t.k !== 'op') break
      const bp = BP[t.v]
      if (bp === undefined || bp <= minBp) break
      take()
      if (t.v === '?') {
        const a = expr(0)
        take(':')
        const b = expr(0)
        left = { t: 'tern', c: left, a, b }
        continue
      }
      const right = expr(t.v === '^' ? bp - 1 : bp)
      left = { t: 'bin', op: t.v, a: left, b: right }
    }
    return left
  }
  const out = expr(0)
  if (p < toks.length) throw new ExprError(`sobrou "${toks[p].v}" em "${src}"`)
  return out
}

const isVec = (v: Value): v is V3 => Array.isArray(v)

function num(v: Value, ctx: string): number {
  if (typeof v !== 'number') throw new ExprError(`${ctx}: esperava número`)
  return v
}

function arith(op: string, a: Value, b: Value): Value {
  if (typeof a === 'number' && typeof b === 'number') {
    switch (op) {
      case '+':
        return a + b
      case '-':
        return a - b
      case '*':
        return a * b
      case '/':
        return a / b
      case '^':
        return a ** b
      case '<':
        return +(a < b)
      case '>':
        return +(a > b)
      case '<=':
        return +(a <= b)
      case '>=':
        return +(a >= b)
      case '==':
        return +(a === b)
      case '!=':
        return +(a !== b)
      case '&&':
        return +(!!a && !!b)
      case '||':
        return +(!!a || !!b)
    }
  }
  if (isVec(a) && isVec(b) && (op === '+' || op === '-')) {
    const s = op === '+' ? 1 : -1
    return [a[0] + s * b[0], a[1] + s * b[1], a[2] + s * b[2]]
  }
  if (op === '*' && isVec(a) && typeof b === 'number') return [a[0] * b, a[1] * b, a[2] * b]
  if (op === '*' && typeof a === 'number' && isVec(b)) return [b[0] * a, b[1] * a, b[2] * a]
  if (op === '/' && isVec(a) && typeof b === 'number') return [a[0] / b, a[1] / b, a[2] / b]
  throw new ExprError(`operação "${op}" inválida entre esses tipos`)
}

type Compiled = (env: Env) => Value

function compileNode(n: Node): Compiled {
  switch (n.t) {
    case 'num':
      return () => n.v
    case 'str':
      return () => n.v
    case 'id':
      return (env) => {
        // só chaves próprias: "constructor", "toString" e afins não vêm do protótipo
        const v = Object.hasOwn(env.vars, n.name) ? env.vars[n.name] : undefined
        if (v === undefined) throw new ExprError(`variável desconhecida "${n.name}"`)
        return v
      }
    case 'un': {
      const a = compileNode(n.a)
      if (n.op === '!') return (env) => +!num(a(env), '!')
      if (n.op === '+') return a
      return (env) => {
        const v = a(env)
        if (isVec(v)) return [-v[0], -v[1], -v[2]]
        return -num(v, '−')
      }
    }
    case 'bin': {
      const a = compileNode(n.a)
      const b = compileNode(n.b)
      // curto-circuito: "modo==1 && fem('bob')" não avalia fem quando modo≠1
      if (n.op === '&&') return (env) => (num(a(env), '&&') ? +!!num(b(env), '&&') : 0)
      if (n.op === '||') return (env) => (num(a(env), '||') ? 1 : +!!num(b(env), '||'))
      return (env) => arith(n.op, a(env), b(env))
    }
    case 'tern': {
      const c = compileNode(n.c)
      const a = compileNode(n.a)
      const b = compileNode(n.b)
      return (env) => (num(c(env), '?:') ? a(env) : b(env))
    }
    case 'vec': {
      if (n.items.length !== 3) throw new ExprError('vetores têm 3 componentes')
      const [x, y, z] = n.items.map(compileNode)
      return (env) => [num(x(env), 'x'), num(y(env), 'y'), num(z(env), 'z')]
    }
    case 'call': {
      const args = n.args.map(compileNode)
      return (env) => {
        const f = Object.hasOwn(env.fns, n.name) ? env.fns[n.name] : undefined
        if (!f) throw new ExprError(`função desconhecida "${n.name}"`)
        return f(...args.map((a) => a(env)))
      }
    }
  }
}

const cache = new Map<string, { run: Compiled; ids: Set<string> }>()

function collectIds(n: Node, out: Set<string>) {
  switch (n.t) {
    case 'id':
      out.add(n.name)
      break
    case 'un':
      collectIds(n.a, out)
      break
    case 'bin':
      collectIds(n.a, out)
      collectIds(n.b, out)
      break
    case 'tern':
      collectIds(n.c, out)
      collectIds(n.a, out)
      collectIds(n.b, out)
      break
    case 'vec':
      n.items.forEach((i) => collectIds(i, out))
      break
    case 'call':
      out.add(`${n.name}()`)
      n.args.forEach((i) => collectIds(i, out))
      break
  }
}

export function compile(src: string) {
  let hit = cache.get(src)
  if (!hit) {
    const ast = parse(src)
    const ids = new Set<string>()
    collectIds(ast, ids)
    hit = { run: compileNode(ast), ids }
    cache.set(src, hit)
  }
  return hit
}

export function evaluate(src: string | number, env: Env): Value {
  if (typeof src === 'number') return src
  return compile(src).run(env)
}

export function evalNum(src: string | number, env: Env): number {
  const v = evaluate(src, env)
  if (typeof v !== 'number') throw new ExprError(`"${src}" deveria ser um número`)
  return v
}

/** Identificadores e chamadas usados pela expressão (para saber se depende de t, x, y, z…). */
export function dependsOn(src: string | number | undefined, names: string[]): boolean {
  if (typeof src !== 'string') return false
  try {
    const ids = compile(src).ids
    return names.some((n) => ids.has(n))
  } catch {
    return false
  }
}

const MATH: Record<string, (...a: Value[]) => Value> = {
  sin: (a) => Math.sin(num(a, 'sin')),
  cos: (a) => Math.cos(num(a, 'cos')),
  tan: (a) => Math.tan(num(a, 'tan')),
  asin: (a) => Math.asin(num(a, 'asin')),
  acos: (a) => Math.acos(num(a, 'acos')),
  atan: (a) => Math.atan(num(a, 'atan')),
  atan2: (a, b) => Math.atan2(num(a, 'atan2'), num(b, 'atan2')),
  sqrt: (a) => Math.sqrt(num(a, 'sqrt')),
  abs: (a) => (isVec(a) ? Math.hypot(a[0], a[1], a[2]) : Math.abs(num(a, 'abs'))),
  exp: (a) => Math.exp(num(a, 'exp')),
  ln: (a) => Math.log(num(a, 'ln')),
  log10: (a) => Math.log10(num(a, 'log10')),
  sign: (a) => Math.sign(num(a, 'sign')),
  floor: (a) => Math.floor(num(a, 'floor')),
  min: (...a) => Math.min(...a.map((x) => num(x, 'min'))),
  max: (...a) => Math.max(...a.map((x) => num(x, 'max'))),
  rad: (a) => (num(a, 'rad') * Math.PI) / 180,
  deg: (a) => (num(a, 'deg') * 180) / Math.PI,
  vec: (a, b, c) => [num(a, 'vec'), num(b, 'vec'), num(c, 'vec')],
  mag: (a) => {
    if (!isVec(a)) throw new ExprError('mag: esperava vetor')
    return Math.hypot(a[0], a[1], a[2])
  },
  unit: (a) => {
    if (!isVec(a)) throw new ExprError('unit: esperava vetor')
    const l = Math.hypot(a[0], a[1], a[2]) || 1
    return [a[0] / l, a[1] / l, a[2] / l]
  },
  dot: (a, b) => {
    if (!isVec(a) || !isVec(b)) throw new ExprError('dot: esperava vetores')
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  },
  cross: (a, b) => {
    if (!isVec(a) || !isVec(b)) throw new ExprError('cross: esperava vetores')
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
  },
  x: (a) => (isVec(a) ? a[0] : num(a, 'x')),
  y: (a) => (isVec(a) ? a[1] : num(a, 'y')),
  z: (a) => (isVec(a) ? a[2] : num(a, 'z')),
}

export const mathFns = MATH
