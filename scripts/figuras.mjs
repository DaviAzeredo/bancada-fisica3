// Lista as figuras de uma prova curada em JSON: um recorte por arquivo,
// "<questao>.webp" e, quando o enunciado continua em outra coluna, "<questao>-2.webp".
// Uso: node scripts/figuras.mjs src/content/provas/<prova>.ts
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const mod = await import(pathToFileURL(resolve(process.argv[2])).href)
const prova = Object.values(mod)[0]
const figuras = []
for (const q of prova.questoes) {
  if (!q.figura) continue
  const list = Array.isArray(q.figura) ? q.figura : [q.figura]
  list.forEach((f, i) => figuras.push({ arquivo: i ? `${q.id}-${i + 1}` : q.id, ...f }))
}
process.stdout.write(JSON.stringify({ prova: prova.id, figuras }))
