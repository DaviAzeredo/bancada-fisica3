import { COBERTURA } from '../content/cobertura'
import { type ProvaMeta, labs, provas } from '../content/registry'

export interface Tema {
  id: string
  titulo: string
  labs: string[]
}

/** A ementa em blocos de estudo. Cada lab pertence a um só tema. */
export const TEMAS: Tema[] = [
  { id: 'campo', titulo: 'Campo e potencial', labs: ['coulomb', 'dipolo', 'distribuicoes', 'potencial', 'energia'] },
  { id: 'gauss', titulo: 'Gauss e condutores', labs: ['gauss', 'densidade', 'planos', 'condutores'] },
  { id: 'capacitores', titulo: 'Capacitores', labs: ['capacitor', 'associacao'] },
  { id: 'corrente', titulo: 'Corrente e circuitos', labs: ['corrente', 'continua'] },
  { id: 'forca', titulo: 'Força magnética', labs: ['lorentz', 'forcas'] },
  { id: 'fontes', titulo: 'Biot-Savart e Ampère', labs: ['trechos', 'ampere', 'ampereJ'] },
  { id: 'inducao', titulo: 'Indução', labs: ['faraday', 'movimento', 'circuitos', 'maxwell'] },
]

export interface QuestaoBanco {
  chave: string
  provaId: string
  questaoId: string
  numero: string
  titulo: string
  resumo?: string
  pontos: number
  discursiva: boolean
  tema: string
  labs: string[]
}

/** Terceiras provas: nos períodos sem P3, a terceira prova se chama PF. */
export const PROVAS_TREINO: ProvaMeta[] = provas.filter((p) => /^(p3|pf)-/.test(p.id))

/**
 * As três mais recentes ficam fora do treino por tema: resolvidas pela primeira vez
 * no simulado, elas ainda medem alguma coisa.
 */
export const RESERVADAS: string[] = PROVAS_TREINO.slice(0, 3).map((p) => p.id)

export const BANCO: QuestaoBanco[] = PROVAS_TREINO.flatMap((p) =>
  p.questoes.map((q) => {
    const cobertura = COBERTURA[p.id]?.[q.id] ?? []
    return {
      chave: `${p.id}/${q.id}`,
      provaId: p.id,
      questaoId: q.id,
      numero: q.numero,
      titulo: q.titulo,
      resumo: q.resumo,
      pontos: q.pontos ?? 0,
      discursiva: q.secao === 'Discursiva',
      tema: TEMAS.find((t) => t.labs.includes(cobertura[0]))?.id ?? '',
      labs: cobertura,
    }
  }),
)

export const tituloDoLab = (id: string) => labs.find((l) => l.id === id)?.titulo ?? id
export const tituloCurto = (p: ProvaMeta) => p.titulo.replace(' · Diurno', '').replace(' · Noturno', ' noturna')
export const fmt = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** "6 objetivas de 1,0 + discursiva de 4,0", lido da própria prova. */
export function formatoDe(p: ProvaMeta) {
  const obj = p.questoes.filter((q) => q.secao !== 'Discursiva')
  const disc = p.questoes.filter((q) => q.secao === 'Discursiva')
  const cada = obj[0]?.pontos ?? 0
  const partes = [`${obj.length} objetivas de ${fmt(cada)}`]
  if (disc.length) partes.push(`${disc.length > 1 ? `${disc.length} discursivas` : 'discursiva'} de ${disc.map((q) => fmt(q.pontos ?? 0)).join(' e ')}`)
  return partes.join(' + ')
}

export const parteDiscursiva = (p: ProvaMeta) => p.questoes.filter((q) => q.secao === 'Discursiva').reduce((s, q) => s + (q.pontos ?? 0), 0)

/** O tema que mais apareceu nas discursivas das P3, e em quantas das provas. */
export function temaDasDiscursivas() {
  const p3 = PROVAS_TREINO.filter((p) => p.id.startsWith('p3-'))
  const conta = (t: Tema) => p3.filter((p) => BANCO.some((q) => q.provaId === p.id && q.discursiva && q.tema === t.id)).length
  const tema = TEMAS.reduce((a, b) => (conta(b) > conta(a) ? b : a))
  return { tema, vezes: conta(tema), provas: p3.length }
}

/** Labs do tema, começando pelos que mais caíram. */
export function labsDoTema(id: string) {
  const tema = TEMAS.find((t) => t.id === id)
  if (!tema) return []
  const usos = (lab: string) => BANCO.filter((q) => q.labs.includes(lab)).length
  return [...tema.labs].sort((a, b) => usos(b) - usos(a))
}
