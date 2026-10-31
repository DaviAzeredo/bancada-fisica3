import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { labs, provas } from '../content/registry'
import { BANCO, PROVAS_TREINO, RESERVADAS, TEMAS, fmt, formatoDe, parteDiscursiva, temaDasDiscursivas, tituloCurto } from '../treino/banco'
import { type Tarefa, gerarPlano } from '../treino/plano'
import { dataCurta, diasEntre, dominio, hojeISO, paraRevisar, porTema, useTreino } from '../treino/progresso'
import { Icon } from '../ui/kit'
import { TopBar } from './Shell'
import { Fila } from './treino/Fila'
import { SimuladoRota } from './treino/Simulado'

const META = 9

function Titulo({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h2 className="text-[12px] font-semibold tracking-[0.06em] text-text-3 uppercase">{children}</h2>
      {aside && <p className="text-[12.5px] text-text-3">{aside}</p>}
    </div>
  )
}

/** Medidor de 0 a 10, com a meta marcada. */
function Medidor({ valor }: { valor: number }) {
  return (
    <div className="relative mt-3 h-2 rounded-full bg-surface-3" role="img" aria-label={`${fmt(valor)} de 10, meta ${fmt(META)}`}>
      <div className="h-full rounded-full bg-accent" style={{ width: `${valor * 10}%` }} />
      <div className="absolute -top-1 -bottom-1 w-[2px] bg-text" style={{ left: `${META * 10}%` }} />
    </div>
  )
}

function TarefaDeHoje({ tarefa, feita }: { tarefa?: Tarefa; feita: boolean }) {
  const marcar = useTreino((s) => s.marcar)
  if (!tarefa) return <p className="text-[14px] text-text-2">O plano terminou. Refaça um simulado ou escolha um tema abaixo.</p>
  const lab = tarefa.lab ? labs.find((l) => l.id === tarefa.lab) : undefined
  return (
    <div>
      <p className="text-[12.5px] text-text-3">{tarefa.fase}</p>
      <p className="mt-0.5 text-[18px] font-semibold tracking-[-0.01em] text-text">{tarefa.titulo}</p>
      <p className="mt-1.5 max-w-[62ch] text-[14px] leading-[1.55] text-text-2">{tarefa.detalhe}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {lab && (
          <a href={`#/lab/${lab.id}`} className="inline-flex h-9 items-center rounded-[var(--radius-ctl)] border border-line px-3.5 text-[13.5px] text-text-2 hover:border-text-3 hover:text-text">
            Abrir o laboratório
          </a>
        )}
        <a href={tarefa.href} className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-ctl)] bg-accent px-4 text-[13.5px] font-medium text-accent-ink">
          Começar {Icon.next}
        </a>
        <button type="button" onClick={() => marcar(tarefa.id)} className="ml-1 text-[13px] text-text-3 underline decoration-line underline-offset-4 hover:text-text-2">
          {feita ? 'Desmarcar' : 'Marcar como feito'}
        </button>
      </div>
    </div>
  )
}

