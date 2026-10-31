import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { type Resolved, compileScenario } from '../scenario/compile'
import { ocultosDoPasso, simRef, useRun } from '../store'

function useCompiled(t: number, tick: number): Resolved | null {
  const { scenario, params, overrides, orient, extras, step, previsoes } = useRun(
    useShallow((s) => ({ scenario: s.scenario, params: s.params, overrides: s.overrides, orient: s.orient, extras: s.extras, step: s.step, previsoes: s.previsoes })),
  )
  return useMemo(() => {
    if (!scenario) return null
    const passo = step >= 0 ? scenario.passos[step] : undefined
    void tick
    const ocultar = ocultosDoPasso(scenario, step, previsoes)
    return compileScenario(scenario, { params, overrides, orient, extras, t, sim: simRef.current, mostrar: passo?.mostrar, ocultar })
  }, [scenario, params, overrides, orient, extras, t, tick, step, previsoes])
}

/** Mundo compilado a cada quadro: para a cena 3D. */
export function useResolved(): Resolved | null {
  const { t, tick } = useRun(useShallow((s) => ({ t: s.t, tick: s.tick })))
  return useCompiled(t, tick)
}

/**
 * Mundo compilado no máximo a cada `ms` enquanto a simulação corre: para o
 * painel (medidas, gráficos). Mudanças do aluno (parâmetro, passo, arrasto)
 * continuam imediatas, porque não passam pelo relógio.
 */
export function useResolvedThrottled(ms = 100): Resolved | null {
  const [clock, setClock] = useState(() => {
    const s = useRun.getState()
    return { t: s.t, tick: s.tick }
  })
  useEffect(() => {
    let last = 0
    let timer: ReturnType<typeof setTimeout> | null = null
    const unsub = useRun.subscribe((s, prev) => {
      if (s.t === prev.t && s.tick === prev.tick) return
      const now = performance.now()
      const flush = () => {
        last = performance.now()
        timer = null
        const st = useRun.getState()
        setClock({ t: st.t, tick: st.tick })
      }
      if (now - last >= ms) flush()
      else if (!timer) timer = setTimeout(flush, ms - (now - last))
    })
    return () => {
      unsub()
      if (timer) clearTimeout(timer)
    }
  }, [ms])
  return useCompiled(clock.t, clock.tick)
}
