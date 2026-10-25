import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type FocusEvent } from 'react'
import gsap from 'gsap'
import { CHAPTERS } from '../chapters'
import { colorize, type Point } from '../fx/ink'
import { markerRibbon } from '../fx/marker'
import { beamPaths, REST_AIM, turnToward, type Aim } from './beam'
import { ITEMS, LOOP, SURFACE_Y, WALL_LOOP, WALL_SPEED, type Item } from './items'
import { LAMP_BASE, LAMP_FRAME, LAMP_HEAD } from './lamp'
import { LampLight } from './LampLight'
import { StickyNote } from './StickyNote'
import { TOUR, type TourStop } from './tour'
import { useInfinitePan, wrap } from './useInfinitePan'
import { CalendarPage, ClockHands } from './WallFaces'
import './scene.css'

/** Every layer is drawn for the previous, current and next lap so the wrap is seamless. */
const COPIES = [-1, 0, 1] as const
/** Desk laps until the wall lines up with the desk again (see WALL_LOOP). */
const HOME_LAPS = 4
const GRID = 10
/** Horizontal repeat of the rail's 45° crosshatch (5px apart, see .scene-rail). */
const RAIL_HATCH = 5 * Math.SQRT2
const LAMPS = ITEMS.filter((item) => item.action === 'lamp')
const WALL_ITEMS = ITEMS.filter((item) => item.surface === 'wall')
const DESK_ITEMS = ITEMS.filter((item) => item.surface !== 'wall')

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The marker loop round a label, drawn on when its object is hovered (scene.css): a filled
 * pen stroke that swells and thins, uncovered along its centre line by a mask. Its box is
 * 150% × 230% of the label's (scene.css), so the viewBox takes that shape and the stroke stays even.
 */
function LabelCircle({ aspect, seed }: { aspect: number; seed: string }) {
  const mask = `circle-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const w = 40 * aspect * (1.5 / 2.3)
  const { line, ribbon } = useMemo(() => markerRibbon(w, 40, seed), [w, seed])
  return (
    <svg className="item-circle" viewBox={`0 0 ${w.toFixed(1)} 40`} preserveAspectRatio="none" aria-hidden>
      <mask id={mask}>
        <path className="circle-reveal" d={line} pathLength={1} />
      </mask>
      <path className="circle-ink" d={ribbon} mask={`url(#${mask})`} />
    </svg>
  )
}

/** Where an object sits on the desk. */
function placement(item: Item, scale: number, offset: number): CSSProperties {
  const y = item.y ?? SURFACE_Y[item.surface]
  return {
    left: item.x * scale + offset,
    // nearer the front of the desk draws on top; flat things (a mat) lie under everything
    zIndex: item.flat ? 1 : Math.round(y * 10),
    '--h': item.h,
    '--y': y,
    '--turn': item.rotate ? `${item.rotate}deg` : undefined,
  } as CSSProperties
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)

/** Where the tour's panel goes: beside what's lit, kept on screen. */
function placePanel(box: DOMRect, width: number, height: number, side: TourStop['side']) {
  const gap = window.innerHeight * 0.016
  const midX = box.left + box.width / 2 - width / 2
  const midY = box.top + box.height / 2 - height / 2
  const at = {
    right: { x: box.right + gap, y: midY },
    left: { x: box.left - gap - width, y: midY },
    below: { x: midX, y: box.bottom + gap },
    above: { x: midX, y: box.top - gap - height },
  }[side]
  const edge = 16
  return {
    left: clamp(at.x, edge, window.innerWidth - edge - width),
    top: clamp(at.y, edge, window.innerHeight - edge - height),
  }
}

/**
 * Desk positions (items.ts x, LOOP) are px on a screen this tall; they scale with the
 * screen's height, like the objects' sizes do, so the layout looks the same everywhere
 * and wider screens just show more desk. (Set on Callum's ~780px-tall browser.)
 */
const DESIGN_HEIGHT = 780
const worldScale = () => window.innerHeight / DESIGN_HEIGHT

