import { describe, expect, it } from 'vitest'
import { Prova } from '../scenario/schema'
import { LABS } from './labs'
import { PROVAS } from './provas'

/** Caracteres de controle aparecem quando um "\t" ou "\v" de LaTeX perde a barra. */
// eslint-disable-next-line no-control-regex -- é exatamente o que o teste procura
const CONTROLE = /[\x00-\x08\x0b\x0c\x0e-\x1f]/

function strings(v: unknown, path = '', out: [string, string][] = []): [string, string][] {
  if (typeof v === 'string') out.push([path, v])
  else if (Array.isArray(v)) v.forEach((x, i) => strings(x, `${path}[${i}]`, out))
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) strings(x, path ? `${path}.${k}` : k, out)
  return out
}

describe('conteúdo', () => {
  it('nenhum texto tem caractere de controle (escape de LaTeX perdido)', () => {
    for (const [path, s] of strings({ PROVAS, LABS })) expect(CONTROLE.test(s), path).toBe(false)
  })

  for (const raw of PROVAS) {
    const prova = Prova.parse(raw)
    describe(prova.titulo, () => {
      for (const q of prova.questoes) {
        it(`questão ${q.numero}: gabarito detalhado completo`, () => {
          expect(q.resolucao, 'resolução').toBeDefined()
          const r = q.resolucao!
          expect(r.etapas.length).toBeGreaterThan(0)
          for (const e of r.etapas) if (e.passo !== undefined) expect(q.passos[e.passo], `etapa "${e.titulo}"`).toBeDefined()
          for (const c of r.conceitos) if (c.lab) expect(LABS.some((l) => l.cenario.id === c.lab), `lab ${c.lab}`).toBe(true)
          if (q.alternativas) for (const a of q.alternativas) expect(a.porque, `alternativa ${a.letra}`).toBeTruthy()
          for (const p of q.passos)
            if (p.previsao) {
              expect(p.previsao.correta, `previsão de "${p.titulo}"`).toBeGreaterThanOrEqual(0)
              expect(p.previsao.correta).toBeLessThan(p.previsao.opcoes.length)
            }
          const itens = new Set(q.passos.map((p) => p.item).filter(Boolean))
          for (const item of itens) expect(q.respostas.some((x) => x.item === item), `resposta do item ${item}`).toBe(true)
        })
      }
      it('pontuação das discursivas soma o valor da questão', () => {
        for (const q of prova.questoes)
          // há provas que só dão o total da questão, sem pontos por item
          if (q.respostas.some((x) => x.pontos !== undefined) && q.pontos !== undefined)
            expect(q.respostas.reduce((s, x) => s + (x.pontos ?? 0), 0)).toBeCloseTo(q.pontos, 9)
      })
    })
  }
})
