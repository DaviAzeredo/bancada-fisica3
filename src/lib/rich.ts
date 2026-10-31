import katex from 'katex'
import 'katex/dist/katex.min.css'

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function inlineMd(s: string): string {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>')
}

function tex(src: string, display: boolean) {
  return katex.renderToString(src, { displayMode: display, throwOnError: false, trust: false, strict: 'ignore', output: 'html' })
}

/** A matemática sai antes do Markdown: um negrito pode conter fórmula. */
function bloco(p: string) {
  const formulas: string[] = []
  let soDestaque = true
  const texto = p.replace(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g, (_, destaque?: string, linha?: string) => {
    if (linha !== undefined) soDestaque = false
    formulas.push(destaque !== undefined ? tex(destaque.trim(), true) : tex(linha!, false))
    return `${formulas.length - 1}`
  })
  if (texto.replace(/\d+/g, '').trim()) soDestaque = false
  const html = inlineMd(texto)
    .replace(/\n/g, ' ')
    .replace(/(\d+)/g, (_, n: string) => formulas[Number(n)])
  return { html, soDestaque }
}

/** Parágrafo, ou texto seguido de uma lista com linhas em "- ". */
function paragrafo(p: string) {
  const linhas = p.split('\n')
  const inicio = linhas.findIndex((l) => /^\s*- /.test(l))
  if (inicio < 0) {
    const { html, soDestaque } = bloco(p)
    return soDestaque ? `<div>${html}</div>` : `<p>${html}</p>`
  }
  const itens: string[] = []
  for (const l of linhas.slice(inicio)) {
    if (/^\s*- /.test(l)) itens.push(l.replace(/^\s*- /, ''))
    else itens[itens.length - 1] += `\n${l}`
  }
  const antes = linhas.slice(0, inicio).join('\n')
  return `${antes.trim() ? `<p>${bloco(antes).html}</p>` : ''}<ul>${itens.map((i) => `<li>${bloco(i).html}</li>`).join('')}</ul>`
}

/**
 * Markdown leve + LaTeX ($…$, $$…$$). O texto pode vir de um cenário gerado
 * por IA, então tudo que não é matemática passa por escape; o KaTeX roda com
 * trust: false (sem \href, \url, \includegraphics).
 */
export function renderRich(src: string): string {
  const cache = renderCache.get(src)
  if (cache) return cache
  const html = src.trim().split(/\n\s*\n/).map(paragrafo).join('')
  renderCache.set(src, html)
  return html
}

const renderCache = new Map<string, string>()

export const texInline = (src: string) => tex(src, false)
