import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1 gap-4 px-4">
      <img
        src="/logo.svg"
        alt=""
        width={80}
        height={80}
        className="mx-auto"
      />
      <h1 className="text-3xl font-bold tracking-tight">Watchstop</h1>
      <p className="text-fd-muted-foreground max-w-xl mx-auto">
        Runtime-agnostic stopwatch core with thin framework adapters. Docs are
        the design spec.
      </p>
      <p>
        <Link href="/docs" className="font-medium underline">
          Open the docs
        </Link>
        {' · '}
        <Link href="/llms.txt" className="font-medium underline">
          llms.txt
        </Link>
      </p>
    </div>
  )
}
