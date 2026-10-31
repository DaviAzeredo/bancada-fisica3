import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Section({ title, aside, children, id }: { title: string; aside?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section className="border-t border-line-soft px-5 py-4" aria-labelledby={id}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id={id} className="text-[12px] font-semibold tracking-[0.06em] text-text-3 uppercase">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

type Variant = 'primary' | 'ghost' | 'quiet'

export function Button({ variant = 'ghost', className = '', children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    'inline-flex items-center justify-center gap-2 h-8 px-3 rounded-[var(--radius-ctl)] text-[13px] font-medium transition-[background,color,border-color] duration-150 ease-[var(--ease-out-expo)] disabled:opacity-40 disabled:pointer-events-none select-none'
  const v =
    variant === 'primary'
      ? 'bg-accent text-accent-ink hover:bg-[oklch(0.87_0.12_160)]'
      : variant === 'quiet'
        ? 'text-text-2 hover:text-text hover:bg-surface-2'
        : 'border border-line text-text-2 hover:text-text hover:border-text-3 bg-surface'
  return (
    <button type="button" className={`${base} ${v} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function IconButton({ label, children, className = '', active, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-ctl)] text-text-2 transition-colors duration-150 hover:bg-surface-3 hover:text-text ${active ? 'bg-surface-3 text-text' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

/** Ícones de traço único, 16 px, desenhados para a interface. */
export const Icon = {
  play: (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M5 3.5v9l7-4.5z" fill="currentColor" /></svg>
  ),
  pause: (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M5 3.5h2v9H5zM9 3.5h2v9H9z" fill="currentColor" /></svg>
  ),
  reset: (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3.5 8a4.5 4.5 0 1 0 1.4-3.3" /><path d="M3.5 2.5v2.6h2.6" /></svg>
  ),
  prev: (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3.5 5.5 8l4.5 4.5" /></svg>
  ),
  next: (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3.5 10.5 8 6 12.5" /></svg>
  ),
  close: (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
  ),
  doc: (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M4 1.8h5.2L12 4.6v9.6H4z" /><path d="M9 1.8v3h3" /><path d="M6 8h4M6 10.5h4" strokeLinecap="round" /></svg>
  ),
  upload: (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 10.5V2.5M5 5.5l3-3 3 3" /><path d="M2.5 10v3.5h11V10" /></svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
  ),
  menu: (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" /></svg>
  ),
  download: (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2.5v8M5 7.5l3 3 3-3" /><path d="M2.5 11v2.5h11V11" /></svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5 6.5 12 13 4.5" /></svg>
  ),
}
