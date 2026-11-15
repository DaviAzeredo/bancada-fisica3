import { FISICA2, type ProblemaF2 } from '../content/fisica2'
import { Alternatives, Answers } from '../ui/Answers'
import { Icon, Section } from '../ui/kit'
import { Plot } from '../ui/Plot'
import { Rich } from '../ui/Rich'
import { Solution } from '../ui/Solution'
import { TopBar } from './Shell'

const GRUPOS = [...new Set(FISICA2.map((p) => p.grupo))]

function Lista({ atual }: { atual?: string }) {
  return (
    <nav aria-label="Problemas de Física II" className="grid gap-5">
      {GRUPOS.map((g) => (
        <div key={g}>
          <div className="mb-1.5 px-2 text-[12px] text-text-3">{g}</div>
          <ul className="grid gap-px">
            {FISICA2.filter((p) => p.grupo === g).map((p) => (
              <li key={p.id}>
                <a
                  href={`#/fisica2/${p.id}`}
                  aria-current={p.id === atual ? 'page' : undefined}
                  className={`grid grid-cols-[34px_1fr] items-baseline rounded-[var(--radius-ctl)] px-2 py-1.5 text-[13px] leading-snug transition-colors duration-150 ${
                    p.id === atual ? 'bg-surface-2 text-text' : 'text-text-2 hover:bg-surface hover:text-text'
                  }`}
                >
                  <span className="num text-[12px] text-text-3">{p.numero}</span>
                  <span>
                    <span className="block">{p.titulo}</span>
                    <span className="block text-[12px] text-text-3">{p.assunto}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function Indice() {
  return (
    <div className="min-h-full">
      <TopBar route="fisica2" />
      <div className="mx-auto max-w-[760px] px-5 pt-10 pb-20 sm:px-8">
        <p className="mb-2 text-[13px] text-text-3">Física II · oscilações, ondas e som</p>
        <h1 className="text-[30px] leading-tight font-semibold tracking-[-0.02em] text-text">Revisão para a P2</h1>
        <p className="mt-3 mb-8 max-w-[60ch] text-[14.5px] leading-[1.6] text-text-2">
          Os problemas da revisão em sala e da lista de problemas extras, resolvidos passo a passo para quem está começando: cada item diz o que se
          pede, a ideia por trás, a conta e uma conferência. Os gráficos se mexem: ajuste os controles e veja a física acontecer.
        </p>
        <Lista />
      </div>
    </div>
  )
}

function Pagina({ p, antes, depois }: { p: ProblemaF2; antes?: ProblemaF2; depois?: ProblemaF2 }) {
  return (
    <div className="min-h-full">
      <TopBar route="fisica2" />
      <div className="mx-auto grid max-w-[1120px] gap-10 px-5 pt-6 pb-20 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-4 max-h-[calc(100svh-2rem)] overflow-y-auto">
            <a href="#/fisica2" className="mb-3 block px-2 text-[12px] font-semibold tracking-[0.06em] text-text-3 uppercase hover:text-text-2">
              Física II · P2
            </a>
            <Lista atual={p.id} />
          </div>
        </aside>
        <main className="min-w-0 max-w-[760px]">
          <a href="#/fisica2" className="mb-3 inline-flex items-center gap-1 text-[12.5px] text-text-3 hover:text-text-2 lg:hidden">
            {Icon.prev} Todos os problemas
          </a>
          <p className="text-[12.5px] text-text-3">
            Física II · {p.grupo} · {p.numero.startsWith('R') ? 'Questão' : 'Problema'} {p.numero.replace('R', '')} · {p.assunto}
          </p>
          <h1 className="mt-1 text-[24px] leading-tight font-semibold tracking-[-0.015em] text-text">{p.titulo}</h1>

          <div className="mt-5 -mx-5 sm:mx-0">
            <Section title="Enunciado" id="f2-enunciado">
              <Rich text={p.enunciado} className="text-[14.5px] leading-[1.65] text-text-2" />
            </Section>

            {p.alternativas && (
              <Section title="Alternativas" id="f2-alternativas">
                <Alternatives key={p.id} alts={p.alternativas} />
              </Section>
            )}

            <Section title="Respostas" id="f2-respostas">
              <Answers key={p.id} respostas={p.respostas} />
            </Section>

            {p.graficos && p.graficos.length > 0 && (
              <Section title="Gráficos interativos" id="f2-graficos">
                <div className="grid gap-8">
                  {p.graficos.map((g) => (
                    <Plot key={`${p.id}-${g.titulo}`} g={g} />
                  ))}
                </div>
              </Section>
            )}

            <Section title="Gabarito detalhado" id="f2-resolucao">
              <Solution key={p.id} r={p.resolucao} />
            </Section>
          </div>

          <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-line-soft pt-4 text-[13px]">
            {antes ? (
              <a href={`#/fisica2/${antes.id}`} className="inline-flex items-center gap-1.5 text-text-2 hover:text-text">
                {Icon.prev} {antes.numero} · {antes.titulo}
              </a>
            ) : (
              <span />
            )}
            {depois && (
              <a href={`#/fisica2/${depois.id}`} className="inline-flex items-center gap-1.5 text-right text-text-2 hover:text-text">
                {depois.numero} · {depois.titulo} {Icon.next}
              </a>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export function Fisica2({ id }: { id?: string }) {
  const i = id ? FISICA2.findIndex((p) => p.id === id) : -1
  if (i < 0) return <Indice />
  return <Pagina key={FISICA2[i].id} p={FISICA2[i]} antes={FISICA2[i - 1]} depois={FISICA2[i + 1]} />
}
