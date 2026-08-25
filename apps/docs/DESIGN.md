---
name: Watchstop Docs
description: Chronograph-bench docs — Fumadocs chrome with live instrument faces.
colors:
  ink-primary: "#171717"
  ink-primary-foreground: "#fafafa"
  soft-paper: "#f5f5f5"
  soft-ink: "#0a0a0a"
  graphite-muted: "#737373"
  card-wash: "#f1f1f1"
  hairline-border: "#cccccc80"
  accent-wash: "#d1d1d180"
  focus-ring: "#a3a3a3"
  dark-paper: "#121212"
  dark-ink: "#ebebeb"
  dark-card: "#191919"
  dark-muted: "#212121"
  dark-primary: "#fafafa"
  running-ember: "#ea580c"
  terminal-well: "#07140f"
  terminal-phosphor: "#34d399"
  terminal-dim: "#047857"
  flap-board: "#1c1917"
  flap-amber: "#fffbeb"
  flap-label: "#b45309"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.2em"
  mono-readout:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.025em"
rounded:
  control: "0.375rem"
  skin: "0.75rem"
  pill: "9999px"
spacing:
  "4": "4px"
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "24": "24px"
  "32": "32px"
  "48": "48px"
components:
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.soft-ink}"
    rounded: "{rounded.control}"
    padding: "8px"
    height: "44px"
    width: "44px"
    typography: "{typography.label}"
  button-ghost-hover:
    backgroundColor: "{colors.accent-wash}"
    textColor: "{colors.soft-ink}"
    rounded: "{rounded.control}"
  button-pill-cta:
    backgroundColor: "#f1f1f199"
    textColor: "{colors.soft-ink}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
    typography: "{typography.title}"
  button-pill-cta-hover:
    backgroundColor: "{colors.accent-wash}"
    textColor: "{colors.soft-ink}"
    rounded: "{rounded.pill}"
  skin-panel:
    backgroundColor: "#f1f1f166"
    textColor: "{colors.soft-ink}"
    rounded: "{rounded.skin}"
    padding: "16px"
  session-readout:
    backgroundColor: "transparent"
    textColor: "{colors.soft-ink}"
    typography: "{typography.mono-readout}"
---

# Design System: Watchstop Docs

## Overview

**Creative North Star: "The Chronograph Bench"**

Watchstop’s docs feel like a quiet workbench: Fumadocs supplies the neutral tool-chest chrome, and the live stopwatch faces are the instruments on the bench. Inter carries reading and navigation; monospace carries elapsed time, skin labels, and Spec-adjacent figures. Density stays tight inside instrument groups, with generous breaks between sections on a 4pt scale.

Personality is technical, sharp, and slightly playful — a workshop instrument, not a SaaS marketing page and not a personal art site. Keep Fumadocs light and dark. Do not restyle the whole docs theme. Do not borrow sm17p.me’s dark art-led atmosphere. Confirmed visual rejections: generic SaaS heroes, equal feature-card grids, purple/blue glow, nested cards, and a fully centered stack with even padding everywhere.

**Key Characteristics:**
- Live faces lead; copy and chrome stay secondary
- Fumadocs neutral tokens own page chrome; instrument accents may signal live state outside skins
- One shared session stopwatch drives header readout and gallery faces
- Skin panels use `rounded-xl` and hairline borders; controls use `rounded-md` with 44×44 hit targets
- Sibling rhythm uses `gap` on a 4 / 8 / 12 / 16 / 24 / 32 / 48 scale

## Colors

Fumadocs neutral greys carry the bench; chronograph orange, terminal emerald, and flap amber are first-class live-state accents.

### Primary
- **Ink Primary** (`#171717` light / `#fafafa` dark): Fumadocs `--color-fd-primary` for high-contrast chrome actions and inverted dark-mode primary.
- **Soft Ink** (`#0a0a0a`): Default foreground on Soft Paper; brand wordmark and body emphasis.

