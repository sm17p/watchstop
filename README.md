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

On push to `main`, [`.github/workflows/release.yml`](./.github/workflows/release.yml) uses the Changesets [Trusted Publishing](https://changesets.dev/guide/automating) split jobs (`select-mode` → `version` or `pack` → `publish`):

1. If pending changesets exist, the **version** job opens or updates a **Version Packages** PR (`changeset version`: bumps versions, writes changelogs, consumes changesets). Prefer **squash-merge** for that PR so `main` gets a single `Version Packages` commit.
2. When that PR is merged and there are no remaining changesets, **pack** builds (`mise run build`) then packs tarballs, and **publish** uploads to npm via OIDC, creates git tags, and opens GitHub Releases.

There is no `NPM_TOKEN` secret. Publishing uses npm [Trusted Publishers](https://docs.npmjs.com/trusted-publishers) (GitHub Actions OIDC). `id-token: write` is granted only on the publish job.

### Trusted Publisher setup (manual)

For each publishable package (`@watchstop/core`, adapters, …):

1. The package must already exist on npm (first publish of a new name still needs a one-time interactive or token bootstrap; Trusted Publisher settings cannot be created on a missing package).
2. On npm → package → **Trusted Publisher**: GitHub Actions, repository `sm17p/watchstop`, workflow filename `release.yml` (exact), environment blank unless the workflow adds one. Allow `npm publish`.
3. Ensure Actions can open PRs: repo Settings → Actions → General → **Allow GitHub Actions to create and approve pull requests**.

OIDC authentication only works inside GitHub Actions. Local `mise run release` (build then `changeset publish`) remains an emergency escape hatch and still needs a human `npm login` (or equivalent) if used.

### Release candidates

Use Changesets pre mode for the `rc` channel:

```sh
mise run pre:enter   # changeset pre enter rc
# … merge Version Packages PRs / publish as usual (versions like x.y.z-rc.N, dist-tag rc) …
mise run pre:exit    # changeset pre exit before the first stable cut
```
