type SkinProps = {
  elapsed: number
  running: boolean
}

function FlapDigit({ value }: { value: string }) {
  return (
    <span className="relative inline-flex h-12 w-9 items-center justify-center overflow-hidden rounded-md border border-stone-700 bg-gradient-to-b from-stone-800 to-stone-950 font-mono text-2xl font-semibold tabular-nums text-amber-50 shadow-inner">
      <span className="absolute inset-x-0 top-1/2 h-px bg-black/50" />
      <span key={value} className="animate-[fadeDigit_0.18s_ease-out]">
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
    <div className="flex h-full flex-col justify-between rounded-xl border border-stone-700/80 bg-stone-900 p-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-amber-700/90">
        split-flap // skin{running ? ' · live' : ''}
      </p>
      <div className="mt-4 flex items-center justify-center gap-1.5">
        <FlapDigit value={minutes[0] ?? '0'} />
        <FlapDigit value={minutes[1] ?? '0'} />
        <span className="px-0.5 font-mono text-xl text-amber-200/40">:</span>
        <FlapDigit value={seconds[0] ?? '0'} />
        <FlapDigit value={seconds[1] ?? '0'} />
        <span className="px-0.5 font-mono text-xl text-amber-200/40">.</span>
        <FlapDigit value={centiseconds[0] ?? '0'} />
        <FlapDigit value={centiseconds[1] ?? '0'} />
      </div>
      <p className="mt-3 text-center font-mono text-xs text-stone-500">
        board readout
      </p>
    </div>
  )
}
