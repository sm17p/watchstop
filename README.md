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

## Examples

Private smoke-test apps live under [`examples/`](./examples) (workspace-linked, never published). Build packages first, then run the Astro playground or an individual app:

```sh
mise run build
mise run examples:dev
# or: pnpm --filter @watchstop/example-react dev
```

See [`examples/README.md`](./examples/README.md) for both tracks.

## Versioning and release

Public `@watchstop/*` packages use [Changesets](https://github.com/changesets/changesets) (independent versions; `@watchstop/docs` is ignored and never published).

After a meaningful user-facing change, add a changeset in the feature PR:

```sh
pnpm changeset
# or: mise run changeset
```

Do **not** run `changeset publish`, `pnpm release`, or `mise run release` from routine PR work.

### Version Packages PR

On push to `main` (or manual **Run workflow**), [`.github/workflows/release.yml`](./.github/workflows/release.yml) uses the Changesets [Trusted Publishing](https://changesets.dev/guide/automating) split jobs (`select-mode` → `version` or `osv-scan` → `pack` → `publish`):

1. If pending changesets exist, the **version** job opens or updates a **Version Packages** PR (`changeset version`: bumps versions, writes changelogs, consumes changesets). Prefer **squash-merge** for that PR so `main` gets a single `Version Packages` commit. OSV-Scanner does not block this path.
2. When that PR is merged and there are no remaining changesets, **osv-scan** runs a full [OSV-Scanner](https://google.github.io/osv-scanner/github-action/) pass, then **pack** builds (`mise run build`) and packs tarballs, and **publish** uploads to npm via OIDC, creates git tags, and opens GitHub Releases.

PR and merge-group delta scans live in [`.github/workflows/osv-scanner-pr.yml`](./.github/workflows/osv-scanner-pr.yml); weekly and push-to-`main` full scans (SARIF → Security → Code scanning) in [`.github/workflows/osv-scanner.yml`](./.github/workflows/osv-scanner.yml).

There is no `NPM_TOKEN` secret. Publishing uses npm [Trusted Publishers](https://docs.npmjs.com/trusted-publishers) (GitHub Actions OIDC). `id-token: write` is granted only on the publish job.

Do not put GitHub [workflow-skip markers](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/skipping-workflow-runs) in squash-merge commit messages or in PR bodies that become those messages. A substring match suppresses **all** `push` workflows on that commit (Release, CI, and Deploy docs). The Version Packages commit title stays `Version Packages` with no skip marker.

### Trusted Publisher setup (manual)

Human prerequisites (website / interactive; OIDC cannot do these):

1. Create or claim the npm org **`@watchstop`**.
2. For each new package name, bootstrap once with `npm publish --access public` so the name exists on the registry (Trusted Publisher cannot be attached to a missing package).
3. Enable **2FA** on the npm account used for `npm trust`.

Then configure Trusted Publisher for every publishable package. Prefer the **npm CLI** (`npm trust`, requires npm ≥ 11.15; this repo pins Node 26 / npm 11.17 via mise):

```sh
for pkg in core react svelte vue solid angular qwik alpine; do
  npm trust github "@watchstop/${pkg}" --file release.yml --repo sm17p/watchstop --allow-publish -y
done

for pkg in core react svelte vue solid angular qwik alpine; do
  npm trust list "@watchstop/${pkg}"
done
```

Alternate: npm website → package → **Trusted Publisher** → GitHub Actions, repository `sm17p/watchstop`, workflow filename `release.yml` (exact), environment blank unless the workflow adds one, allow `npm publish`.

Also ensure Actions can open Version Packages PRs: repo Settings → Actions → General → **Allow GitHub Actions to create and approve pull requests**.

OIDC authentication only works inside GitHub Actions. Local `mise run release` (build then `changeset publish`) remains an emergency escape hatch and still needs a human `npm login` (or equivalent) if used.

### Release candidates

Use Changesets pre mode for the `rc` channel:

```sh
mise run pre:enter   # changeset pre enter rc
# … merge Version Packages PRs / publish as usual (versions like x.y.z-rc.N, dist-tag rc) …
mise run pre:exit    # changeset pre exit before the first stable cut
```
