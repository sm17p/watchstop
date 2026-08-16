import { Blocks } from 'lucide-react'
import Link from 'next/link'
import { WatchGallery } from '@/components/watch-gallery'

type FrameworkLink = {
  href: string
  name: string
}

const frameworks: FrameworkLink[] = [
  { href: '/docs/frameworks/react', name: 'React' },
  { href: '/docs/frameworks/svelte', name: 'Svelte' },
  { href: '/docs/frameworks/vue', name: 'Vue' },
  { href: '/docs/frameworks/solid', name: 'Solid' },
  { href: '/docs/frameworks/angular', name: 'Angular' },
  { href: '/docs/frameworks/qwik', name: 'Qwik' },
  { href: '/docs/frameworks/alpine', name: 'Alpine' },
  { href: '/docs/frameworks/vanilla', name: 'Vanilla' },
]

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 pt-8 pb-16">
      <div className="flex flex-col gap-2">
        <img
          src="/logo.svg"
          alt=""
          width={40}
          height={40}
        />
        <h1 className="text-3xl font-bold tracking-tight">Watchstop</h1>
      </div>
      <WatchGallery />
      <div className="flex max-w-[65ch] flex-col gap-3">
        <p className="text-fd-muted-foreground text-pretty">
          Runtime-agnostic stopwatch core with thin framework adapters. One
          session drives every face — docs are the design spec.
        </p>
        <p className="text-fd-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium text-fd-foreground">
            <Blocks aria-hidden className="size-4" />
            Adapters
          </span>
          {frameworks.map((framework) => (
            <Link
              key={framework.href}
              href={framework.href}
              className="underline-offset-4 hover:underline"
            >
              {framework.name}
            </Link>
          ))}
        </p>
        <p className="flex gap-3">
          <Link href="/docs" className="font-medium underline">
            Open the docs
          </Link>
          <Link href="/llms.txt" className="font-medium underline">
            llms.txt
          </Link>
        </p>
      </div>
    </div>
  )
}
