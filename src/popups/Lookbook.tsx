import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { LOOKS } from './looks'
import './popup.css'
import './lookbook.css'

/** How wide the looks are together, in heights: the card sizes itself so they all fit on the rail. */
const RAIL_RATIO = LOOKS.reduce((sum, look) => sum + look.w / look.h, 0)

/** A wooden hanger with a wire hook, hooked over the rail. */
function Hanger() {
  return (
    <svg className="hanger" viewBox="0 0 200 60" aria-hidden>
      <path className="hanger-hook" d="M100 24 V17 C100 11 107 9.5 107 4.5 C107 -0.5 98 -1.5 95.5 3.5" />
      <rect className="hanger-wood" x="94.5" y="20" width="11" height="9" rx="2.5" />
      <path
        className="hanger-wood"
        d="M100 26 C72 29.5 34 39.5 11 46.5 C3.5 48.8 4.5 56 12 54.5 C40 48.5 72 40.5 100 37.5 C128 40.5 160 48.5 188 54.5 C195.5 56 196.5 48.8 189 46.5 C166 39.5 128 29.5 100 26 Z"
      />
      <path className="hanger-shine" d="M98 29.8 C72 33.2 38 42 15 49 M102 29.8 C128 33.2 162 42 185 49" />
    </svg>
  )
}

/**
 * What Fia has made to wear, opened from the sewing machine: her looks on wooden hangers
 * along a clothes rail, each named underneath. Closes with the button, Esc, or a click on
 * the desk.
 */
export function Lookbook({ onClose }: { onClose: () => void }) {
  const title = useId()
  const close = useRef<HTMLButtonElement>(null)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    close.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLeaving(true)
      // Close is the only stop inside, so focus stays on it
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
        className="lookbook"
        style={{ '--ratios': RAIL_RATIO, '--looks': LOOKS.length } as CSSProperties}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title}
        onAnimationEnd={(e) => leaving && e.target === e.currentTarget && onClose()}
      >
        <header className="lookbook-head">
          <h2 id={title} className="lookbook-title">
            <img src="/art/label-fashion.svg" alt="Fashion" draggable={false} />
          </h2>
          <button ref={close} type="button" className="lookbook-btn" onClick={() => setLeaving(true)}>
            Close
          </button>
        </header>

        <div className="rail">
          {LOOKS.map((look, i) => (
            <figure key={look.id} className="look" style={{ '--ratio': look.w / look.h } as CSSProperties}>
              <Hanger />
              <span className="look-frame">
                <img src={`/art/fashion/${look.id}.webp`} alt={look.alt} draggable={false} />
              </span>
              <figcaption className="look-caption">
                <span className="look-no">Look {String(i + 1).padStart(2, '0')}</span>
                <span className="look-name">{look.title}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  )
}