/** A largura diz quanto o tema vale nas provas; a parte cheia, quanto o aluno já acerta. */
function MapaDosPontos() {
  const questoes = useTreino((s) => s.questoes)
  const linhas = useMemo(() => porTema(questoes), [questoes])
  const maior = Math.max(...linhas.map((l) => l.peso))
  return (
    <section aria-labelledby="t-mapa">
      <Titulo aside="Barra: peso do tema nas terceiras provas. Parte verde: o que você já acerta.">
        <span id="t-mapa">Onde estão os pontos</span>
      </Titulo>
      <ol className="divide-y divide-line-soft border-y border-line-soft">
        {linhas.map((l) => (
          <li key={l.id}>
            <a href={`#/treino/tema/${l.id}`} className="grid gap-x-5 gap-y-1.5 px-1 py-3 hover:bg-surface sm:grid-cols-[190px_1fr_112px] sm:items-center">
              <span className="text-[14px] text-text">{l.titulo}</span>
              <span className="block h-2 rounded-full bg-surface-3" style={{ width: `${(l.peso / maior) * 100}%` }}>
                <span className="block h-full rounded-full bg-accent" style={{ width: `${(l.conseguidos / l.pontos) * 100}%` }} />
              </span>
              <span className="num text-[12.5px] text-text-3 sm:text-right">
                vale {fmt(l.peso)} · {l.feitas}/{l.questoes}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}

/** A conta sai dos formatos reais das provas, não de um número decorado. */
function ContaDoNove() {
  const fatias = PROVAS_TREINO.filter((p) => p.id.startsWith('p3-')).map(parteDiscursiva)
  const formatos = useMemo(() => {
    const m = new Map<string, string[]>()
    for (const p of PROVAS_TREINO.filter((x) => x.id.startsWith('p3-'))) {
      const semestre = p.titulo.split('·')[1].trim()
      const lista = m.get(formatoDe(p)) ?? []
      if (!lista.includes(semestre)) m.set(formatoDe(p), [...lista, semestre])
    }
    return [...m]
  }, [])
  const { tema, vezes, provas: total } = temaDasDiscursivas()
  return (
    <section aria-labelledby="t-conta">
      <Titulo>
        <span id="t-conta">A conta do 9</span>
      </Titulo>
      <p className="max-w-[62ch] text-[14px] leading-[1.6] text-text-2">
        Para tirar {fmt(META)}, você pode perder só 1,0 ponto na prova inteira. A discursiva vale de {fmt(Math.min(...fatias))} a {fmt(Math.max(...fatias))} pontos nas P3: acertar todas as objetivas não
        basta, e treiná-la no papel é o que decide.
      </p>
      <p className="mt-2.5 max-w-[62ch] text-[14px] leading-[1.6] text-text-2">
        Em {vezes} das {total} P3, a discursiva cobrou {tema.titulo}. Esse é o assunto que mais vale dominar.
      </p>
      <ul className="mt-3 grid gap-1 text-[13px] text-text-3">
        {formatos.map(([f, semestres]) => (
          <li key={f}>
            <span className="text-text-2">{f}</span> <span className="num">({semestres.join(', ')})</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Simulados() {
  const feitos = useTreino((s) => s.simulados)
  const emCurso = useTreino((s) => s.emCurso)
  return (
    <section aria-labelledby="t-sim">
      <Titulo aside="As três mais recentes ficam guardadas: não aparecem no treino por tema.">
        <span id="t-sim">Simulados</span>
      </Titulo>
      <ol className="divide-y divide-line-soft border-y border-line-soft">
        {PROVAS_TREINO.map((p) => {
          const notas = feitos.filter((s) => s.provaId === p.id).map((s) => s.nota)
          return (
            <li key={p.id}>
              <a href={`#/treino/simulado/${p.id}`} className="grid grid-cols-[1fr_auto] items-baseline gap-4 px-1 py-2.5 hover:bg-surface">
                <span className="min-w-0">
                  <span className="text-[14px] text-text">{tituloCurto(p)}</span>
                  {RESERVADAS.includes(p.id) && <span className="ml-2 text-[12px] text-accent">guardada</span>}
                  <span className="block truncate text-[12.5px] text-text-3">{formatoDe(p)}</span>
                </span>
                <span className="num text-[13px] text-text-2">{emCurso?.provaId === p.id ? 'em andamento' : notas.length ? `melhor ${fmt(Math.max(...notas))}` : 'não feita'}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function Plano({ plano, hoje }: { plano: Tarefa[]; hoje: string }) {
  const { feitas, marcar, recomecarPlano } = useTreino()
  const semanas = useMemo(() => {
    const out: Tarefa[][] = []
    plano.forEach((t, i) => (out[Math.floor(i / 7)] ??= []).push(t))
    return out
  }, [plano])
  return (
    <section aria-labelledby="t-plano">
      <Titulo
        aside={
          <button type="button" onClick={recomecarPlano} className="underline decoration-line underline-offset-4 hover:text-text-2">
            Recomeçar a partir de hoje
          </button>
        }
      >
        <span id="t-plano">Plano até a prova</span>
      </Titulo>
      <div className="grid gap-5">
        {semanas.map((s, i) => (
          <details key={s[0].dia} open={s.some((t) => t.dia === hoje) || (i === 0 && hoje < s[0].dia)} className="group/s">
            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-3 py-1 [&::-webkit-details-marker]:hidden">
              <span className="text-[14px] font-medium text-text">Semana {i + 1}</span>
              <span className="num text-[12.5px] text-text-3">
                {s.filter((t) => feitas.includes(t.id)).length}/{s.length} · {dataCurta(s[0].dia)} a {dataCurta(s[s.length - 1].dia)}
              </span>
            </summary>
            <ol className="mt-1 divide-y divide-line-soft border-y border-line-soft">
              {s.map((t) => {
                const feita = feitas.includes(t.id)
                return (
                  <li key={t.id} className={`grid grid-cols-[24px_52px_1fr] items-center gap-2 py-2 ${t.dia === hoje ? 'bg-surface' : ''}`}>
                    <input type="checkbox" checked={feita} onChange={() => marcar(t.id)} aria-label={`Marcar ${t.titulo}`} className="h-4 w-4 accent-[var(--color-accent)]" />
                    <span className="num text-[12.5px] text-text-3">{dataCurta(t.dia)}</span>
                    <a href={t.href} className={`min-w-0 truncate text-[13.5px] hover:underline ${feita ? 'text-text-3 line-through' : 'text-text'}`}>
                      {t.titulo}
                    </a>
                  </li>
                )
              })}
            </ol>
          </details>
        ))}
      </div>
    </section>
  )
}

function Painel() {
  const { dataProva, inicio, questoes, feitas, emCurso, definirData } = useTreino()
  const hoje = hojeISO()
  const faltam = diasEntre(hoje, dataProva)
  const nota = dominio(questoes)
  const plano = useMemo(() => gerarPlano(inicio, dataProva), [inicio, dataProva])
  const revisar = paraRevisar(questoes, hoje).length
  const pendentes = plano.filter((t) => t.dia <= hoje && !feitas.includes(t.id))
  const tarefa = pendentes[pendentes.length - 1] ?? plano.find((t) => !feitas.includes(t.id))
  const atrasadas = Math.max(pendentes.length - 1, 0)
  return (
    <>
      <header className="grid gap-8 border-b border-line-soft py-10 md:grid-cols-[1.3fr_1fr] md:py-12">
        <div>
          <p className="mb-2 text-[13px] text-text-3">Treino intensivo · terceira prova</p>
          <h1 className="text-[34px] leading-[1.08] font-semibold tracking-[-0.025em] text-text sm:text-[42px]">
            {faltam > 1 ? `Faltam ${faltam} dias.` : faltam === 1 ? 'A prova é amanhã.' : faltam === 0 ? 'A prova é hoje.' : 'A data da prova passou.'}
          </h1>
          <label className="mt-3 flex flex-wrap items-center gap-2 text-[13.5px] text-text-2">
            Data da prova
            <input
              type="date"
              value={dataProva}
              onChange={(e) => e.target.value && definirData(e.target.value)}
              className="num h-8 rounded-[var(--radius-ctl)] border border-line bg-surface px-2 text-[13px] text-text [color-scheme:dark]"
            />
          </label>
        </div>
        <div>
          <p className="text-[13px] text-text-3">Domínio das terceiras provas</p>
          <p className="num mt-0.5 text-[34px] leading-none font-semibold tracking-[-0.02em] text-text">
            {fmt(nota)}
            <span className="ml-1.5 text-[15px] font-normal text-text-3">/ 10</span>
          </p>
          <Medidor valor={nota} />
          <p className="mt-2.5 text-[12.5px] leading-[1.5] text-text-3">
            Nota de quem fizesse todas as {BANCO.length} questões do banco hoje, contando sua última tentativa em cada uma. O traço marca o {fmt(META)}.
          </p>
        </div>
      </header>

      <div className="grid gap-12 pt-9 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <div className="grid content-start gap-11">
          <section aria-labelledby="t-hoje">
            <Titulo aside={atrasadas > 0 ? `${atrasadas} ${atrasadas > 1 ? 'tarefas atrasadas' : 'tarefa atrasada'} no plano` : undefined}>
              <span id="t-hoje">Hoje</span>
            </Titulo>
            {emCurso && (
              <a href={`#/treino/simulado/${emCurso.provaId}`} className="mb-3 flex items-center justify-between gap-3 rounded-[var(--radius-ctl)] border border-accent/60 px-3 py-2 text-[13.5px] text-text hover:bg-accent/10">
                Simulado em andamento: {tituloCurto(provas.find((p) => p.id === emCurso.provaId) ?? provas[0])} {Icon.next}
              </a>
            )}
            <TarefaDeHoje tarefa={tarefa} feita={!!tarefa && feitas.includes(tarefa.id)} />
            {revisar > 0 && (
              <a href="#/treino/revisao" className="mt-4 flex items-center justify-between gap-3 rounded-[var(--radius-ctl)] border border-line px-3 py-2 text-[13.5px] text-text-2 hover:border-text-3 hover:text-text">
                {revisar} {revisar > 1 ? 'questões voltaram' : 'questão voltou'} para revisão {Icon.next}
              </a>
            )}
          </section>
          <MapaDosPontos />
          <Simulados />
        </div>
        <div className="grid content-start gap-11">
          <ContaDoNove />
          <Plano plano={plano} hoje={hoje} />
        </div>
      </div>
    </>
  )
}

export function Treino({ secao, id }: { secao?: string; id?: string }) {
  const [, atualiza] = useState(0)
  // o dia pode virar com a aba aberta, e é ele que escolhe a tarefa e a revisão
  useEffect(() => {
    const fim = window.setInterval(() => atualiza((n) => n + 1), 600000)
    return () => window.clearInterval(fim)
  }, [])

  if (secao === 'simulado' && id) {
    return <SimuladoRota id={id} />
  }
  const tema = TEMAS.find((t) => t.id === id)
  return (
    <div className="min-h-full">
      <TopBar route="treino" />
      <div className="mx-auto max-w-[1120px] px-5 pb-20 sm:px-8">
        {secao === 'tema' && id && !tema && id !== 'discursivas' ? (
          <p className="py-10 text-[14px] text-text-2">
            Este tema não existe.{' '}
            <a href="#/treino" className="text-accent underline underline-offset-4">
              Voltar ao painel
            </a>
          </p>
        ) : secao === 'tema' && id ? (
          <Fila key={id} modo={id} titulo={tema?.titulo ?? 'Discursivas'} />
        ) : secao === 'revisao' ? (
          <Fila key="revisao" modo="revisao" titulo="Revisão" />
        ) : (
          <Painel />
        )}
      </div>
    </div>
  )
}
