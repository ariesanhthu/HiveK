## KOL Public Profile: hiện tại đang gọi API hay tải local?

Hiện tại câu trả lời ngắn là:

- **Page public profile `/kol/[id]` không gọi social API trực tiếp khi render**
- **Ranking `/kol-ranking` cũng không gọi YouTube trực tiếp khi render**
- App đang đọc từ **seed local + cache local**
- Chỉ có route sync `POST /api/ranking/sync` mới đi lấy dữ liệu ngoài

---

## 1) Source of truth hiện tại

Hiện tại dữ liệu profile/ranking KOL đi theo 2 lớp:

### Lớp 1: seed local cố định

File:

- `apps/client/src/data/kol-ranking.ts`

Seed này giữ:

- `id`
- `name`
- `niche`
- `platform`
- `followers`
- `rating`
- `engagementRate`
- `youtubeHandle`
- `avatarUrl` mặc định

Đây là **base dataset** để app luôn render được kể cả khi không sync social.

### Lớp 2: cache local sau khi sync

File:

- `apps/client/src/data/.kol-cache.json`

Cache này hiện đang lưu:

- `name`
- `avatarUrl`
- `followers`
- `syncedAt`

Khi có cache, app sẽ ưu tiên lấy:

- `avatarUrl`
- `followers`

từ cache để đè lên seed.

Lưu ý:

- `name` hiện vẫn nên coi seed là nguồn chính để tránh lỗi encoding khi scrape HTML YouTube có Unicode.

---

## 2) Runtime page hiện tại làm gì

### `/kol-ranking`

Route/API liên quan:

- `apps/client/src/app/api/ranking/kols/route.ts`
- `apps/client/src/app/api/ranking/kols/live/route.ts`
- `apps/client/src/features/kol-ranking/server/get-kol-rankings.ts`
- `apps/client/src/features/kol-ranking/server/ranking-dataset.ts`

Luồng:

1. UI gọi `/api/ranking/kols/live`
2. SSE route gọi `getKolRankings()`
3. `getKolRankings()` đọc từ `ranking-dataset.ts`
4. `ranking-dataset.ts` merge:
   - seed từ `kol-ranking.ts`
   - cache từ `.kol-cache.json` nếu có
5. UI render table

Tức là:

- **runtime ranking không fetch YouTube**
- chỉ đọc dữ liệu local đã có sẵn trong project

### `/kol/[id]`

Route:

- `apps/client/src/app/(public)/kol/[id]/page.tsx`

Luồng:

1. page lấy `id`
2. gọi `getKolById(id)`
3. `getKolById()` đọc cùng dataset của ranking
4. map sang certificate/profile UI

Tức là:

- **profile page cũng không gọi social API trực tiếp**
- nó dùng đúng dataset đã được ranking dùng

---

## 3) Chỗ nào mới thật sự gọi dữ liệu ngoài

Chỉ có route:

- `apps/client/src/app/api/ranking/sync/route.ts`

Route này dùng để **đồng bộ dữ liệu social/public vào local cache**.

### Thứ tự ưu tiên hiện tại

#### Mode 1: YouTube Data API v3

File:

- `apps/client/src/features/kol-ranking/services/youtube-api.ts`

Nếu `YOUTUBE_API_KEY` dùng được và YouTube API đã enable:

- gọi `channels.list`
- lấy title
- lấy thumbnail/avatar
- lấy subscriber count

#### Mode 2: public HTML scrape fallback

File:

- `apps/client/src/features/kol-ranking/services/youtube-public-scraper.ts`

Nếu API fail hoặc chưa enable:

- fetch public page `https://www.youtube.com/@handle`
- parse:
  - `og:title`
  - `og:image`

Mode này hiện dùng tốt để lấy:

- avatar thật
- title public cơ bản

Nhưng không đáng tin bằng API cho:

- subscriber count thật realtime
- Unicode title chuẩn tuyệt đối

---

## 4) Vậy hiện tại app đang “gọi API” hay “tải về”?

Đúng nhất là:

- **Không gọi social API trong lúc user mở page**
- **Có 1 bước sync riêng để tải metadata về local cache**
- Sau đó runtime chỉ **đọc local cache + seed**

Nói ngắn:

- **runtime = local-first**
- **sync = API/scrape**

Đây là mô hình khá ổn cho MVP vì:

- render nhanh
- không phụ thuộc quota social API mỗi request
- tránh rate limit
- dev/staging chạy ổn ngay cả khi external API lỗi

---

## 5) Data flow hiện tại

```mermaid
flowchart TD
    A[KOL seed local\nsrc/data/kol-ranking.ts] --> C[ranking-dataset.ts]
    B[Cache local\nsrc/data/.kol-cache.json] --> C
    D[POST /api/ranking/sync] --> E[YouTube API v3]
    D --> F[Public YouTube HTML scrape]
    E --> B
    F --> B
    C --> G[/api/ranking/kols]
    C --> H[/api/ranking/kols/live]
    C --> I[/kol/[id]]
```

---

## 6) Trạng thái implementation hiện tại

### Đã có

- ranking dùng cùng một dataset với profile page
- top performers có link sang `/kol/[id]`
- avatar thật có thể sync về local cache
- fallback scrape public hoạt động kể cả khi YouTube API chưa enable

### Chưa hoàn hảo

- scrape HTML YouTube có thể lỗi encoding với tên tiếng Việt
- follower count từ scrape public chưa đáng tin bằng API
- route sync hiện hợp nhất nhiều mode nhưng chưa có scheduler/background job

---

## 7) Kết luận kỹ thuật

Nếu hỏi chính xác:

**“profile hiện tại đang gọi API hay tải local?”**

thì câu trả lời là:

- **profile page đang đọc local**
- **không gọi YouTube/TikTok/Facebook trực tiếp khi render**
- dữ liệu social/public chỉ được lấy ở bước sync rồi lưu vào cache local

Đề xuất giữ như hiện tại cho MVP:

1. render từ `seed + cache`
2. sync thủ công hoặc cron qua `/api/ranking/sync`
3. chỉ bật social API thật khi cần subscriber/avatar chuẩn realtime

Nếu muốn phase tiếp theo, nên tách rõ 3 mode:

1. `manual seed`
2. `cached social snapshot`
3. `live social adapter`
