// Soma o JS que a página inicial baixa antes de qualquer clique e reprova o build
// acima do orçamento: uma prova, o zod ou o KaTeX presos à entrada pesariam aqui.
// Roda depois do vite build, a partir de fisica3/.
import { readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

const ORCAMENTO_KB = 120

const html = readFileSync('dist/index.html', 'utf8')
if (!html.includes('Content-Security-Policy')) {
  console.error('dist/index.html saiu sem a política de segurança.')
  process.exit(1)
}
const arquivos = [...html.matchAll(/(?:src|href)="\.\/(assets\/[^"]+\.js)"/g)].map((m) => m[1])
const kb = arquivos.reduce((soma, a) => soma + gzipSync(readFileSync(`dist/${a}`)).length / 1024, 0)

console.log(`JS da página inicial: ${kb.toFixed(1)} kB gz em ${arquivos.length} arquivos (orçamento: ${ORCAMENTO_KB} kB)`)
if (kb > ORCAMENTO_KB) {
  console.error('Acima do orçamento: veja o que entrou na entrada em dist/index.html.')
  process.exit(1)
}
