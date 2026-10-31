import { type ReactNode, useEffect, useMemo, useState } from 'react'
import type { Scenario } from '../scenario/schema'
import { evalNum } from '../scenario/expr'
import { Stage } from '../scene/Stage'
import { MAX_CARGAS_PROVA, useRun } from '../store'
import { Alternatives, Answers } from '../ui/Answers'
import { Controls } from '../ui/Controls'
import { Graph } from '../ui/Graph'
import { Icon, IconButton, Section } from '../ui/kit'
import { Measures } from '../ui/Measures'
import { LayerToggles, Legend, SceneTools, TimeControls } from '../ui/Overlay'
import { SelectionHud } from '../ui/SelectionHud'
import { Rich } from '../ui/Rich'
import { Solution } from '../ui/Solution'
import { Steps, tituloDoPasso } from '../ui/Steps'
import { useResolvedThrottled } from '../ui/useResolved'
import { TopBar } from './Shell'

export interface NavItem {
  href: string
  numero: string
  titulo: string
  grupo?: string
  active: boolean
}

export interface Header {
  kicker: string
  route: 'lab' | 'prova'
  /** Recortes do enunciado original (WebP), na ordem de leitura. */
  figuras?: string[]
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

function Nav({ items, title }: { items: NavItem[]; title: string }) {
  let lastGroup: string | undefined
  return (
    <nav aria-label={title} className="scroll-y h-full px-3 py-4">
      <div className="mb-2 px-2 text-[12px] font-semibold tracking-[0.06em] text-text-3 uppercase">{title}</div>
      <ul className="grid gap-px">
        {items.map((it) => {
          const head = it.grupo && it.grupo !== lastGroup
          lastGroup = it.grupo
          return (
            <li key={it.href}>
              {head && <div className="mt-4 mb-1 px-2 text-[11.5px] text-text-3">{it.grupo}</div>}
              <a
                href={it.href}
                aria-current={it.active ? 'page' : undefined}
                className={`grid grid-cols-[30px_1fr] items-baseline rounded-[var(--radius-ctl)] px-2 py-1.5 text-[13px] leading-snug transition-colors duration-150 ${
                  it.active ? 'bg-surface-2 text-text' : 'text-text-2 hover:bg-surface hover:text-text'
                }`}
              >
                <span className={`num text-[12px] ${it.active ? 'text-accent' : 'text-text-3'}`}>{it.numero}</span>
                <span>{it.titulo}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function downloadJSON(s: Scenario) {
  const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${s.id}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export function ScenarioView({
  scenario,
  header,
  nav,
  navTitle,
  extra,
}: {
  scenario: Scenario & { figura?: Scenario['figura'] }
  header: Header
  nav: NavItem[]
  navTitle: string
  extra?: ReactNode
}) {
  const load = useRun((s) => s.load)
  const loaded = useRun((s) => s.scenario)
  const step = useRun((s) => s.step)
  const selected = useRun((s) => s.selected)
  const extras = useRun((s) => s.extras)
  const previsoes = useRun((s) => s.previsoes)
  const [drawer, setDrawer] = useState(false)
  const [showFig, setShowFig] = useState(true)
  const [ready, setReady] = useState(false)
  const webgl = useMemo(hasWebGL, [])

  useEffect(() => {
    load(scenario)
    setDrawer(false)
    setReady(false)
    const id = setTimeout(() => setReady(true), 450)
    return () => clearTimeout(id)
  }, [scenario, load])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'A') return
      const st = useRun.getState()
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === ' ' && (st.scenario?.cena.tempo || st.extras.some((x) => x.tipo === 'particula'))) {
        e.preventDefault()
        st.setPlaying(!st.playing)
      } else if ((e.key === 'p' || e.key === 'P') && !st.selected) {
        e.preventDefault()
        st.toggleSonda()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // O painel atualiza a 10 Hz; a cena 3D compila o próprio mundo a cada quadro.
  const r = useResolvedThrottled(100)
  if (!loaded || loaded !== scenario) return <div className="h-full bg-bg" />
  const passo = step >= 0 ? scenario.passos[step] : undefined
  const respondida = previsoes[step] !== undefined
  const desafios = scenario.desafios
  const graficos = r ? scenario.graficos.filter((g) => g.ativo === undefined || evalNum(g.ativo, r.env)) : []

  return (
    <div className="fixed inset-0 flex flex-col">
      <TopBar route={header.route}>
        <IconButton label="Abrir lista" className="lg:hidden" onClick={() => setDrawer(true)}>
          {Icon.menu}
        </IconButton>
      </TopBar>
      <div className="relative grid min-h-0 flex-1 grid-rows-[minmax(300px,48svh)_1fr] md:grid-cols-[minmax(0,1fr)_380px] md:grid-rows-1 lg:grid-cols-[248px_minmax(0,1fr)_408px]">
        {/* lista lateral: fixa no desktop, gaveta abaixo de lg */}
        <div className="hidden min-h-0 border-r border-line-soft lg:block">
          <Nav items={nav} title={navTitle} />
        </div>
        {drawer && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label={navTitle}>
            <button type="button" aria-label="Fechar" className="absolute inset-0 bg-[oklch(0.1_0.01_255/0.6)]" onClick={() => setDrawer(false)} />
            <div className="absolute inset-y-0 left-0 w-[min(300px,86vw)] border-r border-line bg-bg shadow-2xl">
              <div className="flex justify-end p-2">
                <IconButton label="Fechar lista" onClick={() => setDrawer(false)}>
                  {Icon.close}
                </IconButton>
              </div>
              <div className="h-[calc(100%-48px)]">
                <Nav items={nav} title={navTitle} />
              </div>
            </div>
          </div>
        )}

        {/* cena */}
        <main className="relative min-h-0 overflow-hidden bg-bg" aria-label="Simulação">
          {webgl ? (
            <Stage />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-[14px] text-text-2">
              <div className="max-w-sm">
                <p className="mb-2 font-semibold text-text">Este navegador não oferece WebGL.</p>
                <p>A cena 3D precisa dele. Os passos, medidas e gráficos ao lado continuam funcionando.</p>
              </div>
            </div>
          )}
          <div
            className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-bg transition-opacity duration-500 ${ready ? 'opacity-0' : 'opacity-100'}`}
            aria-hidden={ready}
          >
            <span className="text-[13px] text-text-3">Montando a cena…</span>
          </div>
          <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-3">
            <div className="max-w-[70%] rounded-[var(--radius-panel)] border border-line bg-surface/92 px-3 py-2 shadow-[0_8px_24px_-12px_oklch(0_0_0/0.6)] sm:max-w-[60%]">
              <div className="hidden text-[11.5px] text-text-3 sm:block">{header.kicker}</div>
              <div className="truncate text-[13.5px] font-medium text-text">{passo ? tituloDoPasso(passo, respondida) : scenario.titulo}</div>
            </div>
            {r && (
              <div className="hidden sm:block">
                <Legend r={r} />
              </div>
            )}
          </div>
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap items-end gap-2 pr-[56px]">
            {r && <LayerToggles r={r} />}
            <TimeControls />
          </div>
          <div className="pointer-events-none absolute right-3 bottom-3 flex flex-col items-end gap-2">
            {r && <SelectionHud r={r} />}
            <SceneTools />
          </div>
          {r && r.errors.length > 0 && (
            <div role="alert" className="absolute top-20 left-3 max-w-md rounded-[var(--radius-ctl)] border border-danger/50 bg-surface px-3 py-2 text-[12.5px] text-text-2">
              <div className="mb-1 font-medium text-danger">O cenário tem erros</div>
              <ul className="list-disc pl-4">
                {r.errors.slice(0, 4).map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </main>

        {/* painel */}
        <aside className="scroll-y min-h-0 border-t border-line-soft bg-bg md:border-t-0 md:border-l" aria-label="Painel da questão">
          <div className="px-5 pt-5 pb-4">
            <div className="mb-1 text-[12px] text-text-3">{header.kicker}</div>
            <h1 className="text-[20px] leading-tight font-semibold tracking-[-0.015em] text-text">{scenario.titulo}</h1>
            {scenario.resumo && <p className="mt-1.5 text-[13.5px] text-text-2">{scenario.resumo}</p>}
          </div>

          {scenario.enunciado && (
            <Section
              title="Enunciado"
              id="sec-enunciado"
              aside={
                header.figuras?.length ? (
                  <button type="button" className="text-[12px] text-text-3 hover:text-text-2" onClick={() => setShowFig((v) => !v)} aria-expanded={showFig}>
                    {showFig ? 'ocultar original' : 'ver original'}
                  </button>
                ) : undefined
              }
            >
              <Rich text={scenario.enunciado} className="text-[13.5px] leading-[1.6] text-text-2" />
              {showFig && header.figuras && header.figuras.length > 0 && (
                <div className="mt-3 grid gap-1 overflow-hidden rounded-[var(--radius-ctl)] bg-[oklch(0.97_0.003_90)] p-2">
                  {header.figuras.map((src, i) => (
                    <img key={src} src={src} alt={`Enunciado original${header.figuras!.length > 1 ? `, parte ${i + 1}` : ''}`} loading="lazy" decoding="async" className="block h-auto w-full" />
                  ))}
                </div>
              )}
            </Section>
          )}

          {scenario.teoria && (
            <Section title="Ideia central" id="sec-teoria">
              <Rich text={scenario.teoria} className="text-[13.5px] leading-[1.6] text-text-2" />
            </Section>
          )}

          {scenario.passos.length > 0 && (
            <Section title="Resolução passo a passo" id="sec-passos">
              <Steps passos={scenario.passos} />
            </Section>
          )}

          {(scenario.parametros.length > 0 || scenario.editor?.adicionarCarga) && (
            <Section title="Controles" id="sec-controles">
              {scenario.editor?.adicionarCarga && <ChargeEditor selected={selected} extras={extras.map((e) => e.id)} />}
              <Controls params={scenario.parametros} vivos={r?.env.vars} />
            </Section>
          )}

          {r && scenario.medidas.length > 0 && (
            <Section title="Medidas · simulação × teoria" id="sec-medidas">
              <Measures medidas={scenario.medidas} r={r} focus={passo?.medidas} />
            </Section>
          )}

          {r && graficos.length > 0 && (
            <Section title="Gráficos" id="sec-graficos">
              <div className="grid gap-5">
                {graficos.map((g) => (
                  <Graph key={g.titulo} g={g} r={r} />
                ))}
              </div>
            </Section>
          )}

          {r && desafios.length > 0 && (
            <Section title="Desafios" id="sec-desafios">
              <ul className="grid gap-2">
                {desafios.map((d, i) => {
                  let ok = false
                  try {
                    ok = !!evalNum(d.condicao, r.env)
                  } catch {
                    ok = false
                  }
                  return (
                    <li key={i} className={`rounded-[var(--radius-ctl)] border px-3 py-2.5 text-[13.5px] transition-colors duration-300 ${ok ? 'border-accent/50 bg-accent/8' : 'border-line-soft'}`}>
                      <div className="flex gap-2.5">
                        <span className={`mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${ok ? 'border-accent bg-accent text-accent-ink' : 'border-line'}`} aria-hidden>
                          {ok && Icon.check}
                        </span>
                        <div>
                          <Rich text={d.pergunta} className="text-text-2" />
                          {ok && d.sucesso && <Rich text={d.sucesso} className="mt-1 text-text" />}
                          {!ok && d.dica && <Rich text={`Dica: ${d.dica}`} className="mt-1 text-[12.5px] text-text-3" />}
                        </div>
                      </div>
                      <span className="sr-only">{ok ? 'concluído' : 'pendente'}</span>
                    </li>
                  )
                })}
              </ul>
            </Section>
          )}

          {scenario.alternativas && (
            <Section title="Alternativas" id="sec-alternativas">
              <Alternatives key={scenario.id} alts={scenario.alternativas} />
            </Section>
          )}

          {scenario.respostas.length > 0 && (
            <Section title="Respostas" id="sec-respostas">
              <Answers key={scenario.id} respostas={scenario.respostas} />
            </Section>
          )}

          {scenario.resolucao && (
            <Section title="Gabarito detalhado" id="sec-resolucao">
              <Solution key={scenario.id} r={scenario.resolucao} praticar={scenario.labs} />
            </Section>
          )}

          {extra}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft px-5 py-4 text-[12px] text-text-3">
            <span>Arraste para girar · role para aproximar · objetos com anel são arrastáveis</span>
            <button type="button" className="inline-flex items-center gap-1.5 hover:text-text-2" onClick={() => downloadJSON(scenario)}>
              {Icon.download} cenário JSON
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

function ChargeEditor({ selected, extras }: { selected: string | null; extras: string[] }) {
  const add = useRun((s) => s.addCharge)
  const addTest = useRun((s) => s.addTestCharge)
  const clearTest = useRun((s) => s.clearTestCharges)
  const remove = useRun((s) => s.removeExtra)
  const provas = useRun((s) => s.extras.filter((e) => e.tipo === 'particula').length)
  const noLimite = provas >= MAX_CARGAS_PROVA
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => add(2e-9)} className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-ctl)] border border-line bg-surface px-3 text-[13px] text-text-2 hover:border-pos hover:text-text">
        <span className="h-2.5 w-2.5 rounded-full bg-pos" aria-hidden /> Adicionar +2 nC
      </button>
      <button type="button" onClick={() => add(-2e-9)} className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-ctl)] border border-line bg-surface px-3 text-[13px] text-text-2 hover:border-neg hover:text-text">
        <span className="h-2.5 w-2.5 rounded-full bg-neg" aria-hidden /> Adicionar −2 nC
      </button>
      <button
        type="button"
        onClick={() => addTest()}
        disabled={noLimite}
        title={noLimite ? 'Limpe as cargas de prova para soltar outras' : 'Uma carga leve, solta em repouso, que segue o campo'}
        className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-ctl)] border border-line bg-surface px-3 text-[13px] text-text-2 hover:border-accent hover:text-text disabled:pointer-events-none disabled:opacity-40"
      >
        <span className="h-2.5 w-2.5 rounded-full border border-accent" aria-hidden /> Soltar carga de prova
      </button>
      {provas > 0 && (
        <button type="button" onClick={clearTest} className="h-8 px-2 text-[13px] text-text-3 hover:text-text">
          Limpar cargas de prova <span className="num">{provas}/{MAX_CARGAS_PROVA}</span>
        </button>
      )}
      {selected && extras.includes(selected) && (
        <button type="button" onClick={() => remove(selected)} className="h-8 px-2 text-[13px] text-text-3 hover:text-danger">
          Remover selecionada
        </button>
      )}
    </div>
  )
}
