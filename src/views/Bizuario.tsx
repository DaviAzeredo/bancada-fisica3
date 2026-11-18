import { useEffect, useMemo, useState } from 'react'
import { BIZUARIO, type Ficha, type Formula } from '../content/bizuarioF2'
import { FISICA2 } from '../content/fisica2'
import { Rich, Tex } from '../ui/Rich'
import { TopBar } from './Shell'

const CHAVE = 'fisica3:bizuario-f2'
const TOTAL = BIZUARIO.reduce((n, t) => n + t.fichas.length, 0)

function lerSabidas(): Set<string> {
  try {
    const bruto = window.localStorage.getItem(CHAVE)
    const lista: unknown = bruto ? JSON.parse(bruto) : []
    return new Set(Array.isArray(lista) ? lista.filter((x): x is string => typeof x === 'string') : [])
  } catch {
    return new Set()
  }
}

function salvarSabidas(s: Set<string>) {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify([...s]))
  } catch {
    /* sem armazenamento: o progresso vale só nesta visita */
  }
}

/** Rótulo curto de uma questão da seção, para os links "treine em". */
export function rotuloQuestao(id: string) {
  const p = FISICA2.find((q) => q.id === id)
  if (!p) return id
  if (p.grupo.startsWith('P2')) return `${p.grupo} ${p.numero}`
  if (p.grupo === 'Problemas extras da P2') return `Extra ${p.numero}`
  if (p.grupo === 'Questões avulsas') return `Avulsa ${p.numero.replace('Q', '')}`
  return `Revisão ${p.numero}`
}

/** Cada fórmula com o nome em cima e a explicação embaixo: nada de fórmula solta. */
function Formulas({ lista }: { lista: Formula[] }) {
  return (
    <ol className="grid gap-px overflow-hidden rounded-[var(--radius-ctl)] border border-line bg-line-soft" aria-label="Fórmulas">
      {lista.map((f) => (
        <li key={f.tex} className="grid gap-1.5 bg-surface px-3 py-3">
          <div className="text-[12.5px] font-semibold text-text">{f.nome}</div>
          <div className="max-w-full overflow-x-auto overflow-y-hidden px-1 py-1 text-center text-[12.5px] text-text sm:text-[13.5px]">
            <Tex src={`\\displaystyle ${f.tex}`} />
          </div>
          <Rich text={f.explica} className="text-[13px] leading-[1.6] text-text-2" />
        </li>
      ))}
    </ol>
  )
}

function Cartao({
  f,
  decorar,
  sabida,
  marcar,
}: {
  f: Ficha
  decorar: boolean
  sabida: boolean
  marcar: (sabe: boolean) => void
}) {
  const [aberta, setAberta] = useState(false)
  const mostrar = !decorar || aberta

  return (
    <article className={`grid gap-3 rounded-[10px] border p-4 ${sabida ? 'border-accent/40 bg-surface' : 'border-line-soft bg-surface'}`}>
      <header className="flex items-start justify-between gap-3">
        <h3 className="text-[15px] leading-snug font-semibold text-text">{f.titulo}</h3>
        {sabida && <span className="shrink-0 rounded-full border border-accent/50 px-2 py-0.5 text-[11.5px] text-accent">já sei</span>}
      </header>
      <div className="text-[13.5px] leading-[1.6] text-text-2">
        <div className="mb-0.5 text-[12px] font-semibold tracking-[0.06em] text-text-3 uppercase">Quando usar</div>
        <Rich text={f.quando} />
      </div>

      {mostrar ? (
        <>
          <Formulas lista={f.formulas} />
          <div>
            <div className="mb-1.5 text-[12px] font-semibold tracking-[0.06em] text-text-3 uppercase">Pulos do gato</div>
            <ul className="grid gap-1.5">
              {f.bizus.map((b) => (
                <li key={b} className="grid grid-cols-[14px_1fr] gap-1.5 text-[13.5px] leading-[1.6] text-text-2">
                  <span className="text-accent" aria-hidden>
                    ▸
                  </span>
                  <Rich text={b} />
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-text-3">
            <span>Treine em:</span>
            {f.questoes.map((q) => (
              <a key={q} href={`#/fisica2/${q}`} className="rounded-[var(--radius-ctl)] border border-line px-1.5 py-0.5 text-text-2 hover:border-text-3 hover:text-text">
                {rotuloQuestao(q)}
              </a>
            ))}
          </div>
          {decorar ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  marcar(true)
                  setAberta(false)
                }}
                className="inline-flex h-8 items-center rounded-[var(--radius-ctl)] bg-accent px-3 text-[13px] font-medium text-accent-ink"
              >
                Lembrei
              </button>
              <button
                type="button"
                onClick={() => {
                  marcar(false)
                  setAberta(false)
                }}
                className="inline-flex h-8 items-center rounded-[var(--radius-ctl)] border border-line px-3 text-[13px] text-text-2 hover:text-text"
              >
                Ainda não
              </button>
            </div>
          ) : (
            <label className="inline-flex w-fit items-center gap-2 text-[13px] text-text-2">
              <input type="checkbox" checked={sabida} onChange={(e) => marcar(e.target.checked)} className="accent-[var(--color-accent)]" />
              Já sei esta ficha de cor
            </label>
          )}
        </>
      ) : (
        <div className="grid gap-2 rounded-[var(--radius-ctl)] border border-dashed border-line px-3 py-3 text-[13.5px] text-text-2">
          <p>Escreva de cabeça, e diga o que significa cada símbolo:</p>
          <ol className="grid list-decimal gap-0.5 pl-5 text-text">
            {f.formulas.map((x) => (
              <li key={x.tex}>{x.nome}</li>
            ))}
          </ol>
          <p>Depois lembre o pulo do gato desta ficha e confira.</p>
          <button
            type="button"
            onClick={() => setAberta(true)}
            className="inline-flex h-8 w-fit items-center rounded-[var(--radius-ctl)] border border-line px-3 text-[13px] text-text hover:border-text-3"
          >
            Mostrar fórmula e bizus
          </button>
        </div>
      )}
    </article>
  )
}

