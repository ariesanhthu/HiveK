## Thiết kế website Next.js cho giao diện

### Cấu trúc thư mục dự án và quy ước routing

Khuyến nghị dùng **App Router** (thư mục `app/`) và tách nhóm route bằng route groups để quản lý layout theo vùng public/app:

```
src/
  app/
    (public)/
      page.tsx                      // Home
      rankings/
        kols/page.tsx               // Public ranking KOL
        businesses/page.tsx         // Public ranking Business
      kol/[slug]/page.tsx           // Public KOL profile
      business/[slug]/page.tsx      // Public Business profile (optional)
      auth/
        login/page.tsx
        register/page.tsx
      legal/
        terms/page.tsx
        privacy/page.tsx
    (app)/
      layout.tsx                    // App shell (nav/sidebar)
      business/
        page.tsx                    // Business dashboard
        campaigns/
          page.tsx
          new/page.tsx
          [id]/page.tsx
          [id]/participants/page.tsx
      kol/
        page.tsx                    // KOL dashboard
        profile/page.tsx
        campaigns/
          page.tsx                  // invited/applied/active
          discover/page.tsx         // list OPEN campaigns
          [id]/page.tsx
      admin/                         // Admin console
        page.tsx
        users/page.tsx
        campaigns/page.tsx
        verifications/page.tsx
    api/
      v1/
        auth/route.ts
        campaigns/route.ts
        campaigns/[id]/route.ts
        ...
  lib/
    api-client.ts
    auth.ts
    db.ts
    validation/
  components/
    ui/
    forms/
    campaign/
    profile/
```

Lý do: App Router hỗ trợ **Route Handlers** ngay trong `app/` để làm API nếu cần (BFF), và Route Handlers là tương đương API routes ở Pages Router.  

### Quyết định SSR/SSG/ISR cho từng nhóm trang

Nguyên tắc:  
- Trang **public cần SEO** và dữ liệu thay đổi theo chu kỳ → ưu tiên **ISR/time-based revalidation**. Next.js hỗ trợ `next.revalidate` để đặt cache lifetime; hoặc segment-level config.  
- Trang **dashboard cá nhân hoá** → **dynamic rendering/SSR** (no-store) để luôn đúng theo user. Next.js phân biệt static vs dynamic rendering theo cách fetch và cache.  

Bảng quyết định:

| Trang | Rendering khuyến nghị | Lý do | Cấu hình gợi ý |
|---|---|---|---|
| `/` Home | SSG | Nội dung giới thiệu | mặc định |
| `/rankings/kols` | ISR | SEO + ranking update theo giờ/ngày | `fetch(..., { next: { revalidate: 300 } })` |
| `/rankings/businesses` | ISR | tương tự | revalidate 300–1800s |
| `/kol/[slug]` public | ISR + on-demand | tránh SSR nặng, nhưng update khi có review/metrics | revalidate 600s + webhook revalidate |
| `/auth/*` | SSG | ít dữ liệu | mặc định |
| `/app/business/*` | SSR/dynamic | dữ liệu theo Business | `cache: 'no-store'` hoặc segment dynamic |
| `/app/kol/*` | SSR/dynamic | dữ liệu theo KOL | tương tự |
| `/app/admin/*` | SSR/dynamic | nhạy cảm | no-store + strict auth |

### Component tree, state management và data flow

Khuyến nghị phân lớp:
- **Server Components** lo: fetch danh sách, render bảng ranking, preload dữ liệu (giảm JS client).  
- **Client Components** chỉ dùng cho: form, tương tác (filter UI, modal), charts.  

State management:
- **Server state**: ưu tiên fetch ở Server Components và truyền xuống.  
- **Client state**: dùng React state + URL search params cho filter/sort; nếu cần cache client (nhiều tương tác) có thể dùng TanStack Query/SWR (*thư viện cụ thể: không xác định; tuỳ team*).

Form handling:
- Dùng **Server Actions** cho mutation nếu muốn giảm boilerplate endpoint, và vì Server Actions tích hợp với caching/revalidation của Next.js.  
- Nếu hệ thống backend tách rời: dùng fetch tới REST API và xử lý optimistic UI tại client.

### Styling, accessibility, i18n, performance, SEO

Accessibility (bắt buộc trong quy định coding):
- Tuân thủ WCAG 2.2 (được công bố là W3C Recommendation).  
- Với component custom (tabs, combobox, modal), bám APG của WAI-ARIA để đảm bảo semantics và keyboard interaction.  
- Form error: luôn có `aria-describedby`, focus vào field lỗi đầu tiên, và danh sách lỗi tổng ở đầu form (đề xuất thực thi).

i18n:
- Nếu bật đa ngôn ngữ, dùng guide i18n cho App Router của Next.js.  
- Chuẩn URL: `/vi/...`, `/en/...` (prefix-based) để SEO tốt (đề xuất).

SEO:
- Dùng Metadata API (`metadata` hoặc `generateMetadata`) để đặt title/description/OG.  
- Dùng JSON-LD cho trang public (KOL profile, ranking) theo guide Next.js JSON-LD và theo hướng dẫn structured data của Google.  
- Nội dung SEO base: theo SEO Starter Guide của Google.  

Performance:
- Trang ranking nên server-render với ISR; client chỉ hydrate phần filter cần thiết. (Giảm JS, cải thiện TTFB/LCP).  
- Use streaming/loading UI (`loading.tsx`) và error boundary (`error.tsx`) theo conventions App Router (*cụ thể file: phụ thuộc quyết định UI; không xác định*).  
- Tránh N+1 fetch: gom API calls.

