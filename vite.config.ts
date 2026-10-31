/// <reference types="vitest/config" />
import { type Plugin, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * O GitHub Pages não deixa definir cabeçalhos, então a política vai numa meta, e por
 * isso `frame-ancestors` não entra. Só no build: em desenvolvimento, o Vite injeta
 * script inline. `style-src` precisa de 'unsafe-inline' pelos estilos do KaTeX.
 */
const CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' data: blob:",
  "worker-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ')

const politicaDeSeguranca = (): Plugin => ({
  name: 'politica-de-seguranca',
  apply: 'build',
  transformIndexHtml: () => [
    { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP }, injectTo: 'head-prepend' },
    { tag: 'meta', attrs: { name: 'referrer', content: 'no-referrer' }, injectTo: 'head-prepend' },
  ],
})

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), politicaDeSeguranca()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'react'
          if (id.includes('node_modules/katex')) return 'katex'
          return undefined
        },
      },
    },
  },
  // cenas com muitas fontes levam segundos sob carga: o limite padrão dava falso negativo
  test: { environment: 'node', include: ['src/**/*.test.ts'], testTimeout: 20000 },
})
