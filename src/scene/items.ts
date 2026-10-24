import type { ChapterId } from '../chapters'

/**
 * Width of one lap of the desk in world px (see DESIGN_HEIGHT in Scene.tsx); everything repeats after this.
 * Just long enough for the objects, so panning never crosses bare desk: the headphones at the end
 * of a lap sit ~60px left of the next lap's laptop.
 */
export const LOOP = 2280

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
    // Right of the books, left of the name on load; the name's left margin in scene.css clears it.
    x: 351,
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
    x: 465,
    surface: 'desk',
    h: 15.9,
    y: 47.8,
  },
  {
    id: 'pencil',
    src: '/art/pencil.svg',
    alt: 'A pencil',
    // left of the notebook, turned to stand more upright
    x: 337,
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
    x: 457,
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
    x: 823,
    surface: 'desk',
    h: 34.9,
    y: 80.6,
    flat: true,
  },
  {
    id: 'books',
    src: '/art/books.svg',
    alt: 'A stack of books',
    // back left, rising in front of the wall: fully in frame on load, ~19px clear of the lamp's elbow
    action: 'books',
    label: 'Books',
    labelAbove: true, // the laptop's lid is right below the stack
    x: 120,
    surface: 'desk',
    h: 36.7,
    y: 57,
  },
  {
    id: 'laptop',
    src: '/art/laptop.svg',
    alt: 'A closed laptop',
    // front left, in front of the books; the left edge of the screen cuts it on load (a bit
    // over half shows) and its right corner stays ~14px clear of the pencil
    x: 30,
    surface: 'desk',
    h: 31.6,
    y: 85.2,
  },
  {
    id: 'water-bottle',
    src: '/art/water-bottle.svg',
    alt: "Fia's water bottle",
    // back of the desk in the gap between the mat and the sewing machine;
    // right of where the name ends on load (~1090px), so it doesn't cover the "y"
    x: 1150,
    surface: 'desk',
    h: 24,
    y: 50,
  },
  {
    id: 'headphones',
    src: '/art/headphones.svg',
    alt: 'A pair of headphones',
    // down at the front, their top-left corner just over the yarn basket's bottom-right;
    // just past the right edge on load: found by panning
    href: 'https://open.spotify.com/playlist/3G8By3kXTjUQSF3y3BYsiy',
    label: 'Playlist',
    labelAbove: true, // below them is the desk's front edge
    x: 1880,
    surface: 'desk',
    h: 26.8,
    y: 85,
  },
  {
    id: 'f1-poster',
    src: '/art/f1-poster.svg',
    hoverSrc: '/art/f1-poster-color.svg',
    alt: 'A Formula 1 poster',
    // on the wall right of the yarn basket, above the headphones; its top runs off the screen.
    // Framed and matted, so it's taller than the print alone (the print is ~35vh).
    x: 1995,
    surface: 'wall',
    h: 40.8,
    y: 33,
  },
  {
    id: 'eraser',
    src: '/art/eraser.svg',
    alt: 'An eraser',
    // just off the mat's top-left corner, between the puppy and the notebook
    x: 565,
    surface: 'desk',
    h: 6.5,
    y: 51.5,
  },
  {
    id: 'paper-pad',
    src: '/art/paper-pad.svg',
    alt: 'A clipped stack of paper',
    // front of the desk right of the mat, just under the sewing machine's base (its top edge
    // stops at the machine's bottom), filling the bare desk there
    x: 1240,
    surface: 'desk',
    h: 15,
    y: 84.5,
  },
  {
    id: 'glasses',
    src: '/art/glasses.svg',
    alt: 'A pair of glasses',
    // front of the desk, halfway between the paper pad and the headphones' cable; ~16px in
    // front of the sewing machine's base
    x: 1530,
    surface: 'desk',
    h: 12,
    y: 83,
  },
  {
    id: 'sewing-machine',
    src: '/art/sewing-machine.svg',
    alt: 'A sewing machine',
    // back right, where the books used to be, ~34px past the water bottle; the right edge of
    // the screen cuts it on most laptops. Real-machine scale (~45cm wide next to the ~21cm
    // notebook), set back on the desk.
    x: 1420,
    surface: 'desk',
    h: 49.3,
    y: 69,
  },
  {
    id: 'yarn-basket',
    src: '/art/yarn-basket.svg',
    alt: 'A basket of yarn',
    // Right of the sewing machine, its left end tucked ~15px behind the machine's right end
    // (set further back, so it draws behind). The one deliberate overlap: the machine in
    // front is solid, with no see-through parts.
    x: 1735,
    surface: 'desk',
    h: 32,
    y: 63,
  },
]
