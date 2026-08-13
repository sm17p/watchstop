import Link from 'next/link'
import { WatchGallery } from '@/components/watch-gallery'

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-6 px-4 pt-6 pb-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <img
          src="/logo.svg"
          alt=""
          width={64}
          height={64}
        />
        <h1 className="text-3xl font-bold tracking-tight">Watchstop</h1>
      </div>
      <WatchGallery />
      <div className="flex max-w-xl flex-col items-center gap-3 text-center">
        <p className="text-fd-muted-foreground text-pretty">
          Runtime-agnostic stopwatch core with thin framework adapters. One
          session drives every face — docs are the design spec.
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
    </div>
  )
}
