import gsap from 'gsap'
import { inkBlob, reach, type Point } from './ink'

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const play = (tl: gsap.core.Timeline) => new Promise<void>((resolve) => tl.eventCallback('onComplete', () => resolve()))

const vw = () => window.innerWidth
const vh = () => window.innerHeight

function showFlood(flood: HTMLElement, color: string) {
  flood.style.backgroundColor = color
  flood.style.opacity = '1'
  flood.style.clipPath = 'circle(0px at 0px 0px)'
  flood.style.visibility = 'visible'
}

export function hideFlood(flood: HTMLElement) {
  flood.style.visibility = 'hidden'
  flood.style.clipPath = ''
  flood.style.opacity = ''
}

/** Local geometry of an object's color layer relative to a viewport point. */
function local(colorEl: HTMLElement, at: Point) {
  const box = colorEl.getBoundingClientRect()
  const p = { x: at.x - box.left, y: at.y - box.top }
  return { box, p, fill: reach(p, box.width, box.height) }
}

/**
 * Open: color soaks through the object from where it was touched, then
 * spills out until it covers the screen. Resolves with the screen covered.
 */
export function inkIn(colorEl: HTMLElement, flood: HTMLElement, at: Point, color: string): Promise<void> {
  showFlood(flood, color)
  if (reduced()) {
    colorEl.style.clipPath = 'none'
    flood.style.clipPath = 'none'
    return play(gsap.timeline().fromTo(flood, { opacity: 0 }, { opacity: 1, duration: 0.25 }))
  }

  const { p, fill } = local(colorEl, at)
  const screen = reach(at, vw(), vh())
  const seed = Math.random() * 10
  const s = { obj: 0, scr: 0 }

  return play(
    gsap
      .timeline()
      .to(s, {
        obj: fill,
        duration: 0.6,
        ease: 'power2.out',
        onUpdate: () => void (colorEl.style.clipPath = inkBlob(p.x, p.y, s.obj, seed, s.obj / fill)),
        onComplete: () => void (colorEl.style.clipPath = 'none'),
      })
      .to(
        s,
        {
          scr: screen,
          duration: 1.05,
          ease: 'power3.inOut',
          onUpdate: () => void (flood.style.clipPath = inkBlob(at.x, at.y, s.scr, seed + 2, s.scr / 500)),
          onComplete: () => void (flood.style.clipPath = 'none'),
        },
        0.42,
      ),
  )
}

/**
 * Close: color spreads over the chapter from where Close was pressed, `swap`
 * unmounts the chapter underneath, then the color retreats into its object
 * and drains out of it.
 */
export async function inkOut(
  flood: HTMLElement,
  from: Point,
  color: string,
  swap: () => HTMLElement | null,
): Promise<void> {
  showFlood(flood, color)
  if (reduced()) {
    flood.style.clipPath = 'none'
    await play(gsap.timeline().fromTo(flood, { opacity: 0 }, { opacity: 1, duration: 0.2 }))
    swap()
    await play(gsap.timeline().to(flood, { opacity: 0, duration: 0.3 }))
    hideFlood(flood)
    return
  }

  const seed = Math.random() * 10
  const cover = { r: 0 }
  await play(
    gsap.timeline().to(cover, {
      r: reach(from, vw(), vh()),
      duration: 0.65,
      ease: 'power3.inOut',
      onUpdate: () => void (flood.style.clipPath = inkBlob(from.x, from.y, cover.r, seed, cover.r / 500)),
    }),
  )

  const colorEl = swap()
  if (!colorEl) {
    await play(gsap.timeline().to(flood, { opacity: 0, duration: 0.4 }))
    hideFlood(flood)
    return
  }

  colorEl.style.clipPath = 'none'
  const box = colorEl.getBoundingClientRect()
  const c = { x: box.left + box.width / 2, y: box.top + box.height / 2 }
  const fill = Math.hypot(box.width, box.height) / 2 + 30
  const back = { r: reach(c, vw(), vh()), obj: fill }

  await play(
    gsap
      .timeline()
      .to(back, {
        r: fill,
        duration: 0.9,
        ease: 'power3.inOut',
        onUpdate: () => void (flood.style.clipPath = inkBlob(c.x, c.y, back.r, seed + 2, back.r / 500)),
      })
      .to(flood, { opacity: 0, duration: 0.25, ease: 'power1.out' }, '-=0.08')
      .to(
        back,
        {
          obj: 0,
          duration: 0.6,
          ease: 'power2.inOut',
          onUpdate: () =>
            void (colorEl.style.clipPath = inkBlob(box.width / 2, box.height / 2, back.obj, seed, back.obj / fill)),
        },
        '-=0.12',
      ),
  )
  hideFlood(flood)
}
