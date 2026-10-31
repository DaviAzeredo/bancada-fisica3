import { useId } from 'react'
import { formatSI } from '../lib/format'
import type { Parametro } from '../scenario/schema'
import { useRun } from '../store'
import { Tex } from './Rich'

function Slider({ p, value }: { p: Parametro; value: number }) {
  const setParam = useRun((s) => s.setParam)
  const id = useId()
  const min = p.min ?? Math.min(0, value)
  const max = p.max ?? Math.max(1, value * 2)
  const log = p.log && min > 0
  const toPos = (v: number) => (log ? Math.log(v / min) / Math.log(max / min) : (v - min) / (max - min || 1))
  const fromPos = (t: number) => (log ? min * (max / min) ** t : min + t * (max - min))
  const pos = Math.min(1, Math.max(0, toPos(value)))
  const f = formatSI(value, p.unidade, 3)
  const step = p.passo ?? (max - min) / 200
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] text-text-2">
          {p.simbolo && <Tex src={p.simbolo} className="mr-1.5 text-text" />}
          {p.rotulo}
        </label>
        <output htmlFor={id} className="num text-[13px] text-text">
          {f.value}
          {f.unit && <span className="ml-1 text-text-3">{f.unit}</span>}
        </output>
      </div>
      <input
        id={id}
        className="slider"
        type="range"
        min={0}
        max={1000}
        step={log ? 1 : Math.max(1, Math.round((step / (max - min || 1)) * 1000))}
        value={Math.round(pos * 1000)}
        style={{ ['--fill' as string]: `${pos * 100}%` }}
        aria-valuetext={`${f.value} ${f.unit}`}
        onChange={(e) => {
          let v = fromPos(Number(e.target.value) / 1000)
          if (!log && p.passo) v = Math.round(v / p.passo) * p.passo
          setParam(p.id, Number(v.toPrecision(10)))
        }}
      />
    </div>
  )
}

function Options({ p, value }: { p: Parametro; value: number }) {
  const setParam = useRun((s) => s.setParam)
  return (
    <fieldset className="grid gap-1.5">
      <legend className="mb-1.5 text-[13px] text-text-2">{p.rotulo}</legend>
      <div className="flex flex-wrap gap-1 rounded-[var(--radius-ctl)] bg-bg p-1" role="radiogroup">
        {p.opcoes!.map((o) => {
          const on = o.valor === value
          return (
            <button
              key={o.valor}
              role="radio"
              aria-checked={on}
              type="button"
              onClick={() => setParam(p.id, o.valor)}
              className={`h-7 flex-1 rounded-[5px] px-2.5 text-[12.5px] whitespace-nowrap transition-colors duration-150 ${
                on ? 'bg-surface-3 text-text shadow-[0_0_0_1px_var(--color-line)]' : 'text-text-3 hover:text-text-2'
              }`}
            >
              {o.rotulo}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function Given({ p, value }: { p: Parametro; value: number }) {
  const f = formatSI(value, p.unidade, 3)
  return (
    <div className="flex items-baseline justify-between gap-3 text-[13px]">
      <span className="text-text-3">
        {p.simbolo && <Tex src={p.simbolo} className="mr-1.5 text-text-2" />}
        {p.rotulo}
      </span>
      <span className="num text-text-2">
        {f.value}
        {f.unit && <span className="ml-1 text-text-3">{f.unit}</span>}
      </span>
    </div>
  )
}

/** `vivos`: valores da cena agora, que um parâmetro em varredura não guarda no estado. */
export function Controls({ params, vivos }: { params: Parametro[]; vivos?: Record<string, unknown> }) {
  const guardados = useRun((s) => s.params)
  const valor = (p: Parametro) => {
    const v = p.varre ? vivos?.[p.id] : undefined
    return typeof v === 'number' ? v : guardados[p.id]
  }
  const free = params.filter((p) => p.opcoes || p.min !== p.max)
  const given = params.filter((p) => !p.opcoes && p.min !== undefined && p.min === p.max)
  return (
    <div className="grid gap-4">
      {free.map((p) => (p.opcoes ? <Options key={p.id} p={p} value={valor(p) ?? p.valor} /> : <Slider key={p.id} p={p} value={valor(p) ?? p.valor} />))}
      {given.length > 0 && (
        <div className="grid gap-1.5 rounded-[var(--radius-ctl)] border border-line-soft px-3 py-2.5">
          <div className="text-[11.5px] tracking-[0.04em] text-text-3 uppercase">Dados do enunciado</div>
          {given.map((p) => (
            <Given key={p.id} p={p} value={valor(p) ?? p.valor} />
          ))}
        </div>
      )}
    </div>
  )
}