### Secondary
- **Running Ember** (`#ea580c`): Chronograph sweep hand and hub while running; reusable live-state signal on the bench.
- **Terminal Phosphor** (`#34d399`): Terminal skin readout and caret; usable wherever a console-live accent is needed.
- **Flap Amber** (`#fffbeb` digits / `#b45309` labels): Split-flap board language; usable for board-style live accents.

### Neutral
- **Soft Paper** (`#f5f5f5`): Page background (`--color-fd-background`).
- **Card Wash** (`#f1f1f1`): Skin and surface fills (`--color-fd-card`), often at reduced opacity.
- **Graphite Muted** (`#737373`): Secondary copy (`--color-fd-muted-foreground`).
- **Hairline Border** (`#cccccc80`): Panel edges (`--color-fd-border`).
- **Accent Wash** (`#d1d1d180`): Hover wash on ghost controls (`--color-fd-accent`).
- **Focus Ring** (`#a3a3a3`): Focus token (`--color-fd-ring`).
- **Dark Paper / Dark Card / Dark Muted** (`#121212` / `#191919` / `#212121`): Dark-mode Fumadocs surfaces.
- **Terminal Well** (`#07140f`): Terminal skin field only (fixed dark well inside either theme).
- **Flap Board** (`#1c1917`): Split-flap panel field.

### Named Rules
**The Bench Chrome Rule.** Page chrome stays on Fumadocs neutrals. Instrument accents (Running Ember, Terminal Phosphor, Flap Amber) may appear outside skins when a control needs a live-state signal — never as a purple/blue glow theme.

**The One Session Rule.** One shared stopwatch drives header readout and gallery faces; do not invent parallel decorative timers.

## Typography

**Display Font:** Inter (with ui-sans-serif / system-ui)
**Body Font:** Inter (with ui-sans-serif / system-ui)
**Label/Mono Font:** ui-monospace stack (SF Mono / Menlo / Consolas)

**Character:** Neutral sans for the bench; monospace for anything that behaves like a reading from an instrument.

### Hierarchy
- **Display** (700, `1.875rem` / `text-3xl`, tight tracking): Home brand title “Watchstop”.
- **Headline** (600, ~`1.25rem`): Section titles inside docs content (Fumadocs defaults).
- **Title** (500, `1rem`): Inline emphasis, pill CTA label weight.
- **Body** (400, `1rem`, comfortable leading, max ~`65ch` on home supporting copy): Explanatory prose.
- **Label** (600, `0.625rem` / `10px`, `0.2em` tracking, uppercase): Skin captions (`chronograph // skin`) and figure captions.
- **Mono readout** (400–600, `1rem`–`1.875rem`, tabular-nums): Session header clock and skin elapsed values.

### Named Rules
**The Instrument Type Rule.** Elapsed time, raw ms, and skin captions stay monospace + tabular nums. Marketing display fonts are out of bounds.

## Layout

Home content sits in a single column `max-w-5xl` with `px-4`, `pt-8`, `pb-16`, and section `gap-8`. Brand mark is compact (40px) above the title; gallery and copy left-align in that column rather than centering every block. Supporting prose uses `max-w-[65ch]`. The watch gallery is a responsive grid: chronograph spans full width, terminal and split-flap share a two-column row from `md` up, with `gap-3` inside the gallery. Docs pages keep Fumadocs sidebar + TOC chrome; custom layout only trims sidebar horizontal padding and stabilizes scrollbar gutter. Spacing rhythm is the 4pt ladder (4, 8, 12, 16, 24, 32, 48); sibling groups use `gap`, not nested card stacks.

### Named Rules
**The Faces-First Rule.** On the home surface, the gallery precedes explanatory copy and adapter links.

## Elevation & Depth

Flat-by-default Fumadocs surfaces. Depth comes from tonal card washes, hairline borders, and — inside skins — material effects that belong to the instrument (terminal inset phosphor glow, split-flap inner shadow and digit seam). Soft `shadow-sm` appears on the home pill CTA only. No multi-layer marketing drop shadows.

