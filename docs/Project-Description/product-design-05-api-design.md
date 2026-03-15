## Thiết kế API REST và phác thảo GraphQL

### Chuẩn chung cho API

**Base URL & versioning**
- REST: `/api/v1/...` (hoặc domain riêng `api.example.com/v1/...`: *không xác định*)  
- Versioning theo path để dễ inventory và giảm rủi ro “deprecated API” (phù hợp tinh thần OWASP API inventory management).  

**Auth**
- Header: `Authorization: Bearer <access_token>` theo RFC 6750.  
- Token format: JWT theo RFC 7519.  

**Error format**
- Dùng `application/problem+json` theo RFC 9457.  

**Rate limit**
- Nếu implement header theo draft IETF: `RateLimit-Policy` và `RateLimit` (hoặc các biến thể draft) để client biết quota.  
- Khi vượt giới hạn, trả HTTP 429 và có thể gửi `Retry-After` theo RFC 6585.  

**Pagination**
- Khuyến nghị cursor-based: `?limit=20&cursor=...` trả `nextCursor`.  
- Sorting: `?sort=-createdAt` hoặc `?sort=score:desc`.

**Timestamp**
- Tất cả datetime theo RFC 3339.  

### Bảng tóm tắt endpoints REST v1

| Nhóm | Method | Path | Auth | Mô tả |
|---|---|---|---|---|
| Auth | POST | `/api/v1/auth/register` | Public | Đăng ký + chọn role |
| Auth | POST | `/api/v1/auth/login` | Public | Đăng nhập |
| Auth | POST | `/api/v1/auth/refresh` | Public | Refresh token (*cơ chế lưu refresh: không xác định*) |
| Auth | POST | `/api/v1/auth/logout` | User | Thu hồi refresh/session |
| User | GET | `/api/v1/me` | User | Lấy profile hiện tại |
| Admin | GET | `/api/v1/admin/users` | Admin | List & filter user |
| KOL | GET | `/api/v1/kols` | User | List KOL (business dùng để tìm) |
| KOL | GET | `/api/v1/kols/{kolId}` | User/Public (tuỳ visibility) | Xem KOL detail |
| KOL | PATCH | `/api/v1/kols/{kolId}` | KOL/Admin | Update KOL profile |
| Business | GET | `/api/v1/businesses/{businessId}` | User/Public (tuỳ) | Detail business |
| Business | PATCH | `/api/v1/businesses/{businessId}` | Business/Admin | Update business profile |
| Campaign | POST | `/api/v1/campaigns` | Business | Tạo campaign |
| Campaign | GET | `/api/v1/campaigns` | User | List (filter theo status/role) |
| Campaign | GET | `/api/v1/campaigns/{id}` | User | Detail campaign |
| Campaign | PATCH | `/api/v1/campaigns/{id}` | Business/Admin | Update campaign (ràng buộc) |
| Campaign | POST | `/api/v1/campaigns/{id}/publish` | Business | Publish (DRAFT→OPEN) |
| Matching | GET | `/api/v1/campaigns/{id}/suggested-kols` | Business | Rule-based suggestions (P1) |
| Participant | POST | `/api/v1/campaigns/{id}/invites` | Business | Invite KOL vào campaign |
| Participant | POST | `/api/v1/campaigns/{id}/applications` | KOL | KOL apply campaign |
| Participant | POST | `/api/v1/participants/{pid}/accept` | KOL/Business | Accept invite/app (tuỳ flow) |
| Participant | PATCH | `/api/v1/participants/{pid}/status` | Business/KOL/Admin | Update status (Posting/Completed/Failed) |
| KPI | POST | `/api/v1/participants/{pid}/metrics` | KOL | Submit metrics + proof |
| KPI | POST | `/api/v1/participants/{pid}/metrics/verify` | Business/Admin | Verify metrics |
| Review | POST | `/api/v1/reviews` | User | Tạo review/rating |
| Review | GET | `/api/v1/reviews` | User/Public | List reviews theo toUser/campaign |
| Ranking | GET | `/api/v1/rankings/kols` | Public | Bảng xếp hạng KOL |
| Ranking | GET | `/api/v1/rankings/businesses` | Public | Bảng xếp hạng Business |
| Public | GET | `/api/v1/public/kols/{slug}` | Public | Public KOL page data |
| Public | GET | `/api/v1/public/businesses/{slug}` | Public | Public business page data (optional) |
| Webhook | POST | `/api/v1/webhooks/social/{provider}` | Provider | Nhận callback metric (P2) |

