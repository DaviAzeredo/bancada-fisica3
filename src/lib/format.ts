const PREFIXABLE = new Set(['C', 'F', 'V', 'A', 'm', 's', 'T', 'Wb', 'N', 'J', 'Ω', 'W', 'H', 'Hz', 'Ω·m', 'V/m', 'N/C', 'C/m', 'C/m²'])
const PREFIXES: [number, string][] = [
  [1e9, 'G'],
  [1e6, 'M'],
  [1e3, 'k'],
  [1, ''],
  [1e-3, 'm'],
  [1e-6, 'µ'],
  [1e-9, 'n'],
  [1e-12, 'p'],
  [1e-15, 'f'],
]
const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }

const fmtNum = (v: number, digits: number) =>
  v.toLocaleString('pt-BR', { maximumSignificantDigits: digits, minimumSignificantDigits: Math.min(digits, 2) })

/** "1,23 × 10⁻⁵" */
export function sci(v: number, digits = 3): string {
  if (v === 0) return '0'
  const e = Math.floor(Math.log10(Math.abs(v)))
  if (e >= -2 && e <= 4) return fmtNum(v, digits)
  const m = v / 10 ** e
  return `${fmtNum(m, digits)} × 10${String(e).replace(/./g, (c) => SUP[c] ?? c)}`
}

export interface Formatted {
  value: string
  unit: string
}

/** Formata com prefixo SI quando a unidade admite (3,2 µC); senão notação científica. */
export function formatSI(v: number, unit = '', digits = 3): Formatted {
  if (!Number.isFinite(v)) return { value: '—', unit }
  if (Math.abs(v) < 1e-300) return { value: '0', unit }
  if (PREFIXABLE.has(unit) && unit !== 'm/s') {
    const a = Math.abs(v)
    for (const [f, p] of PREFIXES) {
      if (a >= f * 0.9995) {
        // metro não usa k/M/G na escala da bancada
        if (unit === 'm' && f > 1) break
        return { value: fmtNum(v / f, digits), unit: p + unit }
      }
    }
    if (a < 1e-15) return { value: sci(v, digits), unit }
  }
  if (unit === 'm' && Math.abs(v) >= 1) return { value: fmtNum(v, digits), unit }
  return { value: sci(v, digits), unit }
}

export const formatInline = (v: number, unit = '', digits = 3) => {
  const f = formatSI(v, unit, digits)
  return f.unit ? `${f.value} ${f.unit}` : f.value
}

export function relErr(sim: number, th: number): number | null {
  if (!Number.isFinite(sim) || !Number.isFinite(th)) return null
  const scale = Math.max(Math.abs(th), Math.abs(sim))
  if (scale < 1e-300) return 0
  if (Math.abs(th) < 1e-12 * scale || Math.abs(th) === 0) return Math.abs(sim) < 1e-9 * Math.max(1, scale) ? 0 : null
  return Math.abs(sim - th) / Math.abs(th)
}
