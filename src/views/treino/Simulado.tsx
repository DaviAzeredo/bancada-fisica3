import { type ReactNode, Suspense, use, useEffect, useState } from 'react'
import { carregarProva, provas } from '../../content/registry'
import type { Prova } from '../../scenario/schema'
import { PROVAS_TREINO, RESERVADAS, fmt, formatoDe, tituloCurto } from '../../treino/banco'
import { type EmCurso, dataCurta, useTreino } from '../../treino/progresso'
import { Alternatives } from '../../ui/Answers'
import { Button } from '../../ui/kit'
import { Rich } from '../../ui/Rich'
import { TopBar } from '../Shell'
import { Autocorrecao, Enunciado, Fechamento, type Questao } from './Questao'

const relogio = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

function Pagina({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full">
      <TopBar route="treino" />
      <div className="mx-auto max-w-[760px] px-5 pb-20 sm:px-8">{children}</div>
    </div>
  )
}

function Trilha({ titulo }: { titulo: string }) {
  return (
    <nav className="mb-6 pt-8 text-[13px] text-text-3" aria-label="Treino">
      <a href="#/treino" className="hover:text-text-2">
        Treino
      </a>{' '}
      / <span className="text-text-2">{titulo}</span>
    </nav>
  )
}

function Abertura({ id }: { id: string }) {
  const meta = PROVAS_TREINO.find((p) => p.id === id)
  const { emCurso, simulados, comecarSimulado, descartarSimulado } = useTreino()
  const [minutos, setMinutos] = useState(120)
  if (!meta)
    return (
      <Pagina>
        <Trilha titulo="Simulado" />
        <p className="text-[14px] text-text-2">
          Esta prova não está no banco de simulados.{' '}
          <a href="#/treino" className="text-accent underline underline-offset-4">
            Voltar ao painel
          </a>
        </p>
      </Pagina>
    )
  const outro = emCurso && emCurso.provaId !== id ? provas.find((p) => p.id === emCurso.provaId) : undefined
  const feitos = simulados.filter((s) => s.provaId === id)
  return (
    <Pagina>
      <Trilha titulo={`Simulado: ${tituloCurto(meta)}`} />
      <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-text">{tituloCurto(meta)}</h1>
      <p className="mt-1.5 text-[14px] text-text-2">{formatoDe(meta)}</p>
      <ul className="mt-5 grid max-w-[62ch] gap-1.5 text-[14px] leading-[1.55] text-text-2">
        <li>O relógio corre mesmo se você sair da página, como na prova.</li>
        <li>Nada de gabarito até entregar. A discursiva é no papel, e você a corrige depois com a pontuação da prova.</li>
        {RESERVADAS.includes(id) && <li>Esta prova ficou fora do treino por tema: é uma tentativa limpa.</li>}
      </ul>
      {outro ? (
        <div className="mt-6 flex flex-wrap items-center gap-3 text-[14px] text-text-2">
          Há um simulado em andamento: {tituloCurto(outro)}.
          <a href={`#/treino/simulado/${outro.id}`} className="text-accent underline underline-offset-4">
            Continuar
          </a>
          <button type="button" onClick={descartarSimulado} className="text-text-3 underline underline-offset-4">
            Descartar
          </button>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-[13.5px] text-text-2">
            Tempo
            <input
              type="number"
              min={10}
              max={300}
              step={10}
              value={minutos}
              onChange={(e) => setMinutos(Number(e.target.value) || 120)}
              className="num h-8 w-[72px] rounded-[var(--radius-ctl)] border border-line bg-surface px-2 text-[13px] text-text"
            />
            min
          </label>
          <Button variant="primary" onClick={() => comecarSimulado(id, Math.min(Math.max(minutos, 1), 600))}>
            Começar o simulado
          </Button>
        </div>
      )}
      {feitos.length > 0 && (
        <p className="num mt-6 text-[13px] text-text-3">
          Feito antes: {feitos.map((s) => `${fmt(s.nota)} em ${dataCurta(s.fim)}`).join(' · ')}
        </p>
      )}
    </Pagina>
  )
}

