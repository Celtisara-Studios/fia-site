export type Point = { x: number; y: number }

const POINTS = 72

/**
 * A closed, slightly irregular ink-drop outline of radius r around (cx, cy),
 * as a CSS clip-path in the element's own pixel space. `t` slowly morphs the
 * edge so a growing drop looks like it's spreading, not scaling.
 */
export function inkBlob(cx: number, cy: number, r: number, seed: number, t = 0): string {
  if (r <= 0.5) return 'circle(0px at 0px 0px)'
  // Wobble grows with the drop but stays ink-sized on a full-screen flood.
  const amp = Math.min(r * 0.09, 26)
  const pts: [number, number][] = []
  for (let i = 0; i < POINTS; i++) {
    const a = (i / POINTS) * Math.PI * 2
    const n =
      0.5 * Math.sin(3 * a + seed + t * 1.9) +
      0.3 * Math.sin(5 * a + seed * 2.3 - t * 1.4) +
      0.15 * Math.sin(11 * a + seed * 3.7 + t * 0.8) +
      0.05 * Math.sin(23 * a + seed * 5.1)
    const rr = r + amp * n
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr])
  }
  const f = (v: number) => v.toFixed(1)
  const mid = (p: [number, number], q: [number, number]) => `${f((p[0] + q[0]) / 2)} ${f((p[1] + q[1]) / 2)}`
  let d = `M${mid(pts[POINTS - 1], pts[0])}`
  for (let i = 0; i < POINTS; i++) {
    const p = pts[i]
    d += `Q${f(p[0])} ${f(p[1])} ${mid(p, pts[(i + 1) % POINTS])}`
  }
  return `path("${d}Z")`
}

/** Distance from p to the farthest corner of a w × h box, plus the wobble. */
export function reach(p: Point, w: number, h: number): number {
  return Math.hypot(Math.max(p.x, w - p.x), Math.max(p.y, h - p.y)) + 30
}

const colored = new Map<string, Promise<string>>()

/**
 * Fill an ink drawing's solid black areas with `color`, keeping a band of ink
 * around them as the outline. Thin lines and halftone dots are narrower than
 * the band, so they stay black. Returns an object URL; cached per src+color.
 */
export function colorize(src: string, color: string, edge?: number): Promise<string> {
  const key = `${src}|${color}|${edge ?? ''}`
  let job = colored.get(key)
  if (!job) {
    job = loadImage(src).then((img) => paint(img, color, edge))
    colored.set(key, job)
  }
  return job
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function paint(img: HTMLImageElement, color: string, edge?: number): Promise<string> {
  const w = img.naturalWidth
  const h = img.naturalHeight
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(img, 0, 0)
  const data = ctx.getImageData(0, 0, w, h)
  const px = data.data

  const r = edge ?? Math.max(2, Math.round(Math.min(w, h) * 0.018))
  const solid = new Uint8Array(w * h)
  for (let i = 0; i < w * h; i++) {
    const a = px[i * 4 + 3] / 255
    const lum = (px[i * 4] * 0.299 + px[i * 4 + 1] * 0.587 + px[i * 4 + 2] * 0.114) / 255
    solid[i] = a > 0.5 && lum < 0.4 ? 1 : 0
  }
  const inner = blurred(erode(solid, w, h, r), w, h)

  const [cr, cg, cb] = hexToRgb(color)
  for (let i = 0; i < w * h; i++) {
    const k = inner[i]
    if (k === 0) continue
    const o = i * 4
    px[o] = px[o] * (1 - k) + cr * k
    px[o + 1] = px[o + 1] * (1 - k) + cg * k
    px[o + 2] = px[o + 2] * (1 - k) + cb * k
  }
  ctx.putImageData(data, 0, 0)
  return new Promise((resolve) => canvas.toBlob((b) => resolve(URL.createObjectURL(b!)), 'image/png'))
}

/** Square erosion: a pixel survives only if its whole (2r+1)² window is solid. */
function erode(m: Uint8Array, w: number, h: number, r: number): Uint8Array {
  const pass = (src: Uint8Array, horizontal: boolean) => {
    const out = new Uint8Array(w * h)
    const len = horizontal ? w : h
    const lines = horizontal ? h : w
    for (let l = 0; l < lines; l++) {
      const at = (i: number) => (horizontal ? l * w + i : i * w + l)
      let run = 0
      const runs = new Int32Array(len)
      for (let i = 0; i < len; i++) runs[i] = run = src[at(i)] ? run + 1 : 0
      run = 0
      for (let i = len - 1; i >= 0; i--) {
        run = src[at(i)] ? run + 1 : 0
        // solid r pixels to the left and r to the right
        if (runs[i] > r && run > r) out[at(i)] = 1
      }
    }
    return out
  }
  return pass(pass(m, true), false)
}

/** 3×3 box blur to anti-alias the color edge. */
function blurred(m: Uint8Array, w: number, h: number): Float32Array {
  const out = new Float32Array(w * h)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let s = 0
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += m[(y + dy) * w + x + dx]
      out[y * w + x] = s / 9
    }
  }
  return out
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
