import { describe, expect, it } from 'vitest'
import { velocidadeZoom } from './zoom'

/** A mesma conta do camera-controls 3. deltaY negativo aproxima: ampliação maior que 1. */
function ampliacao(deltaY: number, ev: { ctrlKey: boolean; deltaMode: number }, mac: boolean) {
  const f = mac ? -1 : -3
  const delta = ev.deltaMode === 1 && !ev.ctrlKey ? deltaY / f : deltaY / (f * 10)
  return 0.95 ** (-delta * velocidadeZoom(ev, mac))
}

const roda = { ctrlKey: false, deltaMode: 0 }
const pinca = { ctrlKey: true, deltaMode: 0 }
const linhas = { ctrlKey: false, deltaMode: 1 }

describe('sensibilidade do zoom', () => {
  it.each([false, true])('um dente de roda amplia cerca de 1,36×, no Mac (%s) ou não', (mac) => {
    expect(ampliacao(-100, roda, mac)).toBeCloseTo(Math.exp(0.31), 6)
  })

  it('4× saem em 5 dentes', () => {
    expect(ampliacao(-100, roda, false) ** 5).toBeGreaterThan(4)
    expect(ampliacao(-100, roda, false) ** 4).toBeLessThan(4)
  })

  it.each([false, true])('a pinça acompanha os dedos: escala = e^(-deltaY/100), no Mac (%s) ou não', (mac) => {
    for (const d of [2, 20, 69.3]) expect(ampliacao(-d, pinca, mac)).toBeCloseTo(Math.exp(d / 100), 6)
  })

  it.each([false, true])('um dente em linhas (Firefox) vale o mesmo que em pixels, no Mac (%s) ou não', (mac) => {
    expect(ampliacao(-3, linhas, mac)).toBeCloseTo(ampliacao(-100, roda, mac), 6)
  })

  it('aproximar e afastar se desfazem', () => {
    expect(ampliacao(-100, roda, false) * ampliacao(100, roda, false)).toBeCloseTo(1, 9)
  })
})
