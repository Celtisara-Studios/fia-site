import { useId, type Ref } from 'react'
import { beamPaths, REST_AIM } from './beam'

/**
 * Lamp on: the room goes dark except where the lamp shines. The beam and the bulb
 * stay clean paper, outlined by two lines from the shade and the curve where it
 * lands. Where it points is an Aim (beam.ts); Scene swings it.
 *
 * One viewport-sized SVG; Scene pans the `.lamp-pan` groups with the desk. Each
 * lamp's shapes are drawn in lamp.svg's own coordinates (698.88 × 1006.88) so they
 * line up with the shade.
 */
const VIEW = '0 0 698.88 1006.88'

// The opening of the shade, copied from lamp.svg; it turns with the head (beam.ts).
const BULB =
  'M474.31,388.03c65.84-24.85,126.53-59.19,182.19-102.17,17.45-13.48,40.81-38.85,33.49-43.64-8.61-5.64-37.75,2.15-56.01,8.84-67.53,24.74-129.38,59.24-185.94,103.4-17.27,13.48-42.12,38.22-33.43,43.37,10.32,6.11,40.53-2.55,59.69-9.79Z'

// First paint is the resting beam; Scene updates these paths as the head swings.
const REST = beamPaths(REST_AIM)

export type LampSpot = {
  key: string
  /** Lamp center in desk px. */
  x: number
  /** Bottom edge, % of screen height. */
  y: number
  /** Height, vh. */
  h: number
}

/** A box the lamp's height tall, centered on x; the wide box lets the height alone set the scale. */
const place = (l: LampSpot) => ({
  x: l.x - 2000,
  width: 4000,
  y: `${l.y - l.h}%`,
  height: `${l.h}%`,
  viewBox: VIEW,
  preserveAspectRatio: 'xMidYMax meet',
  overflow: 'visible',
})

export function LampLight({ lamps, ref }: { lamps: LampSpot[]; ref?: Ref<SVGSVGElement> }) {
  const lit = `${useId()}lit`

  return (
    <svg ref={ref} className="scene-shade" aria-hidden>
      <defs>
        <mask id={lit} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
          <rect width="100%" height="100%" fill="#fff" />
          <g className="lamp-pan">
            {lamps.map((l) => (
              <svg key={l.key} {...place(l)}>
                <path className="beam-cut" d={REST.cut} />
                <ellipse className="beam-pool" {...REST.pool} />
                <g className="lamp-bulb" transform={REST.bulb}>
                  <path d={BULB} />
                </g>
              </svg>
            ))}
          </g>
        </mask>
      </defs>

      <rect className="shade-dark" width="100%" height="100%" mask={`url(#${lit})`} />
      <g className="lamp-pan">
        {lamps.map((l) => (
          <svg key={l.key} {...place(l)}>
            <path className="beam-edge" d={REST.edge} />
          </svg>
        ))}
      </g>
    </svg>
  )
}
