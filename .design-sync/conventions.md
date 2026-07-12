# HiveK UI — build conventions

HiveK is a KOL / influencer-marketing platform (Vietnamese-first). Components are
real React, compiled from the `apps/client` Next.js app, exposed on
`window.HiveKUI.*` and imported from the bundle. Content is Vietnamese by default.

## Styling idiom: Tailwind v4 utility classes + CSS custom-property tokens

Style with Tailwind utility classes (the compiled stylesheet ships in the bundle).
Colours come from CSS variables — use the semantic utility classes, not raw hex:

| Purpose | Class / token |
|---|---|
| Brand / primary (amber `#f59e0b`) | `bg-primary`, `text-primary`, `border-primary-soft`, `bg-primary-soft` |
| Body text | `text-foreground`, muted: `text-foreground-muted`, `text-muted` |
| Surfaces | `bg-card`, `bg-muted`, page: `bg-background-light` / `bg-background-dark` |
| Accents | `--color-tech-blue` (#3b82f6), `--color-creator-purple` (#8b5cf6), `--color-success` |
| Radius | cards `rounded-2xl` / `rounded-[2rem]`, buttons `rounded-xl`, pills `rounded-full` |
| Shadow | `shadow-sm`, hero cards `shadow-[0_8px_30px_rgb(0,0,0,0.06)]` |

Dark mode is class-based: the `.dark` class on an ancestor swaps the token values
(NOT `prefers-color-scheme`). Weights run heavy — headings `font-black`/`font-bold`.

## Icons: Material Symbols

Icons are `<span className="material-symbols-outlined">icon_name</span>` (the font
is loaded via the shipped stylesheet). Use ligature names like `trending_up`,
`payments`, `monitoring`, `person_add`, `search`.

## Core primitives (compose these first)

- **Button** — `variant`: default (amber) | outline | ghost | secondary | link;
  `size`: default | sm | lg | icon. `<Button variant="outline" size="lg">…</Button>`
- **Badge** — `variant`: default | success | warning | secondary. Small status pills.
- **Card / CardHeader / CardTitle / CardDescription / CardContent** — surface container;
  compose the parts (`<Card><CardHeader><CardTitle/><CardDescription/></CardHeader><CardContent/></Card>`).
- **Input**, **Label** — form controls; pair `<Label htmlFor>` + `<Input id>`.
- **ChartContainer / ChartTooltip / ChartTooltipContent** — recharts wrappers; charts
  need an explicit sized wrapper.

Feature components (KpiOverview, CampaignStatsGrid, ProductCard, DashboardKpiCards,
SearchResultsList, …) are higher-level compositions built from these — take plain data
props (arrays/objects), no context providers required.

## Where the truth lives

- Styling tokens + utilities: the shipped `styles.css` → `_ds_bundle.css` (read it before
  inventing colours).
- Per-component API + usage: each component's `<Name>.prompt.md` and `<Name>.d.ts`.

## Idiomatic snippet

```jsx
const { Card, CardHeader, CardTitle, CardContent, Badge, Button } = window.HiveKUI;

<Card className="rounded-2xl border-primary-soft shadow-sm">
  <CardHeader>
    <CardTitle>Chiến dịch Cocoon</CardTitle>
    <Badge variant="success">Đang chạy</Badge>
  </CardHeader>
  <CardContent className="flex items-center justify-between gap-4">
    <p className="text-2xl font-black text-foreground">2,4 triệu lượt tiếp cận</p>
    <Button variant="default" size="lg">
      Xem chi tiết
      <span className="material-symbols-outlined">arrow_forward</span>
    </Button>
  </CardContent>
</Card>
```