export function Bizuario() {
  const [decorar, setDecorar] = useState(false)
  const [esconderSabidas, setEsconderSabidas] = useState(false)
  const [sabidas, setSabidas] = useState<Set<string>>(() => lerSabidas())

  useEffect(() => salvarSabidas(sabidas), [sabidas])

  const marcar = (id: string, sabe: boolean) =>
    setSabidas((s) => {
      const n = new Set(s)
      if (sabe) n.add(id)
      else n.delete(id)
      return n
    })

  const feitas = useMemo(() => BIZUARIO.flatMap((t) => t.fichas).filter((f) => sabidas.has(f.id)).length, [sabidas])
  const ir = (id: string) => document.getElementById(`biz-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="min-h-full">
      <TopBar route="fisica2" />
      <div className="mx-auto max-w-[820px] px-5 pt-8 pb-24 sm:px-8">
        <a href="#/fisica2" className="mb-3 inline-block text-[12.5px] text-text-3 hover:text-text-2">
          ← Física II
        </a>
        <p className="mb-2 text-[13px] text-text-3">Física II · oscilações, ondas e som</p>
        <h1 className="text-[30px] leading-tight font-semibold tracking-[-0.02em] text-text">Bizuário para a P2</h1>
        <p className="mt-3 max-w-[62ch] text-[14.5px] leading-[1.6] text-text-2">
          Todas as fórmulas e todos os pulos do gato das {FISICA2.length} questões de Física II do site, em {TOTAL} fichas. Cada ficha diz quando usar a
          fórmula, o atalho ou a armadilha que as questões cobram, e onde treinar.
        </p>

        <ol className="mt-5 grid gap-2 rounded-[var(--radius-ctl)] border border-line-soft bg-surface px-4 py-3 text-[13.5px] leading-[1.55] text-text-2">
          <li>
            <span className="font-semibold text-text">1. Leia</span> um tópico inteiro no modo <em>Ler</em>, na ordem: cada um usa o anterior.
          </li>
          <li>
            <span className="font-semibold text-text">2. Decore</span> no modo <em>Decorar</em>: a fórmula fica escondida; escreva de cabeça, confira e marque
            "Lembrei" ou "Ainda não".
          </li>
          <li>
            <span className="font-semibold text-text">3. Repita</span> escondendo as que já sabe até a barra encher, e feche com a folha de revisão no fim da
            página.
          </li>
        </ol>

        <div className="sticky top-0 z-10 -mx-5 mt-5 grid gap-2.5 border-b border-line-soft bg-bg/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <div role="radiogroup" aria-label="Modo" className="inline-flex rounded-[var(--radius-ctl)] border border-line p-0.5">
              {(['Ler', 'Decorar'] as const).map((m) => {
                const ativo = (m === 'Decorar') === decorar
                return (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={ativo}
                    onClick={() => setDecorar(m === 'Decorar')}
                    className={`h-7 rounded-[calc(var(--radius-ctl)-2px)] px-3 text-[13px] ${ativo ? 'bg-surface-2 text-text' : 'text-text-2 hover:text-text'}`}
                  >
                    {m}
                  </button>
                )
              })}
            </div>
            <label className="inline-flex items-center gap-1.5 text-[12.5px] text-text-2">
              <input type="checkbox" checked={esconderSabidas} onChange={(e) => setEsconderSabidas(e.target.checked)} />
              Esconder as que já sei
            </label>
            <span className="num ml-auto text-[12.5px] text-text-2">
              {feitas} de {TOTAL} fichas
            </span>
            {feitas > 0 && (
              <button type="button" onClick={() => setSabidas(new Set())} className="text-[12.5px] text-text-3 underline-offset-2 hover:text-text-2 hover:underline">
                recomeçar
              </button>
            )}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden>
            <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${(100 * feitas) / TOTAL}%` }} />
          </div>
          <nav aria-label="Tópicos" className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {BIZUARIO.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => ir(t.id)}
                className="shrink-0 rounded-full border border-line px-2.5 py-0.5 text-[12px] text-text-2 hover:border-text-3 hover:text-text"
              >
                {i + 1}. {t.titulo}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6 grid gap-10">
          {BIZUARIO.map((t, i) => {
            const fichas = t.fichas.filter((f) => !esconderSabidas || !sabidas.has(f.id))
            const ok = t.fichas.filter((f) => sabidas.has(f.id)).length
            return (
              <section key={t.id} id={`biz-${t.id}`} className="scroll-mt-36" aria-labelledby={`biz-h-${t.id}`}>
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <h2 id={`biz-h-${t.id}`} className="text-[20px] font-semibold tracking-[-0.01em] text-text">
                    <span className="num mr-2 text-text-3">{i + 1}</span>
                    {t.titulo}
                  </h2>
                  <span className="num shrink-0 text-[12px] text-text-3">
                    {ok}/{t.fichas.length}
                  </span>
                </div>
                <p className="mb-4 text-[14px] leading-[1.6] text-text-2">{t.resumo}</p>
                {fichas.length ? (
                  <div className="grid gap-4">
                    {fichas.map((f) => (
                      <Cartao key={`${f.id}-${decorar}`} f={f} decorar={decorar} sabida={sabidas.has(f.id)} marcar={(s) => marcar(f.id, s)} />
                    ))}
                  </div>
                ) : (
                  <p className="rounded-[var(--radius-ctl)] border border-line-soft px-3 py-2.5 text-[13px] text-accent">Tópico inteiro marcado como sabido.</p>
                )}
              </section>
            )
          })}
        </div>

        <section id="biz-revisao" className="mt-14 border-t border-line pt-8" aria-labelledby="biz-h-revisao">
          <h2 id="biz-h-revisao" className="text-[20px] font-semibold tracking-[-0.01em] text-text">
            Folha de revisão rápida
          </h2>
          <p className="mt-2 mb-5 text-[14px] leading-[1.6] text-text-2">
            Nome e fórmula, na ordem dos tópicos, para a última olhada antes da prova. Se um nome não trouxer a fórmula à cabeça, volte à ficha.
          </p>
          <div className="grid gap-5">
            {BIZUARIO.map((t, i) => (
              <div key={t.id}>
                <div className="mb-1.5 text-[12.5px] font-semibold text-text-2">
                  {i + 1}. {t.titulo}
                </div>
                <dl className="grid gap-px overflow-hidden rounded-[var(--radius-ctl)] border border-line-soft bg-line-soft text-[13px]">
                  {t.fichas
                    .flatMap((f) => f.formulas)
                    .map((f) => (
                      <div key={f.tex} className="grid items-center gap-x-4 gap-y-0.5 bg-surface px-3 py-2 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
                        <dt className="text-[12.5px] text-text-2">{f.nome}</dt>
                        <dd className="max-w-full overflow-x-auto overflow-y-hidden px-0.5 py-0.5 text-text">
                          <Tex src={f.tex} />
                        </dd>
                      </div>
                    ))}
                </dl>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
