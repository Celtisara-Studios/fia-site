/**
 * The lamp's tour: where its light lands, in order, and what the floating panel beside
 * each stop says. The words are placeholders until Fia writes her own.
 */
export type TourStop = {
  /** data-id of what the light lands on (an object, or the name on the wall). */
  target: string
  /** A heading on the panel; only the welcome has one. */
  title?: string
  line: string
  /** Which side of the target the panel sits on; it's kept on screen either way. */
  side: 'right' | 'left' | 'below' | 'above'
  /**
   * How far the pool of light reaches past the target's box, across and down, as
   * multiples of its half-width and half-height. 1.33 each reaches about to the corners;
   * the name is wide and right next to the lamp, so its pool is narrower and taller.
   */
  fit?: [number, number]
}

/** Her name, then the three things on the desk that open: Writing, Visual Art, Fashion. */
export const TOUR: TourStop[] = [
  {
    target: 'name',
    title: 'Hi, I’m Fia!',
    line: 'Welcome to my desk. Everything on it is something I made or love.',
    side: 'right',
    fit: [1.12, 1.6],
  },
  {
    target: 'notebook',
    line: 'Start with my writing: open the notebook to read my poems.',
    side: 'below',
  },
  {
    target: 'cutting-mat',
    line: 'My visual art lives on the cutting mat.',
    side: 'below',
  },
  {
    // past the right edge at the start on most screens, so the desk pans to bring it in
    target: 'sewing-machine',
    line: 'And the sewing machine has the things I’ve made to wear.',
    side: 'left',
  },
]
