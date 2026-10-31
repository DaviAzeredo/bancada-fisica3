const MAC = /Mac/.test(globalThis.navigator?.platform ?? '')

/** Cada dente de roda de mouse amplia ×1,36: 4× em 5 dentes. */
const POR_DENTE = 0.31
/** Pinça no touchpad: o navegador manda deltaY = -100·ln(escala), e a cena acompanha os dedos. */
const POR_DELTA_PINCA = 0.01

/**
 * O camera-controls leva roda, pinça e linhas (Firefox) a um só `dollySpeed`, mas
 * elas chegam em escalas muito diferentes. Ele aplica 0,95^(delta·velocidade), com
 * delta = deltaY/(10f), ou deltaY/f em linhas; f é 3, exceto no Mac, onde é 1.
 * Esta função devolve a velocidade que dá a ampliação desejada para o evento.
 */
export function velocidadeZoom(e: Pick<WheelEvent, 'ctrlKey' | 'deltaMode'>, mac = MAC) {
  const f = mac ? 1 : 3
  const emLinhas = e.deltaMode === 1 && !e.ctrlKey
  // ln(ampliação) por unidade de deltaY; a roda dá 100 de deltaY ou 3 linhas por dente
  const alvo = emLinhas ? POR_DENTE / 3 : e.ctrlKey ? POR_DELTA_PINCA : POR_DENTE / 100
  return (alvo * (emLinhas ? f : 10 * f)) / -Math.log(0.95)
}
