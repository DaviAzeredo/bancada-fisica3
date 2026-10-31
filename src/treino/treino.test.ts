import { describe, expect, it } from 'vitest'
import { BANCO, PROVAS_TREINO, RESERVADAS, TEMAS, formatoDe, labsDoTema, parteDiscursiva, temaDasDiscursivas } from './banco'
import { gerarPlano } from './plano'
import { type Progresso, diasEntre, dominio, filaDoTema, paraRevisar, porTema, registrar, saneia, somaDias } from './progresso'

describe('banco de terceiras provas', () => {
  it('tem as P3 dos últimos três anos e a PF', () => {
    const ids = PROVAS_TREINO.map((p) => p.id)
    for (const id of ['p3-2023-2-diurno', 'p3-2023-2-noturno', 'p3-2024-1-diurno', 'p3-2024-1-noturno', 'p3-2024-2-diurno', 'p3-2025-1-diurno', 'p3-2025-2-diurno', 'p3-2026-1-diurno', 'pf-2023-1-noturno']) {
      expect(ids).toContain(id)
    }
  })

  it('cada prova soma 10 pontos: é o que permite dar nota', () => {
    for (const p of PROVAS_TREINO) expect(p.questoes.reduce((s, q) => s + (q.pontos ?? 0), 0), p.id).toBeCloseTo(10, 6)
  })

  it('toda questão cai em um tema, e todo tema tem questão para treinar', () => {
    for (const q of BANCO) expect(q.tema, q.chave).not.toBe('')
    for (const t of TEMAS) expect(filaDoTema(t.id, {}).length, t.id).toBeGreaterThan(0)
    expect(filaDoTema('discursivas', {}).length).toBeGreaterThan(0)
  })

  it('nenhum lab de tema está escrito errado', () => {
    for (const t of TEMAS) expect(labsDoTema(t.id).sort()).toEqual([...t.labs].sort())
    expect(new Set(TEMAS.flatMap((t) => t.labs)).size).toBe(TEMAS.flatMap((t) => t.labs).length)
  })

  it('o treino por tema não gasta as provas guardadas para simulado', () => {
    for (const t of TEMAS) expect(filaDoTema(t.id, {}).some((q) => RESERVADAS.includes(q.provaId))).toBe(false)
  })

  it('sabe o que mais cai na discursiva', () => {
    const { tema, vezes, provas } = temaDasDiscursivas()
    expect(tema.id).toBe('fontes')
    expect(vezes).toBeGreaterThanOrEqual(6)
    expect(provas).toBe(8)
  })

  it('o formato sai da própria prova', () => {
    const p = PROVAS_TREINO.find((x) => x.id === 'p3-2026-1-diurno')!
    expect(formatoDe(p)).toBe('5 objetivas de 1,0 + 2 discursivas de 3,0 e 2,0')
    expect(parteDiscursiva(p)).toBe(5)
  })
})

describe('progresso', () => {
  const hoje = '2026-11-01'

  it('errar volta para amanhã, acertar afasta, e três acertos tiram da fila', () => {
    let r = registrar(undefined, 0, hoje)
    expect(r.vence).toBe('2026-11-02')
    r = registrar(r, 1, r.vence)
    expect(r.vence).toBe('2026-11-05')
    r = registrar(r, 1, r.vence)
    expect(r.vence).toBe('2026-11-12')
    r = registrar(r, 1, r.vence)
    expect(r.vence).toBe('')
    expect(r.vezes).toBe(4)
    expect(registrar(r, 0, hoje).caixa).toBe(0)
  })

  it('quem acerta de primeira ainda revê uma vez, uma semana depois', () => {
    expect(registrar(undefined, 1, hoje).vence).toBe('2026-11-08')
  })

  it('a revisão só pede o que venceu', () => {
    const q = BANCO[0].chave
    const questoes = { [q]: registrar(undefined, 0, hoje) }
    expect(paraRevisar(questoes, hoje)).toEqual([])
    expect(paraRevisar(questoes, '2026-11-02').map((x) => x.chave)).toEqual([q])
  })

  it('o domínio vai de 0 a 10, e questão não feita vale zero', () => {
    expect(dominio({})).toBe(0)
    const tudo = Object.fromEntries(BANCO.map((q) => [q.chave, registrar(undefined, 1, hoje)]))
    expect(dominio(tudo)).toBeCloseTo(10, 9)
    const meia = Object.fromEntries(BANCO.map((q) => [q.chave, registrar(undefined, 0.5, hoje)]))
    expect(dominio(meia)).toBeCloseTo(5, 9)
  })

  it('os temas somam a nota inteira, com o mais perdido primeiro', () => {
    const t = porTema({})
    expect(t.reduce((s, x) => s + x.peso, 0)).toBeCloseTo(10, 9)
    for (let i = 1; i < t.length; i++) expect(t[i - 1].perdidos).toBeGreaterThanOrEqual(t[i].perdidos)
  })

  it('a fila põe primeiro o que nunca foi feito', () => {
    const fila = filaDoTema('inducao', {})
    const feita = fila[0].chave
    const nova = filaDoTema('inducao', { [feita]: registrar(undefined, 1, hoje) })
    expect(nova[nova.length - 1].chave).toBe(feita)
  })
})

