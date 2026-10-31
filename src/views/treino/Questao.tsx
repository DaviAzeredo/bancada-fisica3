import type { Prova } from '../../scenario/schema'
import { figurasDe } from '../../content/registry'
import { fmt, tituloDoLab } from '../../treino/banco'
import { Rich } from '../../ui/Rich'

export type Questao = Prova['questoes'][number]

export function Enunciado({ provaId, q }: { provaId: string; q: Questao }) {
  const figuras = figurasDe(provaId, q)
  return (
    <>
      {q.enunciado && <Rich text={q.enunciado} className="text-[14.5px] leading-[1.65] text-text" />}
      {figuras.length > 0 && (
        <div className="mt-3 grid gap-1 overflow-hidden rounded-[var(--radius-ctl)] bg-[oklch(0.97_0.003_90)] p-2">
          {figuras.map((src, i) => (
            <img key={src} src={src} alt={`Enunciado original${figuras.length > 1 ? `, parte ${i + 1}` : ''}`} loading="lazy" decoding="async" className="mx-auto block h-auto max-h-[420px] max-w-full" />
          ))}
        </div>
      )}
    </>
  )
}

/** Pontos de cada item; sem pontuação na prova, o valor da questão se divide igualmente. */
export const pontosDoItem = (q: Questao, r: Questao['respostas'][number]) => r.pontos ?? (q.pontos ?? 0) / q.respostas.length

/** O aluno confere o próprio papel, item por item, com a pontuação da prova. */
export function Autocorrecao({ q, valor, onChange }: { q: Questao; valor: Record<string, number>; onChange: (item: string, pontos: number) => void }) {
  return (
    <ol className="grid gap-2">
      {q.respostas.map((r) => {
        const total = pontosDoItem(q, r)
        return (
          <li key={r.item} className="rounded-[var(--radius-ctl)] border border-line-soft px-3 py-2.5">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[13px] text-text-2">
                Item {r.item} <span className="num ml-1 text-[12px] text-text-3">{fmt(total)} pt</span>
              </span>
              <span className="flex gap-1" role="radiogroup" aria-label={`Pontos do item ${r.item}`}>
                {[0, total / 2, total].map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={valor[r.item] === p}
                    onClick={() => onChange(r.item, p)}
                    className={`num h-7 rounded-[var(--radius-ctl)] border px-2 text-[12.5px] ${valor[r.item] === p ? 'border-accent bg-accent/15 text-text' : 'border-line text-text-3 hover:text-text-2'}`}
                  >
                    {p.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                  </button>
                ))}
              </span>
            </div>
            <Rich text={r.texto} className="text-[13.5px] text-text" />
            {r.criterio && <Rich text={`**Critério de correção:** ${r.criterio}`} className="mt-1 text-[12.5px] text-text-3" />}
          </li>
        )
      })}
    </ol>
  )
}

/** Depois de responder: o resultado, onde se erra, e para onde ir entender. */
export function Fechamento({ provaId, q }: { provaId: string; q: Questao }) {
  const r = q.resolucao
  return (
    <div className="grid gap-2.5 border-t border-line-soft pt-3.5">
      {r && <Rich text={`**Resultado:** ${r.resultado}`} className="text-[13.5px] leading-[1.6] text-text-2" />}
      {r && r.errosComuns.length > 0 && (
        <ul className="grid gap-1 text-[13px] text-text-3">
          {r.errosComuns.map((e) => (
            <li key={e} className="flex gap-2">
              <span aria-hidden>·</span>
              <Rich text={e} />
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <a href={`#/prova/${provaId}/${q.id}`} className="inline-flex h-8 items-center rounded-[var(--radius-ctl)] border border-line px-3 text-[13px] text-text-2 hover:border-text-3 hover:text-text">
          Resolução na bancada
        </a>
        {q.labs?.map((l) => (
          <a key={l} href={`#/lab/${l}`} className="inline-flex h-8 items-center rounded-[var(--radius-ctl)] px-2.5 text-[13px] text-text-3 hover:bg-surface-2 hover:text-text-2">
            Lab: {tituloDoLab(l)}
          </a>
        ))}
      </div>
    </div>
  )
}
