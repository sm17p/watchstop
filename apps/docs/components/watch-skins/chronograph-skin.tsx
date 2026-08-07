type SkinProps = {
  elapsed: number
  running: boolean
}

export function ChronographSkin({ elapsed, running }: SkinProps) {
  const totalMs = Math.max(0, elapsed)
  const secondsInMinute = (totalMs / 1000) % 60
  const sweepDegrees = (secondsInMinute / 60) * 360
  const ticks = Array.from({ length: 60 }, (_, index) => index)

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
        {ticks.map((tick) => {
          const angle = (tick / 60) * Math.PI * 2 - Math.PI / 2
          const inner = tick % 5 === 0 ? 42 : 46
          const outer = 52
          return (
            <line
              key={tick}
              x1={60 + Math.cos(angle) * inner}
              y1={60 + Math.sin(angle) * inner}
              x2={60 + Math.cos(angle) * outer}
              y2={60 + Math.sin(angle) * outer}
              stroke="currentColor"
              strokeOpacity={tick % 5 === 0 ? 0.55 : 0.25}
              strokeWidth={tick % 5 === 0 ? 1.5 : 1}
            />
          )
        })}
        <line
          x1="60"
          y1="60"
          x2={60 + Math.cos((sweepDegrees * Math.PI) / 180 - Math.PI / 2) * 40}
          y2={60 + Math.sin((sweepDegrees * Math.PI) / 180 - Math.PI / 2) * 40}
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
