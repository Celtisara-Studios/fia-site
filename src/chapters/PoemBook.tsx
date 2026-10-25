import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import type { ChapterProps } from '.'
import { POEM, type Line } from './poem'
import '../popups/popup.css'
import './poem-book.css'

/** One side of a leaf: the book's cover, the title page, or a page of the poem (by index). */
type Face = 'cover' | 'front' | number
type Side = 'left' | 'right'

/** The book open at each spread: the title page facing the poem's first page, then two by two. */
const SPREADS: [Face, Face][] = [
  ['front', 0],
  [1, 2],
  [3, 4],
]

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** A marigold, like the ones on the wall calendar. */
function Marigold({ className }: { className: string }) {
  return (
    <svg className={`marigold ${className}`} viewBox="-50 -50 100 100" aria-hidden>
      {Array.from({ length: 14 }, (_, i) => (
        <ellipse key={i} cx="0" cy="-29" rx="9" ry="18" transform={`rotate(${(i * 360) / 14})`} />
      ))}
      <circle className="marigold-heart" r="16" />
    </svg>
  )
}

function Ln({ line }: { line: Line }) {
  if (typeof line === 'string') return <span className="ln">{line}</span>
  return (
    <span className="ln is-said">
      <span>{line.said}</span>
    </span>
  )
}

function TitlePage() {
  return (
    <div className="page-text">
      <p className="front-kicker">Fia Bondy · Writing</p>
      <p className="front-title">{POEM.title}</p>
      <p className="front-say">{POEM.say}</p>
      <p className="front-meaning">{POEM.meaning}</p>
      <Marigold className="front-flower" />
      <p className="front-intro">{POEM.intro}</p>
    </div>
  )
}

function PoemPage({ index }: { index: number }) {
  const last = index === POEM.pages.length - 1
  return (
    <div className="page-text">
      {POEM.pages[index].map((stanza, i) => (
        <p key={i} className="stanza">
          {stanza.map((line, j) => (
            <Ln key={j} line={line} />
          ))}
        </p>
      ))}
      {last && <img className="page-sign" src="/art/signature.svg" alt={POEM.signature} draggable={false} />}
    </div>
  )
}

/** The outside of the front cover, seen for a moment before the book opens. */
function Cover() {
  return (
    <div className="cover">
      <Marigold className="cover-flower" />
      <p className="cover-title">{POEM.title}</p>
      <p className="cover-name">Fia Bondy</p>
    </div>
  )
}

function Page({ face, side, onTurn }: { face: Face; side: Side; onTurn?: () => void }) {
  if (face === 'cover') return <Cover />
  return (
    <div className={onTurn ? `page is-${side} can-turn` : `page is-${side}`} onClick={onTurn}>
      {face === 'front' ? <TitlePage /> : <PoemPage index={face} />}
      {typeof face === 'number' && <span className="page-number">{face + 1}</span>}
    </div>
  )
}

/**
 * The poem as Fia's notebook, open over the dimmed desk: marigold covers and ruled pages. It
 * swings open from its cover, and the pages turn with the arrows, the arrow keys or a click
 * on a page. Closes with the button, Esc, or a click on the desk.
 */