### Schema request/response mẫu và mã lỗi

**Quy ước response success**
```json
{
  "data": { },
  "meta": { "requestId": "..." }
}
```

**Quy ước lỗi (RFC 9457 Problem Details)**
Content-Type: `application/problem+json`
```json
{
  "type": "https://example.com/problems/validation-error",
  "title": "Validation error",
  "status": 422,
  "detail": "One or more fields are invalid.",
  "instance": "/api/v1/campaigns",
  "errors": [
    { "field": "budget", "reason": "must be > 0" }
  ],
  "requestId": "req_01H..."
}
```
Chuẩn Problem Details được định nghĩa để mang thông tin lỗi machine-readable cho HTTP APIs.  

**Endpoint: Tạo campaign (POST /api/v1/campaigns)**  
Request (MVP):
```json
{
  "name": "Ra mắt sản phẩm X",
  "productName": "Sản phẩm X",
  "budget": 50000000,
  "currency": "VND",
  "startDate": "2026-04-01T00:00:00+07:00",
  "endDate": "2026-04-30T23:59:59+07:00",
  "kpiTargets": [
    { "metric": "REACH", "target": 200000, "unit": "count" },
    { "metric": "CTR", "target": 0.015, "unit": "ratio" }
  ],
  "requirements": {
    "niches": ["beauty", "skincare"],
    "platforms": ["tiktok", "instagram"],
    "followerMin": 5000,
    "followerMax": 100000,
    "location": "VN"
  },
  "description": "Brief ngắn gọn...",
  "status": "DRAFT"
}
```

Response:
```json
{
  "data": {
    "id": "c1a3b4c5-1111-2222-3333-444455556666",
    "businessId": "b1...",
    "name": "Ra mắt sản phẩm X",
    "status": "DRAFT",
    "createdAt": "2026-03-15T10:20:30Z",
    "updatedAt": "2026-03-15T10:20:30Z"
  },
  "meta": { "requestId": "req_..." }
}
```

**Endpoint: Invite KOL (POST /api/v1/campaigns/{id}/invites)**  
Request:
```json
{
  "kolId": "k1...",
  "message": "Mời hợp tác chiến dịch...",
  "proposedFee": 3000000,
  "currency": "VND"
}
```

Response:
```json
{
  "data": {
    "participantId": "p1...",
    "campaignId": "c1...",
    "kolId": "k1...",
    "status": "PENDING"
  }
}
```

**Endpoint: Submit metrics (POST /api/v1/participants/{pid}/metrics)**  
Request:
```json
{
  "postedAt": "2026-04-10T12:00:00+07:00",
  "postingUrl": "https://tiktok.com/...",
  "metrics": {
    "views": 120000,
    "likes": 5600,
    "comments": 210,
    "shares": 85,
    "clicks": 1300,
    "conversions": 45
  },
  "proofFiles": [
    { "fileId": "f1...", "kind": "SCREENSHOT" }
  ]
}
```

### Phác thảo GraphQL

GraphQL hữu ích khi UI cần query nhiều entity liên quan (campaign → participants → metrics → reviews) trong 1 roundtrip và giảm overfetch/underfetch; đặc tả GraphQL được chuẩn hoá bởi GraphQL Foundation.  

**Schema khung (rút gọn)**
```graphql
type Query {
  me: User!
  publicKOL(slug: String!): KOLPublicView!
  rankingsKOLs(limit: Int!, cursor: String): KOLRankingConnection!
  campaign(id: ID!): Campaign!
  campaigns(filter: CampaignFilter, limit: Int!, cursor: String): CampaignConnection!
}

type Mutation {
  createCampaign(input: CreateCampaignInput!): Campaign!
  applyCampaign(campaignId: ID!, message: String): Participant!
  inviteKOL(campaignId: ID!, kolId: ID!, message: String): Participant!
  submitMetrics(participantId: ID!, input: MetricsInput!): MetricSubmission!
  createReview(input: CreateReviewInput!): Review!
}
```

**Ví dụ query ranking**
```graphql
query Rankings($limit: Int!, $cursor: String) {
  rankingsKOLs(limit: $limit, cursor: $cursor) {
    edges {
      node {
        kol { id slug displayName niche followerCount ratingScore }
        score
        badges { code name }
      }
    }
    pageInfo { endCursor hasNextPage }
  }
}
```

