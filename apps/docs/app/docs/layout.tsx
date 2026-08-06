import { DocsNavStopwatch } from '@/components/docs-nav-stopwatch'
import { source } from '@/lib/source'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { baseOptions } from '@/lib/layout.shared'

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...baseOptions()}
      links={[
        {
          type: 'custom',
          secondary: true,
          children: <DocsNavStopwatch />,
        },
      ]}
    >
      {children}
    </DocsLayout>
  )
}
