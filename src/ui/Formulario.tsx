import { Tex } from './Rich'

/**
 * O quadro de fórmulas impresso na prova. Cada fórmula é um bloco: no painel
 * estreito elas quebram entre si, nunca no meio.
 */
export function Formulario({ formulas }: { formulas: string[] }) {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 rounded-[var(--radius-ctl)] border border-line bg-surface px-3 py-3 text-[13px] text-text" aria-label="Fórmulas">
      {formulas.map((f) => (
        <li key={f} className="max-w-full overflow-x-auto px-1">
          <Tex src={`\\displaystyle ${f}`} />
        </li>
      ))}
    </ul>
  )
}
