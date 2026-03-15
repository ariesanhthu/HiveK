## Checklist cho developer và kế hoạch triển khai

### Checklist kỹ thuật

**Setup & env**
- Node.js version: *không xác định* (chốt theo LTS hiện tại của team).  
- `.env` phân tách biến public (`NEXT_PUBLIC_*`) và private; lưu ý biến `NEXT_PUBLIC_*` sẽ bị inline vào JS client và sau build không đổi theo runtime env.  
- Quy ước `API_BASE_URL`, `DATABASE_URL`, `JWT_SECRET`, `WEBHOOK_SECRET`, `S3_BUCKET` (*nếu có upload; provider: không xác định*).

**Testing**
- Unit test: validation, scoring logic, permission checks (BOLA/IDOR).  
- Integration test: campaign lifecycle, participant transitions, metrics submission/verify, review uniqueness.  
- E2E: luồng Business tạo campaign → invite/apply → KOL submit KPI → complete → rating.

**CI/CD**
- Pipeline tối thiểu: `lint` → `typecheck` → `test` → `build` → `deploy`.  
- Nếu self-host: ưu tiên Next.js `output: "standalone"` để đóng gói runtime tối giản cho Docker.  

**Security**
- Kiểm soát object-level authorization trên mọi endpoint có `{id}` theo OWASP API Top 10.  
- Password hashing theo OWASP Password Storage Cheat Sheet.  
- Logging các sự kiện security (login fail, permission denied, rate limited) theo OWASP Logging Cheat Sheet.  
- Không tạo header “X-…” mới cho tiêu chuẩn nội bộ; IETF khuyến cáo deprecate “X-” prefix cho tham số/field mới.  
- Rate limiting trả 429 + `Retry-After` theo RFC 6585.  

**Logging & monitoring**
- Chuẩn hoá `requestId` trace xuyên suốt FE↔BE.  
- Instrumentation/observability: Next.js có hướng dẫn instrumentation (kết hợp OpenTelemetry nếu cần).  

**Migration**
- Dùng migration tool của ORM (*Prisma hay tương đương: không xác định*). Nếu dùng Prisma, quan hệ model được mô tả rõ trong docs về relations.  

### Kế hoạch triển khai và timeline ước tính

> Timeline mang tính ước lượng cho 1 squad nhỏ (PM + 1 FE + 1 BE + 1 QA part-time + DevOps hỗ trợ). Nếu team khác quy mô, thời gian thay đổi tương ứng (*không xác định năng lực/nguồn lực thực tế*).

| Phase | Thời lượng | Deliverables | Owner chính |
|---|---:|---|---|
| Foundation | 1–2 tuần | Repo setup, CI/CD, auth skeleton, DB migrations, base UI kit | Tech Lead/FE/BE |
| MVP P0 | 4–6 tuần | Role onboarding, KOL/Business profiles, Campaign CRUD+publish, apply/invite/accept, manual KPI submit, basic reviews, public rankings (ISR) | FE+BE |
| Phase 2 P1 | 4–6 tuần | Matching rule-based + scoring v1, KPI verify workflow hoàn chỉnh, badge + ranking snapshot | BE (alg) + FE |
| Phase 3 P2 | 6–10 tuần | Social API ingestion, fraud detection signals, AI recommendation, ROI analytics | BE/DS/DE (*không xác định*) |

### Bảng trade-offs bắt buộc

**SSR vs SSG vs CSR**

| Tiêu chí | SSR | SSG | CSR |
|---|---|---|---|
| SEO | Tốt (HTML sẵn) | Rất tốt | Kém hơn nếu render muộn |
| Fresh data | Tốt (per-request) | Kém (build-time) | Tốt nhưng phụ thuộc client |
| Chi phí server | Cao hơn | Thấp | Trung bình |
| Phù hợp trang | Dashboard, dữ liệu cá nhân | Landing, nội dung ít đổi | UI tương tác nặng, ít SEO |

Next.js hỗ trợ static/dynamic rendering và ISR để lấy ưu điểm của cả hai.  

**REST vs GraphQL**

| Tiêu chí | REST | GraphQL |
|---|---|---|
| MVP speed | Nhanh, rõ endpoint | Cần schema + resolver |
| Cache CDN | Dễ cache GET | Khó hơn (thường POST) |
| Overfetch/Underfetch | Có thể xảy ra | Giảm đáng kể |
| Observability | Dễ theo route | Cần theo operation name |

GraphQL được chuẩn hoá theo GraphQL spec.  

**SQL vs NoSQL**

| Tiêu chí | SQL (PostgreSQL) | NoSQL (MongoDB) |
|---|---|---|
| Quan hệ & join | Mạnh | Thiết kế embedding/reference tuỳ use case |
| Consistency | Giao dịch mạnh, phù hợp đối soát | Linh hoạt, nhưng consistency/transaction tuỳ mô hình |
| Schema evolution | Cần migration | Linh hoạt hơn |
| Use case phù hợp | Campaign/participant/review/ranking | Metrics raw đa dạng, event log |

PostgreSQL mô tả cơ chế concurrency control nhằm đảm bảo toàn vẹn khi nhiều session thao tác; MongoDB nhấn mạnh data modeling theo document linh hoạt.

