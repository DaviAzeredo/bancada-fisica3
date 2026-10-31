import { compileScenario } from './compile'
import { evalNum } from './expr'
import { type Prova, Prova as ProvaSchema } from './schema'

/** Valida no schema e compila cada questão com os valores padrão; devolve a prova e os erros. */
export function checkProva(raw: unknown): { prova?: Prova; errors: string[] } {
  const parsed = ProvaSchema.safeParse(raw)
  if (!parsed.success)
    return { errors: parsed.error.issues.slice(0, 40).map((i) => `${i.path.join('.') || '(raiz)'}: ${i.message}`) }
  const prova = parsed.data
  const errors: string[] = []
  const ids = new Set<string>()
  for (const q of prova.questoes) {
    if (ids.has(q.id)) errors.push(`questoes: id repetido "${q.id}"`)
    ids.add(q.id)
    const params = Object.fromEntries(q.parametros.map((p) => [p.id, p.valor]))
    for (const set of [params, ...q.passos.map((p) => ({ ...params, ...p.parametros }))]) {
      const r = compileScenario(q, { params: set, t: 0, overrides: {} })
      errors.push(...r.errors.map((e) => `questão ${q.numero}: ${e}`))
      for (const m of q.medidas) {
        try {
          if (m.ativo !== undefined && !evalNum(m.ativo, r.env)) continue
          evalNum(m.expr, r.env)
          if (m.teoria !== undefined) evalNum(m.teoria, r.env)
        } catch (e) {
          errors.push(`questão ${q.numero}, medida "${m.rotulo}": ${(e as Error).message}`)
        }
      }
    }
    if (q.alternativas && q.alternativas.filter((a) => a.correta).length !== 1)
      errors.push(`questão ${q.numero}: as alternativas precisam ter exatamente uma correta`)
  }
  return { prova, errors: [...new Set(errors)].slice(0, 40) }
}

