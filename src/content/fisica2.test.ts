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

  it('as provas anteriores conferem com o gabarito oficial', () => {
    // 2025/1 Q1: T = 2πA/v0
    expect((2 * Math.PI * (1 / Math.PI)) / 0.2).toBeCloseTo(10)
    // Q2: tan²(π/6)
    expect(Math.tan(Math.PI / 6) ** 2).toBeCloseTo(1 / 3)
    // Q3: π√d(1 + 1/√2) = 2π√d′
    expect(((1 + 1 / Math.SQRT2) / 2) ** 2).toBeCloseTo((3 + 2 * Math.SQRT2) / 8)
    // Q5: A/A′ com γ = ω0
    const amp = (u: number) => 1 / Math.sqrt((1 - u * u) ** 2 + u * u)
    expect(amp(1) / amp(0.5)).toBeCloseTo(Math.sqrt(13 / 16))
    // Q8: λ, τ, v
    expect((2 * Math.PI) / (0.4 * Math.PI)).toBeCloseTo(5)
    expect(5 * (1 / ((2 * Math.PI) / (250 * Math.PI)))).toBeCloseTo(625)
    // 2025/2 Q1: ω e A
    expect(Math.sqrt(4000 / 10)).toBeCloseTo(20)
    expect(avaliar('-0.5*20*sin(3*pi/2)', {})).toBeCloseTo(10)
    // Q2: mgA²/2L
    expect((2 * 10 * 0.01) / 20).toBeCloseTo(0.01)
    // Q3: a força exata tende à linear
    expect(avaliar('-2*Y/(Y^2 + 0.25)^1.5', { Y: 0.001 }) / -0.016).toBeCloseTo(1, 3)
    // Q4: T = μv²
    expect(0.05 * (2 / 0.4) ** 2).toBeCloseTo(1.25)
    // Q8 (c): δ = ln2/3
    expect(Math.exp(-Math.log(2) / 3) ** 3).toBeCloseTo(0.5)
  })

  it('a corda fixa-livre volta invertida em 2L/v e igual em 4L/v', async () => {
    const { PULSO_FIXA_LIVRE: f } = await import('./fisica2Provas')
    for (const x of [0.3, 0.46, 0.5, 0.55, 0.9]) {
      const y0 = avaliar(f, { x, t: 0 })
      expect(avaliar(f, { x, t: 2 }), `x=${x}`).toBeCloseTo(-y0)
      expect(avaliar(f, { x, t: 4 }), `x=${x}`).toBeCloseTo(y0)
      expect(avaliar(f, { x, t: 1 }), `x=${x}`).toBeCloseTo(0)
    }
    expect(avaliar(f, { x: 0.5, t: 0 })).toBeCloseTo(1)
  })

  it('o pulso retangular volta ao meio: em pé em L/v, invertido em 2L/v e 3L/v', async () => {
    const { PULSO_RETANGULAR: f } = await import('./fisica2Provas')
    const y = (x: number, t: number) => avaliar(f, { x, t })
    expect(y(0.5, 0)).toBe(1)
    expect(y(0.5, 1)).toBe(1)
    expect(y(0.5, 2)).toBe(-1)
    expect(y(0.5, 3)).toBe(-1)
    // em 2L/v anda para a direita, em 3L/v para a esquerda
    expect(y(0.58, 2.05)).toBe(-1)
    expect(y(0.42, 3.05)).toBe(-1)
    expect(y(0.42, 2.05)).toBe(0)
    // nó na ponta fixa
    for (const t of [0.5, 1.5, 2.5]) expect(y(0, t)).toBe(0)
  })

  it('o seletor de opções da reflexão desenha seis formas diferentes', () => {
    const p = FISICA2.find((q) => q.id === 'p2-2025-1-q7')!
    const g = p.graficos!.find((x) => x.parametros?.some((q) => q.id === 'op'))!
    const assinaturas = [1, 2, 3, 4, 5, 6].map((op) => [-3.5, -3, -2, -1.4].map((x) => avaliar(g.curvas[0].expr, { op, x }).toFixed(3)).join())
    expect(new Set(assinaturas).size).toBe(6)
    // (c) = pequena corcova à esquerda e vale largo junto à haste
    expect(avaliar(g.curvas[0].expr, { op: 3, x: -3.6 })).toBeGreaterThan(0.3)
    expect(avaliar(g.curvas[0].expr, { op: 3, x: -2 })).toBeLessThan(-0.8)
  })
})