function Cronometro({ curso }: { curso: EmCurso }) {
  const [agora, setAgora] = useState(() => Date.now())
  useEffect(() => {
    const fim = window.setInterval(() => setAgora(Date.now()), 1000)
    return () => window.clearInterval(fim)
  }, [])
  const resta = Math.round((curso.inicio + curso.minutos * 60000 - agora) / 1000)
  return (
    <span className={`num text-[15px] font-medium ${resta < 0 ? 'text-danger' : resta < 600 ? 'text-pos' : 'text-text'}`} aria-label="Tempo restante">
      {resta < 0 ? `+${relogio(-resta)}` : relogio(resta)}
    </span>
  )
}

function Marcar({ q, marcada, onMarca }: { q: Questao; marcada?: string; onMarca: (letra: string) => void }) {
  return (
    <div className="grid gap-1" role="radiogroup" aria-label={`Alternativas da questão ${q.numero}`}>
      {q.alternativas?.map((a) => (
        <button
          key={a.letra}
          type="button"
          role="radio"
          aria-checked={marcada === a.letra}
          onClick={() => onMarca(a.letra)}
          className={`grid w-full grid-cols-[22px_1fr] items-center gap-2.5 rounded-[var(--radius-ctl)] border px-2.5 py-2 text-left text-[13.5px] ${
            marcada === a.letra ? 'border-accent/70 bg-accent/10 text-text' : 'border-transparent text-text-2 hover:border-line hover:bg-surface-2'
          }`}
        >
          <span className={`num flex h-[22px] w-[22px] items-center justify-center rounded-full border text-[12px] ${marcada === a.letra ? 'border-accent text-accent' : 'border-line text-text-3'}`}>{a.letra}</span>
          <Rich text={a.texto} />
        </button>
      ))}
    </div>
  )
}

function Aplicacao({ prova, curso }: { prova: Prova; curso: EmCurso }) {
  const { marcarResposta, entregar, descartarSimulado } = useTreino()
  const [confirmar, setConfirmar] = useState(false)
  const objetivas = prova.questoes.filter((q) => q.alternativas)
  const brancas = objetivas.filter((q) => !curso.respostas[q.id]).length
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-line-soft bg-bg">
        <div className="mx-auto flex h-[52px] max-w-[760px] items-center justify-between gap-3 px-5 sm:px-8">
          <span className="truncate text-[13.5px] text-text-2">{tituloCurto(prova)}</span>
          <span className="flex shrink-0 items-center gap-3">
            <Cronometro curso={curso} />
            {confirmar ? (
              <Button variant="primary" onClick={entregar}>
                {brancas ? `Entregar com ${brancas} em branco` : 'Confirmar entrega'}
              </Button>
            ) : (
              <Button variant="primary" onClick={() => setConfirmar(true)}>
                Entregar
              </Button>
            )}
          </span>
        </div>
      </header>
      <div className="mx-auto grid max-w-[760px] gap-10 px-5 py-8 sm:px-8">
        {prova.questoes.map((q) => (
          <article key={q.id} className="grid gap-3.5">
            <p className="num text-[12.5px] text-text-3">
              {q.secao} {q.numero}
              {q.pontos !== undefined && ` · ${fmt(q.pontos)} pt`}
            </p>
            <div>
              <Enunciado provaId={prova.id} q={q} />
            </div>
            {q.alternativas ? (
              <Marcar q={q} marcada={curso.respostas[q.id]} onMarca={(l) => marcarResposta(q.id, l)} />
            ) : (
              <p className="text-[13.5px] text-text-3">Resolva no papel. A correção abre depois da entrega.</p>
            )}
          </article>
        ))}
        <button type="button" onClick={descartarSimulado} className="justify-self-start text-[13px] text-text-3 underline decoration-line underline-offset-4 hover:text-text-2">
          Abandonar este simulado
        </button>
      </div>
    </div>
  )
}

