import { useEffect, useState } from 'react'
import type { Passo } from '../scenario/schema'
import { useRun } from '../store'
import { Icon, IconButton } from './kit'
import { Rich } from './Rich'

/** O título pode entregar a resposta; enquanto a previsão está aberta, fica neutro. */
export const tituloDoPasso = (passo: Passo, respondida: boolean) => (passo.previsao && !respondida ? 'Antes de continuar' : passo.titulo)

function Previsao({ p, escolha, onEscolha }: { p: NonNullable<Passo['previsao']>; escolha?: number; onEscolha: (i: number) => void }) {
  const done = escolha !== undefined
  return (
    <div className="mb-3 rounded-[var(--radius-ctl)] border border-line bg-surface px-3 py-2.5">
      <div className="mb-2 text-[12px] text-accent">Preveja antes de ver</div>
      <Rich text={p.pergunta} className="mb-2 text-[13.5px] text-text" />
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Sua previsão">
        {p.opcoes.map((o, i) => {
          const state = !done ? 'idle' : i === p.correta ? 'right' : i === escolha ? 'wrong' : 'idle'
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={escolha === i}
              disabled={done}
              onClick={() => onEscolha(i)}
              className={`rounded-[var(--radius-ctl)] border px-2.5 py-1 text-[13px] transition-colors duration-150 ${
                state === 'right'
                  ? 'border-accent/70 bg-accent/10 text-text'
                  : state === 'wrong'
                    ? 'border-danger/60 bg-danger/10 text-text'
                    : 'border-line text-text-2 enabled:hover:border-text-3 enabled:hover:text-text'
              }`}
            >
              <Rich text={o} className="[&_p]:inline" />
            </button>
          )
        })}
      </div>
      {done && (
        <p className="mt-2 text-[12.5px] text-text-3" aria-live="polite">
          {escolha === p.correta ? 'Acertou. Veja por quê:' : 'Não é isso. Veja na cena e no texto:'}
        </p>
      )}
    </div>
  )
}

export function Steps({ passos }: { passos: Passo[] }) {
  const step = useRun((s) => s.step)
  const setStep = useRun((s) => s.setStep)
  const passo = passos[step]
  const previsoes = useRun((s) => s.previsoes)
  const answer = useRun((s) => s.answerPrevisao)
  const [conta, setConta] = useState(false)
  useEffect(() => setConta(false), [step])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.metaKey || e.ctrlKey) return
      const st = useRun.getState()
      // com um objeto selecionado, as setas movem o objeto (KeyboardMover)
      if (st.selected) return
      if (e.key === 'ArrowRight') setStep(st.step + 1)
      else if (e.key === 'ArrowLeft') setStep(st.step - 1)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setStep])

  if (!passo) return null
  return (
    <div className="grid gap-3">
      <ol className="flex gap-1" aria-label="Passos da resolução">
        {passos.map((p, i) => (
          <li key={i} className="flex-1">
            <button
              type="button"
              onClick={() => setStep(i)}
              aria-current={i === step ? 'step' : undefined}
              aria-label={`Passo ${i + 1}: ${p.titulo}`}
              className="group block w-full py-1.5"
            >
              <span
                className={`block h-[3px] rounded-full transition-colors duration-200 ${
                  i === step ? 'bg-accent' : i < step ? 'bg-text-3' : 'bg-surface-3 group-hover:bg-line'
                }`}
              />
            </button>
          </li>
        ))}
      </ol>
      <div aria-live="polite">
        <div className="mb-1 flex items-baseline gap-2 text-[12px] text-text-3">
          <span className="num">
            {String(step + 1).padStart(2, '0')}/{String(passos.length).padStart(2, '0')}
          </span>
          {passo.item && <span className="rounded-[4px] border border-line px-1.5 text-[11px] text-text-2">item {passo.item}</span>}
        </div>
        <h3 className="mb-2 text-[16px] leading-snug font-semibold text-text">{tituloDoPasso(passo, previsoes[step] !== undefined)}</h3>
        {passo.previsao && (
          <Previsao
            p={passo.previsao}
            escolha={previsoes[step]}
            onEscolha={(i) => answer(step, i)}
          />
        )}
        {(!passo.previsao || previsoes[step] !== undefined) && <Rich text={passo.texto} className="text-[14px] leading-[1.6] text-text-2" />}
        {passo.detalhe && (!passo.previsao || previsoes[step] !== undefined) && (
          <div className="mt-2">
            <button
              type="button"
              aria-expanded={conta}
              onClick={() => setConta((v) => !v)}
              className="text-[12.5px] text-text-3 underline decoration-line underline-offset-4 hover:text-text-2"
            >
              {conta ? 'ocultar a conta' : 'ver a conta'}
            </button>
            {conta && <Rich text={passo.detalhe} className="mt-2 rounded-[var(--radius-ctl)] bg-surface px-3 py-2.5 text-[13.5px] leading-[1.6] text-text-2" />}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between pt-1">
        <IconButton label="Passo anterior (←)" onClick={() => setStep(step - 1)} disabled={step === 0} className="disabled:opacity-30">
          {Icon.prev}
        </IconButton>
        <span className="hidden text-[12px] text-text-3 sm:inline">← → para navegar</span>
        <button
          type="button"
          onClick={() => setStep(step + 1)}
          disabled={step === passos.length - 1}
          className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-ctl)] bg-accent px-3 text-[13px] font-medium text-accent-ink transition-opacity duration-150 disabled:opacity-30"
        >
          Próximo {Icon.next}
        </button>
      </div>
    </div>
  )
}
