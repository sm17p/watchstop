type SkinProps = {
  elapsed: number
  running: boolean
}

export function TerminalSkin({ elapsed, running }: SkinProps) {
  const totalMs = Math.max(0, Math.floor(elapsed))
  const minutes = String(Math.floor(totalMs / 60_000)).padStart(2, '0')
  const seconds = String(Math.floor((totalMs % 60_000) / 1000)).padStart(2, '0')
  const centiseconds = String(Math.floor((totalMs % 1000) / 10)).padStart(2, '0')

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-emerald-900/60 bg-[#07140f] p-4 text-left shadow-[inset_0_0_40px_rgba(16,185,129,0.12)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-600/90">
        terminal // skin
      </p>
      <p className="mt-4 font-mono text-2xl tracking-tight text-emerald-400 sm:text-3xl">
        <span className="text-emerald-700">$</span> elapsed{' '}
        <span className="tabular-nums">
          {minutes}:{seconds}.{centiseconds}
        </span>
        <span
          className={
            running
              ? 'ms-0.5 inline-block h-[1.1em] w-[0.55ch] animate-pulse bg-emerald-400 align-[-0.1em]'
              : 'ms-0.5 inline-block h-[1.1em] w-[0.55ch] bg-emerald-800 align-[-0.1em]'
          }
        />
      </p>
      <p className="mt-3 font-mono text-xs text-emerald-700 tabular-nums">
        raw {totalMs} ms
      </p>
    </div>
  )
}
