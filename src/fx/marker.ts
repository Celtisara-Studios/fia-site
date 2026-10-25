/**
 * A quick marker loop around something, going a little past closed, as an SVG path: the
 * calendar's circle round today.
 */
export function markerLoop(cx: number, cy: number, rx: number, ry: number) {
  const pts = Array.from({ length: 41 }, (_, k) => {
    const p = k / 40
    const t = -0.5 + p * (2 * Math.PI + 0.9)
    const grow = 1 + 0.08 * p
    return `${(cx + rx * grow * Math.cos(t) + 0.6 * p).toFixed(1)},${(cy + ry * grow * Math.sin(t) - 1.2 * p).toFixed(1)}`
  })
  return `M${pts.join(' L')}`
}

/** A seeded 0–1 random, so every copy of the same label draws the same loop. */
function seeded(seed: string) {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

/**
 * A marker loop drawn quickly round a word, in a `w` × `h` box, a little past closed and a
 * little off true. Gives its centre line (to draw it on along) and its outline as a filled
 * shape whose width swells and thins like a pen pressed harder and lighter: light where it
 * starts, full round the loop, trailing off at the end.
 */
export function markerRibbon(w: number, h: number, seed: string, nib = 2.6) {
  const rand = seeded(seed)
  const [a, b, c] = [rand(), rand(), rand()].map((v) => v * Math.PI * 2)
  const cx = w / 2
  const cy = h / 2
  const rx = w / 2 - nib * 1.6
  const ry = h / 2 - nib * 1.6
  const n = 72
  const pts = Array.from({ length: n }, (_, k) => {
    const p = k / (n - 1)
    const t = -0.5 + p * (2 * Math.PI + 0.9)
    // grows a touch as it goes round, and wobbles
    const r = (0.94 + 0.08 * p) * (1 + 0.035 * Math.sin(2 * t + a) + 0.025 * Math.sin(3 * t + b))
    return { p, t, x: cx + rx * r * Math.cos(t) + 0.8 * p, y: cy + ry * r * Math.sin(t) - 1.4 * p }
  })
  const press = (p: number) => (p < 0.12 ? 0.35 + 0.65 * (p / 0.12) : p > 0.8 ? 1 - 0.75 * ((p - 0.8) / 0.2) : 1)
  const left: string[] = []
  const right: string[] = []
  pts.forEach((pt, i) => {
    const prev = pts[Math.max(0, i - 1)]
    const next = pts[Math.min(n - 1, i + 1)]
    const tx = next.x - prev.x
    const ty = next.y - prev.y
    const len = Math.hypot(tx, ty) || 1
    const half = (nib * press(pt.p) * (1 + 0.15 * Math.sin(5 * pt.t + c))) / 2
    const nx = (-ty / len) * half
    const ny = (tx / len) * half
    left.push(`${(pt.x + nx).toFixed(2)},${(pt.y + ny).toFixed(2)}`)
    right.push(`${(pt.x - nx).toFixed(2)},${(pt.y - ny).toFixed(2)}`)
  })
  return {
    line: `M${pts.map((pt) => `${pt.x.toFixed(2)},${pt.y.toFixed(2)}`).join(' L')}`,
    ribbon: `M${left.join(' L')} L${right.reverse().join(' L')} Z`,
  }
}
