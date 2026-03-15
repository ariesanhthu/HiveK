## Mẫu JSON và mã ví dụ Next.js

### Ví dụ Next.js fetch data cho trang Ranking (ISR)

Next.js cho phép set revalidation theo thời gian bằng `fetch(..., { next: { revalidate: seconds } })`.  

`src/app/(public)/rankings/kols/page.tsx` (Server Component):
```ts
// src/app/(public)/rankings/kols/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bảng xếp hạng KOL",
  description: "Xếp hạng KOL/KOC theo hiệu suất và minh bạch."
};

type RankingItem = {
  kol: { id: string; slug: string; displayName: string; niche: string; followerCount: number; ratingScore: number };
  score: number;
  rank: number;
  badges: Array<{ code: string; name: string }>;
};

export default async function KOLRankingsPage() {
  const res = await fetch(`${process.env.API_BASE_URL}/api/v1/rankings/kols?limit=50`, {
    // ISR: refresh mỗi 5 phút
    next: { revalidate: 300 }
  });

  if (!res.ok) {
    // Có thể map problem+json sang UI error boundary
    throw new Error("Failed to load rankings");
  }

  const json = (await res.json()) as { data: RankingItem[] };
  const rows = json.data;

  return (
    <main>
      <h1>Bảng xếp hạng KOL</h1>
      <ol>
        {rows.map((r) => (
          <li key={r.kol.id}>
            <a href={`/kol/${r.kol.slug}`}>{r.rank}. {r.kol.displayName}</a>
            {" "}— Score: {r.score.toFixed(2)}
          </li>
        ))}
      </ol>
    </main>
  );
}
```

### Ví dụ form handling với Server Actions (tạo Campaign)

Server Actions có thể gọi từ `<form>` và tích hợp với cơ chế caching/revalidation của Next.js.  

`src/app/(app)/business/campaigns/new/actions.ts`:
```ts
"use server";

import { z } from "zod";

const CreateCampaignSchema = z.object({
  name: z.string().min(3),
  productName: z.string().min(1),
  budget: z.coerce.number().positive(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

export async function createCampaignAction(prevState: any, formData: FormData) {
  const parsed = CreateCampaignSchema.safeParse({
    name: formData.get("name"),
    productName: formData.get("productName"),
    budget: formData.get("budget"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const res = await fetch(`${process.env.API_BASE_URL}/api/v1/campaigns`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // TODO: lấy access token từ cookie/session (cơ chế auth cụ thể: không xác định)
      "Authorization": `Bearer ${process.env.DEV_ACCESS_TOKEN ?? ""}`,
    },
    body: JSON.stringify({
      ...parsed.data,
      currency: "VND",
      status: "DRAFT",
      kpiTargets: [],
      requirements: {},
      description: ""
    })
  });

  if (!res.ok) {
    const problem = await res.json().catch(() => null);
    return { ok: false, problem };
  }

  const json = await res.json();
  return { ok: true, campaignId: json.data.id };
}
```

`src/app/(app)/business/campaigns/new/page.tsx`:
```tsx
import { createCampaignAction } from "./actions";

export default function NewCampaignPage() {
  return (
    <main>
      <h1>Tạo chiến dịch</h1>
      <form action={createCampaignAction}>
        <label>
          Tên chiến dịch
          <input name="name" required minLength={3} />
        </label>

        <label>
          Sản phẩm
          <input name="productName" required />
        </label>

        <label>
          Ngân sách (VND)
          <input name="budget" type="number" required min={1} />
        </label>

        <label>
          Ngày bắt đầu
          <input name="startDate" type="date" required />
        </label>

        <label>
          Ngày kết thúc
          <input name="endDate" type="date" required />
        </label>

        <button type="submit">Lưu</button>
      </form>
    </main>
  );
}
```

### Metadata và structured data (SEO)

Dùng `generateMetadata`/`metadata` để tăng SEO và chia sẻ mạng xã hội.  
Nếu cần JSON-LD: theo guide JSON-LD của Next.js.  

