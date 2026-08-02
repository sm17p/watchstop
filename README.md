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

## Versioning and release

Public `@watchstop/*` packages use [Changesets](https://github.com/changesets/changesets) (independent versions; `@watchstop/docs` is ignored and never published).

After a meaningful user-facing change, add a changeset in the feature PR:

```sh
pnpm changeset
# or: mise run changeset
```

Do **not** run `changeset publish`, `pnpm release`, or `mise run release` from routine PR work.

### Version Packages PR

On push to `main`, [`.github/workflows/release.yml`](./.github/workflows/release.yml) runs [changesets/action](https://github.com/changesets/action):

1. If pending changesets exist, it opens or updates a **Version Packages** PR (`changeset version`: bumps versions, writes changelogs, consumes changesets).
2. When that PR is merged and there are no remaining changesets, the same workflow publishes to npm (`mise run release` builds first, then `changeset publish`), creates git tags, and opens GitHub Releases.

Repo secret `NPM_TOKEN` is required for publish. Never commit npm tokens.

### Release candidates

Use Changesets pre mode for the `rc` channel:

```sh
mise run pre:enter   # changeset pre enter rc
# … merge Version Packages PRs / publish as usual (versions like x.y.z-rc.N, dist-tag rc) …
mise run pre:exit    # changeset pre exit before the first stable cut
```
