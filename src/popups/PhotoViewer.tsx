import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { ITEMS } from '../scene/items'
import './popup.css'
import './photo-viewer.css'

/** The polaroids on the wall, in the order they hang. */
const PHOTOS = ITEMS.filter((item) => item.photo).sort((a, b) => a.x - b.x)

/**
 * A polaroid from the wall, held up close in full colour, with arrows (and the arrow keys)
 * to go round all of them. Closes with the button, Esc, or a click outside.
 */
export function PhotoViewer({ start, onClose }: { start: string; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null)
  const stage = useRef<HTMLElement>(null)
  const [index, setIndex] = useState(() => Math.max(0, PHOTOS.findIndex((p) => p.id === start)))
  /** Which way the last move went, so the next photo comes in from that side. */
  const [dir, setDir] = useState<1 | -1 | 0>(0)
  const [leaving, setLeaving] = useState(false)

  const go = useCallback((step: 1 | -1) => {
    setDir(step)
    setIndex((i) => (i + step + PHOTOS.length) % PHOTOS.length)
  }, [])

  useEffect(() => {
    close.current?.focus()
    // fetch the rest now, so going round is instant
    for (const p of PHOTOS) new Image().src = p.photo!
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLeaving(true)
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Tab') {
        // keep focus on the viewer's own buttons
        const stops = [...(stage.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
        const at = stops.indexOf(document.activeElement as HTMLButtonElement)
        e.preventDefault()
        stops[(at + (e.shiftKey ? -1 : 1) + stops.length) % stops.length]?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  const photo = PHOTOS[index]
  // tilted like it hangs on the wall, only less
  const tilt = `${(photo.rotate ?? 0) * 0.5}deg`

  return (
    <div className={leaving ? 'popup is-leaving' : 'popup'}>
      <div className="popup-scrim" onClick={() => setLeaving(true)} />
      <section
        ref={stage}
        className="photo-stage"
        role="dialog"
        aria-modal="true"
        aria-label="Fia’s photos"
        onAnimationEnd={(e) => leaving && e.target === e.currentTarget && onClose()}
      >
        <button ref={close} type="button" className="photo-close" onClick={() => setLeaving(true)}>
          Close
        </button>

        <button type="button" className="photo-turn" aria-label="Previous photo" onClick={() => go(-1)}>
          <svg viewBox="0 0 20 20" aria-hidden>
            <path d="M12.5 4 L6.5 10 L12.5 16" />
          </svg>
        </button>

        <figure
          key={photo.id}
          className={dir === 1 ? 'photo-card from-right' : dir === -1 ? 'photo-card from-left' : 'photo-card'}
          style={{ '--tilt': tilt } as CSSProperties}
        >
          <img src={photo.photo} alt={photo.alt} draggable={false} />
          <figcaption className="photo-count" aria-live="polite">
            {index + 1} / {PHOTOS.length}
          </figcaption>
        </figure>

        <button type="button" className="photo-turn" aria-label="Next photo" onClick={() => go(1)}>
          <svg viewBox="0 0 20 20" aria-hidden>
            <path d="M7.5 4 L13.5 10 L7.5 16" />
          </svg>
        </button>
      </section>
    </div>
  )
}