function Resultado({ prova, curso }: { prova: Prova; curso: EmCurso }) {
  const { corrigir, concluirSimulado } = useTreino()
  const acertos: Record<string, number> = {}
  let nota = 0
  for (const q of prova.questoes) {
    const pts = q.pontos ?? 0
    if (q.alternativas) {
      const certa = q.alternativas.find((a) => a.letra === curso.respostas[q.id])?.correta ? 1 : 0
      acertos[q.id] = certa
      nota += certa * pts
    } else {
      const dados = curso.discursivas[q.id] ?? {}
      const soma = q.respostas.reduce((s, r) => s + (dados[r.item] ?? 0), 0)
      acertos[q.id] = pts ? soma / pts : 0
      nota += soma
    }
  }
  const pendentes = prova.questoes.filter((q) => !q.alternativas).some((q) => q.respostas.some((r) => curso.discursivas[q.id]?.[r.item] === undefined))
  const usados = Math.round(((curso.entregue ?? curso.inicio) - curso.inicio) / 1000)

  return (
    <Pagina>
      <Trilha titulo={`Resultado: ${tituloCurto(prova)}`} />
      <p className="text-[13px] text-text-3">{pendentes ? 'Parcial: faltam itens da discursiva' : 'Nota do simulado'}</p>
      <p className="num text-[44px] leading-[1.1] font-semibold tracking-[-0.02em] text-text">
        {fmt(nota)}
        <span className="ml-2 text-[15px] font-normal text-text-3">/ 10 em {relogio(usados)}</span>
      </p>
      <p className="mt-1 text-[14px] text-text-2">{nota >= 9 ? 'Acima da meta. Repita com outra prova para confirmar.' : `Faltam ${fmt(9 - nota)} para o 9,0.`}</p>

      <div className="mt-8 grid gap-9">
        {prova.questoes.map((q) => (
          <article key={q.id} className="grid gap-3">
            <p className="num text-[12.5px] text-text-3">
              {q.secao} {q.numero}
              {q.pontos !== undefined && ` · ${fmt(q.pontos)} pt`}
              {q.alternativas && (acertos[q.id] ? <span className="ml-2 text-accent">certa</span> : <span className="ml-2 text-danger">{curso.respostas[q.id] ? 'errada' : 'em branco'}</span>)}
            </p>
            <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-text">{q.titulo}</h2>
            {q.alternativas ? (
              <Alternatives alts={q.alternativas} inicial={curso.respostas[q.id] ?? null} revelado />
            ) : (
              <>
                <div className="text-[13px] text-text-3">Dê a você mesmo os pontos de cada item, como um corretor faria.</div>
                <Autocorrecao q={q} valor={curso.discursivas[q.id] ?? {}} onChange={(item, p) => corrigir(q.id, item, p)} />
              </>
            )}
            <Fechamento provaId={prova.id} q={q} />
          </article>
        ))}
      </div>
      <div className="mt-9 flex items-center gap-3">
        <Button
          variant="primary"
          disabled={pendentes}
          onClick={() => {
            concluirSimulado(nota, acertos)
            window.location.hash = '#/treino'
          }}
        >
          Registrar a nota
        </Button>
        {pendentes && <span className="text-[13px] text-text-3">Corrija todos os itens da discursiva.</span>}
      </div>
    </Pagina>
  )
}

function EmAndamento({ id, curso }: { id: string; curso: EmCurso }) {
  const prova = use(carregarProva(id))
  if (!prova) return null
  return curso.entregue ? <Resultado prova={prova} curso={curso} /> : <Aplicacao prova={prova} curso={curso} />
}

export function SimuladoRota({ id }: { id: string }) {
  const emCurso = useTreino((s) => s.emCurso)
  if (emCurso?.provaId !== id) return <Abertura id={id} />
  return (
    <Suspense fallback={<p className="p-8 text-[13px] text-text-3" role="status">Carregando a prova…</p>}>
      <EmAndamento id={id} curso={emCurso} />
    </Suspense>
  )
}
