import { memo } from 'react'
import { renderRich, texInline } from '../lib/rich'

export const Rich = memo(function Rich({ text, className = '' }: { text: string; className?: string }) {
  return <div className={`rich ${className}`} dangerouslySetInnerHTML={{ __html: renderRich(text) }} />
})

export const Tex = memo(function Tex({ src, className = '' }: { src: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: texInline(src) }} />
})
