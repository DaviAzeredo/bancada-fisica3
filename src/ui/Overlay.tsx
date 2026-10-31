import { useState } from 'react'
import { formatInline } from '../lib/format'
import type { Resolved } from '../scenario/compile'
import { type Layer, useRun } from '../store'
import { Icon, IconButton } from './kit'

const LAYERS: { id: Layer; label: string; needs: 'E' | 'B' | 'EB' }[] = [
  { id: 'linhasE', label: 'Linhas de E', needs: 'E' },
  { id: 'setasE', label: 'Setas de E', needs: 'E' },
  { id: 'planoV', label: 'Plano de V', needs: 'E' },
  { id: 'equipotenciais', label: 'Equipotenciais', needs: 'E' },
  { id: 'linhasB', label: 'Linhas de B', needs: 'B' },
  { id: 'setasB', label: 'Setas de B', needs: 'B' },
  { id: 'limalha', label: 'Limalha', needs: 'EB' },
]

export function LayerToggles({ r }: { r: Resolved }) {
  const layers = useRun((s) => s.layers)
  const toggle = useRun((s) => s.toggleLayer)
  const hasE = r.world.e.length > 0
  const hasB = r.world.b.length > 0
  const list = LAYERS.filter((l) => (l.needs === 'E' ? hasE : l.needs === 'B' ? hasB : hasE || hasB))
  const [open, setOpen] = useState(false)
  if (!list.length) return null
  const ativas = list.filter((l) => layers[l.id]).length
  return (
    <div className="pointer-events-auto">
      {/* telas estreitas: um botão que abre a lista, para a cena não sumir atrás dos controles */}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 items-center gap-2 rounded-[var(--radius-panel)] border border-line bg-surface/92 px-3 text-[12.5px] text-text-2 sm:hidden"
      >
        Camadas <span className="num text-text-3">{ativas}</span>
      </button>
      <div
        className={`${open ? 'mt-1 flex' : 'hidden'} max-w-[78vw] flex-wrap gap-1 rounded-[var(--radius-panel)] border border-line bg-surface/92 p-1 shadow-[0_8px_24px_-12px_oklch(0_0_0/0.6)] sm:mt-0 sm:flex sm:max-w-none`}
        role="group"
        aria-label="Camadas de visualização"
      >
      {list.map((l) => {
        const on = layers[l.id]
        return (
          <button
            key={l.id}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(l.id)}
            className={`inline-flex h-7 items-center gap-1.5 rounded-[5px] px-2.5 text-[12.5px] transition-colors duration-150 ${
              on ? 'bg-surface-3 text-text' : 'text-text-3 hover:text-text-2'
            }`}
          >
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full"
              style={{
                background: on ? (l.needs === 'E' || (l.needs === 'EB' && !hasB) ? 'var(--color-field-e)' : 'var(--color-field-b)') : 'transparent',
                boxShadow: `inset 0 0 0 1.5px ${l.needs === 'E' || (l.needs === 'EB' && !hasB) ? 'var(--color-field-e)' : 'var(--color-field-b)'}`,
              }}
            />
            {l.label}
          </button>
        )
      })}
      </div>
    </div>
  )
}

const SPEEDS = [0.25, 0.5, 1, 2, 4]

export function TimeControls() {
  const scenario = useRun((s) => s.scenario)
  const playing = useRun((s) => s.playing)
  const speed = useRun((s) => s.speed)
  const t = useRun((s) => s.t)
  const setPlaying = useRun((s) => s.setPlaying)
  const setSpeed = useRun((s) => s.setSpeed)
  const resetSim = useRun((s) => s.resetSim)
  const tMax = useRun((s) => s.tMax)
  const scrubTo = useRun((s) => s.scrubTo)
  const hasTestCharge = useRun((s) => s.extras.some((e) => e.tipo === 'particula'))
  const tempo = scenario?.cena.tempo ?? (hasTestCharge ? { escala: 1, unidade: 's' as const, duracao: undefined } : undefined)
  if (!tempo) return null
  const unitScale = { s: 1, ms: 1e-3, 'µs': 1e-6, ns: 1e-9 }[tempo.unidade]
  const limite = tempo.duracao ?? tMax
  return (
    <div className="pointer-events-auto flex items-center gap-1 rounded-[var(--radius-panel)] border border-line bg-surface/92 p-1 shadow-[0_8px_24px_-12px_oklch(0_0_0/0.6)]">
      <IconButton label={playing ? 'Pausar (espaço)' : 'Reproduzir (espaço)'} onClick={() => setPlaying(!playing)}>
        {playing ? Icon.pause : Icon.play}
      </IconButton>
      <IconButton label="Recomeçar" onClick={resetSim}>
        {Icon.reset}
      </IconButton>
      <div className="num min-w-[92px] px-1 text-right text-[12.5px] whitespace-nowrap text-text-2" aria-live="off">
        {/* prefixo SI em vez de "1.025 ns", que em português se lê como mil e vinte e cinco */}
        t = {formatInline(t, 's', 3)}
      </div>
      {limite > 0 && (
        <input
          type="range"
          className="slider mx-1 w-24 sm:w-36"
          min={0}
          max={1000}
          value={Math.round((Math.min(t, limite) / limite) * 1000)}
          style={{ ['--fill' as string]: `${(Math.min(t, limite) / limite) * 100}%` }}
          aria-label="Linha do tempo"
          aria-valuetext={`t = ${(t / unitScale).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${tempo.unidade}`}
          onChange={(e) => scrubTo((Number(e.target.value) / 1000) * limite)}
        />
      )}
      <div className="mx-1 h-5 w-px bg-line" />
      {/* no celular, os cinco botões empurrariam a barra para cima das ferramentas da cena */}
      <button
        type="button"
        aria-label={`Velocidade ${speed}×: tocar para mudar`}
        onClick={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}
        className="num h-7 rounded-[5px] bg-surface-3 px-1.5 text-[11.5px] text-text sm:hidden"
      >
        {speed}×
      </button>
      <div className="hidden sm:flex" role="radiogroup" aria-label="Velocidade">
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={speed === s}
            onClick={() => setSpeed(s)}
            className={`num h-7 rounded-[5px] px-1.5 text-[11.5px] ${speed === s ? 'bg-surface-3 text-text' : 'text-text-3 hover:text-text-2'}`}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  )
}

