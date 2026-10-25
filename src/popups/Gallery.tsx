import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { ART, ROWS } from './art'
import './popup.css'
import './gallery.css'

const bigSrc = (i: number) => `/art/gallery/${ART[i].id}.webp`

/**
 * Fia's visual art, opened from the cutting mat: all of it hung together on a paper card,
 * and any piece held up close with arrows (and the arrow keys) round the rest. Esc steps
 * back from a piece to all of them, then closes; so do Close and a click on the desk.
 */
export function Gallery({ onClose }: { onClose: () => void }) {
  const title = useId()
  const close = useRef<HTMLButtonElement>(null)
  const stage = useRef<HTMLElement>(null)
  const tiles = useRef<(HTMLButtonElement | null)[]>([])
  /** The piece held up close, or null for all of them. */
  const [focus, setFocus] = useState<number | null>(null)
  /** Which way the last move went, so the next piece comes in from that side. */
  const [dir, setDir] = useState<1 | -1 | 0>(0)
  const [leaving, setLeaving] = useState(false)
  /** The piece to put keyboard focus back on when stepping back to all of them. */
  const opened = useRef<number | null>(null)

  /** The latest piece asked for, so a slow image can't land after a later click. */
  const wanted = useRef(-1)

  /** Hold up piece `i` once its big image is decoded, so it never flashes in empty. */
  const show = useCallback((i: number, step: 1 | -1 | 0) => {
    wanted.current = i
    const img = new Image()
    img.src = bigSrc(i)
    img
      .decode()
      .catch(() => undefined)
      .then(() => {
        if (wanted.current !== i) return
        setDir(step)
        setFocus(i)
      })
  }, [])

  const go = useCallback(
    (step: 1 | -1) => {
      if (focus !== null) show((focus + step + ART.length) % ART.length, step)
    },
    [focus, show],
  )

  const open = (i: number) => {
    opened.current = i
    show(i, 0)
    // the other big ones too, now someone's looking
    for (let j = 0; j < ART.length; j++) new Image().src = bigSrc(j)
  }

  useEffect(() => close.current?.focus(), [])

  // Back on the wall: focus the piece that was open.
  useEffect(() => {
    if (focus === null && opened.current !== null) tiles.current[opened.current]?.focus()
  }, [focus])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        wanted.current = -1
        if (focus === null) setLeaving(true)
        else setFocus(null)
      } else if (focus !== null && e.key === 'ArrowRight') go(1)
      else if (focus !== null && e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Tab') {
        // keep focus inside the gallery
        const stops = [...(stage.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
        const at = stops.indexOf(document.activeElement as HTMLButtonElement)
        e.preventDefault()
        stops[(at + (e.shiftKey ? -1 : 1) + stops.length) % stops.length]?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focus, go])

  const piece = focus === null ? null : ART[focus]

  return (
    <div className={leaving ? 'popup is-leaving' : 'popup'}>
      <div className="popup-scrim" onClick={() => setLeaving(true)} />
      <section
        ref={stage}
        className="gallery"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title}
        onAnimationEnd={(e) => leaving && e.target === e.currentTarget && onClose()}
      >
        <header className="gallery-head">
          <h2 id={title} className="gallery-title">
            <img src="/art/label-visual-art.svg" alt="Visual Art" draggable={false} />
          </h2>
          {piece && (
            <button
              type="button"
              className="gallery-btn"
              onClick={() => {
                wanted.current = -1
                setFocus(null)
              }}
            >
              All pieces
            </button>
          )}
          <button ref={close} type="button" className="gallery-btn" onClick={() => setLeaving(true)}>
            Close
          </button>
        </header>

        {piece ? (
          <div className="gallery-focus">
            <button type="button" className="gallery-turn" aria-label="Previous piece" onClick={() => go(-1)}>
              <svg viewBox="0 0 20 20" aria-hidden>
                <path d="M12.5 4 L6.5 10 L12.5 16" />
              </svg>
            </button>
            <figure key={piece.id} className={dir === 1 ? 'gallery-big from-right' : dir === -1 ? 'gallery-big from-left' : 'gallery-big'}>
              <img src={bigSrc(focus!)} alt={piece.alt} width={piece.w} height={piece.h} draggable={false} />
              <figcaption>
                <span className="gallery-name">{piece.title}</span>
                <span className="gallery-count" aria-live="polite">
                  {focus! + 1} / {ART.length}
                </span>
              </figcaption>
            </figure>
            <button type="button" className="gallery-turn" aria-label="Next piece" onClick={() => go(1)}>
              <svg viewBox="0 0 20 20" aria-hidden>
                <path d="M7.5 4 L13.5 10 L7.5 16" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="gallery-wall">
            {ROWS.map((row, r) => (
              <div key={r} className="gallery-row">
                {row.map((i) => {
                  const p = ART[i]
                  return (
                    <button
                      key={p.id}
                      ref={(el) => {
                        tiles.current[i] = el
                      }}
                      type="button"
                      className="gallery-piece"
                      style={{ '--ratio': p.w / p.h } as CSSProperties}
                      aria-label={`Look closer at ${p.title}`}
                      onClick={() => open(i)}
                    >
                      <span className="gallery-frame">
                        <img src={`/art/gallery/${p.id}-thumb.webp`} alt={p.alt} draggable={false} />
                      </span>
                      <span className="gallery-name">{p.title}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
