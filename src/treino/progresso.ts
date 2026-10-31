import { create } from 'zustand'
import { BANCO, PROVAS_TREINO, type QuestaoBanco, RESERVADAS, TEMAS } from './banco'

export const hojeISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const emUTC = (dia: string) => Date.parse(`${dia}T00:00:00Z`)
export const somaDias = (dia: string, n: number) => new Date(emUTC(dia) + n * 86400000).toISOString().slice(0, 10)
export const diasEntre = (de: string, ate: string) => Math.round((emUTC(ate) - emUTC(de)) / 86400000)
export const dataCurta = (dia: string) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`

export interface Registro {
  /** Fração dos pontos na última tentativa. */
  acerto: number
  em: string
  caixa: number
  /** Dia da próxima revisão; vazio quando a questão saiu da fila. */
  vence: string
  vezes: number
}

export interface SimuladoFeito {
  provaId: string
  fim: string
  nota: number
  segundos: number
}

export interface EmCurso {
  provaId: string
  inicio: number
  minutos: number
  respostas: Record<string, string>
  entregue?: number
  /** Pontos que o aluno se deu, por questão e item. */
  discursivas: Record<string, Record<string, number>>
}

export interface Progresso {
  dataProva: string
  inicio: string
  questoes: Record<string, Registro>
  simulados: SimuladoFeito[]
  emCurso?: EmCurso
  feitas: string[]
}

/** Dias até rever, por caixa. Errar volta para a primeira. */
const INTERVALOS = [1, 3, 7]
const BEM = 0.8

export function registrar(antes: Registro | undefined, acerto: number, hoje: string): Registro {
  const caixa = acerto < BEM ? 0 : antes ? antes.caixa + 1 : 2
  return { acerto, em: hoje, caixa, vence: caixa < INTERVALOS.length ? somaDias(hoje, INTERVALOS[caixa]) : '', vezes: (antes?.vezes ?? 0) + 1 }
}

export function paraRevisar(questoes: Progresso['questoes'], hoje: string) {
  return BANCO.filter((q) => {
    const r = questoes[q.chave]
    return r?.vence && r.vence <= hoje
  })
}

const noBanco = (banco: QuestaoBanco[], f: (q: QuestaoBanco) => number) => banco.reduce((s, q) => s + f(q) * q.pontos, 0)

/** O que o aluno acertou na última vez, como nota de 0 a 10. Questão não feita vale zero. */
export function dominio(questoes: Progresso['questoes'], banco = BANCO) {
  const total = noBanco(banco, () => 1)
  return total ? (10 * noBanco(banco, (q) => questoes[q.chave]?.acerto ?? 0)) / total : 0
}

export interface LinhaTema {
  id: string
  titulo: string
  pontos: number
  conseguidos: number
  /** Parte da nota de 10 que este tema vale nas provas. */
  peso: number
  /** Parte da nota de 10 que ainda se perde neste tema. */
  perdidos: number
  questoes: number
  feitas: number
}

export function porTema(questoes: Progresso['questoes'], banco = BANCO): LinhaTema[] {
  const total = noBanco(banco, () => 1)
  return TEMAS.map((t) => {
    const qs = banco.filter((q) => q.tema === t.id)
    const pontos = noBanco(qs, () => 1)
    const conseguidos = noBanco(qs, (q) => questoes[q.chave]?.acerto ?? 0)
    return {
      id: t.id,
      titulo: t.titulo,
      pontos,
      conseguidos,
      peso: (10 * pontos) / total,
      perdidos: (10 * (pontos - conseguidos)) / total,
      questoes: qs.length,
      feitas: qs.filter((q) => questoes[q.chave]).length,
    }
  }).sort((a, b) => b.perdidos - a.perdidos)
}

/** Fila do treino: primeiro o que nunca foi feito, depois o que errou. */
export function filaDoTema(id: string, questoes: Progresso['questoes']) {
  const livres = BANCO.filter((q) => !RESERVADAS.includes(q.provaId))
  const qs = id === 'discursivas' ? livres.filter((q) => q.discursiva) : livres.filter((q) => q.tema === id)
  const ordem = (q: QuestaoBanco) => {
    const r = questoes[q.chave]
    return !r ? 0 : r.acerto < BEM ? 1 : 2
  }
  return [...qs].sort((a, b) => ordem(a) - ordem(b) || Number(a.discursiva) - Number(b.discursiva))
}

const CHAVE = 'bancada-treino-p3'

/** A P3 de 2026/2 é em 30 de novembro, ou 30 dias à frente para quem chegar depois. */
const dataPadrao = (hoje: string) => (hoje > '2026-11-02' ? somaDias(hoje, 30) : '2026-11-30')

const ehDia = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(emUTC(v))
const ehObjeto = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const ehNumero = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

const ehRegistro = (r: unknown): r is Registro =>
  ehObjeto(r) && ehNumero(r.acerto) && r.acerto >= 0 && r.acerto <= 1 && ehDia(r.em) && ehNumero(r.caixa) && (r.vence === '' || ehDia(r.vence)) && ehNumero(r.vezes)

const ehSimuladoFeito = (s: unknown): s is SimuladoFeito => ehObjeto(s) && typeof s.provaId === 'string' && ehDia(s.fim) && ehNumero(s.nota) && ehNumero(s.segundos)

const ehEmCurso = (c: unknown): c is EmCurso =>
  ehObjeto(c) &&
  PROVAS_TREINO.some((p) => p.id === c.provaId) &&
  ehNumero(c.inicio) &&
  ehNumero(c.minutos) &&
  (c.entregue === undefined || ehNumero(c.entregue)) &&
  ehObjeto(c.respostas) &&
  Object.values(c.respostas).every((r) => typeof r === 'string') &&
  ehObjeto(c.discursivas) &&
  Object.values(c.discursivas).every((d) => ehObjeto(d) && Object.values(d).every(ehNumero))

/**
 * O que vem do navegador pode estar velho, cortado ou mexido à mão. Fica só o que tem
 * a forma certa: um registro estragado não pode derrubar a página nem o resto do progresso.
 */
export function saneia(salvo: unknown, vazio: Progresso): Progresso {
  if (!ehObjeto(salvo)) return vazio
  return {
    dataProva: ehDia(salvo.dataProva) ? salvo.dataProva : vazio.dataProva,
    inicio: ehDia(salvo.inicio) ? salvo.inicio : vazio.inicio,
    questoes: ehObjeto(salvo.questoes) ? Object.fromEntries(Object.entries(salvo.questoes).filter((e): e is [string, Registro] => ehRegistro(e[1]))) : {},
    simulados: Array.isArray(salvo.simulados) ? salvo.simulados.filter(ehSimuladoFeito) : [],
    emCurso: ehEmCurso(salvo.emCurso) ? salvo.emCurso : undefined,
    feitas: Array.isArray(salvo.feitas) ? salvo.feitas.filter((t): t is string => typeof t === 'string') : [],
  }
}

function ler(): Progresso {
  const hoje = hojeISO()
  const vazio: Progresso = { dataProva: dataPadrao(hoje), inicio: hoje, questoes: {}, simulados: [], feitas: [] }
  try {
    const salvo = window.localStorage.getItem(CHAVE)
    return salvo ? saneia(JSON.parse(salvo), vazio) : vazio
  } catch {
    return vazio
  }
}

function gravar(p: Progresso) {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(p))
  } catch {
    // sem armazenamento o treino funciona, só não sobrevive a recarregar a página
  }
}

interface Acoes {
  responder(chave: string, acerto: number): void
  definirData(dia: string): void
  marcar(tarefa: string): void
  recomecarPlano(): void
  comecarSimulado(provaId: string, minutos: number): void
  marcarResposta(questao: string, letra: string): void
  entregar(): void
  corrigir(questao: string, item: string, pontos: number): void
  concluirSimulado(nota: number, acertos: Record<string, number>): void
  descartarSimulado(): void
}

export const useTreino = create<Progresso & Acoes>((set, get) => {
  const muda = (f: (p: Progresso) => Partial<Progresso>) => {
    set(f(get()))
    const { dataProva, inicio, questoes, simulados, emCurso, feitas } = get()
    gravar({ dataProva, inicio, questoes, simulados, emCurso, feitas })
  }
  const noSimulado = (f: (c: EmCurso) => Partial<EmCurso>) => muda(({ emCurso }) => (emCurso ? { emCurso: { ...emCurso, ...f(emCurso) } } : {}))
  return {
    ...ler(),
    responder: (chave, acerto) => muda(({ questoes }) => ({ questoes: { ...questoes, [chave]: registrar(questoes[chave], acerto, hojeISO()) } })),
    definirData: (dataProva) => muda(() => ({ dataProva })),
    marcar: (tarefa) => muda(({ feitas }) => ({ feitas: feitas.includes(tarefa) ? feitas.filter((t) => t !== tarefa) : [...feitas, tarefa] })),
    recomecarPlano: () => muda(() => ({ inicio: hojeISO(), feitas: [] })),
    comecarSimulado: (provaId, minutos) => muda(() => ({ emCurso: { provaId, inicio: Date.now(), minutos, respostas: {}, discursivas: {} } })),
    marcarResposta: (questao, letra) => noSimulado(({ respostas }) => ({ respostas: { ...respostas, [questao]: letra } })),
    entregar: () => noSimulado(() => ({ entregue: Date.now() })),
    corrigir: (questao, item, pontos) => noSimulado(({ discursivas }) => ({ discursivas: { ...discursivas, [questao]: { ...discursivas[questao], [item]: pontos } } })),
    concluirSimulado: (nota, acertos) =>
      muda(({ emCurso, questoes, simulados }) => {
        if (!emCurso) return {}
        const hoje = hojeISO()
        const novas = { ...questoes }
        for (const [questao, acerto] of Object.entries(acertos)) {
          const chave = `${emCurso.provaId}/${questao}`
          novas[chave] = registrar(novas[chave], acerto, hoje)
        }
        const segundos = Math.round(((emCurso.entregue ?? Date.now()) - emCurso.inicio) / 1000)
        return { questoes: novas, simulados: [...simulados, { provaId: emCurso.provaId, fim: hoje, nota, segundos }], emCurso: undefined }
      }),
    descartarSimulado: () => muda(() => ({ emCurso: undefined })),
  }
})

// com duas abas abertas, a que ficou para trás gravaria por cima do que a outra fez
if (typeof window !== 'undefined')
  window.addEventListener('storage', (e) => {
    if (e.key === CHAVE) useTreino.setState(ler())
  })
