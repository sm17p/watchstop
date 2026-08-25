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
    <div className="flex h-full flex-col justify-between rounded-xl border border-[color-mix(in_srgb,var(--color-terminal-phosphor)_25%,transparent)] bg-[var(--color-terminal-well)] p-4 text-left shadow-[inset_0_0_40px_color-mix(in_srgb,var(--color-terminal-phosphor)_18%,transparent)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--color-terminal-dim)_90%,transparent)]">
        terminal // skin
      </p>
      <p className="mt-4 font-mono text-2xl tracking-tight text-[var(--color-terminal-phosphor)] sm:text-3xl">
        <span className="text-[var(--color-terminal-dim)]">$</span> elapsed{' '}
        <span className="tabular-nums">
          {minutes}:{seconds}.{centiseconds}
        </span>
        <span
          className={
            running
              ? 'ms-0.5 inline-block h-[1.1em] w-[0.55ch] animate-pulse motion-reduce:animate-none bg-[var(--color-terminal-phosphor)] align-[-0.1em]'
              : 'ms-0.5 inline-block h-[1.1em] w-[0.55ch] bg-[color-mix(in_srgb,var(--color-terminal-dim)_55%,black)] align-[-0.1em]'
          }
        />
      </p>
      <p className="mt-3 font-mono text-xs text-[var(--color-terminal-dim)] tabular-nums">
        raw {totalMs} ms
      </p>
    </div>
  )
}
