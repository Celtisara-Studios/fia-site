import type { CSSProperties } from 'react'

/**
 * The lamp is two drawings so its head can turn: lamp-base.svg (base and arms) and
 * lamp-shade.svg (the head, the only part you click). Both sit in the frame of the
 * original single-piece lamp.svg (698.88 × 1006.88), which LampLight.tsx's beam
 * geometry also uses, so together they match it exactly.
 */
const FRAME = { w: 698.88, h: 1006.88 }
const BASE = { w: 428.08, h: 925.67, x: 0, y: 81.21 }
const HEAD = {
  w: 354.48,
  h: 403.47,
  // Where the head's box sits before turning, and the joint it turns around (the top
  // of the arm), in the head's own frame. At rest it's turned 8.03°.
  x: 359,
  y: -11.98,
  pivot: { x: -34, y: 128.97 },
  turn: 8.03,
}

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`

export const LAMP_RATIO = FRAME.w / FRAME.h

export const LAMP_BASE = {
  src: '/art/lamp-base.svg',
  style: { left: pct(BASE.x, FRAME.w), top: pct(BASE.y, FRAME.h), width: pct(BASE.w, FRAME.w) } as CSSProperties,
}

export const LAMP_HEAD = {
  src: '/art/lamp-shade.svg',
  style: {
    left: pct(HEAD.x, FRAME.w),
    top: pct(HEAD.y, FRAME.h),
    width: pct(HEAD.w, FRAME.w),
    transformOrigin: `${pct(HEAD.pivot.x, HEAD.w)} ${pct(HEAD.pivot.y, HEAD.h)}`,
    rotate: `${HEAD.turn}deg`,
  } as CSSProperties,
}

export const LAMP_PARTS = [LAMP_BASE.src, LAMP_HEAD.src]

/** The lamp's frame, the arm-top joint the head swings around, and its resting turn. */
export const LAMP_FRAME = FRAME
export const LAMP_PIVOT = { x: HEAD.x + HEAD.pivot.x, y: HEAD.y + HEAD.pivot.y }
export const LAMP_REST_TURN = HEAD.turn