function useWorldScale() {
  const [scale, setScale] = useState(worldScale)
  useEffect(() => {
    const onResize = () => setScale(worldScale())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return scale
}

type Props = {
  active: boolean
  onOpen: (item: Item, el: HTMLElement, at: Point) => void
  onBooks: () => void
  /** A polaroid on the wall was clicked: open the photo viewer at it. */
  onPhoto: (id: string) => void
  /** The cutting mat was clicked: open her visual art. */
  onGallery: () => void
}

export function Scene({ active, onOpen, onBooks, onPhoto, onGallery }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const world = useRef<HTMLDivElement>(null)
  const wall = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const shade = useRef<SVGSVGElement>(null)
  const [lit, setLit] = useState(false)
  /** Which stop of the lamp's tour is showing, or null when there's no tour. */
  const [tour, setTour] = useState<number | null>(null)
  /** The tour runs the first time the lamp comes on; after that it's a plain switch. */
  const [toured, setToured] = useState(false)
  /** The box of what the current stop lights up; the panel sits beside it. */
  const [litBox, setLitBox] = useState<DOMRect | null>(null)
  const aim = useRef<Aim>({ ...REST_AIM })
  const swingTween = useRef<gsap.core.Tween | null>(null)
  /** The light stuttering out at the end of the tour. */
  const flicker = useRef<gsap.core.Timeline | null>(null)
  /** Waiting on the pan to get home before the first stop is aimed. */
  const settling = useRef<(() => void) | null>(null)
  const scale = useWorldScale()
  const loop = LOOP * scale
  const wallLoop = WALL_LOOP * scale

  const pan = useInfinitePan(root, loop, active && tour === null, (v) => {
    const w = v * WALL_SPEED
    const x = wrap(v, loop)
    if (world.current) world.current.style.transform = `translate3d(${-x}px,0,0)`
    // The rail is the back edge of the desk, so its crosshatch moves with the desk.
    if (rail.current) rail.current.style.backgroundPositionX = `${-wrap(v, RAIL_HATCH).toFixed(2)}px`
    // The lamp's beam moves with the desk.
    if (shade.current) {
      for (const g of shade.current.querySelectorAll('.lamp-pan')) g.setAttribute('transform', `translate(${-x} 0)`)
    }
    if (wall.current) wall.current.style.transform = `translate3d(${-wrap(w, wallLoop)}px,0,0)`
    if (grid.current) grid.current.style.backgroundPositionX = `${-wrap(w, GRID)}px`
  })

  /** Point every copy of the lamp: turn the heads, move the lit shape, its outline and the bulb. */
  const applyAim = useCallback((a: Aim) => {
    const r = root.current
    if (!r) return
    const { cut, edge, pool, bulb } = beamPaths(a)
    for (const head of r.querySelectorAll<HTMLElement>('.lamp-head')) head.style.rotate = `${a.turn}deg`
    for (const p of r.querySelectorAll('.beam-cut')) p.setAttribute('d', cut)
    for (const e of r.querySelectorAll('.beam-pool')) {
      for (const [k, v] of Object.entries(pool)) e.setAttribute(k, v)
    }
    for (const p of r.querySelectorAll('.beam-edge')) p.setAttribute('d', edge)
    for (const g of r.querySelectorAll('.lamp-bulb')) g.setAttribute('transform', bulb)
  }, [])

  /** Swing the head (and its light) to a new aim, slowly, like pushing a real lamp. */
  const swingTo = useCallback(
    (to: Aim, instant = reducedMotion()) => {
      swingTween.current?.kill()
      if (instant) {
        Object.assign(aim.current, to)
        applyAim(aim.current)
        return
      }
      swingTween.current = gsap.to(aim.current, {
        ...to,
        duration: 1.2,
        ease: 'power2.inOut',
        onUpdate: () => applyAim(aim.current),
      })
    },
    [applyAim],
  )

  /** Light up a tour stop: the head points at it and the pool just covers it. */
  const aimAt = useCallback((stop: TourStop) => {
    const r = root.current
    const lamp = r?.querySelector<HTMLElement>('.item.is-lamp:not([aria-hidden]) .lamp-art')
    if (!r || !lamp) return null
    const lr = lamp.getBoundingClientRect()
    const lampMid = lr.left + lr.width / 2
    const across = (rect: DOMRect) => Math.abs(rect.left + rect.width / 2 - lampMid)
    let box: DOMRect | null = null
    // the copy nearest the lamp: an object's drawing, or the name itself
    for (const el of r.querySelectorAll<HTMLElement>(`[data-id="${stop.target}"]`)) {
      const t = (el.querySelector('.item-art') ?? el).getBoundingClientRect()
      if (!box || across(t) < across(box)) box = t
    }
    if (!box) return null
    const s = lr.height / LAMP_FRAME.h // px per lamp unit
    const pad = window.innerHeight * 0.015
    const [kx, ky] = stop.fit ?? [1.33, 1.33]
    const cx = (box.left + box.width / 2 - lr.left) / s
    const cy = (box.top + box.height / 2 - lr.top) / s
    const rx = ((box.width / 2) * kx + pad) / s
    const ry = ((box.height / 2) * ky + pad) / s
    const to: Aim = { turn: turnToward(cx, cy), cx, cy, rx, ry }
    return { to, box }
  }, [])

  /** Show a stop: swing the light onto it, with the panel beside it. */
  const showStop = useCallback(
    (i: number, instant?: boolean) => {
      setTour(i)
      const hit = aimAt(TOUR[i])
      if (!hit) return setLitBox(null)
      swingTo(hit.to, instant)
      setLitBox(hit.box)
    },
    [aimAt, swingTo],
  )

  const stopSettling = useCallback(() => {
    if (settling.current) gsap.ticker.remove(settling.current)
    settling.current = null
  }, [])

  /**
   * The light goes out: the bulb stutters a few times, uneven like a real one, then
   * it's off and the head settles back. Straight off when motion is reduced.
   */
  const flickerOut = useCallback(() => {
    const el = shade.current
    const off = () => {
      el?.classList.remove('is-flickering')
      setLit(false)
      swingTo(REST_AIM)
    }
    flicker.current?.kill()
    if (!el || reducedMotion()) {
      off()
      return
    }
    const dark = (on: boolean) => () => el.classList.toggle('is-flickering', on)
    flicker.current = gsap
      .timeline({ onComplete: off })
      .call(dark(true), [], 0.15)
      .call(dark(false), [], 0.23)
      .call(dark(true), [], 0.38)
      .call(dark(false), [], 0.43)
      .call(dark(true), [], 0.62)
      .to({}, { duration: 0.2 })
  }, [swingTo])

  /** End the tour (Done, Skip, Esc, or a click on the desk): the light flickers out. */
  const endTour = useCallback(() => {
    stopSettling()
    setTour(null)
    setLitBox(null)
    flickerOut()
  }, [stopSettling, flickerOut])

  const nextStop = () => {
    if (tour === null) return
    stopSettling()
    if (tour + 1 < TOUR.length) showStop(tour + 1)
    else endTour()
  }

  const backStop = () => {
    if (tour) showStop(tour - 1)
  }

  // The lamp's head: off → lights on (and the tour, the first time); on → lights off.
  const pressLamp = () => {
    if (tour !== null || flicker.current?.isActive()) return
    if (lit) {
      setLit(false)
      swingTo(REST_AIM)
      return
    }
    setLit(true)
    if (toured) return
    setToured(true)
    setTour(0)
    // Back to where the desk starts, wall and all, so every stop is on screen. The
    // first stop is aimed once the pan has got there.
    pan.panTo(0, HOME_LAPS)
    const arrive = () => {
      if (!pan.settled()) return
      stopSettling()
      showStop(0)
    }
    settling.current = arrive
    gsap.ticker.add(arrive)
  }

  // During the tour: Esc ends it, and a resize re-aims the stop.
  useEffect(() => {
    if (tour === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      endTour()
    }
    // after the desk has re-laid itself out for the new size
    const onResize = () => requestAnimationFrame(() => !settling.current && showStop(tour, true))
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [tour, endTour, showStop])

  useEffect(
    () => () => {
      flicker.current?.kill()
      stopSettling()
    },
    [stopSettling],
  )

  return (
    <div
      ref={root}
      className={['scene', lit && 'is-lit', tour !== null && 'is-touring'].filter(Boolean).join(' ')}
      inert={!active}
      aria-hidden={!active || undefined}
    >
      <div ref={grid} className="scene-grid" />

      {/* the rail between wall and desk: crosshatched between its two lines */}
      <div ref={rail} className="scene-rail" />

      <svg className="scene-lines" viewBox="0 0 2000 1250" preserveAspectRatio="none" aria-hidden>
        <line className="scene-line" x1="0" y1="481" x2="2000" y2="487.5" />
        <line className="scene-line" x1="0" y1="506.5" x2="2000" y2="515.5" />
        <line className="scene-line" x1="0" y1="1086.5" x2="2000" y2="1086" />
        <rect className="scene-front" x="0" y="1157" width="2000" height="93" />
      </svg>

      <div ref={wall} className="scene-layer">
        {COPIES.map((c) => {
          const Name = c === 0 ? 'h1' : 'p'
          return (
            <Name key={c} className="wall-name" data-id="name" style={{ left: c * wallLoop }} aria-hidden={c !== 0 || undefined}>
              Fia Bondy
              <img className="wall-sign" src="/art/signature.svg" alt="" draggable={false} />
            </Name>
          )
        })}
        {/* things hanging on the wall move with it */}
        {COPIES.map((c) =>
          WALL_ITEMS.map((item) => (
            <DeskItem
              key={`${c}:${item.id}`}
              item={item}
              scale={scale}
              offset={c * wallLoop}
              primary={c === 0}
              lit={lit}
              onOpen={onOpen}
              onLamp={pressLamp}
              onBooks={onBooks}
              onPhoto={onPhoto}
              onGallery={onGallery}
              // the wall moves slower than the desk and comes round on its own lap
              onFocus={() => pan.panTo((item.x * scale - window.innerWidth / 2) / WALL_SPEED, 1, wallLoop / WALL_SPEED)}
            />
          )),
        )}
      </div>

      <div ref={world} className="scene-layer">
        {COPIES.map((c) =>
          DESK_ITEMS.map((item) => (
            <DeskItem
              key={`${c}:${item.id}`}
              item={item}
              scale={scale}
              offset={c * loop}
              primary={c === 0}
              lit={lit}
              onOpen={onOpen}
              onLamp={pressLamp}
              onBooks={onBooks}
              onPhoto={onPhoto}
              onGallery={onGallery}
              onFocus={() => pan.panTo(item.x * scale - window.innerWidth / 2)}
            />
          )),
        )}
      </div>

      <LampLight
        ref={shade}
        lamps={COPIES.flatMap((c) =>
          LAMPS.map((item) => ({
            key: `${c}:${item.id}`,
            x: item.x * scale + c * loop,
            y: item.y ?? SURFACE_Y[item.surface],
            h: item.h,
          })),
        )}
      />

      {/* during the tour, a click anywhere on the dark desk ends it */}
      {tour !== null && <div className="tour-catch" onClick={endTour} />}

      {/* the tour's panel, floating beside whatever the light is on */}
      {tour !== null && litBox && (
        <TourPanel
          key={tour}
          step={tour}
          box={litBox}
          onBack={backStop}
          onNext={nextStop}
          onEnd={endTour}
        />
      )}

      {/* the dark front edge: hints, quiet during the tour (its panel has the words and controls) */}
      <div className="scene-hint" aria-hidden={tour === null || undefined}>
        {tour === null ? (
          <>
            <span>
              <span className="for-mouse">Drag to look around</span>
              <span className="for-touch">Swipe to look around</span>
            </span>
            <span>
              <span className="for-mouse">Open anything on the desk</span>
              <span className="for-touch">Tap to open</span>
            </span>
          </>
        ) : (
          <p className="sr-only" aria-live="polite">
            {[TOUR[tour].title, TOUR[tour].line].filter(Boolean).join(' ')}
          </p>
        )}
      </div>
    </div>
  )
}

type PanelProps = {
  step: number
  box: DOMRect
  onBack: () => void
  onNext: () => void
  onEnd: () => void
}

/**
 * The tour's floating panel: the stop's words, where it is in the tour, Back and Next,
 * and a close that ends it. It measures itself, then sits beside what's lit. Each
 * stop gets a fresh one, with Next focused.
 */
function TourPanel({ step, box, onBack, onNext, onEnd }: PanelProps) {
  const panel = useRef<HTMLDivElement>(null)
  const next = useRef<HTMLButtonElement>(null)
  const stop = TOUR[step]

  useEffect(() => next.current?.focus({ preventScroll: true }), [])

  useLayoutEffect(() => {
    const el = panel.current
    if (!el) return
    const { left, top } = placePanel(box, el.offsetWidth, el.offsetHeight, stop.side)
    el.style.left = `${left}px`
    el.style.top = `${top}px`
  }, [box, stop])

  return (
    <div ref={panel} className="tour-panel" role="group" aria-label="Desk tour">
      <button type="button" className="tour-close" aria-label="End the tour" onClick={onEnd}>
        <svg viewBox="0 0 12 12" aria-hidden>
          <path d="M2 2 L10 10 M10 2 L2 10" />
        </svg>
      </button>
      {stop.title && <p className="tour-title">{stop.title}</p>}
      <p className="tour-text">{stop.line}</p>
      <div className="tour-foot">
        <span className="tour-count">
          {step + 1} / {TOUR.length}
        </span>
        {step > 0 && (
          <button type="button" className="tour-btn is-quiet" onClick={onBack}>
            Back
          </button>
        )}
        <button ref={next} type="button" className="tour-btn" onClick={onNext}>
          {step + 1 < TOUR.length ? 'Next' : 'Done'}
        </button>
      </div>
    </div>
  )
}

type ItemProps = {
  item: Item
  scale: number
  offset: number
  primary: boolean
  lit: boolean
  onOpen: Props['onOpen']
  onLamp: () => void
  onBooks: () => void
  onPhoto: (id: string) => void
  onGallery: () => void
  onFocus: () => void
}

function DeskItem({ item, scale, offset, primary, lit, onOpen, onLamp, onBooks, onPhoto, onGallery, onFocus }: ItemProps) {
  const color = item.chapter ? CHAPTERS[item.chapter].color : null
  const [colorSrc, setColorSrc] = useState<string | null>(null)
  /** The hand-lettered label's width over its height, once it's loaded. */
  const [labelAspect, setLabelAspect] = useState(2.5)

  useEffect(() => {
    if (!color || item.colorSrc) return
    let live = true
    colorize(item.src, color).then((url) => live && setColorSrc(url))
    return () => {
      live = false
    }
  }, [item.src, item.colorSrc, color])

  const style = placement(item, scale, offset)
  const focusPan = (e: FocusEvent<HTMLElement>) => primary && e.currentTarget.matches(':focus-visible') && onFocus()
  // Copies of the desk on either side of the visible lap aren't focusable or announced.
  const reach = { tabIndex: primary ? 0 : -1, 'aria-hidden': !primary || undefined, onFocus: focusPan }
  const art = (
    <span className="item-art">
      <img src={item.src} alt="" draggable={false} />
    </span>
  )
  const label = item.label && (
    <span
      className={['item-label', item.labelAbove && 'is-above', item.labelSrc && 'is-hand'].filter(Boolean).join(' ')}
      style={item.labelAt && { left: `${item.labelAt.x ?? 50}%`, top: item.labelAt.y === undefined ? undefined : `${item.labelAt.y}%` }}
    >
      {item.labelSrc ? (
        <img
          src={item.labelSrc}
          alt=""
          draggable={false}
          onLoad={(e) => setLabelAspect(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
        />
      ) : (
        item.label
      )}
      <LabelCircle aspect={labelAspect} seed={item.id} />
    </span>
  )

  if (item.href) {
    return (
      <a
        className="item opens" data-id={item.id}
        style={style}
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        draggable={false}
        aria-label={`${item.label ?? item.alt} (opens in a new tab)`}
        {...reach}
      >
        {art}
        {label}
      </a>
    )
  }

  // The reading list, a polaroid held up close, or her visual art: popups over the desk.
  if (item.action === 'books' || item.action === 'photos' || item.action === 'gallery') {
    const open = { books: onBooks, photos: () => onPhoto(item.id), gallery: onGallery }[item.action]
    return (
      <button
        type="button"
        className={['item opens', item.hoverSrc && 'has-reveal', item.flat && 'is-flat'].filter(Boolean).join(' ')}
        data-id={item.id}
        data-action={item.action}
        style={style}
        aria-haspopup="dialog"
        aria-label={`Open ${item.label ?? item.alt}`}
        onClick={open}
        {...reach}
      >
        <span className="item-art">
          <img src={item.src} alt="" draggable={false} />
          {item.hoverSrc && <img className="item-reveal" src={item.hoverSrc} alt="" draggable={false} />}
          {item.prints && (
            // lying flat on its top surface, so drawn into the desk's slant
            <span className="item-prints">
              {item.prints.map((p) => (
                <span
                  key={p.src}
                  className="print"
                  style={{ left: `${p.x}%`, top: `${p.y}%`, height: `${p.h}%`, '--turn': `${p.turn}deg` } as CSSProperties}
                >
                  <img src={p.src} alt="" draggable={false} />
                  <img className="print-color" src={p.colorSrc} alt="" draggable={false} />
                </span>
              ))}
            </span>
          )}
        </span>
        {label}
      </button>
    )
  }

  // The lamp: only its head is clickable (and carries the sticky note). The base is just desk.
  if (item.action === 'lamp') {
    return (
      <div className="item is-lamp" data-id={item.id} style={style} aria-hidden={!primary || undefined}>
        <span className="item-art lamp-art">
          <img className="lamp-base" src={LAMP_BASE.src} style={LAMP_BASE.style} alt="" draggable={false} />
          <button
            type="button"
            className="lamp-head"
            style={LAMP_HEAD.style}
            aria-label="Desk lamp"
            aria-pressed={lit}
            onClick={onLamp}
            {...reach}
          >
            <img src={LAMP_HEAD.src} alt="" draggable={false} />
            <StickyNote>
              <img src="/art/click-me.svg" alt="" draggable={false} />
            </StickyNote>
          </button>
        </span>
      </div>
    )
  }


  // Objects without a chapter are just part of the desk: no click, no focus.
  if (!item.chapter) {
    return (
      <div
        className={item.hoverSrc ? 'item is-static has-reveal' : 'item is-static'}
        data-id={item.id}
        style={style}
        aria-hidden={!primary || undefined}
      >
        <span className="item-art">
          <img src={item.src} alt={primary ? item.alt : ''} draggable={false} />
          {item.hoverSrc && <img className="item-reveal" src={item.hoverSrc} alt="" draggable={false} />}
          {item.face === 'clock' && <ClockHands />}
          {item.face === 'calendar' && <CalendarPage />}
        </span>
        {label}
      </div>
    )
  }

  return (
    <button
      type="button"
      className="item opens" data-id={item.id}
      data-chapter={item.chapter}
      style={style}
      tabIndex={primary ? 0 : -1}
      aria-hidden={!primary || undefined}
      aria-label={item.label ? `Open ${item.label}` : item.alt}
      onFocus={focusPan}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        // Keyboard activation has no pointer position; start from the middle.
        const at = e.detail === 0 ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: e.clientX, y: e.clientY }
        onOpen(item, e.currentTarget, at)
      }}
    >
      <span className="item-art">
        <img src={item.src} alt="" draggable={false} />
        {(item.colorSrc ?? colorSrc) && (
          <img className="item-color" src={item.colorSrc ?? colorSrc!} alt="" draggable={false} />
        )}
      </span>
      {label}
    </button>
  )
}
