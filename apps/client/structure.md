# Cấu trúc `apps/client/`

Next.js 16 frontend (App Router).

## Thư mục chính

- **`src/app/`** – Routes & layouts
  - `layout.tsx` – Root layout (font, metadata)
  - `(public)/` – Nhóm route public (landing)
    - `layout.tsx` – Header + dynamic Footer
    - `page.tsx` – Trang chủ → LandingPage
    - `loading.tsx` – Loading UI (skeleton) khi chuyển route / load page
    - `kol-ranking/page.tsx` – Trang xếp hạng KOL real-time
  - `(business)/dashboard/page.tsx` – Trang Business Dashboard (KPI, campaign performance, execution queue)
  - `(business)/kol-matching/page.tsx` – Trang matching flow 4 bước (entry → processing → results → comparison)
  - `api/ranking/kols/route.ts` – Endpoint snapshot ranking (JSON)
  - `api/ranking/kols/live/route.ts` – SSE stream ranking real-time
- **`src/components/global/`**
  - `layout/` – MainHeader, MainFooter
  - `sections/` – Hero, PlatformBenefits, TopPerformers, ActiveCampaigns, CTA, **section-skeleton**
  - **`lazy-*.tsx`** (platform-benefits, top-performers, active-campaigns, cta) – Mỗi file 1 dynamic import, load khi scroll vào viewport (hook `useInView`)
- **`src/components/ui/`** – UI primitives:
  - `badge.tsx` – Badge dùng `cva` cho variant UI
  - `card.tsx` – Card primitives (Card, CardHeader, CardContent, ...)
  - `chart.tsx` – Chart primitives theo shadcn (ChartContainer, ChartTooltip, ChartTooltipContent, `ChartConfig`)
- **`src/hooks/use-in-view.ts`** – Hook Intersection Observer, không phụ thuộc section nào → giảm compile scope
- **`src/features/landing/`** – LandingPage (Hero sync + 4 sections lazy)
- **`src/features/kol-ranking/`** – Feature ranking tách riêng:
  - `components/` – Page composition, filters, table, pagination
  - `hooks/use-kol-ranking-realtime.ts` – Hook kết nối SSE + reconnect
  - `server/` – Data layer và filter parser cho ranking
  - `types.ts` – Typed contracts cho ranking
- **`src/features/business-dashboard/`** – Feature dashboard cho business workspace:
  - `components/` – Dashboard shell layers (sidebar, topbar, KPI cards, performance, activities)
  - `hooks/use-business-dashboard-data.ts` – State period (weekly/monthly) + data mapper
  - `types.ts` – Typed contracts cho nav, metrics, trend chart, activities
  - `index.ts` – Public entry export `BusinessDashboardPage`
- **`src/features/kol-matching/`** – Feature KOL/KOC matching theo step:
  - `components/` – Stepper + step views (entry form, agent processing, `search-results-list`, `search-results-filters-panel`, comparison)
  - `hooks/use-kol-matching-flow.ts` – Orchestrate state machine của flow (gồm `inviteSelected` stub)
  - `hooks/use-search-results-filters.ts` – State + derived list cho filter step 3
  - `services/kol-matching-service.ts` – Search/scoring pipeline (mock service, ready để cắm MCP/API)
  - `services/search-results-filter-service.ts` – Pure filter helpers cho danh sách KOL (platform, niche, followers, ER)
  - `types.ts` – Typed contracts cho entry, stages, candidates, comparison metrics
  - `index.ts` – Public entry export `KolMatchingPage`
- **`src/lib/utils.ts`** – `cn()` helper

## Tối ưu load

- **Initial:** Chỉ load HeroSection + MainHeader (+ layout). Footer và 4 section dưới load dynamic.
- **Khi scroll:** Mỗi section load khi vào viewport (LazySection) → chunk tách riêng, không build hết lúc đầu.
- **Loading state:** `loading.tsx` cho route; SectionSkeleton cho từng section đang load.
