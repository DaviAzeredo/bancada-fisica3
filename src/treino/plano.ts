import { BANCO, PROVAS_TREINO, RESERVADAS, TEMAS, labsDoTema, tituloCurto, tituloDoLab } from './banco'
import { diasEntre, somaDias } from './progresso'

export interface Tarefa {
  id: string
  dia: string
  fase: string
  titulo: string
  detalhe: string
  href: string
  lab?: string
}

type Rascunho = Omit<Tarefa, 'dia'>

/** Reparte os dias pelo peso de cada tema; sobras vão para as maiores frações. */
function repartir(dias: number, pesos: number[]) {
  const soma = pesos.reduce((s, p) => s + p, 0)
  const exatos = pesos.map((p) => (dias * p) / soma)
  const cotas = exatos.map(Math.floor)
  const ordem = exatos.map((e, i) => [e - cotas[i], i]).sort((a, b) => b[0] - a[0])
  const sobra = dias - cotas.reduce((s, c) => s + c, 0)
  for (let k = 0; k < sobra; k++) cotas[ordem[k][1]]++
  return cotas
}

/**
 * O peso é o número de questões, não os pontos: uma discursiva de 4,0 cairia num tema só
 * e daria oito dias seguidos de Ampère. E os temas se alternam, em vez de virem em bloco:
 * voltar a um assunto depois de alguns dias fixa mais do que insistir nele.
 */
function diasDeTema(n: number): Rascunho[] {
  const temas = TEMAS.map((t) => ({ ...t, questoes: BANCO.filter((q) => q.tema === t.id).length })).sort((a, b) => b.questoes - a.questoes)
  const cotas = repartir(n, temas.map((t) => t.questoes))
  const dias: Rascunho[] = []
  for (let k = 0; dias.length < n; k++) {
    temas.forEach((t, i) => {
      if (k >= cotas[i]) return
      const labs = labsDoTema(t.id)
      const lab = labs[k % labs.length]
      dias.push({
        id: `tema:${t.id}:${k}`,
        fase: 'Temas',
        titulo: cotas[i] > 1 ? `${t.titulo}, parte ${k + 1} de ${cotas[i]}` : t.titulo,
        detalhe: `Comece pelo laboratório ${tituloDoLab(lab)}: mexa até prever o resultado antes de ver a medida. Depois, questões do tema.`,
        href: `#/treino/tema/${t.id}`,
        lab,
      })
    })
  }
  return dias
}

function diasDeDiscursiva(n: number): Rascunho[] {
  return Array.from({ length: n }, (_, k) => ({
    id: `disc:${k}`,
    fase: 'Discursivas',
    titulo: `Discursiva ${k + 1} de ${n}`,
    detalhe: 'Resolva no papel, item por item, e corrija com a pontuação da própria prova. É aqui que se ganha ou perde o 9.',
    href: '#/treino/tema/discursivas',
  }))
}

/** A prova mais recente fica por último: é a que mais se parece com a próxima. */
function diasDeSimulado(n: number): Rascunho[] {
  return RESERVADAS.slice(0, n)
    .reverse()
    .flatMap((id) => {
      const prova = PROVAS_TREINO.find((p) => p.id === id)
      const nome = prova ? tituloCurto(prova) : id
      return [
        { id: `sim:${id}`, fase: 'Simulados', titulo: `Simulado: ${nome}`, detalhe: 'Prova inteira, com o tempo correndo e sem consultar nada.', href: `#/treino/simulado/${id}` },
        { id: `cor:${id}`, fase: 'Simulados', titulo: `Corrigir: ${nome}`, detalhe: 'Refaça sem olhar o que errou e abra cada resolução na bancada.', href: '#/treino/revisao' },
      ]
    })
}

/** Só depende das datas: o plano não muda de lugar conforme o aluno avança. */
export function gerarPlano(inicio: string, dataProva: string): Tarefa[] {
  const total = Math.min(Math.max(diasEntre(inicio, dataProva), 1), 120)
  const livres = total - 1
  const simulados = Math.min(RESERVADAS.length, Math.max(livres >= 2 ? 1 : 0, Math.round(livres * 0.12)))
  const discursivas = Math.round(livres * 0.15)
  const tarefas: Rascunho[] = [
    ...diasDeTema(livres - 2 * simulados - discursivas),
    ...diasDeDiscursiva(discursivas),
    ...diasDeSimulado(simulados),
    { id: 'vespera', fase: 'Véspera', titulo: 'Revisão leve', detalhe: 'Só o que ainda está na fila de revisão. Nada novo, e durma bem.', href: '#/treino/revisao' },
  ]
  return tarefas.map((t, i) => ({ ...t, dia: somaDias(inicio, i) }))
}
