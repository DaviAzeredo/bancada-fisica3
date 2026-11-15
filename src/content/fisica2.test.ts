import katex from 'katex'
import { describe, expect, it } from 'vitest'
import { avaliar } from '../ui/Plot'
import { FISICA2 } from './fisica2'

const formulas = (t: string) => [...t.matchAll(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g)].map((m) => m[1] ?? m[2])
const semFormulas = (t: string) => t.replace(/\$\$[\s\S]+?\$\$|\$[^$\n]+?\$/g, ' ')

function textos(p: (typeof FISICA2)[number]) {
  return [
    p.enunciado,
    p.resolucao.resultado,
    ...p.resolucao.errosComuns,
    ...p.resolucao.etapas.map((e) => e.texto),
    ...p.respostas.map((r) => r.texto),
    ...(p.alternativas ?? []).flatMap((a) => [a.texto, a.porque]),
  ]
}

describe('Física II', () => {
  it('ids únicos', () => {
    expect(new Set(FISICA2.map((p) => p.id)).size).toBe(FISICA2.length)
  })

  it('cada item respondido tem uma explicação completa só dele', () => {
    const ruins: string[] = []
    for (const p of FISICA2)
      for (const r of p.respostas) {
        const e = p.resolucao.etapas.find((x) => x.titulo.startsWith(r.item))
        if (!e) ruins.push(`${p.id} ${r.item}: sem etapa`)
        else if (semFormulas(e.texto).length < 300) ruins.push(`${p.id} ${r.item}: curta`)
      }
    expect(ruins).toEqual([])
  })

  it('toda fórmula compila e nenhum cifrão sobra', () => {
    const ruins: string[] = []
    for (const p of FISICA2)
      for (const t of textos(p)) {
        for (const f of formulas(t))
          try {
            katex.renderToString(f, { throwOnError: true, strict: 'ignore' })
          } catch (e) {
            ruins.push(`${p.id}: ${f.slice(0, 50)} → ${(e as Error).message.slice(0, 60)}`)
          }
        if (semFormulas(t).includes('$')) ruins.push(`${p.id}: cifrão solto`)
      }
    expect(ruins).toEqual([])
  })

  it('objetivas têm alternativa certa e explicam cada uma', () => {
    for (const p of FISICA2) {
      if (!p.alternativas) continue
      expect(p.alternativas.some((a) => a.correta), p.id).toBe(true)
      expect(p.alternativas.every((a) => a.porque.length > 10), p.id).toBe(true)
    }
  })

  it('os gráficos dão números em quase todo o domínio', () => {
    const ruins: string[] = []
    for (const p of FISICA2)
      for (const g of p.graficos ?? []) {
        const vals = Object.fromEntries((g.parametros ?? []).map((x) => [x.id, x.valor]))
        for (const c of g.curvas) {
          let ok = 0
          for (let i = 0; i <= 100; i++) if (Number.isFinite(avaliar(c.expr, { ...vals, [g.x.variavel]: g.x.de + ((g.x.ate - g.x.de) * i) / 100 }))) ok++
          if (ok < 90) ruins.push(`${p.id} · ${g.titulo} · ${c.expr}`)
        }
        if (g.setas && !Number.isFinite(avaliar(g.setas.expr, { ...vals, [g.x.variavel]: (g.x.de + g.x.ate) / 2 }))) ruins.push(`${p.id} · setas`)
      }
    expect(ruins).toEqual([])
  })

  it('os números das respostas conferem com as contas', () => {
    // R1: 40 oscilações em 4 s; energia a e⁻¹ em 2 s
    expect(4 / ((2 * Math.PI) / (20 * Math.PI))).toBeCloseTo(40)
    // R2: 635 Hz com A parado; 40 m/s
    expect((600 * 360) / 340).toBeCloseTo(635.3, 1)
    expect(340 - (600 * 360) / 720).toBeCloseTo(40)
    // 3: ω = √(g/Δ), T e f
    const w = Math.sqrt(9.8 / 0.02)
    expect((2 * Math.PI) / w).toBeCloseTo(0.284, 3)
    expect(w / (2 * Math.PI)).toBeCloseTo(3.52, 2)
    // 6: v = ω/k e distância entre nós
    expect(500 / 0.025 / 100).toBeCloseTo(200)
    expect(Math.PI / 0.025).toBeCloseTo(125.66, 2)
    // 10: x(0) = 0 descendo com δ = π/2
    expect(avaliar('4*cos(2*pi*t + pi/2)', { t: 0.25 })).toBeCloseTo(-4)
    // 12: com v_p = u o eco volta sem desvio
    expect(avaliar('1e10*((3e8 - u)*(3e8 + vp)/((3e8 - vp)*(3e8 + u)) - 1)', { u: 37, vp: 37 })).toBeCloseTo(0, 3)
  })
})
