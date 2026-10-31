import { useState } from 'react'
import { labs } from '../content/registry'
import type { Resolucao } from '../scenario/schema'
import { useRun } from '../store'
import { Icon } from './kit'
import { Rich } from './Rich'

/**
 * Gabarito comentado: conceitos, etapas (cada uma pode abrir o passo da cena
 * correspondente), resultado, erros comuns e a conferência com o oficial.
 * Fica fechado até o aluno pedir, para não entregar a resposta de cara.
 */
export function Solution({ r, praticar = [] }: { r: Resolucao; praticar?: string[] }) {
  const [open, setOpen] = useState(false)
  const setStep = useRun((s) => s.setStep)

  if (!open)
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[34ch] text-[13px] text-text-3">Tente resolver antes. A resolução completa fica aqui embaixo.</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-8 items-center rounded-[var(--radius-ctl)] border border-line px-3 text-[13px] text-text-2 hover:border-text-3 hover:text-text"
        >
          Mostrar resolução
        </button>
      </div>
    )

  return (
    <div className="grid gap-5">
      {r.conceitos.length > 0 && (
        <div>
          <h3 className="mb-2 text-[12.5px] text-text-3">Conceitos usados</h3>
          <ul className="flex flex-wrap gap-1.5">
            {r.conceitos.map((c) => {
              const lab = c.lab ? labs.find((l) => l.id === c.lab) : undefined
              const body = <Rich text={c.texto} className="[&_p]:inline" />
              return (
                <li key={c.texto}>
                  {lab ? (
                    <a
                      href={`#/lab/${lab.id}`}
                      title={`Praticar no laboratório ${lab.numero}: ${lab.titulo}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[12.5px] text-text-2 hover:border-accent/60 hover:text-text"
                    >
                      {body}
                      <span className="num text-[11px] text-accent">lab {lab.numero}</span>
                    </a>
                  ) : (
                    <span className="inline-flex rounded-full border border-line-soft px-2.5 py-1 text-[12.5px] text-text-2">{body}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <ol className="grid gap-4">
        {r.etapas.map((e, i) => (
          <li key={i} className="grid grid-cols-[24px_1fr] gap-2.5">
            <span className="num mt-[1px] flex h-6 w-6 items-center justify-center rounded-full bg-surface-3 text-[11.5px] text-text-2" aria-hidden>
              {i + 1}
            </span>
            <div>
              <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3">
                <h4 className="text-[14px] font-semibold text-text">{e.titulo}</h4>
                {e.passo !== undefined && (
                  <button type="button" onClick={() => setStep(e.passo!)} className="inline-flex items-center gap-1 text-[12px] text-text-3 hover:text-accent">
                    ver na cena {Icon.next}
                  </button>
                )}
              </div>
              <Rich text={e.texto} className="text-[13.5px] leading-[1.6] text-text-2" />
            </div>
          </li>
        ))}
      </ol>

      <div className="rounded-[var(--radius-ctl)] border border-accent/40 bg-accent/5 px-3.5 py-3">
        <div className="mb-1 text-[12px] text-accent">Resultado</div>
        <Rich text={r.resultado} className="text-[14px] text-text" />
      </div>

      {r.errosComuns.length > 0 && (
        <div>
          <h3 className="mb-2 text-[12.5px] text-text-3">Erros comuns</h3>
          <ul className="grid gap-2">
            {r.errosComuns.map((e, i) => (
              <li key={i} className="grid grid-cols-[14px_1fr] gap-2 text-[13.5px] text-text-2">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-pos" aria-hidden />
                <Rich text={e} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {praticar.length > 0 && (
        <div>
          <h3 className="mb-2 text-[12.5px] text-text-3">Para praticar</h3>
          <ul className="flex flex-wrap gap-1.5">
            {labs
              .filter((l) => praticar.includes(l.id))
              .map((l) => (
                <li key={l.id}>
                  <a
                    href={`#/lab/${l.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[12.5px] text-text-2 hover:border-accent/60 hover:text-text"
                  >
                    {l.titulo}
                    <span className="num text-[11px] text-accent">lab {l.numero}</span>
                  </a>
                </li>
              ))}
          </ul>
        </div>
      )}

      <div className="border-t border-line-soft pt-3 text-[12.5px] text-text-3">
        {r.oficial ? (
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <span className="text-accent">{Icon.check}</span> Confere com o gabarito oficial: <Rich text={r.oficial.resposta} className="text-text-2 [&_p]:inline" />
            {r.oficial.observacao && <Rich text={r.oficial.observacao} className="basis-full [&_p]:inline" />}
          </span>
        ) : (
          'Resolução da bancada. A conferência com o gabarito oficial ainda está pendente.'
        )}
      </div>
    </div>
  )
}
