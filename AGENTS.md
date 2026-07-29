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

## Workflow

1. Read `/docs/architecture`, `/docs/core/*`, `/docs/runtimes/*`, `/docs/agents`
2. Implement `@watchstop/core` + Vitest until green
3. Then Wave 1 adapters, then Wave 2
4. Fill framework docs only after code ships

Root tasks live in `mise.toml` (`mise run build|test|typecheck|docs|docs:dev`). `pnpm <script>` delegates to the same mise tasks.