/** Ferramentas da cena: enquadrar (F) e sonda livre (P). */
export function SceneTools() {
  const sonda = useRun((s) => s.sondaLivre)
  const toggleSonda = useRun((s) => s.toggleSonda)
  const requestFrame = useRun((s) => s.requestFrame)
  return (
    <div className="pointer-events-auto flex flex-col gap-1 rounded-[var(--radius-panel)] border border-line bg-surface/92 p-1 shadow-[0_8px_24px_-12px_oklch(0_0_0/0.6)]">
      <IconButton label="Enquadrar a cena (F)" onClick={requestFrame}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2.5 5.5v-3h3M10.5 2.5h3v3M13.5 10.5v3h-3M5.5 13.5h-3v-3" />
          <circle cx="8" cy="8" r="1.6" />
        </svg>
      </IconButton>
      <IconButton label={sonda ? 'Desligar a sonda livre (P)' : 'Sonda livre: medir sob o cursor (P)'} active={sonda} onClick={toggleSonda}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="8" cy="8" r="4.5" />
          <path d="M8 1.5v3M8 11.5v3M1.5 8h3M11.5 8h3" />
        </svg>
      </IconButton>
    </div>
  )
}

export function Legend({ r }: { r: Resolved }) {
  const scenario = useRun((s) => s.scenario)!
  const items: { color: string; label: string }[] = []
  const has = (t: string) => r.ents.some((e) => e.tipo === t)
  const charges = r.ents.filter((e) => e.tipo === 'carga' || e.tipo === 'esfera' || e.tipo === 'capacitor' || e.tipo === 'placa' || e.tipo === 'planoInfinito' || e.tipo === 'linhaInfinita' || e.tipo === 'anelCarga' || e.tipo === 'segmentoCarga' || e.tipo === 'cilindroInfinito')
  if (charges.length) {
    items.push({ color: 'var(--color-pos)', label: 'carga +' })
    items.push({ color: 'var(--color-neg)', label: 'carga −' })
  }
  if (r.world.e.length) items.push({ color: 'var(--color-field-e)', label: 'campo E' })
  if (r.world.b.length) items.push({ color: 'var(--color-field-b)', label: 'campo B' })
  if (r.ents.some((e) => e.tipo === 'seta' && e.papel === 'forca')) items.push({ color: 'var(--color-force)', label: 'força' })
  if (r.ents.some((e) => e.tipo === 'seta' && e.papel === 'v')) items.push({ color: 'var(--color-velocity)', label: 'velocidade' })
  if (has('fio') || has('fioInfinito') || has('bobina') || has('condutor') || has('circuito')) items.push({ color: 'var(--color-copper)', label: 'corrente' })
  if (has('gaussiana') || has('amperiana')) items.push({ color: 'linear-gradient(90deg, var(--color-neg), var(--color-pos))', label: 'fluxo entra / sai' })
  const { escala, extensao } = scenario.cena
  const cell = extensao > 12 ? 1 : 0.5
  return (
    <div className="pointer-events-auto rounded-[var(--radius-panel)] border border-line bg-surface/92 px-3 py-2 text-[12px] text-text-2 shadow-[0_8px_24px_-12px_oklch(0_0_0/0.6)]">
      <ul className="grid gap-1">
        {items.map((i) => (
          <li key={i.label} className="flex items-center gap-2">
            <span aria-hidden className="inline-block h-2 w-3.5 rounded-sm" style={{ background: i.color }} />
            {i.label}
          </li>
        ))}
      </ul>
      <div className="num mt-1.5 border-t border-line-soft pt-1.5 text-[11.5px] text-text-3">quadrado = {formatInline(cell * escala, 'm')}</div>
    </div>
  )
}
