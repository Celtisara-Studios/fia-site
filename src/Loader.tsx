import { useEffect, useRef, useState } from 'react'
import { ITEMS } from './scene/items'
import { LAMP_PARTS } from './scene/lamp'
import './loader.css'

const FILL_MS = 1100 // the bar never rushes, even on a fast connection
const HOLD_MS = 150 // a beat with the bar full before the desk appears
const MAX_MS = 8000 // never hold the site back for one slow file

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

function decode(src: string) {
  const img = new Image()
  img.src = src
  return img.decode().catch(() => undefined)
}

/**
 * The little husky from the desk, Fia's signature and a thin bar filling as the fonts
 * and art load, on the desk's paper. When everything's in, it fades and the desk is there.
 */
export function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const srcs = [
      ...new Set([
        // what shows at rest; the hover colours (poster, polaroids, prints) load in behind
        ...ITEMS.flatMap((i) => [i.src, i.labelSrc].filter((s): s is string => !!s)),
        ...ITEMS.flatMap((i) => i.prints?.map((p) => p.src) ?? []),
        ...LAMP_PARTS,
        '/art/signature.svg', // inside the notebook's cover, and at the end of each poem
      ]),
    ]
    const jobs = [
      document.fonts.load('400 100px "Instrument Serif"'),
      document.fonts.load('italic 400 30px "Instrument Serif"'), // the welcome under her name
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
      // The bar follows whichever is behind: its own pace or the loading.
      const pace = reduce ? 1 : easeInOut(Math.min(1, (now - start) / FILL_MS))
      const target = Math.min(pace, loaded / jobs.length)
      shown = reduce ? target : shown + (target - shown) * 0.2
      if (target === 1 && 1 - shown < 0.002) shown = 1
      el.style.setProperty('--p', shown.toFixed(4))
      el.setAttribute('aria-valuenow', String(Math.round(shown * 100)))
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
      aria-label="Loading Fia’s desk"
      aria-valuemin={0}
      aria-valuemax={100}
      onTransitionEnd={(e) => leaving && e.target === e.currentTarget && onDone()}
    >
      <div className="loader-card" aria-hidden>
        <img className="loader-pup" src="/art/puppy.svg" alt="" draggable={false} />
        <img className="loader-sign" src="/art/signature.svg" alt="" draggable={false} />
        <span className="loader-bar" />
      </div>
    </div>
  )
}
