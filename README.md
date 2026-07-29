# watchstop

Runtime-agnostic stopwatch core and thin framework adapters.

Tooling is orchestrated with [mise](https://mise.jdx.dev) (`mise.toml`). Prefer `mise run <task>`; root `pnpm` scripts are thin wrappers around the same tasks. CI (`.github/workflows/ci.yml`) runs `mise run build`, `test`, `typecheck`, and `docs` on push/PR to `main`.

Documentation lives in [`apps/docs`](./apps/docs). Start with:

```sh
mise install
pnpm install
mise run docs:dev
```

See [AGENTS.md](./AGENTS.md) for agent implementation rules. Core docs under `/docs` are the source of truth.
