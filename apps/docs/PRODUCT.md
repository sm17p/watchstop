# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

JS and framework engineers evaluating `@watchstop/core` and a thin adapter. They open the docs site to see one live session, then read the Spec and copy a binding.

## Product Purpose

The docs site is how people discover, verify, and adopt Watchstop. Success means understanding elapsed math and the public API, trying a live stopwatch, and leaving with a correct binding.

## Positioning

The docs prove Watchstop’s mechanism: runtime-agnostic Clock → Store → Stopwatch, injectable clocks (including `createMockClock`), and thin framework bridges that only expose `get` / `subscribe` / `destroy`. Live faces demonstrate the object; Spec is normative.

## Operating Context

Documentation lives in `apps/docs` (Next.js + Fumadocs), run locally with `mise run docs:dev`, and published at https://watchstop.sm17p.me. Engineers and agents work from Core, Runtimes, Frameworks, Spec, and machine indexes `/llms.txt` and `/llms-full.txt`.

## Capabilities and Constraints

Document and demonstrate the published `@watchstop/*` packages and their exact public names. Do not invent APIs, customers, benchmarks, testimonials, pricing, or licensing claims. Private `examples/` apps are smoke tests, not product marketing surfaces.

## Brand Commitments

Name: Watchstop. Logos: `assets/logo.svg`, `assets/logo-mark.svg`. Voice: technical, sharp, slightly playful — a workshop instrument, not a SaaS marketing page and not a personal art site. Keep Fumadocs light and dark; do not restyle the whole docs theme; do not borrow sm17p.me’s dark art-led atmosphere.

## Evidence on Hand

Logo assets under `assets/`. Live stopwatch demos and normative MDX under `apps/docs/content`. Public site and npm packages linked from the root README. No customer quotes, case studies, or performance claims on hand — future work must not fabricate them.

## Product Principles

1. Show the stopwatch before explaining the packaging.
2. Spec and Core docs stay the source of truth; UI never invents behavior.
3. Prefer one clear live session over many decorative demos.
4. Chrome stays quiet so engineers can scan, copy, and leave.
