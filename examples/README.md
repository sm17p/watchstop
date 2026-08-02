# Examples

Private smoke-test apps for every released `@watchstop/*` package. They use `workspace:*` and import built `packages/*/dist` — run `mise run build` first.

## Tracks

1. **Individual apps** — one Vite (or framework) app per package under `examples/{core,react,vue,svelte,solid,alpine,angular,qwik}`
2. **Astro playground** — `examples/astro` mounts one island per package on a single page

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
```

Each app shows elapsed milliseconds with Start / Stop / Reset using that package’s public API from the docs.

## Notes

- Astro pins Vite 7 (individual apps use Vite 8) so Qwik’s optimizer stays compatible with the multi-renderer playground.
- Angular examples require TypeScript 6 (Angular 22 compiler).
- The Astro Qwik island mounts via CSR (`qwikVite({ csr: true })`) rather than `@qwik.dev/astro`, which currently fails to inject its client manifest under Astro 6 multi-renderer builds. The dedicated `examples/qwik` app remains the primary Qwik smoke test.
- Framework islands in Astro use `client:only` where JSX transforms collide across React / Solid / Qwik.
