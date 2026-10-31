import { useState } from 'react'
import type { Scenario } from '../scenario/schema'
import { Icon } from './kit'
import { Rich } from './Rich'

/**
 * Alternativas: o aluno escolhe antes de ver o gabarito. Depois da escolha,
 * a explicação da escolhida e da correta aparece; as demais, sob demanda.
 */
export function Alternatives({
  alts,
  inicial = null,
  revelado = false,
  onEscolha,
}: {
  alts: NonNullable<Scenario['alternativas']>
  /** Resposta dada antes, como a de um simulado já entregue. */
  inicial?: string | null
  /** Mostra o gabarito mesmo sem escolha: a questão deixada em branco no simulado. */
  revelado?: boolean
  /** Só a primeira escolha conta: é ela que o treino registra. */
  onEscolha?: (correta: boolean) => void
}) {
  const [chosen, setChosen] = useState<string | null>(inicial)
  const [reveal, setReveal] = useState(revelado)
  const [all, setAll] = useState(false)
  const show = reveal || chosen !== null
  const right = alts.find((a) => a.letra === chosen)?.correta
  const hasWhy = alts.some((a) => a.porque)
  return (
    <div className="grid gap-2">
      <div className="grid gap-1" role="radiogroup" aria-label="Alternativas">
        {alts.map((a) => {
          const isChosen = chosen === a.letra
          const state = !show ? 'idle' : a.correta ? 'right' : isChosen ? 'wrong' : 'idle'
          const why = show && a.porque && (all || isChosen || a.correta)
          return (
            <div
              key={a.letra}
              className={`rounded-[var(--radius-ctl)] border transition-colors duration-150 ${
                state === 'right' ? 'border-accent/60 bg-accent/10' : state === 'wrong' ? 'border-danger/60 bg-danger/10' : 'border-transparent hover:border-line hover:bg-surface-2'
              }`}
            >
              <button
                type="button"
                role="radio"
                aria-checked={isChosen}
                onClick={() => {
                  if (chosen === null) onEscolha?.(!!a.correta)
                  setChosen(a.letra)
                }}
                className={`grid w-full grid-cols-[22px_1fr_16px] items-center gap-2.5 px-2.5 py-2 text-left text-[13.5px] ${state === 'idle' ? 'text-text-2' : 'text-text'}`}
              >
                <span
                  className={`num flex h-[22px] w-[22px] items-center justify-center rounded-full border text-[12px] ${
                    state === 'right' ? 'border-accent text-accent' : state === 'wrong' ? 'border-danger text-danger' : 'border-line text-text-3'
                  }`}
                >
                  {a.letra}
                </span>
                <Rich text={a.texto} />
                <span className="text-accent">{state === 'right' && Icon.check}</span>
              </button>
              {why && <Rich text={a.porque!} className="-mt-0.5 px-2.5 pb-2.5 pl-[42px] text-[12.5px] leading-[1.55] text-text-2" />}
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[12.5px] text-text-3" aria-live="polite">
        <span>{chosen === null ? 'Escolha a sua antes de ver o gabarito.' : right ? 'Correta.' : 'Não é essa. A explicação está na alternativa marcada.'}</span>
        {!show && (
          <button type="button" className="shrink-0 text-text-2 underline decoration-line underline-offset-4 hover:text-text" onClick={() => setReveal(true)}>
            Ver gabarito
          </button>
        )}
        {show && hasWhy && !all && (
          <button type="button" className="shrink-0 text-text-2 underline decoration-line underline-offset-4 hover:text-text" onClick={() => setAll(true)}>
            Por que as outras estão erradas
          </button>
        )}
      </div>
    </div>
  )
}

export function Answers({ respostas }: { respostas: Scenario['respostas'] }) {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  return (
    <div className="grid gap-1.5">
      {respostas.map((r) => (
        <div key={r.item} className="rounded-[var(--radius-ctl)] border border-line-soft">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[13px] text-text-2 hover:text-text"
            aria-expanded={!!open[r.item]}
            onClick={() => setOpen((o) => ({ ...o, [r.item]: !o[r.item] }))}
          >
            <span>
              Item ({r.item})
              {r.pontos !== undefined && <span className="num ml-2 text-[12px] text-text-3">{r.pontos.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} pt</span>}
            </span>
            <span className="text-[12px] text-text-3">{open[r.item] ? 'ocultar' : 'mostrar resposta'}</span>
          </button>
          {open[r.item] && (
            <div className="grid gap-2 border-t border-line-soft px-3 py-2.5">
              <Rich text={r.texto} className="text-[13.5px] text-text" />
              {r.criterio && <Rich text={`**Critério de correção:** ${r.criterio}`} className="text-[12.5px] text-text-3" />}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
