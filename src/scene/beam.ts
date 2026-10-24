import { LAMP_PIVOT, LAMP_REST_TURN } from './lamp'

/**
 * Where the lamp points: the head's turn (degrees) and the ellipse its light lands
 * in, all in lamp.svg's frame (698.88 × 1006.88).
 */
export type Aim = { turn: number; cx: number; cy: number; rx: number; ry: number }

/** Resting pose: the wide pool over the notebook, pencil and puppy. */
export const REST_AIM: Aim = { turn: LAMP_REST_TURN, cx: 1160, cy: 1330, rx: 690, ry: 360 }

// The two ends of the shade's opening at rest; they swing with the head.
const A = { x: 414, y: 398 }
const B = { x: 690, y: 242 }
const MID = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }

type P = { x: number; y: number }

/** A point on the head, after it has swung `deg` from rest around the arm's joint. */
function swing(p: P, deg: number): P {
  const r = (deg * Math.PI) / 180
  const c = Math.cos(r)
  const s = Math.sin(r)
  const dx = p.x - LAMP_PIVOT.x
  const dy = p.y - LAMP_PIVOT.y
  return { x: LAMP_PIVOT.x + dx * c - dy * s, y: LAMP_PIVOT.y + dx * s + dy * c }
}

const TAU = Math.PI * 2
const turn = (a: number) => ((a % TAU) + TAU) % TAU
/** Which side of the line from `o` through `to` the point `p` is on. */
const side = (o: P, to: P, p: P) => Math.sign((to.x - o.x) * (p.y - o.y) - (to.y - o.y) * (p.x - o.x))

/**
 * Where a beam edge from `p` touches the pool: the tangent point on p's side of the
 * beam's axis (from `m`, the opening's middle). `at` is its angle around the pool.
 */
function touch(p: P, aim: Aim, m: P) {
  const ux = (p.x - aim.cx) / aim.rx
  const uy = (p.y - aim.cy) / aim.ry
  // a point inside the pool has no tangent; treat it as just outside, along its ray
  const spread = Math.acos(1 / Math.max(Math.hypot(ux, uy), 1.02))
  const toward = Math.atan2(uy, ux)
  const center = { x: aim.cx, y: aim.cy }
  const at = (a: number) => ({ x: aim.cx + aim.rx * Math.cos(a), y: aim.cy + aim.ry * Math.sin(a), at: a })
  const one = at(toward + spread)
  return side(m, center, one) === side(m, center, p) ? one : at(toward - spread)
}

const f = (v: number) => v.toFixed(1)

/**
 * The beam for an aim. `cut` is the cone from the opening's two ends to where they
 * touch the pool (the pool itself is lit whole, from `pool`); `edge` outlines the cone
 * and the pool's far side; `bulb` keeps the shade's lit opening on the turned head.
 * The edges are tangent to the pool, so the light works pointing anywhere: down onto
 * the desk or across onto the wall.
 */
export function beamPaths(aim: Aim) {
  const d = aim.turn - LAMP_REST_TURN
  const a = swing(A, d)
  const b = swing(B, d)
  const m = swing(MID, d)
  const ta = touch(a, aim, m)
  const tb = touch(b, aim, m)
  // The outline runs round the pool's far side, away from the lamp: if going the
  // increasing-angle way from ta to tb would pass the lamp's side, go the other way.
  const lamp = Math.atan2((m.y - aim.cy) / aim.ry, (m.x - aim.cx) / aim.rx)
  const forward = turn(tb.at - ta.at)
  const nearSide = turn(lamp - ta.at) < forward
  const span = nearSide ? TAU - forward : forward
  const arc = `A${f(aim.rx)},${f(aim.ry)} 0 ${span > Math.PI ? 1 : 0} ${nearSide ? 0 : 1}`
  return {
    cut: `M${f(a.x)},${f(a.y)}L${f(ta.x)},${f(ta.y)}L${f(tb.x)},${f(tb.y)}L${f(b.x)},${f(b.y)}Z`,
    edge: `M${f(a.x)},${f(a.y)}L${f(ta.x)},${f(ta.y)}${arc} ${f(tb.x)},${f(tb.y)}L${f(b.x)},${f(b.y)}`,
    pool: { cx: f(aim.cx), cy: f(aim.cy), rx: f(aim.rx), ry: f(aim.ry) },
    bulb: `rotate(${d.toFixed(2)} ${LAMP_PIVOT.x} ${LAMP_PIVOT.y})`,
  }
}

const REST_AXIS = Math.atan2(REST_AIM.cy - MID.y, REST_AIM.cx - MID.x)

/** The head turn that points the shade straight at (x, y), in the lamp's frame. */
export function turnToward(x: number, y: number): number {
  let d = 0
  // the opening moves as the head turns, so settle on the angle in a few passes
  for (let i = 0; i < 4; i++) {
    const m = swing(MID, d)
    const delta = Math.atan2(y - m.y, x - m.x) - REST_AXIS
    d = (Math.atan2(Math.sin(delta), Math.cos(delta)) * 180) / Math.PI
  }
  return LAMP_REST_TURN + d
}
