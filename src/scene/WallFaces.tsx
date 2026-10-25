import { useState, type CSSProperties } from 'react'
import { markerLoop } from '../fx/marker'

/**
 * The live parts of the wall clock and calendar, drawn over their art (wall-clock.svg,
 * wall-calendar.svg) in the same viewBox, so they scale with it. Inline, so the clock's
 * hands can turn and the calendar can show the visitor's month in the site's fonts.
 */

/**
 * How far into its turn each hand is right now, as negative animation delays: the
 * hands then keep real time on their own (scene.css), with nothing ticking in JS.
 */
function handDelays(): CSSProperties {
  const now = new Date()
  const s = now.getSeconds() + now.getMilliseconds() / 1000
  const m = now.getMinutes() * 60 + s
  const h = (now.getHours() % 12) * 3600 + m
  return { '--clock-hour': `${-h}s`, '--clock-minute': `${-m}s`, '--clock-second': `${-s}s` } as CSSProperties
}

/** The visitor's own time. Each hand is drawn pointing at 12 and turns around the middle. */
export function ClockHands() {
  const [delays] = useState(handDelays)
  return (
    <svg className="item-face" viewBox="0 0 400 400" style={delays} aria-hidden>
      <rect className="clock-hand clock-hour" x="192" y="104" width="16" height="112" rx="8" />
      <rect className="clock-hand clock-minute" x="195" y="60" width="10" height="156" rx="5" />
      <g className="clock-hand clock-second">
        <rect x="198.5" y="50" width="3" height="186" rx="1.5" />
        <circle cx="200" cy="232" r="7" />
      </g>
      <circle cx="200" cy="200" r="13" />
      <circle className="clock-pin" cx="200" cy="200" r="4.5" />
    </svg>
  )
}

/** The date grid's box on the page, below the picture (viewBox units of wall-calendar.svg). */
const GX = 34
const GY = 278
const GW = 232
const GH = 155
const CW = GW / 7

/** The visitor's month, as of when the desk loads. */
function thisMonth() {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  return {
    name: now.toLocaleString('en-US', { month: 'long' }),
    first: new Date(y, m, 1).getDay(),
    days: new Date(y, m + 1, 0).getDate(),
    today: now.getDate(),
  }
}

/** This month's page, with today circled. Five or six weeks, squeezed into the same box. */
export function CalendarPage() {
  const [month] = useState(thisMonth)
  const weeks = Math.ceil((month.first + month.days) / 7)
  const rh = GH / weeks
  const today = month.first + month.today - 1
  return (
    <svg className="item-face" viewBox="0 0 300 450" aria-hidden>
      <text className="calendar-month" x="150" y="248" textAnchor="middle">
        {month.name}
      </text>
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
        <text key={i} className="calendar-weekday" x={GX + (i + 0.5) * CW} y="271" textAnchor="middle">
          {d}
        </text>
      ))}
      <g className="calendar-grid">
        {Array.from({ length: weeks + 1 }, (_, r) => (
          <line key={`r${r}`} x1={GX} y1={GY + r * rh} x2={GX + GW} y2={GY + r * rh} />
        ))}
        {Array.from({ length: 8 }, (_, c) => (
          <line key={`c${c}`} x1={GX + c * CW} y1={GY} x2={GX + c * CW} y2={GY + GH} />
        ))}
      </g>
      {Array.from({ length: month.days }, (_, i) => {
        const cell = month.first + i
        return (
          <text key={i} className="calendar-day" x={GX + (cell % 7) * CW + 4.5} y={GY + Math.floor(cell / 7) * rh + 13}>
            {i + 1}
          </text>
        )
      })}
      <path
        className="calendar-today"
        d={markerLoop(GX + ((today % 7) + 0.5) * CW, GY + (Math.floor(today / 7) + 0.5) * rh, 16.5, rh * 0.42)}
      />
    </svg>
  )
}
