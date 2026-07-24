# HiveK design-sync notes

Source DS = the UI layer of the Next.js app `apps/client` (there is no standalone
design-system package). Synced as the `package` shape in **synth-entry mode** (no
`dist/` — `next build` produces an app, not an importable component library).

## Repo-specific setup

- **`pkg: "client"`** resolves via the workspace symlink `node_modules/client -> ../apps/client`,
  so `PKG_DIR = apps/client`. Consequence: `cfg.tsconfig` and `cfg.cssEntry` are resolved
  **relative to `apps/client`** (`cfgPath` uses PKG_DIR), but `cfg.srcDir` is resolved
  **relative to the repo root** (different resolver in `deriveComponentsFromSrc`). Mixed bases —
  don't "fix" one to match the other; both are correct as written.
- `--node-modules` = **repo root `./node_modules`** (react/react-dom are hoisted there, not in
  `apps/client/node_modules`).

## CSS (Tailwind v4)

- Styling is Tailwind v4 via `apps/client/src/styles/globals.css` (`@import "tailwindcss"` +
  custom `:root` tokens + a `@layer utilities` block). esbuild can't follow `@import "tailwindcss"`,
  so `cssEntry` must point at a **compiled** stylesheet, not the source.
- Compiled with `.ds-sync/compile-css.mjs` (PostCSS + `@tailwindcss/postcss`) →
  `apps/client/src/styles/_ds_compiled.css` (~108KB, committed into the app tree by the user's
  choice). **Re-sync: re-run `node .ds-sync/compile-css.mjs` if component classes changed**, else
  new utility classes won't be in the shipped CSS.

## bundle.mjs fork (declared in cfg.libOverrides)

`.design-sync/overrides/bundle.mjs` adds a `serverStub` esbuild plugin that resolves to empty
no-op modules:

- **Server guards + node built-ins** (`server-only`, `client-only`, `fs`, `path`, `os`, `crypto`,
  `stream`, `util`, `node:*`) — client feature components transitively reach `server/` data loaders
  and app-router files; a browser render never executes those paths.
- **CSS side-effect imports** (`tailwindcss`, `*.css`) — `app/layout.tsx` does
  `import "../styles/globals.css"`; the real styles ship via `cssEntry` instead.
  The stub is CJS + Proxy so any _named_ import (`readFileSync`, `join`, …) resolves to a no-op fn.
  Output contract (IIFE header/export shape) is unchanged. Sibling import repointed to
  `../../.ds-sync/lib/common.mjs`; needs `.design-sync/node_modules` symlink to resolve `esbuild`.

## Discovery / scope

- Synth discovery walks ALL `.tsx/.jsx/.mdx` under `srcDir` and takes every PascalCase value
  export as a component → over-includes app-shell. **40 excluded** via `componentSrcMap: {Name: null}`:
  route/page/layout wrappers (`*Route`, `*RoutePage`, `*Layout`, `RootLayout`, `Page`),
  loading/skeleton (`*Loading`, `*Skeleton`, `Loading`), lazy wrappers (`Lazy*`), `AppProviders`,
  and top-level `*Page` route entries. **90 components remain.** (User chose "sync all";
  the excluded 40 are non-DS shell, not feature components.)

## Render / browser (NixOS!)

- This box is **NixOS** — a downloaded playwright Chromium can't run (missing FHS shared libs:
  libglib, libnss, libatk, libdbus…). `~/.cache/ms-playwright/chromium-1228` is cached but unusable.
- Fix: use **nixpkgs chromium** (`nix build nixpkgs#chromium`, ~129MB substituted, prebuilt — not a
  source build) and point playwright at it via `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
  playwright pin installed = `1.61.0` (matches cache build 1228) but the executable is the nix one.

## Known weaknesses / Re-sync risks

- **`.d.ts` contracts are weak** — synth-entry + CVA `VariantProps` means ts-morph emits
  `{ [key: string]: unknown }` for most components (e.g. `ButtonProps`). The design agent gets no
  real prop API. Fix per-component with `cfg.dtsPropsFor` for the core primitives if time allows.
- `next/font/google` `Inter` import in `layout.tsx` warns "always undefined" — benign (layout is
  excluded from components; the font is a runtime concern, not shipped).
- `_ds_compiled.css` is a **generated snapshot** of Tailwind output — regenerate on any class change
  (see CSS section). It lives in the product tree by user choice.
- 1 CSS token referenced-but-undefined (below threshold, non-blocking).

## Preview authoring learnings (folded from batch runs — 54 authored, all graded good)

### Recharts marks capture blank in the static harness

- The headless single-shot capture doesn't paint recharts marks by default (the app's own chart components capture blank too — only the grid frame shows).
- Per-preview fix: pass EXPLICIT pixel `width`/`height` to the inner recharts chart (ResponsiveContainer measures 0 async), give ChartContainer a fixed-size wrapper, and set `isAnimationActive={false}` on series (mount animation collapses bars).
- `<Pie>`/donut still captures empty even with animation off (internal animation timing) — graded on layout/content per rubric. `PlatformNicheAnalytics` donut is the known case.

### ChartContext is not exported

- `ChartTooltipContent`/`useChart()` only get context via a `ChartContainer`. Pattern: wrap in ChartContainer with a 1×1 throwaway chart as the ResponsiveContainer child + the tooltip card as a second child cast `as never`.
- `ChartTooltip` (recharts `Tooltip` re-export) can't be triggered statically (needs pointer hover) — its exact output is captured in the `ChartTooltipContent` preview; graded on composition.

### Capture viewport width

- Capture viewport is ~740–900px wide. Wide composites using `xl:` grids (≥1280px) crop on the right. Cap preview wrappers at ≤880px so they collapse to the visible `md`/`lg`/stacked layout. Not a defect — content is complete.

### Overlays (drawers/modals)

- `fixed inset-0` overlays (CampaignCreateDrawer `isOpen`, CreatorContactModal mount-to-show) render fine wrapped in `position:relative; overflow:hidden` — NO cardMode override needed.

### Misc

- `componentSrcMap` is NOT the discovery gate for authored previews — `ds-bundle/.stories-map.json` + owned `previews/*.tsx` are. The 40 null exclusions + 2 collision excludes are still needed for the bundle export list.
- Local `/public` assets (`/logo.png`) show alt text in captures — benign.
- Mock data files (e.g. `mock-campaign-management.ts`) are NOT package-exported; previews define realistic data inline.

## Known render warns (re-syncs: these are expected, not new)

- Recharts/chart components render thin/blank in capture: PlatformNicheAnalytics (Pie), ScoreDistributionCharts, ProfileRadarChart, ChartTooltip, CampaignKpiDonut, ChartContainer edge cases.
- Wide composites clipped at sheet frame: KpiOverview, OverviewPanel, AnalyticsPanel, KolVerificationCertificateView, FindEntryForm, SearchResultsList, KolComparisonTable.
- `[FONT]` material-symbols: shipped via Google Fonts @import in _ds_compiled.css.
