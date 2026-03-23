# docs/Architecture/frontend/structure.md

## Purpose

Mô tả kiến trúc frontend tham chiếu cho HIVEK, dùng làm **spec docs-first** cho team client và cho hệ thống graph React Flow (`docs/visual/`).  
Đây không phải source code chạy production, mà là **mẫu kiến trúc Next.js 14 App Router + feature-based** cho:
- public marketing website (landing, ranking, profile,…)
- phân nhóm route theo role (public/auth/dashboard)
- tách `features/`, `components/`, `styles/` rõ ràng.

## Folder layout

```text
docs/Architecture/frontend/
  app/                # Cấu trúc App Router demo (docs-only)
  components/         # Global UI components dùng chung nhiều feature
  features/           # Mỗi feature business 1 thư mục riêng
  styles/             # Global styles + mapping brand palette
  pages.md            # Liệt kê toàn bộ page, URL, component, API
  ux-ui-style.md      # Brand palette + UI guideline cho frontend
  structure.md        # (file này) – mô tả kiến trúc + link với graph
```

### `app/` (Next App Router doc)

```text
app/
  layout.tsx              # Root layout chung cho toàn bộ app
  (public)/               # Route group cho các trang không cần login
    layout.tsx            # Layout riêng cho group public (header/footer)
    page.tsx              # Homepage landing sử dụng feature `landing`
```

- `layout.tsx`: demo dùng `next/font` (Inter) + `styles/globals.css` để map brand color từ `ux-ui-style.md`.
- `(public)/layout.tsx`: inject `MainHeader` + `MainFooter` global, đây là layout cho **nhóm user không đăng nhập** (anyone can access).
- `(public)/page.tsx`: chỉ delegate sang `features/landing/` (không chứa logic UI trực tiếp).

> Khi implement thật ở thư mục `client/`, có thể copy cấu trúc này sang `client/app/` và map lại relative import.

### `components/`

```text
components/
  global/
    layout/
      main-header.tsx     # Header sticky cho toàn site public
      main-footer.tsx     # Footer global
    sections/
      hero-section.tsx
      platform-benefits-section.tsx
      top-performers-section.tsx
      active-campaigns-section.tsx
      cta-section.tsx
```

Nguyên tắc:
- `components/global/layout/`: layout-level primitives (navbar, footer, shell).
- `components/global/sections/`: section reusable, có thể dùng lại giữa homepage, ranking page, dashboard marketing site.
- Không chứa business logic (fetch API, hooks) – chỉ nhận props hoặc dùng dummy data cho docs.

### `features/`

```text
features/
  landing/
    components/
      landing-page.tsx    # Compose các section global thành landing page
    hooks/                # (placeholder) hooks đặc thù landing
    server/               # (placeholder) server-side fetch / actions cho landing
  kol-ranking/
    components/           # Page-level UI cho bảng xếp hạng (table/filter/pagination)
    hooks/                # Realtime hooks (SSE/reconnect)
    server/               # Data adapter + filter parser + ranking source
  business-dashboard/
    components/           # Dashboard shell theo layers: sidebar, topbar, KPI, performance, activities
    hooks/                # Hook state + mapping data theo period (weekly/monthly)
    types.ts              # Typed contracts cho metrics/trend/activity
```

Nguyên tắc:
- Mỗi feature = 1 folder dưới `features/`.
- `components/`: UI riêng cho feature (page-level, widget gắn business), compose từ global components.
- `hooks/`: hooks đặc thù cho feature (data + UI state).
- `server/`: hàm server-side / data fetching riêng cho feature (ví dụ: `getTopKols()`, `getFeaturedCampaigns()`).

Hiện tại có 3 feature frontend:
- `landing` cho `/` (homepage, public), mapping với các section: `HeroSection`, `PlatformBenefitsSection`, `TopPerformersSection`, `ActiveCampaignsSection`, `CallToActionSection`.
- `kol-ranking` cho `/kol-ranking`, hỗ trợ filter + pagination + realtime stream để hiển thị bảng xếp hạng KOL.
- `business-dashboard` cho `/dashboard` (group `(business)`), tách dashboard thành nhiều layer UI để dễ maintain và mở rộng dữ liệu thật.

### `styles/`

```text
styles/
  globals.css
```

