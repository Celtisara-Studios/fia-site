/**
 * Fia Bondy's poems, in the order the notebook's contents lists them: her words, line for line,
 * as they fall on its pages (PoemBook.tsx). A page holds 20 ruled lines, with a blank one
 * between stanzas, and a stanza never breaks across a page. A line too long for the page turns
 * over onto the next, indented. Each poem opens on a left-hand title page facing its first
 * page, so each has an odd number of pages.
 */

/** A line of a poem, or one said aloud (italic, with a marigold highlight). */
export type Line = string | { said: string }
export type Stanza = Line[]

export type Poem = {
  id: string
  title: string
  /** On its title page, under the title: how to say it, what it means, the story behind it… */
  say?: string
  meaning?: string
  intro?: string
  /** …or the lines it starts from, and where they're from. */
  epigraph?: { quote: string; source: string }
  pages: Stanza[][]
}

export const AUTHOR = 'Fia Bondy'

const MICTECACIHUATL: Poem = {
  id: 'mictecacihuatl',
  title: 'Mictēcacihuātl',
  say: 'Meek-te-ka-see-wah-tl',
  meaning:
    'In Aztec mythology, she is a death deity and consort of Mictlāntēcutli, god of the dead and ruler of Mictlān, the lowest level of the underworld.',
  intro:
    'La Catrina is Mexico’s iconic skeletal figure, a satirical symbol of death and vanity, created by artist José Guadalupe Posada around 1910 to mock Mexican elites adopting European fashions, who later became a beloved symbol for the Day of the Dead (Día de los Muertos), representing that death brings equality to all, rich or poor.',
  pages: [
    [
      ['She looks at the people', 'Of the glittering city', 'Who have air to breathe', 'Who are not thinking', 'If they get to live another day'],
      [
        'She looks at the people',
        'Of the dimmed city',
        'Who are shrouded in anguish',
        'Holding onto their loved ones',
        'Taking their final breath',
        'Of fog that will take them',
        'Into the abyss',
      ],
      ['But she will not let it'],
      ['She wanders in the street', 'Looking for death', 'Looking for light', 'To dance in'],
    ],
    [
      [
        'She sees everything',
        'She sees all of the fear',
        'And it is her job to say',
        { said: '“Do not be afraid' },
        { said: 'It is not the end”' },
      ],
      ['And she dances', 'To ease the pain', 'To show that this', 'Is not a sad time'],
      ['But to the people', 'In the darker city', 'It is'],
      [
        'The people should not suffer',
        'In this deathly haze',
        'While the glittering city',
        'turns away from the smoke',
        'To their golden palaces',
      ],
    ],
    [
      ['She sees everything'],
      ['She sees the children in the streets', 'She warns them', 'To leave', 'To go inside and never come out'],
      ['But they do not listen', 'They never listen', 'Even with her pleas', 'They never listen'],
      [
        'So all she can do',
        'Is dance',
        'Dance for the damned',
        'Dance for the desperate',
        'And say',
        { said: '“Do not be afraid' },
        { said: 'It is not the end.”' },
      ],
    ],
    [
      [
        'But for her',
        'For her it is',
        'As she is cursed to walk the streets',
        'By the gods above',
        'To see the vanity',
        'To see the helplessness',
        'And do nothing to stop it',
      ],
      [
        'In the end',
        'No matter if you are glittering',
        'Or if you are dimmed',
        'if you are white',
        'Or if you are black',
        'If you speak the common tongue',
        'Or speak something that is just as beautiful',
      ],
    ],
    [['Death is equal', 'Death is infinite', 'Death is for everyone', 'And we must not be afraid']],
  ],
}

const MERMAIDS: Poem = {
  id: 'mermaids',
  title: 'I Hear the Mermaids Singing',
  epigraph: {
    quote: '“I have heard the mermaids singing, each to each”',
    source: '(The Love Song of J. Alfred Prufrock, 123)',
  },
  pages: [
    [
      ['I hear the mermaids singing,', 'With their flowing hair and scaly skin', 'With their sharp eyes and songs that sound like lullabies'],
      ['I hear the mermaids singing', 'In a language I cannot understand', 'But I want to, I truly want to'],
      [
        'I hear the mermaids singing',
        // too long for the page: it turns over before "crashing", the rest held together
        'I follow the soft sounds of the waves crashing\u00a0against\u00a0the\u00a0shore',
        'Until they get louder',
      ],
    ],
    [
      ['I hear the mermaids singing', 'Under the surface', 'It is a beautiful song'],
      ['Such a beautiful song'],
      ['I hear the mermaids singing', 'As I close my eyes', 'Ready for them to take me away'],
      ['Please, take me away'],
    ],
    [['All I hear', 'Is the singing', 'Until it stops'], ['The crash of the waves against the shore'], ['Silence']],
  ],
}

export const POEMS: Poem[] = [MICTECACIHUATL, MERMAIDS]
