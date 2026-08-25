type SkinProps = {
  elapsed: number
  running: boolean
}

function FlapDigit({ value }: { value: string }) {
  return (
    <span className="relative inline-flex h-12 w-9 items-center justify-center overflow-hidden rounded-md border border-[color-mix(in_srgb,var(--color-flap-amber)_18%,#292524)] bg-gradient-to-b from-[#292524] to-[var(--color-flap-board)] font-mono text-2xl font-semibold tabular-nums text-[var(--color-flap-amber)] shadow-inner">
      <span className="absolute inset-x-0 top-1/2 h-px bg-black/50" />
      <span key={value} className="animate-[fadeDigit_0.18s_ease-out] motion-reduce:animate-none">
        {value}
      </span>
    </span>
  )
}

export function SplitFlapSkin({ elapsed, running }: SkinProps) {
  const totalMs = Math.max(0, Math.floor(elapsed))
  const minutes = String(Math.floor(totalMs / 60_000)).padStart(2, '0')
  const seconds = String(Math.floor((totalMs % 60_000) / 1000)).padStart(2, '0')
  const centiseconds = String(Math.floor((totalMs % 1000) / 10)).padStart(2, '0')

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-[color-mix(in_srgb,var(--color-flap-amber)_20%,#44403c)] bg-[var(--color-flap-board)] p-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--color-flap-label)_90%,transparent)]">
        split-flap // skin{running ? ' · live' : ''}
      </p>
      <div className="mt-4 flex items-center justify-center gap-1.5">
        <FlapDigit value={minutes[0] ?? '0'} />
        <FlapDigit value={minutes[1] ?? '0'} />
        <span className="px-0.5 font-mono text-xl text-[color-mix(in_srgb,var(--color-flap-amber)_40%,transparent)]">:</span>
        <FlapDigit value={seconds[0] ?? '0'} />
        <FlapDigit value={seconds[1] ?? '0'} />
        <span className="px-0.5 font-mono text-xl text-[color-mix(in_srgb,var(--color-flap-amber)_40%,transparent)]">.</span>
        <FlapDigit value={centiseconds[0] ?? '0'} />
        <FlapDigit value={centiseconds[1] ?? '0'} />
      </div>
      <p className="mt-3 text-center font-mono text-xs text-[color-mix(in_srgb,var(--color-flap-amber)_35%,#78716c)]">
        board readout
      </p>
    </div>
  )
}
