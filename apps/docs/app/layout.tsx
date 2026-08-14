import { AgentationToolbar } from '@/components/agentation-toolbar'
import { Provider } from '@/components/provider'
import { appName } from '@/lib/shared'
import './global.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'

const inter = Inter({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://watchstop.sm17p.me'),
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description:
    'Runtime-agnostic stopwatch core and thin framework adapters.',
}

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
        <AgentationToolbar />
      </body>
    </html>
  )
}
