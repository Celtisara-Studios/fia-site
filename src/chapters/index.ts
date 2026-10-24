import type { ComponentType } from 'react'
import type { Point } from '../fx/ink'
import PoemChapter from './PoemChapter'

export type ChapterProps = {
  color: string
  onClose: (from?: Point) => void
}

export type Chapter = {
  /** The one color this chapter (and its object on the desk) fills with. */
  color: string
  Component: ComponentType<ChapterProps>
}

export const CHAPTERS = {
  // Marigold: cempasúchil, the Day of the Dead flower.
  writing: { color: '#f0a01e', Component: PoemChapter },
} satisfies Record<string, Chapter>

export type ChapterId = keyof typeof CHAPTERS

export const isChapterId = (v: string): v is ChapterId => v in CHAPTERS
