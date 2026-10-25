import type { ChapterId } from '../chapters'

/**
 * Width of one lap of the desk in world px (see DESIGN_HEIGHT in Scene.tsx); everything repeats after this.
 * Just long enough for the objects, so panning never crosses bare desk: the headphones at the end
 * of a lap sit ~80px left of the next lap's laptop.
 */
export const LOOP = 2394

/** How fast the wall moves against the desk: a little slower, so it reads as a step further back. */
export const WALL_SPEED = 0.85

/**
 * The wall's own lap (~3050px): 3 desk laps of its travel, split into 2. So it lines up with
 * the desk again every 3 laps (HOME_LAPS in Scene.tsx), with room for all the polaroids.
 */
export const WALL_LOOP = (LOOP * WALL_SPEED * 3) / 2

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
  /** Live parts drawn over `src` (WallFaces.tsx): the clock's hands, the calendar's month and dates. */
  face?: 'clock' | 'calendar'
  alt: string
  /**
   * World x of the object's center, 0 – LOOP (0 – WALL_LOOP for 'wall' things); just under
   * the lap's end sits left of the first view.
   */
  x: number
  /** 'wall' things hang on the wall and move with it, a little slower than the desk (WALL_SPEED). */
  surface: 'desk' | 'wall'
  /** Object height in vh. */
  h: number
  /** Where the object's bottom edge sits, in % of screen height. */
  y?: number
  /** Opening this object fills it with the chapter's color. */
  chapter?: ChapterId
  /**
   * 'lamp' switches the lamp on and off; 'books' opens the reading list; 'photos' opens the
   * photo viewer here; 'gallery' opens Fia's visual art; 'fashion' what she's made to wear.
   */
  action?: 'lamp' | 'books' | 'photos' | 'gallery' | 'fashion'
  /**
   * Prints of her art lying on a flat object (the mat), ink at rest and their colour on hover.
   * `x`, `y` are each print's centre and `h` its height, in % of the object's top surface;
   * `turn` is how crooked it lies, in degrees.
   */
  prints?: { src: string; colorSrc: string; x: number; y: number; h: number; turn: number }[]
  /** A polaroid's photo, big and in full colour, for the photo viewer (PhotoViewer.tsx). */
  photo?: string
  /** Opens this link in a new tab (e.g. a playlist). */
  href?: string
  /** Lies flat on the desk under everything else (a mat), regardless of depth. */
  flat?: boolean
  /** Turn on the desk in degrees, clockwise, around the object's center. */
  rotate?: number
  label?: string
  /** Fia's hand-lettering of the label, shown instead of the text (which stays for screen readers). */
  labelSrc?: string
  /** Put the label above the object (when something sits just below it). */
  labelAbove?: boolean
  /**
   * Move the label to hug an odd shape: `x` is where its centre goes across the drawing,
   * `y` where its top goes down it, both in % of the drawing from its top left.
   */
  labelAt?: { x?: number; y?: number }
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
    x: 369,
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
    x: 488,
    surface: 'desk',
    h: 15.9,
    y: 47.8,
  },
  {
    id: 'pencil',
    src: '/art/pencil.svg',
    alt: 'A pencil',
    // left of the notebook, turned to stand more upright
    x: 354,
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
    x: 480,
    surface: 'desk',
    h: 20.6,
    y: 73.5,
    chapter: 'writing',
    label: 'Writing',
    labelSrc: '/art/label-writing.svg',
  },
  {
    id: 'cutting-mat',
    src: '/art/cutting-mat.svg',
    alt: 'A cutting mat with prints of Fia’s art on it',
    // Opens her visual art. Three of her pieces lie on it as loose prints, each with a little
    // mat showing between them: Once Upon a Time on the left, Art Deco, then the Watch.
    action: 'gallery',
    prints: [
      {
        src: '/art/print-once-upon-a-time.webp',
        colorSrc: '/art/print-once-upon-a-time-color.webp',
        x: 20,
        y: 48,
        h: 70,
        turn: -3,
      },
      { src: '/art/print-art-deco.webp', colorSrc: '/art/print-art-deco-color.webp', x: 51, y: 40, h: 50, turn: 2 },
      { src: '/art/print-watch.webp', colorSrc: '/art/print-watch-color.webp', x: 81, y: 60, h: 40, turn: -1.5 },
    ],
    // the label sits close under the mat's front edge, clear of the desk's
    label: 'Visual Art',
    labelSrc: '/art/label-visual-art.svg',
    labelAt: { y: 102 },
    x: 864,
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
    label: 'Reading',
    labelSrc: '/art/label-reading.svg',
    labelAbove: true, // the laptop's lid is right below the stack
    x: 126,
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
    x: 32,
    surface: 'desk',
    h: 31.6,
    y: 85.2,
  },
  {
    id: 'water-bottle',
    src: '/art/water-bottle.svg',
    alt: "Fia's water bottle",
    // back of the desk in the gap between the mat and the sewing machine;
    // right of where the name ends on load (~1000px), so it doesn't cover the "y"; low enough
    // that its cap stays under the clock
    x: 1208,
    surface: 'desk',
    h: 24,
    y: 53,
  },
  {
    id: 'headphones',
    src: '/art/headphones.svg',
    alt: 'A pair of headphones',
    // down at the front, their top-left corner just over the yarn basket's bottom-right;
    // just past the right edge on load: found by panning
    href: 'https://open.spotify.com/playlist/3G8By3kXTjUQSF3y3BYsiy',
    label: 'Music',
    labelSrc: '/art/label-music.svg',
    labelAbove: true, // below them is the desk's front edge
    labelAt: { x: 60 }, // over the headband, clear of the yarn basket
    x: 1974,
    surface: 'desk',
    h: 26.8,
    y: 85,
  },
  {
    id: 'f1-poster',
    src: '/art/f1-poster.svg',
    hoverSrc: '/art/f1-poster-color.svg',
    alt: 'A Formula 1 poster',
    // on the wall ~95px right of the World Cup polaroid, over the yarn basket; just high enough
    // that its bottom clears the basket, and its top runs off the screen. Framed and matted,
    // so it's taller than the print alone (the print is ~35vh).
    x: 1918,
    surface: 'wall',
    h: 40.8,
    y: 30.5,
  },
  {
    id: 'wall-clock',
    src: '/art/wall-clock.svg',
    alt: 'A wall clock showing the time',
    face: 'clock',
    // high on the wall (top ~2.6% from the top of the screen), ~145px right of the name's "y"
    // on load and well above the water bottle
    x: 1239,
    surface: 'wall',
    h: 15.4,
    y: 18,
  },
  {
    id: 'wall-calendar',
    src: '/art/wall-calendar.svg',
    alt: 'A wall calendar on this month, with today circled',
    face: 'calendar',
    // ~40px right of the clock, its top level with the clock's; its bottom stays just above
    // the sewing machine's thread
    x: 1404,
    surface: 'wall',
    h: 22,
    y: 24.5,
  },
  // Polaroids of Fia's photos, each a little crooked and at its own height; ink at rest, their
  // colour on hover, and a click holds any of them up close in the photo viewer, which goes
  // round all of them. One between the calendar and the F1 poster (~90px from each); the
  // other four scattered past the poster ~115px apart, up to the end of the wall's lap.
  {
    id: 'polaroid-world-cup',
    src: '/art/polaroid-world-cup.webp',
    hoverSrc: '/art/polaroid-world-cup-color.webp',
    photo: '/art/polaroid-world-cup-large.webp',
    action: 'photos',
    alt: 'A polaroid from a rainy World Cup match, two people in ponchos in the stands',
    // ~90px right of the calendar, its bottom just above the sewing machine's spool
    x: 1619,
    surface: 'wall',
    h: 18,
    y: 22,
    rotate: -5,
  },
  {
    id: 'polaroid-rome',
    src: '/art/polaroid-rome.webp',
    hoverSrc: '/art/polaroid-rome-color.webp',
    photo: '/art/polaroid-rome-large.webp',
    action: 'photos',
    alt: 'A polaroid at the Trevi Fountain, one person sitting on another’s shoulders',
    x: 2222,
    surface: 'wall',
    h: 18,
    y: 26,
    rotate: 4,
  },
  {
    id: 'polaroid-map',
    src: '/art/polaroid-map.webp',
    hoverSrc: '/art/polaroid-map-color.webp',
    photo: '/art/polaroid-map-large.webp',
    action: 'photos',
    alt: 'A polaroid of five people in front of a huge painted map of Italy in a gilded museum gallery',
    x: 2452,
    surface: 'wall',
    h: 18,
    y: 33,
    rotate: -3,
  },
  {
    id: 'polaroid-party',
    src: '/art/polaroid-party.webp',
    hoverSrc: '/art/polaroid-party-color.webp',
    photo: '/art/polaroid-party-large.webp',
    action: 'photos',
    alt: 'A polaroid of a group hug at a party',
    x: 2682,
    surface: 'wall',
    h: 18,
    y: 22,
    rotate: 2,
  },
  {
    id: 'polaroid-race',
    src: '/art/polaroid-race.webp',
    hoverSrc: '/art/polaroid-race-color.webp',
    photo: '/art/polaroid-race-large.webp',
    action: 'photos',
    alt: 'A polaroid of someone waving a Ferrari flag in a grandstand',
    // ends ~80px before the wall's lap does, so on load the previous lap's copy is off-screen left
    x: 2912,
    surface: 'wall',
    h: 18,
    y: 30,
    rotate: -2,
  },
  {
    id: 'paper-pad',
    src: '/art/paper-pad.svg',
    alt: 'A clipped stack of paper',
    // front of the desk right of the mat (~70px clear), under the left end of the sewing
    // machine's base, ~80px left of the machine's label
    x: 1255,
    surface: 'desk',
    h: 15,
    y: 84.5,
  },
  {
    id: 'glasses',
    src: '/art/glasses.svg',
    alt: 'A pair of glasses',
    // at the back of the desk in the bare stretch behind the headphones and the next lap's
    // laptop: ~80px right of the headphones' label, ~130px left of the next books, and just
    // clear of the laptop's far corner
    x: 2200,
    surface: 'desk',
    h: 12,
    y: 54,
  },
  {
    id: 'sewing-machine',
    src: '/art/sewing-machine.svg',
    alt: 'A sewing machine',
    // back right, where the books used to be, ~34px past the water bottle; the right edge of
    // the screen cuts it on most laptops. Real-machine scale (~45cm wide next to the ~21cm
    // notebook). Brought forward enough to clear the wall above it for the clock, calendar
    // and polaroids; the front of its base now sits just behind the paper pad.
    // Its label is tucked just under the front edge of the base, which slopes up to the right,
    // so it sits left of centre where the base comes lowest; clear of the paper pad.
    // Opens what she's made to wear.
    action: 'fashion',
    label: 'Fashion',
    labelSrc: '/art/label-fashion.svg',
    labelAt: { x: 42, y: 97.5 },
    x: 1491,
    surface: 'desk',
    h: 49.3,
    y: 73,
  },
  {
    id: 'yarn-basket',
    src: '/art/yarn-basket.svg',
    alt: 'A basket of yarn',
    // Right of the sewing machine, its left end tucked ~15px behind the machine's right end
    // (set further back, so it draws behind). The one deliberate overlap: the machine in
    // front is solid, with no see-through parts.
    x: 1807,
    surface: 'desk',
    h: 32,
    y: 63,
  },
]
