# Contributing

Core, Runtimes, and Frameworks docs under `apps/docs/content/docs` are the **source of truth** for behavior. Tests are derived from those pages. [Spec](https://watchstop.sm17p.me/docs/spec) (`/docs/spec`) is the implementer index: exact public names, packaging, and adapter constraints.

How to **use** Watchstop as a library: [AGENTS.md](./AGENTS.md) and `/docs/agents`.

## Workflow

1. Read `/docs/architecture`, `/docs/core/*`, `/docs/runtimes/*`, `/docs/spec`
2. Implement `@watchstop/core` + Vitest until green
3. Then adapters
4. Fill framework docs only after code ships

Public TypeScript names must match Spec exactly (`Clock`, `Store`, `Stopwatch`, clock factories). No timing logic in adapters — only `get` / `subscribe` bridges.

## Changesets

For user-facing package changes, add a changeset with `pnpm changeset` (or `mise run changeset`). Prefer independent versioning; ignore `@watchstop/docs` (never published).

Do **not** run `changeset publish`, `mise run release`, `changeset pre enter`, or `mise run pre:enter` / `pre:exit` unless the user explicitly asks. Version bumps and npm publish are owned by the **Version Packages** PR and `.github/workflows/release.yml` on `main` (OIDC Trusted Publishing; no `NPM_TOKEN`). Prefer squash-merge for Version Packages PRs. Agents must not publish from routine feature PRs. See README for Trusted Publisher setup (`npm trust` CLI primary; website alternate).

## Workflows

Run `mise run zizmor` (or the CI `zizmor` job) before merging workflow changes. Pin third-party Actions to full commit SHAs with a version comment. Do not add pnpm store cache on release `pack` / `publish`.

OSV-Scanner gates dependency vulns: PR/`merge_group` delta scan and weekly full scan share [`.github/workflows/osv-scanner.yml`](.github/workflows/osv-scanner.yml) so Code Scanning keeps one config id. Release **publish** runs a full scan (`osv-scan` in `release.yml` before `pack`/`publish`, `upload-sarif: false`) and does not block the Version Packages job.

When writing PR bodies that will be squash-merged to `main`, never include GitHub [workflow-skip markers](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/skipping-workflow-runs) (even inside backticks or “we do not use …” prose). Those substrings skip every `push` workflow for that commit. Release also supports `workflow_dispatch` if a push was skipped.
