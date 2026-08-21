import Link from 'next/link'

type CircleElement = {
  id: string
  plain: string
  api: string
  angleDeg: number
  unlinked?: boolean
}

type CircleLink = {
  from: string
  to: string
  sign: '+' | '−'
  phrase: string
  labelOffset: number
}

const cx = 320
const cy = 290
const radius = 185

const elements: CircleElement[] = [
  {
    id: 'clock',
    plain: 'one shared loop',
    api: 'Clock',
    angleDeg: 0,
  },
  {
    id: 'running',
    plain: 'is this watch on?',
    api: 'running',
    angleDeg: 45,
  },
  {
    id: 'registered',
    plain: 'watches waiting for ticks',
    api: 'registered',
    angleDeg: 90,
  },
  {
    id: 'ticks',
    plain: 'each tick',
    api: 'tick wave',
    angleDeg: 135,
  },
  {
    id: 'notifies',
    plain: 'subscriber updates',
    api: 'notifies',
    angleDeg: 180,
  },
  {
    id: 'precision',
    plain: 'how often to update',
    api: 'precisionMs',
    angleDeg: 225,
  },
  {
    id: 'get',
    plain: 'reading the value',
    api: 'get() — no arrow in',
    angleDeg: 270,
    unlinked: true,
  },
  {
    id: 'owned',
    plain: 'banked + start reading',
    api: 'owned — no arrow in',
    angleDeg: 315,
    unlinked: true,
  },
]

const links: CircleLink[] = [
  {
    from: 'running',
    to: 'registered',
    sign: '+',
    phrase: 'wants ticks',
    labelOffset: 18,
  },
  {
    from: 'registered',
    to: 'ticks',
    sign: '+',
    phrase: 'keeps the loop alive',
    labelOffset: -22,
  },
  {
    from: 'ticks',
    to: 'notifies',
    sign: '+',
    phrase: 'when bucket allows',
    labelOffset: 20,
  },
  {
    from: 'precision',
    to: 'notifies',
    sign: '−',
    phrase: 'coarser buckets',
    labelOffset: -28,
  },
  {
    from: 'clock',
    to: 'ticks',
    sign: '+',
    phrase: 'one loop per Clock',
    labelOffset: 26,
  },
]

function polar(angleDeg: number, r: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function elementAt(id: string): CircleElement {
  const found = elements.find((element) => element.id === id)
  if (found === undefined) {
    throw new Error(`Missing circle element ${id}`)
  }
  return found
}

function chordPath(fromId: string, toId: string): string {
  const from = polar(elementAt(fromId).angleDeg, radius)
  const to = polar(elementAt(toId).angleDeg, radius)
  const midX = (from.x + to.x) / 2
  const midY = (from.y + to.y) / 2
  const pullX = cx + (midX - cx) * 0.25
  const pullY = cy + (midY - cy) * 0.25
  return `M ${from.x} ${from.y} Q ${pullX} ${pullY} ${to.x} ${to.y}`
}

function linkLabelPoint(
  fromId: string,
  toId: string,
  offset: number,
): { x: number; y: number } {
  const from = polar(elementAt(fromId).angleDeg, radius)
  const to = polar(elementAt(toId).angleDeg, radius)
  const midX = (from.x + to.x) / 2
  const midY = (from.y + to.y) / 2
  const towardCenterX = cx + (midX - cx) * 0.45
  const towardCenterY = cy + (midY - cy) * 0.45
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy) || 1
  const nx = -dy / length
  const ny = dx / length
  return {
    x: towardCenterX + nx * offset,
    y: towardCenterY + ny * offset,
  }
}

export function ElapsedSystemCircle() {
  return (
    <figure className="not-prose my-6 rounded-xl border border-fd-border bg-fd-card/40 p-3 sm:p-4">
      <figcaption className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-fd-muted-foreground">
        Connection circle — shared Clock schedule
      </figcaption>
      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 640 580"
          className="mx-auto h-auto w-full min-w-[320px] max-w-[640px]"
          role="img"
          aria-label="Connection circle: running adds registered watches, which keep one shared Clock tick loop alive; precisionMs cuts how often subscribers update; get stays live"
        >
          <defs>
            <marker
              id="elapsed-system-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path
                d="M 0 0 L 10 5 L 0 10 z"
                className="fill-fd-muted-foreground"
              />
            </marker>
          </defs>
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            className="stroke-fd-border"
            strokeWidth={1.25}
            strokeDasharray="4 6"
          />
          {links.map((link) => {
            const label = linkLabelPoint(link.from, link.to, link.labelOffset)
            const phraseWidth = Math.max(72, link.phrase.length * 6)
            return (
              <g key={`${link.from}-${link.to}`}>
                <path
                  d={chordPath(link.from, link.to)}
                  fill="none"
                  className="stroke-fd-muted-foreground/70"
                  strokeWidth={1.5}
                  markerEnd="url(#elapsed-system-arrow)"
                />
                <rect
                  x={label.x - phraseWidth / 2}
                  y={label.y - 22}
                  width={phraseWidth}
                  height={36}
                  rx={6}
                  className="fill-fd-background stroke-fd-border"
                  strokeWidth={1}
                />
                <text
                  x={label.x}
                  y={label.y - 6}
                  textAnchor="middle"
                  className="fill-fd-foreground text-[12px] font-semibold"
                >
                  {link.sign}
                </text>
                <text
                  x={label.x}
                  y={label.y + 10}
                  textAnchor="middle"
                  className="fill-fd-muted-foreground text-[9px]"
                >
                  {link.phrase}
                </text>
              </g>
            )
          })}
          {elements.map((element) => {
            const point = polar(element.angleDeg, radius)
            const boxW = 132
            const boxH = 54
            return (
              <g key={element.id}>
                <rect
                  x={point.x - boxW / 2}
                  y={point.y - boxH / 2}
                  width={boxW}
                  height={boxH}
                  rx={8}
                  className={
                    element.unlinked === true
                      ? 'fill-fd-background stroke-fd-muted-foreground/40'
                      : 'fill-fd-background stroke-fd-border'
                  }
                  strokeWidth={1}
                  strokeDasharray={element.unlinked === true ? '3 3' : undefined}
                />
                <text
                  x={point.x}
                  y={point.y - 6}
                  textAnchor="middle"
                  className="fill-fd-foreground text-[10px] font-semibold"
                >
                  {element.plain}
                </text>
                <text
                  x={point.x}
                  y={point.y + 12}
                  textAnchor="middle"
                  className="fill-fd-muted-foreground font-mono text-[9px]"
                >
                  {element.api}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <p className="mt-3 text-sm text-fd-muted-foreground">
        Same <code className="font-mono text-xs">Clock</code> object → one
        schedule loop. Each stopwatch still owns its banked time and start
        reading (dashed nodes — no arrow in).{' '}
        <code className="font-mono text-xs">get()</code> stays live;{' '}
        <code className="font-mono text-xs">precisionMs</code> only cuts how
        often subscribers update. See{' '}
        <Link href="/docs/core/options" className="text-fd-foreground underline">
          Options
        </Link>
        .
      </p>
    </figure>
  )
}
