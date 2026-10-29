import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import type { ChapterProps } from '.'
import { AUTHOR, POEMS, type Line, type Poem } from './poem'
import '../popups/popup.css'
import './poem-book.css'

/** One page inside the book: the inside of the cover, the contents, or a poem's title page or one of its pages. */
type Face = 'flyleaf' | 'contents' | { poem: number; page: 'title' | number }
type Side = 'left' | 'right'

/**
 * Every page of the book in order, two to a spread: the inside of the cover facing the contents,
 * then each poem's title page facing its first page, and on two by two. A page's number is its
 * place here.
 */
const PAGES: Face[] = [
  'flyleaf',
  'contents',
  ...POEMS.flatMap((poem, p) => [{ poem: p, page: 'title' as const }, ...poem.pages.map((_, i) => ({ poem: p, page: i }))]),
]
const SPREADS = PAGES.length / 2

/** The page each poem starts on (its title page), as the contents lists it. */
const STARTS = POEMS.map((_, p) => PAGES.findIndex((face) => typeof face === 'object' && face.poem === p))

/** The poem open at a spread, if any. */
const poemAt = (spread: number) => {
  const face = PAGES[spread * 2]
  return typeof face === 'object' ? face.poem : null
}

const text = (line: Line) => (typeof line === 'string' ? line : line.said)

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

/** Inside the front cover: a marigold, and her name signed under it. */
function Flyleaf() {
  return (
    <div className="flyleaf">
      <Marigold className="flyleaf-flower" />
      <img src="/art/signature.svg" alt="" draggable={false} />
    </div>
  )
}

