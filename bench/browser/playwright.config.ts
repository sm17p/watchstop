import { defineConfig, devices } from '@playwright/test'

const headed = process.env.BENCH_HEADED === '1'
const port = 5180
const baseURL = `http://127.0.0.1:${port}`
const channel = process.env.BENCH_BROWSER_CHANNEL

const strippedBackgroundArgs = [
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  '--disable-background-timer-throttling',
] as const

const headedLaunchOptions = {
  ignoreDefaultArgs: [...strippedBackgroundArgs],
  ...(channel !== undefined && channel !== '' ? { channel } : {}),
}

const chromiumUse = {
  ...devices['Desktop Chrome'],
  headless: !headed,
  ...(headed ? { launchOptions: headedLaunchOptions } : {}),
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 300_000,
  expect: {
    timeout: 15_000,
  },
  reporter: [['list']],
  use: {
    ...chromiumUse,
    baseURL,
    browserName: 'chromium',
  },
  projects: [
    {
      name: 'chromium',
      use: chromiumUse,
    },
  ],
  webServer: {
    command: `pnpm run build && pnpm exec vite preview --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
