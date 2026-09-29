import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { SessionStopwatch } from '@/components/session-stopwatch'
import { appName, gitConfig } from './shared'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="inline-flex items-center gap-2">
          <img src="/logo.svg" alt="" width={24} height={24} aria-hidden />
          {appName}
        </span>
      ),
      url: '/',
      children: (
        <div className="ms-6 flex items-center pe-2">
          <SessionStopwatch />
        </div>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  }
}
