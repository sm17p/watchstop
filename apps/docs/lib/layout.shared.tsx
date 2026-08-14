import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { SessionStopwatch } from '@/components/session-stopwatch'
import { appName, gitConfig } from './shared'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="inline-flex items-center gap-2">
          <img src="/logo.svg" alt="" width={24} height={24} />
          {appName}
        </span>
      ),
      url: '/',
    },
    links: [
      {
        type: 'custom',
        secondary: true,
        children: <SessionStopwatch />,
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  }
}
