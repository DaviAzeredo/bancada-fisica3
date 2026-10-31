/**
 * Peças reaproveitadas entre provas: expressões de campo que se repetem
 * (condutor oco com partícula na cavidade) e geradores de curvas para o
 * objeto `caminho`. Tudo devolve dados do cenário (strings e números), nada
 * de física nova: a conta continua no núcleo e nos testes.
 */

type P3 = [number, number, number]

/** Ponto em coordenadas polares no plano xy (ângulo em graus). */
export const pol = (r: number, graus: number, z = 0): P3 => {
  const a = (graus * Math.PI) / 180
  return [r * Math.cos(a), r * Math.sin(a), z]
}

/** Curva de Bézier quadrática a → c → b, com n + 1 pontos. */
export function bezier(a: P3, c: P3, b: P3, n = 24): P3[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n
    const u = 1 - t
    return [0, 1, 2].map((k) => u * u * a[k] + 2 * u * t * c[k] + t * t * b[k]) as P3
  })
}

/**
 * Condutor esférico oco (cavidade de raio A, metal até B, centro na origem)
 * com uma partícula `q` em (`x`, 0, 0) dentro da cavidade e carga total `Q`
 * no condutor. Devolve o campo e o potencial **das cargas induzidas** (a
 * partícula entra no cenário como `carga` própria):
 * - na cavidade, a carga-imagem de Kelvin −q·A/|x| em A²/x, mais a constante
 *   do condutor;
 * - no metal, o oposto do campo da partícula (o total é nulo) e potencial
 *   total constante V_c = k₀(Q + q)/B;
 * - fora, uma casca uniforme com Q + q, menos o campo da partícula.
 * Exato para qualquer posição da partícula na cavidade.
 */
export function condutorOco(A: number, B: number, q = 'qp', Q = 'Qc', x = 'xq') {
  const P = '[x,y,z]'
  const d = `(abs(${x}) < 1e-6 ? 1e-6 : ${x})`
  const img = `[${A * A}/${d},0,0]`
  const qi = `(0-${q}*${A}/abs(${d}))`
  const Ep = `k0*${q}*(${P}-[${x},0,0])/mag(${P}-[${x},0,0])^3`
  const Vp = `k0*${q}/mag(${P}-[${x},0,0])`
  const Vc = `k0*(${Q}+${q})/${B}`
  const r = `mag(${P})`
  return {
    campo:
      `${r} < ${A} ? k0*${qi}*(${P}-${img})/mag(${P}-${img})^3` +
      ` : (${r} < ${B} ? (0-1)*${Ep} : k0*(${Q}+${q})*${P}/${r}^3 - ${Ep})`,
    potencial: `${r} < ${A} ? k0*${qi}/mag(${P}-${img}) + ${Vc} : (${r} < ${B} ? ${Vc} - ${Vp} : k0*(${Q}+${q})/${r} - ${Vp})`,
  }
}
