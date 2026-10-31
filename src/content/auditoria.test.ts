import { existsSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import katex from 'katex'
import { describe, expect, it } from 'vitest'
import { renderRich } from '../lib/rich'
import { Prova, Scenario } from '../scenario/schema'
import { LABS } from './labs'
import { PROVAS } from './provas'
import { figurasDe } from './registry'

const provas = PROVAS.map((p) => Prova.parse(p))
const labs = LABS.map((l) => Scenario.parse(l.cenario))
const questoes = provas.flatMap((p) => p.questoes.map((q) => ({ p, q, nome: `${p.id}/${q.id}` })))

/** Campos com texto corrido, em Markdown leve e LaTeX. */
const CAMPOS_TEXTO = new Set(['texto', 'enunciado', 'teoria', 'resultado', 'porque', 'dica', 'sucesso', 'pergunta', 'detalhe', 'observacao', 'criterio', 'resposta', 'erro', 'resumo'])

function textos(v: unknown, nome: string, out: { nome: string; texto: string }[] = [], campo = ''): { nome: string; texto: string }[] {
  if (typeof v === 'string') {
    if (CAMPOS_TEXTO.has(campo) || nome.includes('errosComuns')) out.push({ nome, texto: v })
  } else if (Array.isArray(v)) v.forEach((x, i) => textos(x, `${nome}[${i}]`, out, campo))
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) textos(x, `${nome}.${k}`, out, k)
  return out
}

const todos = [...questoes.flatMap(({ q, nome }) => textos(q, nome)), ...labs.flatMap((s) => textos(s, s.id))]
const simbolos = [...questoes.flatMap(({ q, nome }) => [...q.parametros, ...q.medidas].map((x) => ({ nome, tex: x.simbolo }))), ...labs.flatMap((s) => [...s.parametros, ...s.medidas].map((x) => ({ nome: s.id, tex: x.simbolo })))].filter((x) => x.tex)

const formulas = (t: string) => [...t.matchAll(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g)].map((m) => m[1] ?? m[2])
const semFormulas = (t: string) => t.replace(/\$\$[\s\S]+?\$\$|\$[^$\n]+?\$/g, ' ')

