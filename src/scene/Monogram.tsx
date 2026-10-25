import { useId, type CSSProperties } from 'react'

/** Fia's "FB", hand-lettered (70 × 54): the F, then the B with its long tail. */
const F = 'M21.03,28.49l-6-.27-7.44.38.92,15.69-.48,4.91c-1.58-.09-2.35-1.49-2.45-3.23l-1-17.19c-2.25-.28-3.38-.62-4.58-1.57l4.63-.44L2.37,7.79c-.25-2.08-1.29-6.07,1.49-7.13,3.13-1.2,7.59-.52,10.9.17l10.6,2.2c1.75.36,3.29.52,4.92,1.43C22.24,4.32,14.19-.21,5.83,1.59c-1.27.27-1.55,3.35-1.38,4.58l2.92,20.19,8.11-.21c2.09-.05,3.95,1,5.56,2.34Z'
const B = 'M38.22,51.01c5.69,3.47,28.36-2.25,27.91-10.44s-6.21-14.04-13.61-16.4l-8.54-2.72.13,17.71c-.91.22-2.29-.32-2.85-.97l-.57-18.08.1-15.07,2.26.93c6.5-4.86,18.99,1.65,18.05,6.32-.82,4.03-10.28,7.05-16.4,8.22l12.71,4.72c6.59,2.45,11.04,8.4,12.45,15.31.61,2.97-.51,6.01-3.16,7.77-12.49,8.28-27.18,8.85-37.7-2.93l9.23,5.62ZM57.71,10.27c-.01-2.71-3.84-5.01-8.05-4.71-1.81-.17-5.91.57-6.24,2.84-.47,3.21.07,6.47.31,9.77,5.43-1.15,13.99-4.88,13.98-7.9Z'

/**
 * The pen's path through the letters, in the order she'd write them: the F's top, its stem,
 * its bar; the B's stem, top bowl, then the big bottom bowl sweeping out into the tail.
 */
const STROKES = [
  'M29 4 C20 1 10 0 5 2',
  'M5 2 L7 27 L8 48',
  'M1 27 L21 28',
  'M44 3 L44 38',
  'M44 8 C52 4 60 7 58 11 C56 15 48 18 44 20',
  'M45 22 C60 27 68 34 67 42 C66 50 50 54 38 51 L29 47',
]

/**
 * Her initials, written onto something on hover (scene.css): the pen goes along each
 * stroke in turn, uncovering the letters as it goes, then the whole monogram settles in.
 * `x`, `y` are its centre and `w` its width, in % of the object's drawing; `turn` tilts it.
 */
export function Monogram({ x, y, w, turn }: { x: number; y: number; w: number; turn: number }) {
  const mask = `monogram-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <svg
      className="doodle"
      viewBox="-3 -3 76 61"
      style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, rotate: `${turn}deg` } as CSSProperties}
      aria-hidden
    >
      <mask id={mask} maskUnits="userSpaceOnUse" x="-3" y="-3" width="76" height="61">
        {STROKES.map((d, i) => (
          <path key={i} className="doodle-pen" d={d} pathLength={1} style={{ '--at': i } as CSSProperties} />
        ))}
        <rect className="doodle-rest" x="-3" y="-3" width="76" height="61" />
      </mask>
      <g className="doodle-ink" mask={`url(#${mask})`}>
        <path d={F} />
        <path d={B} />
      </g>
    </svg>
  )
}
