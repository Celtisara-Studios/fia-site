import type { ReactNode } from 'react'

/**
 * A soft yellow sticky note with a lifted corner, drawn like the desk objects
 * (charcoal outline). The text is a handwriting font until Fia writes her own.
 */
export function StickyNote({ children }: { children: ReactNode }) {
  return (
    <span className="sticky-note" aria-hidden>
      <svg viewBox="0 0 100 100">
        <path className="note-paper" d="M3 3 H97 V77 L77 97 H3 Z" />
        <path className="note-fold" d="M97 77 L77 97 L81 81 Z" />
      </svg>
      <span className="note-text">{children}</span>
    </span>
  )
}
