import katex from 'katex'
import { describe, expect, it } from 'vitest'
import { BIZUARIO } from './bizuarioF2'
import { FISICA2 } from './fisica2'

const fichas = BIZUARIO.flatMap((t) => t.fichas)
const formulasDe = (t: string) => [...t.matchAll(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g)].map((m) => m[1] ?? m[2])
const semFormulas = (t: string) => t.replace(/\$\$[\s\S]+?\$\$|\$[^$\n]+?\$/g, ' ')

describe('Bizuário de Física II', () => {
  it('ids únicos', () => {
    expect(new Set(fichas.map((f) => f.id)).size).toBe(fichas.length)
    expect(new Set(BIZUARIO.map((t) => t.id)).size).toBe(BIZUARIO.length)
  })

  it('toda ficha tem fórmula, bizu e aponta só para questões que existem', () => {
    const ids = new Set(FISICA2.map((p) => p.id))
    for (const f of fichas) {
      expect(f.formulas.length, f.id).toBeGreaterThan(0)
      expect(f.bizus.length, f.id).toBeGreaterThan(0)
      expect(f.questoes.length, f.id).toBeGreaterThan(0)
      for (const q of f.questoes) expect(ids.has(q), `${f.id} → ${q}`).toBe(true)
    }
  })

  it('nenhuma fórmula fica solta: cada uma tem nome e explicação', () => {
    const ruins: string[] = []
    const nomes = new Set<string>()
    for (const f of fichas)
      for (const x of f.formulas) {
        if (x.nome.trim().length < 4) ruins.push(`${f.id}: sem nome`)
        if (nomes.has(x.nome)) ruins.push(`${f.id}: nome repetido "${x.nome}"`)
        nomes.add(x.nome)
        if (semFormulas(x.explica).trim().length < 60) ruins.push(`${f.id} · ${x.nome}: explicação curta`)
      }
    expect(ruins).toEqual([])
  })

  it('cobre todas as questões de Física II do site', () => {
    const cobertas = new Set(fichas.flatMap((f) => f.questoes))
    expect(FISICA2.map((p) => p.id).filter((id) => !cobertas.has(id))).toEqual([])
  })

  it('toda fórmula compila e nenhum cifrão sobra', () => {
    const ruins: string[] = []
    const compila = (id: string, f: string) => {
      try {
        katex.renderToString(f, { throwOnError: true, strict: 'ignore', displayMode: true })
      } catch (e) {
        ruins.push(`${id}: ${f.slice(0, 50)} → ${(e as Error).message.slice(0, 60)}`)
      }
    }
    for (const f of fichas) {
      for (const x of f.formulas) {
        compila(f.id, x.tex)
        if (x.tex.includes('$')) ruins.push(`${f.id}: cifrão na fórmula`)
      }
      for (const t of [f.quando, ...f.bizus, ...f.formulas.map((x) => x.explica)]) {
        for (const x of formulasDe(t)) compila(f.id, x)
        if (semFormulas(t).includes('$')) ruins.push(`${f.id}: cifrão solto`)
      }
    }
    expect(ruins).toEqual([])
  })
})