- Import Tailwind layer (`@tailwind base; @tailwind components; @tailwind utilities;`).
- Định nghĩa CSS variables mapping từ `ux-ui-style.md`:
  - `--color-primary` (#F59E0B)
  - `--color-secondary` (#FB923C)
  - `--color-tech-blue` (#3B82F6)
  - `--color-creator-purple` (#8B5CF6)
  - neutrals cho background / text.
- Thêm utility class nhẹ:
  - `.bg-background-light`, `.bg-background-dark`
  - `.text-primary`, `.bg-primary`, `.bg-primary-soft`, `.border-primary-soft`

> Đây là layer theme docs-first. Ở app thật, nên merge với Tailwind config + shadcn theo rule `ui-rule.mdc`.

## Relation to `pages.md`

`pages.md` là spec tổng các route. File này align như sau:

- Section **1. PUBLIC WEBSITE**:
  - `1.1 Homepage` → `app/(public)/page.tsx` → `features/landing/landing-page.tsx`.
  - Component list trong `pages.md`:
    - `HeroSection` → `components/global/sections/hero-section.tsx`
    - `PlatformBenefits` → `components/global/sections/platform-benefits-section.tsx`
    - `TopKOLPreview` → `components/global/sections/top-performers-section.tsx`
    - `FeaturedCampaigns` → `components/global/sections/active-campaigns-section.tsx`
    - `CTASection` → `components/global/sections/cta-section.tsx`
    - `Footer` → `components/global/layout/main-footer.tsx`

- Các page public khác (`/ranking/kols`, `/kol/[id]`…) **chưa** có code trong thư mục này, nhưng sẽ:
  - được đặt dưới `app/(public)/ranking/...` trong triển khai thật.
  - reuse global components (table, card, avatar, badge, tabs, pagination) khi được implement.

## Relation to `docs/visual/graph.json`

Graph React Flow (xem `docs/visual/PROMPT.md` + skill `react-flow.md`) yêu cầu node schema:
- node type: `feature`, `workflow`, `file`, `folder`, `note`.
- focus: **feature → workflow → file**.

Đối với folder này, đề xuất mapping tối thiểu:

### Feature nodes

- **Feature: `landing`**
  - `type`: `feature`
  - `label`: `Public Landing`
  - `description`: Homepage public cho mọi user (không login), giới thiệu KOLConnect.

### Workflow nodes (gợi ý)

- `landing.hero-and-nav`
- `landing.discovery-and-social-proof`
- `landing.campaign-preview`
- `landing.final-cta`

Mỗi workflow map tới 1–2 section:
- `landing.hero-and-nav` → `HeroSection` + `MainHeader`.
- `landing.discovery-and-social-proof` → `PlatformBenefitsSection` + `TopPerformersSection`.
- `landing.campaign-preview` → `ActiveCampaignsSection`.
- `landing.final-cta` → `CallToActionSection` + footer.

### File nodes (gợi ý)

Ví dụ các node `file` nên được thêm vào `graph.json`:
- `docs/Architecture/frontend/structure.md` (file này)
- `docs/Architecture/frontend/pages.md`
- `docs/Architecture/frontend/ux-ui-style.md`
- `docs/Architecture/frontend/app/layout.tsx`
- `docs/Architecture/frontend/app/(public)/layout.tsx`
- `docs/Architecture/frontend/app/(public)/page.tsx`
- `docs/Architecture/frontend/components/global/layout/main-header.tsx`
- `docs/Architecture/frontend/components/global/layout/main-footer.tsx`
- `docs/Architecture/frontend/components/global/sections/hero-section.tsx`
- `docs/Architecture/frontend/components/global/sections/platform-benefits-section.tsx`
- `docs/Architecture/frontend/components/global/sections/top-performers-section.tsx`
- `docs/Architecture/frontend/components/global/sections/active-campaigns-section.tsx`
- `docs/Architecture/frontend/components/global/sections/cta-section.tsx`
- `docs/Architecture/frontend/features/landing/components/landing-page.tsx`
- `docs/Architecture/frontend/styles/globals.css`

Các node `file` này nên:
- có `feature: "landing"` khi liên quan trực tiếp tới landing.
- có `workflow` tương ứng như phần trên để graph filter theo workflow.

> Hiện tại `graph.json` còn trống (`nodes: []`). Khi thêm node/edge đầu tiên, hãy follow schema bắt buộc trong `react-flow.md` và đảm bảo liên kết đầy đủ tới các file ở trên.

## Notes for agents

- Trước khi sửa bất kỳ file nào trong thư mục này:
  1. Đọc `docs/structure.md` (root docs).
  2. Đọc `docs/Architecture/frontend/structure.md` (file này).
  3. Đọc `docs/Architecture/frontend/pages.md` và `ux-ui-style.md` để hiểu spec.
  4. Đọc `docs/visual/graph.json` + `docs/visual/PROMPT.md` nếu change ảnh hưởng tới graph.

- Khi:
  - **thêm / xoá / rename** file / folder trong `docs/Architecture/frontend/`:
    - update lại section **File nodes (gợi ý)** nếu cần.
    - update `docs/visual/graph.json` tương ứng (node mới / xoá / rename).
  - thay đổi kiến trúc (ví dụ: thêm feature mới dưới `features/`, thêm group route mới trong `app/`):
    - bổ sung mô tả dưới mục `features/` bên trên.
    - thêm feature node + workflow node mới trong graph.

- Luôn giữ đồng bộ:
  - `pages.md` ↔ `app/` ↔ `features/` ↔ `components/`
  - và `docs/visual/graph.json` (feature → workflow → file).

