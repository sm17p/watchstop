import { readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const packagesDir = join(root, 'packages')
const packageDirs = readdirSync(packagesDir, { withFileTypes: true }).filter(
  (entry) => entry.isDirectory() && !entry.name.startsWith('.'),
)

if (packageDirs.length === 0) {
  console.log('No packages yet; skipping.')
  process.exit(0)
}

const [command, ...args] = process.argv.slice(2)
const result = spawnSync(command, args, {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: process.env,
})

process.exit(result.status ?? 1)
