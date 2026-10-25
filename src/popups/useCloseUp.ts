import { useCallback, useRef, useState } from 'react'

/**
 * One piece of a set held up close, or none (the overview): which one, which way the last
 * move went (so the next can come in from that side), and moves that wait for the next big
 * image to decode, so it never flashes in empty. Used by the gallery.
 * `bigSrc` must be stable (a module-level function).
 */
export function useCloseUp(count: number, bigSrc: (i: number) => string) {
  const [focus, setFocus] = useState<number | null>(null)
  const [dir, setDir] = useState<1 | -1 | 0>(0)
  /** The latest piece asked for, so a slow image can't land after a later click. */
  const wanted = useRef(-1)
  /** The piece last opened from the overview, to put keyboard focus back on. */
  const opened = useRef<number | null>(null)

  const show = useCallback(
    (i: number, step: 1 | -1 | 0) => {
      wanted.current = i
      const img = new Image()
      img.src = bigSrc(i)
      img
        .decode()
        .catch(() => undefined)
        .then(() => {
          if (wanted.current !== i) return
          setDir(step)
          setFocus(i)
        })
    },
    [bigSrc],
  )

  const open = useCallback(
    (i: number) => {
      opened.current = i
      show(i, 0)
      // the other big ones too, now someone's looking
      for (let j = 0; j < count; j++) new Image().src = bigSrc(j)
    },
    [count, bigSrc, show],
  )

  const go = useCallback(
    (step: 1 | -1) => {
      if (focus !== null) show((focus + step + count) % count, step)
    },
    [focus, count, show],
  )

  const back = useCallback(() => {
    wanted.current = -1
    setFocus(null)
  }, [])

  return { focus, dir, open, go, back, opened }
}
