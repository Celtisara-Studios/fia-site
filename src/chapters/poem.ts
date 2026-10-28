/**
 * Mictēcacihuātl, by Fia Bondy: her words, line for line, as they fall on the pages of the
 * open book (PoemBook.tsx). A page holds 20 ruled lines, with a blank one between stanzas,
 * and a stanza never breaks across a page.
 */

/** A line of the poem, or one La Catrina says aloud (italic, with a marigold highlight). */
export type Line = string | { said: string }
export type Stanza = Line[]

export const POEM = {
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
  ] satisfies Stanza[][] as Stanza[][],
  signature: 'Fia Bondy',
}