### Shadow Vocabulary
- **Pill lift** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.05)` via `shadow-sm`): Home “Check the math” chip only.
- **Terminal well** (`box-shadow: inset 0 0 40px rgba(16,185,129,0.12)`): Terminal skin field.
- **Flap inner** (`box-shadow: inset …` via `shadow-inner`): Split-flap digit tiles.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Glow and inner shadow appear only as skin material or a single quiet CTA lift — never as page atmosphere.

## Shapes

Controls use gently curved `rounded-md` (`0.375rem`). Instrument panels use larger `rounded-xl` (`0.75rem`). The home math CTA is a full pill (`rounded-full`) with a slight `-rotate-1` that settles to `0` on hover (respect `motion-reduce`). Borders are hairline Fumadocs borders on chronograph panels; terminal and flap skins use darker emerald/stone borders that match their wells. Digits on the flap board are short rounded tiles with a horizontal seam.

## Components

### Buttons
- **Shape:** Gently curved controls (`rounded-md` / `0.375rem`); home CTA is a pill.
- **Ghost (session Start/Stop/Reset and math demo controls):** Transparent, `text-xs font-medium`, min 44×44, `hover:bg-fd-accent`, disabled at 40% opacity.
- **Pill CTA (“Check the math”):** Border + `bg-fd-card/60`, `shadow-sm`, Sigma icon, slight tilt interaction.
- **Hover / Focus:** Accent wash hover; Fumadocs ring token for focus. No glow rings.

### Cards / Containers
- **Corner Style:** Instrument panels `rounded-xl` (`0.75rem`)
- **Background:** Chronograph uses `bg-fd-card/40`; terminal `#07140f`; flap `bg-stone-900`
- **Shadow Strategy:** See Elevation — inset material on skins only
- **Border:** `border-fd-border` (chronograph) or skin-matched emerald/stone borders
- **Internal Padding:** `p-4` (`16px`) with caption / face / footer stack

### Inputs / Fields
- **Style:** Inherited from Fumadocs search and docs chrome; do not invent a parallel field language on custom surfaces.
- **Focus:** Fumadocs ring token.

### Navigation
- **Style:** Fumadocs home/docs layouts. Brand is logo (24px in nav, 40px on home) + “Watchstop”. Secondary nav slot holds the session stopwatch readout and controls — never overlapping GitHub or search.
- **Mobile:** Fumadocs mobile sidebar; keep session controls usable at 44×44.

### Signature: Watch skins
- **Chronograph:** SVG dial on Soft Paper card wash; Running Ember hand/hub while running; uppercase mono caption; raw ms footer.
- **Terminal:** Dark well, phosphor mono `$ elapsed`, pulsing caret while running.
- **Split-flap:** Stone board, amber captions, animated digit tiles with seam; “board readout” footer.
- **Gallery:** One shared session; chronograph full-bleed row, then terminal | split-flap.

### Signature: Session stopwatch
- Mono `mm:ss.cc` with muted centiseconds; Start/Stop + Reset ghost buttons; auto-starts with the session.

## Do's and Don'ts

### Do:
- **Do** keep live faces primary and Fumadocs chrome quiet.
- **Do** reuse Running Ember, Terminal Phosphor, or Flap Amber when a control needs a live-state signal.
- **Do** drive header and gallery from one session stopwatch.
- **Do** use the 4pt spacing ladder and `gap` between siblings.
- **Do** keep control hit targets at least 44×44.

### Don't:
- **Don't** restyle the whole Fumadocs theme or import sm17p.me’s art-led atmosphere.
- **Don't** ship purple/blue glow, nested cards, or equal three-up feature-card grids as the composition.
- **Don't** center every block or invent parallel decorative timers.
- **Don't** invent APIs, testimonials, or benchmarks in UI chrome.
- **Don't** place the session stopwatch where it fights GitHub or search.
