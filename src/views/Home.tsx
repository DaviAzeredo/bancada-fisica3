import { useEffect, useMemo } from 'react'
import { labs, provas } from '../content/registry'
import { traceLine } from '../physics/fieldlines'
import { type World, fieldE } from '../physics/sources'
import type { V3 } from '../physics/vec'
import { Icon } from '../ui/kit'
import { TopBar, irParaSecao, repetirSecao } from './Shell'

/** Linhas de campo de um dipolo de verdade, traçadas pelo mesmo núcleo da bancada. */
function DipoleArt() {
  const paths = useMemo(() => {
    const w: World = {
      e: [
        { k: 'point', q: 1, p: [-1, 0, 0] },
        { k: 'point', q: -1, p: [1, 0, 0] },
      ],
      b: [],
    }
    const F = (p: V3) => fieldE(w, p)
    const out: string[] = []
    const n = 18
    for (let i = 0; i < n; i++) {
      const a = ((i + 0.5) / n) * 2 * Math.PI
      const start: V3 = [-1 + 0.08 * Math.cos(a), 0.08 * Math.sin(a), 0]
      const l = traceLine(F, start, 1, { half: 3.2, step: 0.03, maxSteps: 900, sinks: [{ p: [1, 0, 0], r: 0.07 }] })
      out.push(l.pts.map((p, k) => `${k ? 'L' : 'M'}${(p[0] * 60 + 200).toFixed(1)} ${(p[1] * 60 + 120).toFixed(1)}`).join(''))
    }
    return out
  }, [])
  return (
    <svg viewBox="0 0 400 240" className="h-auto w-full" aria-hidden>
      <defs>
        <radialGradient id="fade" cx="50%" cy="50%" r="55%">
          <stop offset="60%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>
        <mask id="m">
          <rect width="400" height="240" fill="url(#fade)" />
        </mask>
      </defs>
      <g mask="url(#m)" fill="none" stroke="var(--color-field-e)" strokeWidth="1" strokeOpacity="0.55">
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <circle cx="140" cy="120" r="9" fill="var(--color-pos)" />
      <circle cx="260" cy="120" r="9" fill="var(--color-neg)" />
    </svg>
  )
}

/** "p1-2026-2-diurno" → "2026/2"; ordem dentro do semestre: P1, P2, P3, final, 2ª chamada. */
const semestreDe = (id: string) => id.match(/(\d{4})-(\d)/)?.slice(1, 3).join('/') ?? 'Outras'
const ordemDe = (id: string) => ['p1', 'p2', 'p3', 'pf', 'sc'].indexOf(id.split('-')[0])

function porSemestre() {
  const out: { semestre: string; provas: typeof provas }[] = []
  for (const p of provas) {
    const s = semestreDe(p.id)
    const g = out.find((x) => x.semestre === s)
    if (g) g.provas.push(p)
    else out.push({ semestre: s, provas: [p] })
  }
  out.sort((a, b) => b.semestre.localeCompare(a.semestre))
  for (const g of out) g.provas.sort((a, b) => ordemDe(a.id) - ordemDe(b.id))
  return out
}

