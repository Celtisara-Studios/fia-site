import { useLayoutEffect, useRef, type CSSProperties, type MouseEvent } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { ChapterProps } from '.'
import { POEM, type Line } from './poem'
import './chapter.css'

gsap.registerPlugin(ScrollTrigger)

const HIDDEN = 'inset(0% 100% 0% 0%)'
const SHOWN = 'inset(0% 0% 0% 0%)'

const pointOf = (e: MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect()
  return e.detail === 0 ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: e.clientX, y: e.clientY }
}

function Ln({ line }: { line: Line }) {
  if (typeof line === 'string') return <span className="ln">{line}</span>
  return <span className="ln is-todo">[ {line.todo} ]</span>
}

export default function PoemChapter({ color, onClose }: ChapterProps) {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      // The cover writes itself in as the flood settles.
      gsap
        .timeline()
        .fromTo('.cover-title', { clipPath: HIDDEN }, { clipPath: SHOWN, duration: 1.3, ease: 'power3.inOut' }, 0.05)
        .from(
          '.cover-kicker, .cover-sub, .cover-name, .cover-cue',
          { opacity: 0, y: 14, duration: 1, ease: 'power2.out', stagger: 0.07 },
          0.55,
        )

      // The cover sinks back as the first page slides over it.
      gsap.to('.cover-inner', {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: { trigger: '.page', start: 'top bottom', end: 'top top', scrub: true },
      })

      gsap.from('.page-intro', {
        opacity: 0,
        y: 20,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.page-intro', start: 'top 88%' },
      })

      // Each line is written left to right as you scroll through its stanza.
      gsap.utils.toArray<HTMLElement>('.stanza, .sign').forEach((el) => {
        gsap.fromTo(
          el.querySelectorAll('.ln'),
          { clipPath: HIDDEN },
          {
            clipPath: SHOWN,
            ease: 'none',
            stagger: 0.6,
            scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 60%', scrub: 0.8 },
          },
        )
      })

      // Margin notes drift a little faster than the page.
      gsap.utils.toArray<HTMLElement>('.note').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 40 },
          { y: -40, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
    }, root)
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => ctx.revert()
  }, [])

  const close = (e: MouseEvent<HTMLElement>) => onClose(pointOf(e))

  return (
    <article ref={root} className="chapter" style={{ '--accent': color } as CSSProperties} aria-labelledby="ch-title">
      <button type="button" className="ch-close" onClick={close}>
        Close
      </button>

      <section className="cover">
        <p className="cover-name">Fia Bondy</p>
        <div className="cover-inner">
          <p className="cover-kicker">
            <span>01</span>
            <span>Writing</span>
          </p>
          <h1 id="ch-title" className="cover-title">
            {POEM.title}
          </h1>
          <p className="cover-sub">{POEM.subtitle}</p>
        </div>
        <p className="cover-cue" aria-hidden>
          Scroll to read
        </p>
      </section>

      <section className="page">
        <header className="page-head">
          <p className="page-intro">
            <Ln line={POEM.intro} />
          </p>
        </header>

        <div className="poem">
          {POEM.stanzas.map((s, i) => (
            <div key={i} className={s.refrain ? 'stanza is-refrain' : 'stanza'}>
              <p className="stanza-lines">
                {s.lines.map((l, j) => (
                  <Ln key={j} line={l} />
                ))}
              </p>
              {s.note && (
                <aside className="note">{s.note.src ? <img src={s.note.src} alt={s.note.text} /> : s.note.text}</aside>
              )}
            </div>
          ))}

          <p className="sign">
            <span className="ln">— {POEM.signature}</span>
          </p>

          <footer className="page-end">
            <button type="button" className="end-close" onClick={close}>
              Close the notebook
            </button>
          </footer>
        </div>
      </section>
    </article>
  )
}
