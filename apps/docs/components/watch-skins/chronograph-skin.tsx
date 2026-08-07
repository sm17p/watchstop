type SkinProps = {
  elapsed: number
  running: boolean
}

function roundCoord(value: number): number {
  return Math.round(value * 1e6) / 1e6
}

const tickMarks = Array.from({ length: 60 }, (_, tick) => {
  const angle = (tick / 60) * Math.PI * 2 - Math.PI / 2
  const inner = tick % 5 === 0 ? 42 : 46
  const outer = 52
  return {
    tick,
    x1: roundCoord(60 + Math.cos(angle) * inner),
    y1: roundCoord(60 + Math.sin(angle) * inner),
    x2: roundCoord(60 + Math.cos(angle) * outer),
    y2: roundCoord(60 + Math.sin(angle) * outer),
    major: tick % 5 === 0,
  }
})

export function ChronographSkin({ elapsed, running }: SkinProps) {
  const totalMs = Math.max(0, elapsed)
  const secondsInMinute = (totalMs / 1000) % 60
  const sweepDegrees = (secondsInMinute / 60) * 360
  const sweepAngle = (sweepDegrees * Math.PI) / 180 - Math.PI / 2
  const handX = roundCoord(60 + Math.cos(sweepAngle) * 40)
  const handY = roundCoord(60 + Math.sin(sweepAngle) * 40)

  return (
    <div className="flex h-full flex-col items-center justify-between rounded-xl border border-fd-border bg-fd-card/40 p-4">
      <p className="self-start text-[10px] uppercase tracking-[0.2em] text-fd-muted-foreground">
        chronograph // skin
      </p>
      <svg
        viewBox="0 0 120 120"
        className="mt-2 size-36 text-fd-foreground"
        aria-hidden
      >
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="2"
        />
        {tickMarks.map(({ tick, x1, y1, x2, y2, major }) => (
          <line
            key={tick}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeOpacity={major ? 0.55 : 0.25}
            strokeWidth={major ? 1.5 : 1}
          />
        ))}
        <line
          x1="60"
          y1="60"
          x2={handX}
          y2={handY}
          stroke={running ? '#ea580c' : 'currentColor'}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="60" cy="60" r="3" fill={running ? '#ea580c' : 'currentColor'} />
      </svg>
      <p className="font-mono text-xs text-fd-muted-foreground tabular-nums">
        {Math.floor(totalMs)} ms
      </p>
    </div>
  )
}
