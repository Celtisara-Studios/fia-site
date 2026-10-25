import type { ComponentType } from 'react'
import type { Point } from '../fx/ink'
import PoemBook from './PoemBook'

export type ChapterProps = {
  color: string
  onClose: (from?: Point) => void
}

export type Chapter = {
  /** The one color this chapter (and its object on the desk) fills with. */
  color: string
  Component: ComponentType<ChapterProps>
  /** Opens as a popup over the dimmed desk instead of flooding the screen with its color. */
  popup?: boolean
}

export const CHAPTERS = {
  // Marigold: cempasúchil, the Day of the Dead flower.
  writing: { color: '#f0a01e', Component: PoemBook, popup: true },
} satisfies Record<string, Chapter>

export type ChapterId = keyof typeof CHAPTERS

export const isChapterId = (v: string): v is ChapterId => v in CHAPTERS