export function Home({ focus }: { focus?: 'labs' | 'provas' }) {
  const grupos = useMemo(porSemestre, [])
  useEffect(() => {
    if (focus) irParaSecao(focus)
  }, [focus])
  let lastGroup = ''
  return (
    <div className="min-h-full">
      <TopBar route={focus ?? 'home'} />
      <div className="mx-auto max-w-[1120px] px-5 pb-20 sm:px-8">
        <header className="grid items-center gap-8 border-b border-line-soft py-12 md:grid-cols-[1.2fr_1fr] md:py-16">
          <div>
            <p className="mb-3 text-[13px] text-text-3">Física III · eletromagnetismo</p>
            <h1 className="max-w-[16ch] text-[34px] leading-[1.08] font-semibold tracking-[-0.025em] text-text sm:text-[44px]">
              Campos que dá para ver, girar e medir.
            </h1>
            <p className="mt-5 max-w-[56ch] text-[15px] leading-[1.6] text-text-2">
              Questões de prova resolvidas passo a passo numa cena 3D que acompanha cada passo, e laboratórios para cada tópico da ementa. Toda medida
              compara a simulação com a fórmula do curso.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {provas[0] && (
                <a
                  href={`#/prova/${provas[0].id}/${provas[0].questoes[0]?.id ?? ''}`}
                  className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-ctl)] bg-accent px-4 text-[13.5px] font-medium text-accent-ink"
                >
                  Abrir a {provas[0].titulo.split('·')[0].trim()} {Icon.next}
                </a>
              )}
              <a
                href="#/treino"
                className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-ctl)] border border-accent/60 px-4 text-[13.5px] text-accent hover:bg-accent/10"
              >
                Treino para a P3
              </a>
              <a
                href="#/labs"
                onClick={repetirSecao('labs')}
                className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-ctl)] border border-line px-4 text-[13.5px] text-text-2 hover:border-text-3 hover:text-text"
              >
                Explorar os laboratórios
              </a>
            </div>
          </div>
          <div className="hidden md:block">
            <DipoleArt />
          </div>
        </header>

        <div className="grid gap-12 pt-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <section id="home-provas" aria-labelledby="h-provas" className="scroll-mt-16">
            <h2 id="h-provas" className="mb-5 text-[12px] font-semibold tracking-[0.06em] text-text-3 uppercase">
              Provas
            </h2>
            <div className="grid gap-9">
              {grupos.map((g) => (
                <div key={g.semestre}>
                  <h3 className="num mb-2 text-[13px] font-medium text-text-3">{g.semestre}</h3>
                  <div className="divide-y divide-line-soft border-y border-line-soft">
                    {g.provas.map((p) => (
                      <details key={p.id} open={p.id === provas[0]?.id} className="group/p">
                        <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto_16px] items-baseline gap-3 py-3 hover:bg-surface [&::-webkit-details-marker]:hidden">
                          <span className="min-w-0">
                            <span className="text-[16px] font-semibold tracking-[-0.01em] text-text">{p.titulo.split('·')[0].trim()}</span>
                            <span className="ml-2 text-[12.5px] text-text-3">{p.subtitulo?.replace(/^Física III · /, '') ?? ''}</span>
                          </span>
                          <span className="num text-[12.5px] text-text-3">{p.questoes.length} questões</span>
                          <span className="text-text-3 transition-transform duration-150 group-open/p:rotate-90">{Icon.next}</span>
                        </summary>
                        <ol className="mb-3 divide-y divide-line-soft border-t border-line-soft">
                          {p.questoes.map((q) => (
                            <li key={q.id}>
                              <a
                                href={`#/prova/${p.id}/${q.id}`}
                                className="group grid grid-cols-[44px_1fr_16px] items-center gap-3 py-2.5 transition-colors duration-150 hover:bg-surface"
                              >
                                <span className="num pl-1 text-[13px] text-text-3 group-hover:text-accent">{q.numero}</span>
                                <span className="min-w-0">
                                  <span className="block text-[14px] text-text">{q.titulo}</span>
                                  {q.resumo && <span className="block truncate text-[12.5px] text-text-3">{q.resumo}</span>}
                                </span>
                                <span className="text-text-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100">{Icon.next}</span>
                              </a>
                            </li>
                          ))}
                        </ol>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="home-labs" aria-labelledby="h-labs" className="scroll-mt-16">
            <h2 id="h-labs" className="mb-5 text-[12px] font-semibold tracking-[0.06em] text-text-3 uppercase">
              Laboratórios da ementa
            </h2>
            {labs.length === 0 && <p className="text-[14px] text-text-3">Nenhum laboratório disponível.</p>}
            <ol className="grid">
              {labs.map((l) => {
                const head = l.grupo !== lastGroup
                lastGroup = l.grupo
                return (
                  <li key={l.id}>
                    {head && <div className="mt-5 mb-1.5 text-[12.5px] text-text-3 first:mt-0">{l.grupo}</div>}
                    <a href={`#/lab/${l.id}`} className="group grid grid-cols-[36px_1fr] gap-2 rounded-[var(--radius-ctl)] px-1 py-2 hover:bg-surface">
                      <span className="num pt-px text-[12.5px] text-text-3 group-hover:text-accent">{l.numero}</span>
                      <span>
                        <span className="block text-[14px] text-text">{l.titulo}</span>
                        {l.resumo && <span className="block text-[12.5px] text-text-3">{l.resumo}</span>}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ol>
          </section>
        </div>
        <footer className="mt-16 border-t border-line-soft pt-5 text-[12.5px] text-text-3">
          Tudo é calculado no navegador, em SI: superposição, quadratura de Gauss, Biot-Savart, integrador de Boris. Material de estudo, não oficial da disciplina.
        </footer>
      </div>
    </div>
  )
}
