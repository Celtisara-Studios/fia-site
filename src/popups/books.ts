/**
 * Spine colours for the reading list: muted, inky tones that sit with the F1 poster's
 * red and navy, so the colour on the site feels like one set of paints.
 */
const SPINE = {
  red: '#b32a2a',
  navy: '#403f59',
  ochre: '#c98a2b',
  plum: '#6e4a5c',
  teal: '#3e6b6e',
  sage: '#7f9171',
  tan: '#d3bc9c',
}

/** Fia's reading list, shown when the book stack on the desk is opened. */
export const BOOKS: { title: string; author: string; spine: string }[] = [
  { title: 'Eragon', author: 'Christopher Paolini', spine: SPINE.teal },
  { title: 'Carrie', author: 'Stephen King', spine: SPINE.red },
  { title: 'A Raisin in the Sun', author: 'Lorraine Hansberry', spine: SPINE.ochre },
  { title: 'Macbeth', author: 'Shakespeare', spine: SPINE.plum },
  { title: 'Keeper of the Lost Cities', author: 'Shannon Messenger', spine: SPINE.sage },
  { title: 'Ring Shout', author: 'P. Djèlí Clark', spine: SPINE.tan },
  { title: '1919', author: 'Eve L. Ewing', spine: SPINE.navy },
  { title: 'Animal Farm', author: 'George Orwell', spine: SPINE.red },
  { title: 'Sorcery of Thorns', author: 'Margaret Rogerson', spine: SPINE.teal },
  { title: 'Strange Case of Dr. Jekyll and Mr. Hyde', author: 'Robert Louis Stevenson', spine: SPINE.plum },
]