describe('texto de todas as provas e labs', () => {
  it('toda fórmula compila no KaTeX', () => {
    const ruins: string[] = []
    const prova = (nome: string, tex: string) => {
      try {
        katex.renderToString(tex, { throwOnError: true, strict: 'ignore', trust: false })
      } catch (e) {
        ruins.push(`${nome}: ${tex.slice(0, 70)} → ${(e as Error).message.slice(0, 90)}`)
      }
    }
    for (const { nome, texto } of todos) for (const f of formulas(texto)) prova(nome, f)
    for (const { nome, tex } of simbolos) prova(nome, tex!)
    expect(ruins).toEqual([])
  })

  it('nenhum cifrão fica sobrando fora de uma fórmula', () => {
    expect(todos.filter(({ texto }) => semFormulas(texto).includes('$')).map(({ nome, texto }) => `${nome}: ${texto.slice(0, 80)}`)).toEqual([])
  })

  it('nenhuma marcação fica crua na página', () => {
    const ruins: string[] = []
    for (const { nome, texto } of todos) {
      const visivel = renderRich(texto).replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ')
      const puro = semFormulas(texto)
      if (/\*\*/.test(renderRich(puro))) ruins.push(`${nome}: asteriscos`)
      if (/undefined|NaN|\[object/.test(puro)) ruins.push(`${nome}: valor quebrado`)
      if (//.test(visivel)) ruins.push(`${nome}: marcador de fórmula`)
    }
    expect(ruins).toEqual([])
  })

  it('lista nunca nasce de uma linha dentro de fórmula', () => {
    const ruins: string[] = []
    for (const { nome, texto } of todos) for (const f of texto.matchAll(/\$\$([\s\S]+?)\$\$/g)) if (/^\s*- /m.test(f[1])) ruins.push(nome)
    expect(ruins).toEqual([])
  })
})

describe('renderizador', () => {
  it('texto é texto: nenhuma marcação de HTML atravessa', () => {
    const html = renderRich('<img src=x onerror=alert(1)> **<b>n</b>** <script>alert(1)</script>\n\n- <svg onload=alert(1)>')
    expect(html).not.toMatch(/<(img|b|script|svg)\b/i)
  })

  it('fórmula não abre link, imagem nem atributo', () => {
    const html = renderRich(String.raw`$\href{javascript:alert(1)}{x}$ $\url{javascript:alert(1)}$ $\includegraphics{x.png}$ $\htmlId{a}{x}$ $\htmlData{a=b}{x}$`)
    expect(html).not.toMatch(/<a\b|<img\b|href=|id="a"|data-a=/i)
  })

  it('negrito pode conter fórmula, e lista funciona', () => {
    expect(renderRich('**arco $x$ fim**')).toMatch(/<strong>arco .*katex.* fim<\/strong>/s)
    expect(renderRich('regras:\n- um\n- dois')).toMatch(/<p>regras:<\/p><ul><li>um<\/li><li>dois<\/li><\/ul>/)
  })
})

describe('integridade das questões', () => {
  it('cada alternativa é diferente das outras, salvo as que a própria prova repete', () => {
    // conferidas no PDF: a repetição é da prova, não da transcrição
    const daProva = ['p2-2024-2-diurno/obj1', 'p2-2024-2-diurno/obj5', 'p3-2024-2-diurno/obj3', 'p3-2023-2-diurno/obj5']
    const ruins: string[] = []
    for (const { q, nome } of questoes) {
      const a = (q.alternativas ?? []).map((x) => x.texto.replace(/\s+/g, ''))
      if (new Set(a).size !== a.length && !daProva.includes(nome)) ruins.push(nome)
      const letras = (q.alternativas ?? []).map((x) => x.letra)
      if (new Set(letras).size !== letras.length) ruins.push(`${nome}: letras`)
    }
    expect(ruins).toEqual([])
  })

  it('o que a resolução diz bate com a alternativa marcada', () => {
    const ruins: string[] = []
    for (const { q, nome } of questoes) {
      const certa = q.alternativas?.find((a) => a.correta)?.letra
      if (!certa) continue
      const frases = [q.resolucao?.resultado ?? '', ...q.passos.map((p) => p.texto)]
      // em negrito é a resposta; sem negrito, a resolução está comentando um distrator
      for (const f of frases) for (const m of f.matchAll(/[Aa]lternativa \*\*\(([a-j])\)/g)) if (m[1] !== certa) ruins.push(`${nome}: diz (${m[1]}), marcada (${certa}): ${semFormulas(f).slice(0, 60)}`)
    }
    expect(ruins).toEqual([])
  })

  it('a marcada bate com o gabarito oficial, salvo as divergências anotadas', () => {
    const ruins: string[] = []
    for (const { q, nome } of questoes) {
      const certa = q.alternativas?.find((a) => a.correta)?.letra
      const of = q.resolucao?.oficial
      const letra = of?.resposta.match(/\(([a-j])\)/)?.[1]
      if (certa && letra && letra !== certa && !of?.observacao) ruins.push(`${nome}: oficial (${letra}), marcada (${certa})`)
    }
    expect(ruins).toEqual([])
  })

  it('passos só citam o que existe', () => {
    const ruins: string[] = []
    for (const { q, nome } of questoes) {
      const ids = new Set(q.objetos.map((o) => o.id))
      const pars = new Set(q.parametros.map((p) => p.id))
      q.passos.forEach((p, i) => {
        for (const id of [...(p.destacar ?? []), ...(p.mostrar ?? []), ...(p.ocultar ?? [])]) if (!ids.has(id)) ruins.push(`${nome} passo ${i}: objeto ${id}`)
        for (const k of Object.keys(p.parametros ?? {})) if (!pars.has(k)) ruins.push(`${nome} passo ${i}: parâmetro ${k}`)
        for (const m of p.medidas ?? []) if (m < 0 || m >= q.medidas.length) ruins.push(`${nome} passo ${i}: medida ${m}`)
      })
    }
    expect(ruins).toEqual([])
  })

  it('cada prova soma 10 pontos, quando dá pontos', () => {
    const ruins: string[] = []
    for (const p of provas) {
      const pts = p.questoes.map((q) => q.pontos)
      if (pts.every((x) => x === undefined)) continue
      const soma = pts.reduce((s: number, x) => s + (x ?? 0), 0)
      if (Math.abs(soma - 10) > 1e-6 || pts.some((x) => x === undefined)) ruins.push(`${p.id}: ${soma}`)
    }
    expect(ruins).toEqual([])
  })
})

describe('recortes', () => {
  const pasta = resolve(process.cwd(), 'public/provas')

  it('toda figura citada existe', () => {
    const ruins = questoes.flatMap(({ p, q }) => figurasDe(p.id, q).filter((f) => !existsSync(join(resolve(process.cwd(), 'public'), f))))
    expect(ruins).toEqual([])
  })

  it('nenhum recorte sobra sem questão: arquivo órfão iria a público à toa', () => {
    const citados = new Set(questoes.flatMap(({ p, q }) => figurasDe(p.id, q)))
    const sobras = readdirSync(pasta).flatMap((d) => readdirSync(join(pasta, d)).map((f) => `provas/${d}/${f}`)).filter((f) => !citados.has(f))
    expect(sobras).toEqual([])
  })
})
