/**
 * Mictēcacihuātl, by Fia Bondy.
 *
 * Only the lines from the brief are filled in. Each `{ todo }` renders as a
 * visible gap on the page until it's replaced with Fia's text.
 */
export type Line = string | { todo: string }

export type Stanza = {
  lines: Line[]
  refrain?: boolean
  /** A note in the margin; `src` swaps in a scan of her handwriting. */
  note?: { text: string; src?: string }
}

export const POEM = {
  title: 'Mictēcacihuātl',
  subtitle: 'A poem about La Catrina',
  intro: { todo: 'Fia’s short intro on La Catrina (two to four sentences)' } as Line,
  stanzas: [
    {
      lines: ['She looks at the people', 'Of the glittering city…', { todo: 'rest of the first stanza' }],
    },
    { refrain: true, lines: ['Do not be afraid', 'It is not the end.'] },
    {
      lines: [{ todo: 'middle stanzas, one block each' }],
      note: { text: 'margin note, in her handwriting' },
    },
    { lines: ['Death is equal', 'Death is infinite', 'Death is for everyone', 'And we must not be afraid'] },
  ] satisfies Stanza[] as Stanza[],
  signature: 'Fia Bondy',
}
