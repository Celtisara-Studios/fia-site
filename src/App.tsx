import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { CHAPTERS, isChapterId, type ChapterId } from './chapters'
import type { Point } from './fx/ink'
import { hideFlood, inkIn, inkOut } from './fx/transitions'
import { Loader } from './Loader'
import { PhoneNote } from './PhoneNote'
import { BookList } from './popups/BookList'
import type { Item } from './scene/items'
import { Scene } from './scene/Scene'
import { usePhone } from './usePhone'

const chapterFromHash = (): ChapterId | null => {
  const id = window.location.hash.slice(1)
  return isChapterId(id) ? id : null
}

/** The on-screen copy of a chapter's object nearest the middle of the view. */
function findObject(id: ChapterId): HTMLElement | null {
  const mid = window.innerWidth / 2
  let best: HTMLElement | null = null
  let bestD = Infinity
  for (const el of document.querySelectorAll<HTMLElement>(`.item[data-chapter="${id}"]`)) {
    const r = el.getBoundingClientRect()
    const d = Math.abs(r.left + r.width / 2 - mid)
    if (d < bestD) [best, bestD] = [el, d]
  }
  return best
}

const centerOf = (el: Element): Point => {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

export default function App() {
  const [open, setOpen] = useState<ChapterId | null>(chapterFromHash)
  const [loading, setLoading] = useState(true)
  const [books, setBooks] = useState(false)
  const phone = usePhone()
  const openRef = useRef(open)
  const flood = useRef<HTMLDivElement>(null)
  const busy = useRef(false)
  const closeFrom = useRef<Point | undefined>(undefined)

  useLayoutEffect(() => {
    openRef.current = open
    document.documentElement.classList.toggle('is-chapter', open !== null)
  }, [open])

  const runOpen = useCallback(async (id: ChapterId, el: HTMLElement, at: Point, push: boolean) => {
    if (busy.current || openRef.current) return
    busy.current = true
    await inkIn(el.querySelector<HTMLElement>('.item-color') ?? el, flood.current!, at, CHAPTERS[id].color)
    flushSync(() => setOpen(id))
    if (push) window.history.pushState({ chapter: id }, '', `#${id}`)
    window.scrollTo(0, 0)
    hideFlood(flood.current!)
    busy.current = false
  }, [])

  const runClose = useCallback(async (from?: Point) => {
    const id = openRef.current
    if (busy.current || !id) return
    busy.current = true
    const at = from ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    await inkOut(flood.current!, at, CHAPTERS[id].color, () => {
      flushSync(() => setOpen(null))
      window.scrollTo(0, 0)
      return findObject(id)?.querySelector<HTMLElement>('.item-color') ?? null
    })
    findObject(id)?.focus({ preventScroll: true })
    busy.current = false
  }, [])

  const openItem = useCallback(
    (item: Item, el: HTMLElement, at: Point) => {
      if (item.chapter) runOpen(item.chapter, el, at, true)
    },
    [runOpen],
  )

  // Close goes through history so the phone's back gesture closes a chapter too.
  const requestClose = useCallback(
    (from?: Point) => {
      if (busy.current) return
      if (window.history.state?.chapter) {
        closeFrom.current = from
        window.history.back()
      } else {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
        runClose(from)
      }
    },
    [runClose],
  )

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    const onPop = () => {
      const id = chapterFromHash()
      if (!id && openRef.current) {
        runClose(closeFrom.current)
        closeFrom.current = undefined
      } else if (id && !openRef.current) {
        const el = findObject(id)
        if (el) runOpen(id, el, centerOf(el), false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openRef.current) requestClose()
    }
    window.addEventListener('popstate', onPop)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('keydown', onKey)
    }
  }, [runOpen, runClose, requestClose])

  // The desk is made for a bigger screen; phones get a note instead.
  if (phone) return <PhoneNote />

  const Chapter = open ? CHAPTERS[open] : null

  return (
    <>
      <Scene active={open === null && !books} onOpen={openItem} onBooks={() => setBooks(true)} />
      {Chapter && <Chapter.Component color={Chapter.color} onClose={requestClose} />}
      {books && (
        <BookList
          onClose={() => {
            setBooks(false)
            // back to the book stack, for keyboard users
            document.querySelector<HTMLElement>('.item[data-action="books"]:not([aria-hidden])')?.focus({ preventScroll: true })
          }}
        />
      )}
      <div ref={flood} className="flood" aria-hidden />
      {loading && <Loader onDone={() => setLoading(false)} />}
    </>
  )
}
