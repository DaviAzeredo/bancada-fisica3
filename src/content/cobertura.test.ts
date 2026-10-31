import { describe, expect, it } from 'vitest'
import { COBERTURA } from './cobertura'
import { LABS } from './labs'
import { PROVAS } from './provas'
import { carregarProva } from './registry'

const ids = new Set(LABS.map((l) => l.cenario.id))

describe('cobertura das provas pelos laboratórios', () => {
  for (const prova of PROVAS)
    it(`${prova.id}: toda questão aponta para laboratórios que existem`, () => {
      const mapa = COBERTURA[prova.id]
      expect(mapa, 'prova sem linha em cobertura.ts').toBeDefined()
      expect(Object.keys(mapa).sort()).toEqual(prova.questoes.map((q) => q.id).sort())
      for (const [q, labs] of Object.entries(mapa)) {
        expect(labs.length, q).toBeGreaterThan(0)
        for (const l of labs) expect(ids.has(l), `${q}: ${l}`).toBe(true)
      }
    })

  it('não sobra lab sem questão', () => {
    const usados = new Set(Object.values(COBERTURA).flatMap((m) => Object.values(m).flat()))
    expect([...ids].filter((l) => !usados.has(l))).toEqual([])
  })

  it('a questão carregada traz os labs da matriz', async () => {
    const prova = await carregarProva('p2-2026-1-diurno')
    expect(prova?.questoes.find((q) => q.id === 'disc1')?.labs).toEqual(['capacitor'])
  })
})
