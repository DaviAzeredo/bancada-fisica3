import { describe, expect, it } from 'vitest'
import { LABS } from './labs'
import { PROVAS } from './provas'
import { carregarLabs, carregarProva, labs, provas } from './registry'

// Este recorte é o catalogo.json: o bastante para listar tudo sem baixar o conteúdo.
const catalogo = {
  provas: PROVAS.map(({ id, titulo, subtitulo, questoes }) => ({
    id,
    titulo,
    subtitulo,
    questoes: questoes.map(({ id, numero, titulo, resumo, secao, pontos }) => ({ id, numero, titulo, resumo, secao, pontos })),
  })),
  labs: LABS.map(({ numero, grupo, cenario: { id, titulo, resumo } }) => ({ id, numero, grupo, titulo, resumo })),
}

describe('catálogo', () => {
  it('acompanha as provas e os labs (para regenerar: npm run catalogo)', async () => {
    await expect(`${JSON.stringify(catalogo, null, 1)}\n`).toMatchFileSnapshot('./catalogo.json')
  })

  it('cada prova listada carrega do próprio arquivo', async () => {
    for (const meta of provas) {
      const prova = await carregarProva(meta.id)
      expect(prova?.id).toBe(meta.id)
      expect(prova?.questoes.map((q) => q.id)).toEqual(meta.questoes.map((q) => q.id))
    }
  })

  it('cada lab listado carrega', async () => {
    const carregados = await carregarLabs()
    expect(carregados.map((l) => l.scenario.id)).toEqual(labs.map((l) => l.id))
  })

  it('prova desconhecida resolve vazio, sem tentar baixar nada', async () => {
    await expect(carregarProva('p9-1999-1-diurno')).resolves.toBeUndefined()
    await expect(carregarProva('modelos')).resolves.toBeUndefined()
  })

  it('devolve sempre a mesma promessa: use() depende disso para não suspender de novo', () => {
    expect(carregarProva(provas[0].id)).toBe(carregarProva(provas[0].id))
    expect(carregarLabs()).toBe(carregarLabs())
  })
})
