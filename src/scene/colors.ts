import { Color } from 'three'

/** OKLCH → sRGB (0..1). Os tokens do DESIGN.md são a única fonte de cor da cena. */
export function oklch(L: number, C: number, h: number): Color {
  const hr = (h * Math.PI) / 180
  const a = C * Math.cos(hr)
  const b = C * Math.sin(hr)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => Math.min(1, Math.max(0, v)))
  // three trabalha em linear-sRGB internamente: Color.setRGB com espaço linear.
  return new Color().setRGB(lin[0], lin[1], lin[2])
}

export const C = {
  bg: oklch(0.155, 0.012, 255),
  surface: oklch(0.19, 0.012, 255),
  grid: oklch(0.3, 0.012, 255),
  gridSection: oklch(0.38, 0.014, 255),
  text: oklch(0.94, 0.006, 255),
  text3: oklch(0.62, 0.012, 255),
  accent: oklch(0.82, 0.13, 160),
  pos: oklch(0.74, 0.16, 55),
  neg: oklch(0.7, 0.13, 245),
  fieldE: oklch(0.88, 0.11, 90),
  fieldEDim: oklch(0.45, 0.05, 90),
  fieldB: oklch(0.78, 0.11, 195),
  fieldBDim: oklch(0.42, 0.05, 195),
  force: oklch(0.72, 0.17, 340),
  velocity: oklch(0.85, 0.08, 130),
  copper: oklch(0.7, 0.11, 55),
  copperDark: oklch(0.5, 0.08, 50),
  north: oklch(0.6, 0.16, 25),
  south: oklch(0.5, 0.03, 255),
  dielectric: oklch(0.72, 0.06, 300),
  neutral: oklch(0.86, 0.01, 255),
}

export const roleColor = (papel: string): Color =>
  papel === 'forca' ? C.force : papel === 'E' ? C.fieldE : papel === 'B' ? C.fieldB : papel === 'v' ? C.velocity : papel === 'I' ? C.copper : C.neutral

export const signColor = (v: number) => (v >= 0 ? C.pos : C.neg)

/** Mapa divergente azul → neutro escuro → laranja, para s ∈ [−1, 1]. */
export function diverging(s: number, out = new Color()): Color {
  const t = Math.min(1, Math.abs(s))
  const mid = oklchMid
  const end = s >= 0 ? C.pos : C.neg
  return out.copy(mid).lerp(end, Math.pow(t, 0.75))
}
const oklchMid = oklch(0.32, 0.01, 255)
