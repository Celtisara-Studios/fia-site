/**
 * Fia's visual art, in the order the gallery hangs it: three rows (three, three, two), the
 * pieces in each row the same height (Gallery.tsx), and the same order going round them up close. Images in public/art/gallery/: `<id>.webp` (1400px) for a
 * piece held up close, `<id>-thumb.webp` (640px) for the wall of all of them.
 */
export type Piece = { id: string; title: string; alt: string; w: number; h: number }

export const ART: Piece[] = [
  {
    id: 'once-upon-a-time',
    title: 'Once Upon a Time',
    alt: 'A large collage of dragons, moons, a burning tree and a sun with an eye, around the hand-lettered words “Once upon a time…”',
    w: 1083,
    h: 1400,
  },
  {
    id: 'crochet-blanket',
    title: 'Mini Crochet Blanket',
    alt: 'A small purple and grey crochet blanket with an orange border, covered in stitched-on drawings: pride flags, padlocks on bridges, an “ACT UP” sign and “SILENCE=DEATH”',
    w: 1361,
    h: 1400,
  },
  {
    id: 'art-deco',
    title: 'Art Deco',
    alt: 'A square painting of gold Art Deco arches and fans on deep burgundy',
    w: 1400,
    h: 1386,
  },
  {
    id: 'sunflowers',
    title: 'Sunflowers',
    alt: 'Three sunflowers with glittering golden petals and dark beaded centres, in a cut-glass vase',
    w: 1050,
    h: 1400,
  },
  {
    id: 'pumpkin-spice-latte',
    title: 'Pumpkin Spice Latte',
    alt: 'A fashion drawing of a figure in fishnet tights, wearing an off-the-shoulder top made from pumpkin spice latte packaging',
    w: 822,
    h: 1400,
  },
  {
    id: 'rhinestone-flower-pot',
    title: 'Rhinestone Flower Pot',
    alt: 'Two red and orange flowers on green stems, covered in rhinestones, in a jewelled green pot on a purple stand',
    w: 1050,
    h: 1400,
  },
  {
    id: 'watch',
    title: 'Watch',
    alt: 'A charcoal and white drawing of a metal wristwatch on tan paper',
    w: 1400,
    h: 955,
  },
  {
    id: 'rhinestone-bag',
    title: 'Rhinestone Bag',
    alt: 'A clutch bag covered in iridescent rhinestones in a woven pattern',
    w: 1400,
    h: 1027,
  },
]

/** Which pieces hang in each row of the gallery wall. */
export const ROWS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7],
]
