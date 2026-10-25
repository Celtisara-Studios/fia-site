import { useEffect, useMemo, useRef, type RefObject } from 'react'
import gsap from 'gsap'

export const wrap = (v: number, loop: number) => ((v % loop) + loop) % loop

const EASE = 0.09 // share of the remaining distance covered per 60fps frame
const DRAG_EASE = 0.45
const FLING = 280 // ms of travel at release speed
const DRAG_THRESHOLD = 6
const KEY_STEP = 360

/**
 * One horizontal pan value driven by wheel, drag, touch fling and arrow keys,
 * eased on the GSAP ticker. `onFrame` receives the raw (unwrapped) value and
 * should write styles directly; React never re-renders per frame.
 */
export function useInfinitePan(
  root: RefObject<HTMLElement | null>,
  loop: number,
  enabled: boolean,
  onFrame: (value: number) => void,
) {
  const state = useRef({ target: 0, current: 0, dragging: false, lastDragEnd: 0 })
  const frame = useRef(onFrame)

  useEffect(() => {
    frame.current = onFrame
  })

  useEffect(() => {
    const s = state.current
    const tick = (_time: number, deltaTime: number) => {
      const diff = s.target - s.current
      if (Math.abs(diff) < 0.05) {
        if (diff !== 0) frame.current((s.current = s.target))
        return
      }
      const k = 1 - Math.pow(1 - (s.dragging ? DRAG_EASE : EASE), Math.min(deltaTime, 64) / 16.667)
      s.current += diff * k
      frame.current(s.current)
    }
    frame.current(s.current)
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  // Re-place layers when the lap length changes (resize).
  useEffect(() => {
    frame.current(state.current.current)
  }, [loop])

  useEffect(() => {
    const el = root.current
    if (!el || !enabled) return
    const s = state.current

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return // pinch-zoom on trackpads
      e.preventDefault()
      const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? window.innerWidth : 1
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      s.target += d * unit
    }

    let pointer = -1
    let startX = 0
    let lastX = 0
    let moved = false
    let samples: { x: number; t: number }[] = []

    const onDown = (e: PointerEvent) => {
      if (pointer !== -1 || (e.pointerType === 'mouse' && e.button !== 0)) return
      pointer = e.pointerId
      startX = lastX = e.clientX
      moved = false
      samples = [{ x: e.clientX, t: e.timeStamp }]
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return
      if (!moved && Math.abs(e.clientX - startX) > DRAG_THRESHOLD) {
        // Capture only once it's a drag, so a plain click still reaches the object.
        moved = true
        s.dragging = true
        el.setPointerCapture(pointer)
        el.classList.add('is-dragging')
      }
      if (moved) s.target -= e.clientX - lastX
      lastX = e.clientX
      samples.push({ x: e.clientX, t: e.timeStamp })
      while (samples.length > 2 && e.timeStamp - samples[0].t > 100) samples.shift()
    }
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return
      pointer = -1
      if (!moved) return
      const first = samples[0]
      const dt = e.timeStamp - first.t
      const v = dt > 0 ? (e.clientX - first.x) / dt : 0
      s.target -= v * FLING
      s.dragging = false
      s.lastDragEnd = performance.now()
      el.classList.remove('is-dragging')
    }
    // The click that ends a drag must not open whatever is under the pointer.
    const onClick = (e: MouseEvent) => {
      if (performance.now() - s.lastDragEnd < 80) {
        e.stopPropagation()
        e.preventDefault()
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.metaKey || e.ctrlKey) return
      if (e.key === 'ArrowRight') s.target += KEY_STEP
      else if (e.key === 'ArrowLeft') s.target -= KEY_STEP
      else return
      e.preventDefault()
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('click', onClick, true)
    window.addEventListener('keydown', onKey)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('click', onClick, true)
      window.removeEventListener('keydown', onKey)
      s.dragging = false
      el.classList.remove('is-dragging')
    }
  }, [root, enabled])

  return useMemo(
    () => ({
      /**
       * Ease to the lap-equivalent of `x` nearest to where we are. `laps` widens that
       * to every so many laps, for layers that only line up again after a few; `period`
       * sets it outright, for a layer with a lap of its own (the wall).
       */
      panTo(x: number, laps = 1, period = loop * laps) {
        const s = state.current
        s.target = x + Math.round((s.target - x) / period) * period
      },
      /** Whether the pan has (all but) arrived where it's heading. */
      settled() {
        const s = state.current
        return Math.abs(s.target - s.current) < 4
      },
    }),
    [loop],
  )
}
