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
| `@watchstop/react` | Wave 1 adapter |
| `@watchstop/svelte` | Wave 1 adapter |
| `@watchstop/vue` | Wave 1 adapter |
| `@watchstop/solid` | Wave 1 adapter |
| `@watchstop/angular` | Wave 2 adapter |
| `@watchstop/qwik` | Wave 2 adapter |
| `@watchstop/alpine` | Wave 2 adapter |

No timing logic in adapters — only `get` / `subscribe` bridges.

Vanilla, Preact, and Lit are docs-only guidance (no `@watchstop/preact`, `@watchstop/vanilla`, or `@watchstop/lit` package).

## Workflow

1. Read `/docs/architecture`, `/docs/core/*`, `/docs/runtimes/*`, `/docs/agents`
2. Implement `@watchstop/core` + Vitest until green
3. Then Wave 1 adapters, then Wave 2
4. Fill framework docs only after code ships

## Changesets

For user-facing package changes, add a changeset with `pnpm changeset` (or `mise run changeset`). Prefer independent versioning; ignore `@watchstop/docs` (never published).

Do **not** run `changeset publish`, `mise run release`, `changeset pre enter`, or `mise run pre:enter` / `pre:exit` unless the user explicitly asks. Version bumps and npm publish are owned by the **Version Packages** PR and `.github/workflows/release.yml` on `main` (see README). Agents must not publish from routine feature PRs.
