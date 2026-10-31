import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './index.css'
import { App } from './App'

// Alça de depuração só em desenvolvimento: com o painel oculto o rAF para, e
// __step avança a simulação "na mão" para inspecionar o estado. O import é
// dinâmico para a simulação não entrar no JS da página inicial.
if (import.meta.env.DEV)
  void Promise.all([import('./scenario/sim'), import('./store')]).then(([{ stepSim }, { simRef, useRun }]) =>
    Object.assign(window, {
      __run: useRun,
      __sim: simRef,
      __step: (realSeconds: number) => {
        const st = useRun.getState()
        const s = st.scenario
        const escala = s?.cena.tempo?.escala ?? (st.extras.some((e) => e.tipo === 'particula') ? 1 : 0)
        if (!s || !escala) return 'sem relógio'
        const t = stepSim(s, { params: st.params, t: st.t, overrides: st.overrides, orient: st.orient, extras: st.extras }, simRef.current, realSeconds * escala)
        st.advance(t)
        return t
      },
    }),
  )

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