export default function PoemBook({ color, onClose }: ChapterProps) {
  const close = useRef<HTMLButtonElement>(null)
  const stage = useRef<HTMLElement>(null)
  const [spread, setSpread] = useState(0)
  /** A page turning: the spread it's turning to, and which way. */
  const [turn, setTurn] = useState<{ to: number; dir: 1 | -1 } | null>(null)
  const [opening, setOpening] = useState(() => !reducedMotion())
  const [leaving, setLeaving] = useState(false)

  const go = useCallback(
    (dir: 1 | -1) => {
      const to = spread + dir
      if (turn || opening || leaving || to < 0 || to >= SPREADS.length) return
      if (reducedMotion()) setSpread(to)
      else setTurn({ to, dir })
    },
    [spread, turn, opening, leaving],
  )

  useEffect(() => close.current?.focus(), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLeaving(true)
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Tab') {
        // keep focus on the book's own buttons
        const stops = [...(stage.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])]
        const at = stops.indexOf(document.activeElement as HTMLButtonElement)
        e.preventDefault()
        stops[(at + (e.shiftKey ? -1 : 1) + stops.length) % stops.length]?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  const [left, right] = SPREADS[spread]
  const next = turn && SPREADS[turn.to]
  // Under a page turning forward the next right page shows through; turning back, the previous left.
  const baseLeft = turn?.dir === -1 ? next![0] : left
  const baseRight = turn?.dir === 1 ? next![1] : right

  return (
    <div className={leaving ? 'popup poem-book is-leaving' : 'popup poem-book'} style={{ '--accent': color } as CSSProperties}>
      <div className="popup-scrim" onClick={() => setLeaving(true)} />
      <section
        ref={stage}
        className="poem-stage"
        role="dialog"
        aria-modal="true"
        aria-label={`${POEM.title}, a poem by ${POEM.signature}`}
        onAnimationEnd={(e) => leaving && e.target === e.currentTarget && onClose()}
      >
        <button ref={close} type="button" className="book-close" onClick={() => setLeaving(true)}>
          Close
        </button>

        <button type="button" className="book-turn" aria-label="Previous pages" disabled={spread === 0} onClick={() => go(-1)}>
          <svg viewBox="0 0 20 20" aria-hidden>
            <path d="M12.5 4 L6.5 10 L12.5 16" />
          </svg>
        </button>

        <div className={opening ? 'book is-opening' : 'book'} aria-hidden>
          <div className="half is-left">
            <div className="board" />
            <div className="slot">
              <Page face={baseLeft} side="left" onTurn={spread > 0 ? () => go(-1) : undefined} />
            </div>
          </div>
          <div className="half is-right">
            <div className="board" />
            <div className="slot">
              <Page face={baseRight} side="right" onTurn={spread < SPREADS.length - 1 ? () => go(1) : undefined} />
            </div>
          </div>

          {turn && (
            <div
              className={turn.dir === 1 ? 'leaf turns-forward' : 'leaf turns-back'}
              onAnimationEnd={(e) => {
                if (e.target !== e.currentTarget) return
                setSpread(turn.to)
                setTurn(null)
              }}
            >
              <div className="leaf-face">
                <Page face={turn.dir === 1 ? right : left} side={turn.dir === 1 ? 'right' : 'left'} />
              </div>
              <div className="leaf-face is-back">
                <Page face={turn.dir === 1 ? next![0] : next![1]} side={turn.dir === 1 ? 'left' : 'right'} />
              </div>
            </div>
          )}

          {opening && (
            <div className="leaf opens" onAnimationEnd={(e) => e.target === e.currentTarget && setOpening(false)}>
              <div className="leaf-face is-left">
                <div className="board" />
                <div className="slot">
                  <Page face="front" side="left" />
                </div>
              </div>
              <div className="leaf-face is-back">
                <Page face="cover" side="right" />
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="book-turn"
          aria-label="Next pages"
          disabled={spread === SPREADS.length - 1}
          onClick={() => go(1)}
        >
          <svg viewBox="0 0 20 20" aria-hidden>
            <path d="M7.5 4 L13.5 10 L7.5 16" />
          </svg>
        </button>

        {/* the whole poem at once, for screen readers */}
        <div className="sr-only">
          <h2>{POEM.title}</h2>
          <p>{POEM.say}</p>
          <p>{POEM.meaning}</p>
          <p>{POEM.intro}</p>
          {POEM.pages.flat().map((stanza, i) => (
            <p key={i}>
              {stanza.map((line, j) => (
                <span key={j}>
                  {typeof line === 'string' ? line : line.said}
                  <br />
                </span>
              ))}
            </p>
          ))}
          <p>{POEM.signature}</p>
        </div>
      </section>
    </div>
  )
}
