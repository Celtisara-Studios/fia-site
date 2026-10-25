import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { CHAPTERS, isChapterId, type Chapter, type ChapterId } from './chapters'
import type { Point } from './fx/ink'
import { drainObject, hideFlood, inkIn, inkObject, inkOut } from './fx/transitions'
import { Loader } from './Loader'
import { PhoneNote } from './PhoneNote'
import { BookList } from './popups/BookList'
import { Gallery } from './popups/Gallery'
import { PhotoViewer } from './popups/PhotoViewer'
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

/** Chapters that open as a popup over the desk, with no color flood. */
const isPopup = (id: ChapterId) => (CHAPTERS[id] as Chapter).popup === true

const centerOf = (el: Element): Point => {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

export default function App() {
  const [open, setOpen] = useState<ChapterId | null>(chapterFromHash)
  const [loading, setLoading] = useState(true)
  const [books, setBooks] = useState(false)
  /** The polaroid the photo viewer opened at, while it's open. */
  const [photo, setPhoto] = useState<string | null>(null)
  const [gallery, setGallery] = useState(false)
  const phone = usePhone()
  const openRef = useRef(open)
  const flood = useRef<HTMLDivElement>(null)
  const busy = useRef(false)
  const closeFrom = useRef<Point | undefined>(undefined)
  /** The object a popup chapter colored in on the way open, to drain on the way out. */
  const inked = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    openRef.current = open
    // a full-screen chapter scrolls the page; a popup leaves the desk fixed
    document.documentElement.classList.toggle('is-chapter', open !== null && !isPopup(open))
  }, [open])

  const runOpen = useCallback(async (id: ChapterId, el: HTMLElement, at: Point, push: boolean) => {
    if (busy.current || openRef.current) return
    busy.current = true
    const popup = isPopup(id)
    const colorEl = el.querySelector<HTMLElement>('.item-color')
    if (!popup) await inkIn(colorEl ?? el, flood.current!, at, CHAPTERS[id].color)
    else if (colorEl) {
      // the object fills with the chapter's color first, then the popup opens over it
      inked.current = colorEl
      await inkObject(colorEl, at)
    }
    flushSync(() => setOpen(id))
    if (push) window.history.pushState({ chapter: id }, '', `#${id}`)
    if (!popup) {
      window.scrollTo(0, 0)
      hideFlood(flood.current!)
    }
    busy.current = false
  }, [])

  const runClose = useCallback(async (from?: Point) => {
    const id = openRef.current
    if (busy.current || !id) return
    busy.current = true
    if (isPopup(id)) {
      // the popup has already played its own way out; then the color drains from its object
      flushSync(() => setOpen(null))
      const colorEl = inked.current ?? findObject(id)?.querySelector<HTMLElement>('.item-color')
      inked.current = null
      if (colorEl) await drainObject(colorEl)
    } else {
      const at = from ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      await inkOut(flood.current!, at, CHAPTERS[id].color, () => {
        flushSync(() => setOpen(null))
        window.scrollTo(0, 0)
        return findObject(id)?.querySelector<HTMLElement>('.item-color') ?? null
      })
    }
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
      // a popup handles its own Esc, so it can play its way out first
      if (e.key === 'Escape' && openRef.current && !isPopup(openRef.current)) requestClose()
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
      <Scene
        active={open === null && !books && !photo && !gallery}
        onOpen={openItem}
        onBooks={() => setBooks(true)}
        onPhoto={setPhoto}
        onGallery={() => setGallery(true)}
      />
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
      {gallery && (
        <Gallery
          onClose={() => {
            setGallery(false)
            // back to the mat, for keyboard users
            document.querySelector<HTMLElement>('.item[data-action="gallery"]:not([aria-hidden])')?.focus({ preventScroll: true })
          }}
        />
      )}
      {photo && (
        <PhotoViewer
          start={photo}
          onClose={() => {
            setPhoto(null)
            // back to the polaroid it opened at, for keyboard users
            document.querySelector<HTMLElement>(`.item[data-id="${photo}"]:not([aria-hidden])`)?.focus({ preventScroll: true })
          }}
        />
      )}
      <div ref={flood} className="flood" aria-hidden />
      {loading && <Loader onDone={() => setLoading(false)} />}
    </>
  )
}
