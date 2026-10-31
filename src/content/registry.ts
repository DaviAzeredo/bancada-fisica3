import type { Prova, ProvaInput, Scenario } from '../scenario/schema'
import catalogo from './catalogo.json'

export interface ProvaMeta {
  id: string
  titulo: string
  subtitulo?: string
  questoes: { id: string; numero: string; titulo: string; resumo?: string; secao?: string; pontos?: number }[]
}

export interface LabMeta {
  id: string
  numero: string
  grupo: string
  titulo: string
  resumo?: string
}

export interface Lab {
  numero: string
  grupo: string
  scenario: Scenario
}

/**
 * Só provas curadas: chegam como PDF + gabarito, são escritas à mão e testadas.
 * Aqui fica só a lista, que é o que a página inicial e os links usam; o conteúdo
 * baixa ao abrir a rota. O catálogo é gerado por `npm run catalogo`.
 */
export const provas: ProvaMeta[] = catalogo.provas
export const labs: LabMeta[] = catalogo.labs

/** Um chunk por prova. O nome do arquivo é o id, como em fontes/ e public/provas/. */
const modulos = import.meta.glob<Record<string, ProvaInput>>('./provas/*-*.ts')

// use() só reconhece uma promessa já resolvida se receber a mesma referência:
// sem guardá-la, cada render suspenderia de novo.
const provasCarregadas = new Map<string, Promise<Prova | undefined>>()
let labsCarregados: Promise<Lab[]> | undefined

export function carregarProva(id: string) {
  let p = provasCarregadas.get(id)
  if (!p) {
    const modulo = modulos[`./provas/${id}.ts`]
    p = modulo
      ? Promise.all([modulo(), import('../scenario/schema'), import('./cobertura')]).then(([m, s, c]) => {
          const prova = s.Prova.parse(Object.values(m)[0])
          for (const q of prova.questoes) q.labs = c.COBERTURA[id]?.[q.id]
          return prova
        })
      : Promise.resolve(undefined)
    provasCarregadas.set(id, p)
  }
  return p
}

export function carregarLabs() {
  labsCarregados ??= Promise.all([import('./labs'), import('../scenario/schema')]).then(([m, s]) =>
    m.LABS.map((l) => ({ numero: l.numero, grupo: l.grupo, scenario: s.Scenario.parse(l.cenario) })),
  )
  return labsCarregados
}

/** Caminhos das imagens de enunciado de uma questão (uma por parte da figura). */
export function figurasDe(provaId: string, q: Prova['questoes'][number]): string[] {
  if (!q.figura) return []
  const n = Array.isArray(q.figura) ? q.figura.length : 1
  return Array.from({ length: n }, (_, i) => `provas/${provaId}/${q.id}${i ? `-${i + 1}` : ''}.webp`)
}
