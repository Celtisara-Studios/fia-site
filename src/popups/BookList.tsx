import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { BOOKS } from './books'
import './popup.css'

/**
 * The book stack's reading list: a ruled paper card over the desk, which drops into
 * the lamp's dark behind it. Each book has a coloured spine; the title a highlighter
 * swipe. Closes with the button, Esc, or a click outside.
 */
export function BookList({ onClose }: { onClose: () => void }) {
  const title = useId()
  const close = useRef<HTMLButtonElement>(null)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    close.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLeaving(true)
      // the close button is the only stop inside the card, so focus stays on it
      if (e.key === 'Tab') {
        e.preventDefault()
        close.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className={leaving ? 'popup is-leaving' : 'popup'}>
      <div className="popup-scrim" onClick={() => setLeaving(true)} />
      <section
        className="popup-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title}
        onAnimationEnd={(e) => leaving && e.target === e.currentTarget && onClose()}
      >
        <header className="popup-head">
          <p className="popup-kicker">Fia’s reading list</p>
          <h2 id={title} className="popup-title">
            Books
          </h2>
          <button ref={close} type="button" className="popup-close" onClick={() => setLeaving(true)}>
            Close
          </button>
        </header>
        <ol className="book-list">
          {BOOKS.map((b) => (
            <li key={b.title}>
              <span className="book-spine" style={{ '--spine': b.spine } as CSSProperties} aria-hidden="true" />
              <span className="book-title">{b.title}</span>
              <span className="book-author">{b.author}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
