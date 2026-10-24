import type { ChapterId } from '../chapters'

/** Width of one lap of the desk in world px (see DESIGN_HEIGHT in Scene.tsx); everything repeats after this. */
export const LOOP = 4800

export type Item = {
  id: string
  /** Transparent PNG from public/art/: black ink, no white background. */
  src: string
  /**
   * Optional hand-colored version, same canvas as `src`. Without it, the solid
   * black areas of `src` are filled with the chapter color automatically.
   */
  colorSrc?: string
  /** Fades in over `src` on hover (same frame), e.g. a poster's colour version. */
  hoverSrc?: string
  alt: string
  /** World x of the object's center, 0 – LOOP (just under LOOP sits left of the first view). */
  x: number
  /** 'wall' things hang on the wall and drift with it, slower than the desk. */
  surface: 'desk' | 'wall'
  /** Object height in vh. */
  h: number
  /** Where the object's bottom edge sits, in % of screen height. */
  y?: number
  /** Opening this object fills it with the chapter's color. */
  chapter?: ChapterId
  /** 'lamp' switches the lamp on and off; 'books' opens the reading list. */
  action?: 'lamp' | 'books'
  /** Opens this link in a new tab (e.g. a playlist). */
  href?: string
  /** Lies flat on the desk under everything else (a mat), regardless of depth. */
  flat?: boolean
  /** Turn on the desk in degrees, clockwise, around the object's center. */
  rotate?: number
  label?: string
  /** Put the label above the object (when something sits just below it). */
  labelAbove?: boolean
}

export const SURFACE_Y: Record<Item['surface'], number> = { desk: 73.6, wall: 34 }

/**
 * Objects never stack: give each one its own clear space on the desk. Their
 * cut-outs (lenses, highlights) are see-through, so anything beneath shows through.
 * Only tuck something behind an object that's solid all the way through.
 *
 * x is in px on a 780px-tall screen and scales with screen height (Scene.tsx);
 * h and y are in % of screen height. Started from Callum's artboard (Oct 2026).
 */
export const ITEMS: Item[] = [
  {
    id: 'lamp',
    src: '/art/lamp.svg',
    alt: 'An adjustable desk lamp',
    // Left of the name on load; the name's left margin in scene.css clears it.
    x: 151,
    action: 'lamp',
    surface: 'desk',
    h: 40.3,
    y: 52.6,
  },
  {
    id: 'puppy',
    src: '/art/puppy.svg',
    alt: 'A husky puppy figure',
    // at the back of the desk, right of the lamp
    x: 265,
    surface: 'desk',
    h: 15.9,
    y: 47.8,
  },
  {
    id: 'pencil',
    src: '/art/pencil.svg',
    alt: 'A pencil',
    // left of the notebook, turned to stand more upright
    x: 137,
    surface: 'desk',
    h: 10,
    y: 68.4,
    rotate: -27.8,
  },
  {
    // Stand-in until the spiral notebook is drawn: swap src, keep the rest.
    id: 'notebook',
    src: '/art/sketchbook.png',
    alt: 'A notebook with a ribbon bookmark',
    x: 257,
    surface: 'desk',
    h: 20.6,
    y: 73.5,
    chapter: 'writing',
    label: 'Writing',
  },
  {
    id: 'cutting-mat',
    src: '/art/cutting-mat.svg',
    alt: 'A cutting mat',
    x: 623,
    surface: 'desk',
    h: 34.9,
    y: 80.6,
    flat: true,
  },
  {
    id: 'books',
    src: '/art/books.svg',
    alt: 'A stack of books',
    // back right, rising in front of the wall; as low as it goes while clearing the laptop
    action: 'books',
    label: 'Books',
    labelAbove: true, // the laptop's lid is right below the stack
    x: 1187,
    surface: 'desk',
    h: 36.7,
    y: 57,
  },
  {
    id: 'laptop',
    src: '/art/laptop.svg',
    alt: 'A closed laptop',
    // front right, ~35px off the mat's right edge
    x: 1134,
    surface: 'desk',
    h: 31.6,
    y: 85.2,
  },
  {
    id: 'headphones',
    src: '/art/headphones.svg',
    alt: 'A pair of headphones',
    // just past the right edge on load: found by panning
    href: 'https://open.spotify.com/playlist/3G8By3kXTjUQSF3y3BYsiy',
    label: 'Playlist',
    x: 1460,
    surface: 'desk',
    h: 26.8,
    y: 64.7,
  },
  {
    id: 'f1-poster',
    src: '/art/f1-poster.svg',
    hoverSrc: '/art/f1-poster-color.svg',
    alt: 'A Formula 1 poster',
    // on the wall right of the books, above the headphones; its top runs off the screen.
    // Framed and matted, so it's taller than the print alone (the print is ~35vh).
    x: 1470,
    surface: 'wall',
    h: 40.8,
    y: 33,
  },
  {
    id: 'eraser',
    src: '/art/eraser.svg',
    alt: 'An eraser',
    // just off the mat's top-left corner, between the puppy and the notebook
    x: 365,
    surface: 'desk',
    h: 6.5,
    y: 51.5,
  },
  {
    id: 'paper-pad',
    src: '/art/paper-pad.svg',
    alt: 'A clipped stack of paper',
    // left of the lamp: the end of the lap, found by dragging the desk to the right
    x: LOOP - 60,
    surface: 'desk',
    h: 15,
    y: 72,
  },
  {
    id: 'sewing-machine',
    src: '/art/sewing-machine.svg',
    alt: 'A sewing machine',
    // further left than the paper pad: off-screen at the start, found by dragging right.
    // Real-machine scale (~45cm wide next to the ~21cm notebook), set back on the desk.
    x: LOOP - 405,
    surface: 'desk',
    h: 49.3,
    y: 69,
  },
  {
    id: 'yarn-basket',
    src: '/art/yarn-basket.svg',
    alt: 'A basket of yarn',
    // Tucked behind the sewing machine's left end (set further back, so it draws behind).
    // The one deliberate overlap: the machine in front is solid, with no see-through parts.
    x: LOOP - 680,
    surface: 'desk',
    h: 32,
    y: 63,
  },
]
