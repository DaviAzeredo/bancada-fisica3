import type { ReactNode } from 'react'

/** Rola até uma seção da página inicial. */
export function irParaSecao(secao: string) {
  document.getElementById(`home-${secao}`)?.scrollIntoView({ block: 'start' })
}

/**
 * Link para o hash atual não dispara hashchange, então o clique rola. Só nesse caso:
 * rolar antes de navegar faria o navegador guardar essa posição para o botão Voltar.
 */
export const repetirSecao = (secao: string) => () => {
  if (window.location.hash === `#/${secao}`) irParaSecao(secao)
}

export function Brand() {
  return (
    <a href="#/" className="flex items-center gap-2.5 rounded-[6px] pr-2 text-text" aria-label="Bancada · Física III, início">
      <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="7" fill="var(--color-surface-3)" />
        <path d="M11 11.5c3-4 7-4 10 0M11 20.5c3 4 7 4 10 0" stroke="var(--color-field-e)" strokeWidth="1.6" fill="none" />
        <circle cx="11" cy="16" r="3.6" fill="var(--color-pos)" />
        <circle cx="21" cy="16" r="3.6" fill="var(--color-neg)" />
      </svg>
      <span className="text-[14px] font-semibold tracking-[-0.01em]">
        Bancada <span className="hidden font-normal text-text-3 sm:inline">· Física III</span>
      </span>
    </a>
  )
}

export function TopBar({ route, children }: { route: string; children?: ReactNode }) {
  const link = (href: string, label: string, active: boolean, short?: string) => (
    <a
      href={href}
      onClick={repetirSecao(href.slice(2))}
      aria-current={active ? 'page' : undefined}
      className={`relative inline-flex h-[52px] items-center px-1 text-[13px] transition-colors duration-150 ${
        active ? 'text-text after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-accent' : 'text-text-3 hover:text-text-2'
      }`}
    >
      {short ? (
        <>
          <span className="sm:hidden">{short}</span>
          <span className="hidden sm:inline">{label}</span>
        </>
      ) : (
        label
      )}
    </a>
  )
  return (
    <header className="flex h-[52px] shrink-0 items-center gap-3 border-b border-line-soft bg-bg px-3 sm:gap-6 sm:px-4">
      {children}
      <Brand />
      <nav className="ml-auto flex items-center gap-4 sm:gap-5" aria-label="Principal">
        {link('#/treino', 'Treino P3', route === 'treino', 'P3')}
        {link('#/provas', 'Provas', route === 'prova' || route === 'provas')}
        {link('#/labs', 'Laboratórios', route === 'lab' || route === 'labs', 'Labs')}
      </nav>
    </header>
  )
}
