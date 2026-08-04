# Examples

Private smoke-test apps for every released `@watchstop/*` package. They use `workspace:*` and import built `packages/*/dist` — run `mise run build` first.

## Tracks

1. **Individual apps** — one Vite (or framework) app per package under `examples/{core,react,vue,svelte,solid,alpine,angular,qwik}`
2. **Astro playground** — `examples/astro` mounts one island per package on a single page
3. **Bench app** — `examples/bench` browser concurrent-stopwatch harness (Playwright; not a framework smoke)

## Prerequisites

```sh
mise install
pnpm install
mise run build
```

## Astro playground

```sh
mise run examples:dev
# or: pnpm --filter @watchstop/examples-astro dev
```

Build:

```sh
mise run examples:build
```

## Individual apps

```sh
pnpm --filter @watchstop/example-core dev
pnpm --filter @watchstop/example-react dev
pnpm --filter @watchstop/example-vue dev
pnpm --filter @watchstop/example-svelte dev
pnpm --filter @watchstop/example-solid dev
pnpm --filter @watchstop/example-alpine dev
pnpm --filter @watchstop/example-angular dev
pnpm --filter @watchstop/example-qwik dev
pnpm --filter @watchstop/example-bench dev
```

Each framework/core app shows elapsed milliseconds with Start / Stop / Reset using that package’s public API from the docs.

Browser bench (MockClock companion; opt-in, not in `mise run test`):

```sh
mise run bench:browser
mise run bench:browser:headed
```

See [`examples/bench/README.md`](./bench/README.md).

## Notes

- Astro pins Vite 7; individual apps use Vite 8.
- Angular examples require TypeScript 6 (Angular 22 compiler).
- Astro’s Qwik slot is a working `@watchstop/core` CSR stub (same Start/Stop/Reset UI). `component$` + `qwikVite` emit lazy `*_component_*.js` chunks that fail to resolve through Astro’s script pipeline in this multi-renderer app, and `@qwik.dev/astro` still fails client-manifest injection under Astro 6. Use `examples/qwik` for the real `@watchstop/qwik` adapter.
- Framework islands in Astro use `client:only` where JSX transforms would collide.
