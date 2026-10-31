import { describe, expect, it } from 'vitest'
import { p2_2026_1_diurno } from '../content/provas/p2-2026-1-diurno'
import { checkProva } from './validate'

describe('validação de provas geradas', () => {
  it('a prova curada passa pela validação completa (JSON ida e volta)', () => {
    const { prova, errors } = checkProva(JSON.parse(JSON.stringify(p2_2026_1_diurno)))
    expect(errors).toEqual([])
    expect(prova?.questoes.length).toBe(7)
  })
  it('aponta erro de expressão com o número da questão', () => {
    const raw = JSON.parse(JSON.stringify(p2_2026_1_diurno))
    raw.questoes[0].medidas[0].expr = 'fluxo(S)'
    const { errors } = checkProva(raw)
    expect(errors.some((e) => e.startsWith('questão 1'))).toBe(true)
  })
  it('aponta campo faltando no schema', () => {
    const { prova, errors } = checkProva({ id: 'x', titulo: 'y', questoes: [{ id: 'q', numero: '1', titulo: 't' }] })
    expect(prova).toBeUndefined()
    expect(errors.join(' ')).toMatch(/objetos/)
  })
})
