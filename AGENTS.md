# Agents

Core documentation under `apps/docs/content/docs` is the **source of truth**.

## Rules

1. Implement from docs — especially Core, Runtimes, and Agents pages — not from assumed APIs.
2. Public TypeScript names must match the docs exactly (`Clock`, `Store`, `Stopwatch`, clock factories).
3. Tests are required for every package; derive cases from acceptance criteria in `/docs/agents`.
4. Prefer machine indexes over scraping HTML:
   - `/llms.txt` — index of pages (when docs are running)
   - `/llms-full.txt` — concatenated processed markdown

## Package map

| Package | Role |
| --- | --- |
| `@watchstop/core` | Clock + Store + Stopwatch + runtime clocks (ships first) |
| `@watchstop/react` | adapter |
| `@watchstop/svelte` | adapter |
| `@watchstop/vue` | adapter |
| `@watchstop/solid` | adapter |
| `@watchstop/angular` | adapter |
| `@watchstop/qwik` | adapter |
| `@watchstop/alpine` | adapter |

No timing logic in adapters — only `get` / `subscribe` bridges.

## Workflow

1. Read `/docs/architecture`, `/docs/core/*`, `/docs/runtimes/*`, `/docs/agents`
2. Implement `@watchstop/core` + Vitest until green
3. Then adapters
4. Fill framework docs only after code ships

## Changesets

For user-facing package changes, add a changeset with `pnpm changeset` (or `mise run changeset`). Prefer independent versioning; ignore `@watchstop/docs` (never published).

Do **not** run `changeset publish`, `mise run release`, `changeset pre enter`, or `mise run pre:enter` / `pre:exit` unless the user explicitly asks. Version bumps and npm publish are owned by the **Version Packages** PR and `.github/workflows/release.yml` on `main` (OIDC Trusted Publishing; no `NPM_TOKEN`). Prefer squash-merge for Version Packages PRs. Agents must not publish from routine feature PRs. See README for Trusted Publisher setup (`npm trust` CLI primary; website alternate).

## Workflows

Run `mise run zizmor` (or the CI `zizmor` job) before merging workflow changes. Pin third-party Actions to full commit SHAs with a version comment. Do not add pnpm store cache on release `pack` / `publish`.

OSV-Scanner gates dependency vulns: PR/`merge_group` delta scan and weekly + push-to-`main` full scan share [`.github/workflows/osv-scanner.yml`](.github/workflows/osv-scanner.yml) so Code Scanning keeps one config id. Release **publish** still runs a full scan (`osv-scan` in `release.yml` before `pack`/`publish`, `upload-sarif: false`) and does not block the Version Packages job.

When writing PR bodies that will be squash-merged to `main`, never include GitHub [workflow-skip markers](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/skipping-workflow-runs) (even inside backticks or “we do not use …” prose). Those substrings skip every `push` workflow for that commit. Release also supports `workflow_dispatch` if a push was skipped.