describe('progresso guardado no navegador', () => {
  const vazio: Progresso = { dataProva: '2026-11-30', inicio: '2026-10-31', questoes: {}, simulados: [], feitas: [] }
  const bom = { acerto: 1, em: '2026-11-01', caixa: 2, vence: '2026-11-08', vezes: 1 }

  it('qualquer lixo vira um começo limpo', () => {
    for (const lixo of [null, 3, 'x', [], true, { questoes: null, simulados: 7, feitas: 'a', dataProva: 12, emCurso: 'z' }]) {
      const p = saneia(lixo, vazio)
      expect(p.dataProva).toBe('2026-11-30')
      expect(p.questoes).toEqual({})
      expect(p.simulados).toEqual([])
      expect(p.feitas).toEqual([])
      expect(p.emCurso).toBeUndefined()
    }
  })

  it('um registro estragado não leva o resto junto', () => {
    const p = saneia({ questoes: { boa: bom, ruim: { acerto: 'muito' }, fora: { ...bom, acerto: 7 } }, feitas: ['a', 3] }, vazio)
    expect(Object.keys(p.questoes)).toEqual(['boa'])
    expect(p.feitas).toEqual(['a'])
  })

  it('data inválida volta ao padrão', () => {
    expect(saneia({ dataProva: '2026-13-45' }, vazio).dataProva).toBe('2026-11-30')
    expect(saneia({ dataProva: '<script>' }, vazio).dataProva).toBe('2026-11-30')
    expect(saneia({ dataProva: '2026-12-02' }, vazio).dataProva).toBe('2026-12-02')
  })

  it('simulado em andamento só sobrevive se a prova existir e a forma estiver certa', () => {
    const curso = { provaId: PROVAS_TREINO[0].id, inicio: 1, minutos: 120, respostas: { obj1: 'a' }, discursivas: { disc1: { a: 1 } } }
    expect(saneia({ emCurso: curso }, vazio).emCurso).toEqual(curso)
    expect(saneia({ emCurso: { ...curso, provaId: '../../etc' } }, vazio).emCurso).toBeUndefined()
    expect(saneia({ emCurso: { ...curso, respostas: { obj1: 2 } } }, vazio).emCurso).toBeUndefined()
    expect(saneia({ emCurso: { ...curso, discursivas: { disc1: 'x' } } }, vazio).emCurso).toBeUndefined()
  })

  it('__proto__ no arquivo salvo não contamina nada', () => {
    const p = saneia(JSON.parse('{"questoes":{"__proto__":{"acerto":1},"boa":{"acerto":1,"em":"2026-11-01","caixa":2,"vence":"","vezes":1}}}'), vazio)
    expect(Object.keys(p.questoes)).toEqual(['boa'])
    expect(({} as Record<string, unknown>).acerto).toBeUndefined()
  })
})

describe('plano', () => {
  it('ocupa cada dia até a véspera da prova', () => {
    const plano = gerarPlano('2026-10-31', '2026-11-30')
    expect(plano).toHaveLength(30)
    plano.forEach((t, i) => expect(t.dia).toBe(somaDias('2026-10-31', i)))
    expect(plano[plano.length - 1]).toMatchObject({ id: 'vespera', dia: '2026-11-29' })
  })

  it('faz os três simulados, com a prova mais recente por último', () => {
    const plano = gerarPlano('2026-10-31', '2026-11-30')
    const sims = plano.filter((t) => t.id.startsWith('sim:')).map((t) => t.id)
    expect(sims).toEqual([...RESERVADAS].reverse().map((id) => `sim:${id}`))
  })

  it('cada tarefa tem um id próprio: é ele que guarda o que foi feito', () => {
    const plano = gerarPlano('2026-10-31', '2026-11-30')
    expect(new Set(plano.map((t) => t.id)).size).toBe(plano.length)
  })

  it('cabe em qualquer prazo', () => {
    for (const dias of [0, 1, 2, 3, 5, 8, 13, 21, 30, 60, 90]) {
      const plano = gerarPlano('2026-10-31', somaDias('2026-10-31', dias))
      expect(plano.length, `${dias} dias`).toBe(Math.max(dias, 1))
      expect(plano[plano.length - 1].id).toBe('vespera')
    }
  })

  it('alterna os temas, sem dias seguidos do mesmo assunto', () => {
    const temas = gerarPlano('2026-10-31', '2026-11-30').filter((t) => t.fase === 'Temas').map((t) => t.href)
    expect(temas.length).toBeGreaterThan(10)
    for (let i = 1; i < temas.length - 3; i++) expect(temas[i], `dia ${i}`).not.toBe(temas[i - 1])
  })

  it('não muda de ideia com a data de hoje', () => {
    expect(diasEntre('2026-10-31', '2026-11-30')).toBe(30)
    expect(gerarPlano('2026-10-31', '2026-11-30')).toEqual(gerarPlano('2026-10-31', '2026-11-30'))
  })
})