/** Each poem on the contents is a button that turns the book to it. */
function Contents({ onOpen }: { onOpen?: (poem: number) => void }) {
  return (
    <div className="page-text">
      <p className="front-kicker">Fia Bondy · Writing</p>
      <p className="front-title">Contents</p>
      <ol className="toc">
        {POEMS.map((poem, p) => (
          <li key={poem.id}>
            <button
              type="button"
              className="toc-entry"
              data-poem={p}
              aria-label={`${poem.title}, page ${STARTS[p]}`}
              onClick={() => onOpen?.(p)}
            >
              <span className="toc-line">
                <span className="toc-title">{poem.title}</span>
                <span className="toc-dots" />
                <span className="toc-no">{STARTS[p]}</span>
              </span>
              <span className="toc-first">{text(poem.pages[0][0][0])}</span>
              <span className="toc-go">
                <svg viewBox="0 0 20 20" aria-hidden>
                  <path d="M7.5 4 L13.5 10 L7.5 16" />
                </svg>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

function TitlePage({ poem }: { poem: Poem }) {
  return (
    <div className="page-text">
      <p className="front-kicker">Fia Bondy · Writing</p>
      <p className="front-title">{poem.title}</p>
      {poem.say && <p className="front-say">{poem.say}</p>}
      {poem.meaning && <p className="front-meaning">{poem.meaning}</p>}
      {poem.intro && (
        <>
          <Marigold className="front-flower" />
          <p className="front-intro">{poem.intro}</p>
        </>
      )}
      {poem.epigraph && (
        <blockquote className="front-epigraph">
          <p>{poem.epigraph.quote}</p>
          <p className="front-source">{poem.epigraph.source}</p>
        </blockquote>
      )}
    </div>
  )
}

function PoemPage({ poem, index }: { poem: Poem; index: number }) {
  const last = index === poem.pages.length - 1
  return (
    <div className="page-text">
      {poem.pages[index].map((stanza, i) => (
        <p key={i} className="stanza">
          {stanza.map((line, j) => (
            <Ln key={j} line={line} />
          ))}
        </p>
      ))}
      {last && <img className="page-sign" src="/art/signature.svg" alt={AUTHOR} draggable={false} />}
    </div>
  )
}

/** The outside of the front cover, seen for a moment before the book opens. */
function Cover() {
  return (
    <div className="cover">
      <Marigold className="cover-flower" />
      <p className="cover-title">Writing</p>
      <p className="cover-name">{AUTHOR}</p>
    </div>
  )
}

/** A page by its number. The contents turns the book from its entries, not from a click anywhere on it. */
function Page({ at, side, onTurn, onOpen }: { at: number; side: Side; onTurn?: () => void; onOpen?: (poem: number) => void }) {
  const face = PAGES[at]
  const turns = face === 'contents' ? undefined : onTurn
  return (
    <div
      className={turns ? `page is-${side} can-turn` : `page is-${side}`}
      onClick={turns}
      aria-hidden={face === 'contents' ? undefined : true}
    >
      {face === 'flyleaf' ? (
        <Flyleaf />
      ) : face === 'contents' ? (
        <Contents onOpen={onOpen} />
      ) : face.page === 'title' ? (
        <TitlePage poem={POEMS[face.poem]} />
      ) : (
        <PoemPage poem={POEMS[face.poem]} index={face.page} />
      )}
      {typeof face === 'object' && face.page !== 'title' && <span className="page-number">{at}</span>}
    </div>
  )
}

/**
 * Fia's poems as her notebook, open over the dimmed desk: marigold covers and ruled pages. It
 * swings open from its cover onto the contents, where a poem's entry turns the book to it. The
 * pages turn with the arrows, the arrow keys or a click on a page, and Contents turns back to
 * the contents. Closes with the button, Esc, or a click on the desk.
 */
export default function PoemBook({ color, onClose }: ChapterProps) {
  const close = useRef<HTMLButtonElement>(null)
  const toContents = useRef<HTMLButtonElement>(null)
  const stage = useRef<HTMLElement>(null)
  const [spread, setSpread] = useState(0)
  /** A page turning: the spread it's turning to, and which way. */
  const [turn, setTurn] = useState<{ to: number; dir: 1 | -1 } | null>(null)
  const [opening, setOpening] = useState(() => !reducedMotion())
  const [leaving, setLeaving] = useState(false)
  /** The poem last open, to come back to its entry on the contents. */
  const reading = useRef(0)

  const turnTo = useCallback(
    (to: number) => {
      if (turn || opening || leaving || to === spread || to < 0 || to >= SPREADS) return
      if (reducedMotion()) setSpread(to)
      else setTurn({ to, dir: to > spread ? 1 : -1 })
    },
    [spread, turn, opening, leaving],
  )

  useEffect(() => close.current?.focus(), [])

  // A turn can take the focused button away with its page: keep focus in the book, on the
  // entry for the poem you were reading when back at the contents, or else on Contents.
  useEffect(() => {
    const poem = poemAt(spread)
    if (poem !== null) reading.current = poem
    if (document.activeElement !== document.body) return
    if (spread === 0) stage.current?.querySelector<HTMLButtonElement>(`.half [data-poem="${reading.current}"]`)?.focus()
    else toContents.current?.focus()
  }, [spread])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLeaving(true)
      else if (e.key === 'ArrowRight') turnTo(spread + 1)
      else if (e.key === 'ArrowLeft') turnTo(spread - 1)
      else if (e.key === 'Tab') {
        // keep focus on the book's own buttons, not the copies on a page that's turning
        const stops = [...(stage.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])].filter(
          (b) => !b.closest('[inert]'),
        )
        const at = stops.indexOf(document.activeElement as HTMLButtonElement)
        e.preventDefault()
        stops[(at + (e.shiftKey ? -1 : 1) + stops.length) % stops.length]?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [turnTo, spread])

  const left = spread * 2
  // Under a page turning forward the next right page shows through; turning back, the previous left.
  const baseLeft = turn?.dir === -1 ? turn.to * 2 : left
  const baseRight = turn?.dir === 1 ? turn.to * 2 + 1 : left + 1

  return (
    <div className={leaving ? 'popup poem-book is-leaving' : 'popup poem-book'} style={{ '--accent': color } as CSSProperties}>
      <div className="popup-scrim" onClick={() => setLeaving(true)} />
      <section
        ref={stage}
        className="poem-stage"
        role="dialog"
        aria-modal="true"
        aria-label={`Writing: poems by ${AUTHOR}`}
        onAnimationEnd={(e) => leaving && e.target === e.currentTarget && onClose()}
      >
        <div className="book-bar">
          {spread > 0 && (
            <button ref={toContents} type="button" className="book-btn" onClick={() => turnTo(0)}>
              Contents
            </button>
          )}
          <button ref={close} type="button" className="book-btn" onClick={() => setLeaving(true)}>
            Close
          </button>
        </div>

        <button type="button" className="book-turn" aria-label="Previous pages" disabled={spread === 0} onClick={() => turnTo(spread - 1)}>
          <svg viewBox="0 0 20 20" aria-hidden>
            <path d="M12.5 4 L6.5 10 L12.5 16" />
          </svg>
        </button>

        <div className={opening ? 'book is-opening' : 'book'}>
          <div className="half is-left">
            <div className="board" />
            <div className="slot">
              <Page at={baseLeft} side="left" onTurn={spread > 0 ? () => turnTo(spread - 1) : undefined} />
            </div>
          </div>
          <div className="half is-right">
            <div className="board" />
            <div className="slot">
              <Page
                at={baseRight}
                side="right"
                onTurn={spread < SPREADS - 1 ? () => turnTo(spread + 1) : undefined}
                onOpen={(p) => turnTo(Math.floor(STARTS[p] / 2))}
              />
            </div>
          </div>

          {turn && (
            <div
              className={turn.dir === 1 ? 'leaf turns-forward' : 'leaf turns-back'}
              inert
              onAnimationEnd={(e) => {
                if (e.target !== e.currentTarget) return
                setSpread(turn.to)
                setTurn(null)
              }}
            >
              <div className="leaf-face">
                <Page at={turn.dir === 1 ? left + 1 : left} side={turn.dir === 1 ? 'right' : 'left'} />
              </div>
              <div className="leaf-face is-back">
                <Page at={turn.dir === 1 ? turn.to * 2 : turn.to * 2 + 1} side={turn.dir === 1 ? 'left' : 'right'} />
              </div>
            </div>
          )}

          {opening && (
            <div className="leaf opens" inert onAnimationEnd={(e) => e.target === e.currentTarget && setOpening(false)}>
              <div className="leaf-face is-left">
                <div className="board" />
                <div className="slot">
                  <Page at={0} side="left" />
                </div>
              </div>
              <div className="leaf-face is-back">
                <Cover />
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="book-turn"
          aria-label="Next pages"
          disabled={spread === SPREADS - 1}
          onClick={() => turnTo(spread + 1)}
        >
          <svg viewBox="0 0 20 20" aria-hidden>
            <path d="M7.5 4 L13.5 10 L7.5 16" />
          </svg>
        </button>

        {/* every poem in full, for screen readers */}
        <div className="sr-only">
          {POEMS.map((poem) => (
            <section key={poem.id}>
              <h2>{poem.title}</h2>
              {poem.say && <p>{poem.say}</p>}
              {poem.meaning && <p>{poem.meaning}</p>}
              {poem.intro && <p>{poem.intro}</p>}
              {poem.epigraph && (
                <p>
                  {poem.epigraph.quote} {poem.epigraph.source}
                </p>
              )}
              {poem.pages.flat().map((stanza, i) => (
                <p key={i}>
                  {stanza.map((line, j) => (
                    <span key={j}>
                      {text(line)}
                      <br />
                    </span>
                  ))}
                </p>
              ))}
              <p>{AUTHOR}</p>
            </section>
          ))}
        </div>
      </section>
    </div>
  )
}
