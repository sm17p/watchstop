import Link from 'next/link'
import { WatchGallery } from '@/components/watch-gallery'

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex min-h-[58vh] flex-col justify-center text-center gap-4 px-4 pb-6">
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
      <WatchGallery />
    </div>
  )
}
