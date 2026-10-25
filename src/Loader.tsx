import { useEffect, useRef, useState } from 'react'
import { ITEMS } from './scene/items'
import { LAMP_PARTS } from './scene/lamp'
import './scene/scene.css'
import './loader.css'

const DRAW_MS = 1100 // the pencil never rushes the line, even on a fast connection
const HOLD_MS = 150 // a beat with the rail finished before the desk appears
const MAX_MS = 8000 // never hold the site back for one slow file

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

function decode(src: string) {
  const img = new Image()
  img.src = src
  return img.decode().catch(() => undefined)
}

/**
 * The empty desk, with Fia's pencil drawing the crosshatched rail in as the
 * fonts and art load. Its lines sit exactly where the desk's do, so when it
 * fades the room stays put and everything else is simply there.
 */
export function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const srcs = [
      ...new Set([
        ...ITEMS.flatMap((i) => [i.src, i.colorSrc, i.hoverSrc, i.labelSrc].filter((s): s is string => !!s)),
        ...ITEMS.flatMap((i) => i.prints?.flatMap((p) => [p.src, p.colorSrc]) ?? []),
        ...LAMP_PARTS,
        '/art/signature.svg', // under her name on the wall
      ]),
    ]
    const jobs = [
      document.fonts.load('400 100px "Instrument Serif"'),
      document.fonts.load('500 11px "Inter Tight"'),
      document.fonts.load('600 18px "Caveat"'),
      ...srcs.map(decode),
    ]
    let loaded = 0
    for (const job of jobs) Promise.resolve(job).catch(() => undefined).then(() => loaded++)
    const giveUp = setTimeout(() => (loaded = jobs.length), MAX_MS)

    const start = performance.now()
    let shown = 0
    let raf = 0
    let hold = 0
    const tick = (now: number) => {
      // The pencil follows whichever is behind: the drawing pace or the loading.
      const pace = reduce ? 1 : easeInOut(Math.min(1, (now - start) / DRAW_MS))
      const target = Math.min(pace, loaded / jobs.length)
      shown = reduce ? target : shown + (target - shown) * 0.2
      if (target === 1 && 1 - shown < 0.002) shown = 1
      el.style.setProperty('--p', shown.toFixed(4))
      const pct = Math.round(shown * 100)
      el.setAttribute('aria-valuenow', String(pct))
      if (count.current) count.current.textContent = `${pct}%`
      if (shown === 1) {
        hold = window.setTimeout(() => setLeaving(true), HOLD_MS)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(giveUp)
      clearTimeout(hold)
    }
  }, [])

  return (
    <div
      ref={root}
      className={leaving ? 'loader is-leaving' : 'loader'}
      role="progressbar"
      aria-label="Loading"
      aria-valuemin={0}
      aria-valuemax={100}
      onTransitionEnd={(e) => leaving && e.target === e.currentTarget && onDone()}
    >
      {/* the room: the same lines as the desk, in the same places */}
      <svg className="scene-lines" viewBox="0 0 2000 1250" preserveAspectRatio="none" aria-hidden>
        <line className="scene-line" x1="0" y1="1086.5" x2="2000" y2="1086" />
        <rect className="scene-front" x="0" y="1157" width="2000" height="93" />
      </svg>

      {/* the rail, revealed up to the pencil's tip */}
      <div className="loader-drawn" aria-hidden>
        <div className="scene-rail" />
        <svg className="scene-lines" viewBox="0 0 2000 1250" preserveAspectRatio="none">
          <line className="scene-line" x1="0" y1="481" x2="2000" y2="487.5" />
          <line className="scene-line" x1="0" y1="506.5" x2="2000" y2="515.5" />
        </svg>
      </div>

      <img className="loader-pencil" src="/art/pencil.svg" alt="" draggable={false} />

      <p className="loader-caption" aria-hidden>
        <span>Drawing the desk</span>
        <span ref={count} className="loader-count">
          0%
        </span>
      </p>
    </div>
  )
}
