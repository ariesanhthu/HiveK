# HIVE-K — Master Plan triển khai Agentic System trên MongoDB

**Mục tiêu:** mở rộng code hiện có trong `ai-service`, không dựng lại hệ thống từ đầu, để hoàn thiện luồng:

```text
Dữ liệu thương hiệu
→ AI lập kế hoạch nội dung
→ người dùng duyệt
→ lên lịch
→ tự động đăng
→ nhận comment/tin nhắn
→ truy xuất FAQ/dữ kiện
→ tự động trả lời hoặc chuyển người thật
→ ghi nhận phản hồi/KPI
→ cải thiện kế hoạch và câu trả lời
```

Tài liệu này là chỉ dẫn tổng hợp cho coding agent. Bốn file tiếp theo là bốn plan triển khai độc lập nhưng có thứ tự phụ thuộc rõ ràng.

---

## 1. Bối cảnh bắt buộc phải giữ

Hệ thống đã có code và đang sử dụng **MongoDB**. Không được tự ý:

- đổi database sang PostgreSQL;
- tạo lại toàn bộ backend;
- thay framework hiện có nếu chưa chứng minh bắt buộc;
- đổi các API frontend đang dùng;
- xóa model/collection hiện có;
- dựng Temporal, Neo4j, Redis hoặc vector database riêng chỉ để demo;
- auto-publish bài chưa được người dùng duyệt;
- gửi tin hoặc trả lời claim nhạy cảm khi độ tin cậy thấp.

Coding agent phải bắt đầu bằng việc đọc code thật trong `ai-service` và tạo báo cáo:

```text
CURRENT_SYSTEM_AUDIT.md
```

Báo cáo phải liệt kê:

1. Framework và entrypoint hiện tại.
2. Cây thư mục `ai-service`.
3. Các route/API hiện có.
4. Các collection MongoDB và field đang dùng.
5. Cách xác thực user/workspace.
6. Luồng tạo kế hoạch, sinh bài, duyệt bài hiện có.
7. Cách lưu agent run/checkpoint hiện có.
8. Cách lưu file/media hiện có.
9. Những connector/social integration đã có.
10. Những phần còn mock, TODO hoặc chưa test.
11. Danh sách thay đổi tương thích ngược.
12. Các giả định chưa thể xác minh từ code.

Chỉ được bắt đầu sửa sau khi đã tạo audit này.

---

## 2. Kiến trúc mục tiêu cho giai đoạn testing miễn phí

```text
Frontend hiện có
        │
        ▼
Render Free Web Service
┌──────────────────────────────────────────────┐
│ FastAPI/Backend hiện có trong ai-service     │
│                                              │
│ Agent Runtime                               │
│ Content Planner                             │
│ Reply Decision Engine                       │
│ Meta/Threads Connector                      │
│ Webhook Receiver                            │
│ Internal Job Dispatcher                     │
└──────────────────────────────────────────────┘
        │
        ├── MongoDB Atlas Free
        │   ├── dữ liệu nghiệp vụ
        │   ├── agent state/checkpoint
        │   ├── lịch đăng
        │   ├── publish jobs
        │   ├── conversation/messages
        │   └── audit/evaluation
        │
        ├── Upstash QStash Free
        │   └── gọi endpoint theo lịch + retry
        │
        ├── Cloudinary Free
        │   └── ảnh/video dùng khi publish
        │
        ├── Meta Graph API / Threads API
        │   └── publish, webhook, reply theo quyền được cấp
        │
        └── LLM API hiện có
            └── chỉ dùng fallback/suy luận cần thiết
```

### Vì sao chọn cấu hình này

- Render Free chạy được API nhưng có thể sleep khi không có traffic.
- MongoDB là nguồn dữ liệu hiện tại và giữ toàn bộ trạng thái bền vững.
- QStash gọi HTTP đúng lịch, có retry và đánh thức Render.
- Cloudinary giữ media, tránh filesystem tạm thời của Render.
- Thuật toán TF-IDF/BM25/classifier nhỏ chạy trong process và không cần GPU.
- Meta API là connector chính thức; mock connector luôn tồn tại để demo không phụ thuộc App Review.

---

## 3. Bốn plan triển khai

| Thứ tự | File | Kết quả |
|---|---|---|
| 1 | `01_PLAN_MONGODB_RUNTIME_SCHEDULER.md` | Chuẩn hóa MongoDB, state/job bền vững, planner và dispatcher |
| 2 | `02_PLAN_SOCIAL_CONNECTORS_AUTO_PUBLISH.md` | Kết nối Meta/Threads, lên lịch và tự động đăng |
| 3 | `03_PLAN_COMMENT_DM_AUTO_REPLY.md` | TF-IDF/BM25/intent/rules để trả lời comment và inbox |
| 4 | `04_PLAN_FREE_TESTING_DEPLOY_EVAL.md` | Mock, sandbox, deployment Render, test và báo cáo metric |

Không làm Plan 2 hoặc Plan 3 trước khi Plan 1 có:

- idempotency;
- audit;
- workspace isolation;
- job state;
- approval state;
- encrypted token reference;
- webhook event deduplication.

---

## 4. Collection MongoDB mục tiêu

Coding agent phải **map vào collection hiện có trước**, chỉ tạo collection mới khi không thể mở rộng schema cũ.

```text
workspaces
workspace_members
brand_profiles
knowledge_sources
knowledge_chunks
faq_entries
content_plans
content_assets
social_accounts
oauth_credentials
scheduled_posts
publish_jobs
webhook_events
conversations
messages
reply_decisions
human_handoffs
performance_events
agent_runs
agent_checkpoints
audit_events
eval_runs
```

### Quy tắc chung

Mọi document nghiệp vụ phải có, khi phù hợp:

```json
{
  "_id": "ObjectId",
  "workspace_id": "ObjectId",
  "created_at": "UTC datetime",
  "updated_at": "UTC datetime",
  "created_by": "user/system",
  "schema_version": 1
}
```

Mọi query phải filter `workspace_id`. Không được truy xuất memory, FAQ, social account hoặc conversation xuyên workspace.

---

## 5. Trạng thái tổng quát

### Content asset

```text
draft
→ needs_review
→ approved
→ scheduled
→ dispatching
→ published
```

Nhánh lỗi:

```text
scheduled → failed_retryable → scheduled
scheduled → failed_terminal
scheduled → canceled
```

### Reply decision

```text
received
→ normalized
→ retrieved
→ classified
→ auto_reply
   hoặc needs_review
   hoặc human_handoff
→ sent
```

### Agent run

```text
queued
→ running
→ needs_user_input
→ needs_approval
→ completed
```

Tất cả chuyển trạng thái phải ghi audit.

---

## 6. Nguyên tắc thuật toán

Không đưa mọi việc vào LLM.

### Dùng deterministic code cho

- kiểm tra quyền;
- kiểm tra trạng thái duyệt;
- lịch và timezone;
- deduplicate;
- idempotency;
- giới hạn rate;
- mapping platform;
- kiểm tra claim số, giá, ưu đãi, lịch;
- chọn câu trả lời exact-match;
- blocklist và policy;
- retry/backoff.

### Dùng thuật toán nhỏ cho

- TF-IDF word/character n-gram;
- BM25;
- cosine similarity;
- fuzzy matching;
- Logistic Regression hoặc Linear SVM cho intent;
- MinHash/SimHash chống trùng nội dung;
- MMR để tăng diversity;
- weighted scoring cho lịch nội dung;
- rolling statistics cho hiệu suất.

### Chỉ dùng LLM khi

- cần tổng hợp ngôn ngữ tự nhiên;
- retrieval không có câu exact nhưng có đủ facts được duyệt;
- cần viết lại theo giọng thương hiệu;
- cần giải thích lý do handoff;
- output luôn qua schema và validator.

---

## 7. Chế độ connector

Hệ thống phải có ba mode:

```text
SOCIAL_CONNECTOR_MODE=mock
SOCIAL_CONNECTOR_MODE=sandbox
SOCIAL_CONNECTOR_MODE=live
```

### `mock`

- không gọi API thật;
- đọc fixture JSON;
- mô phỏng publish success/failure;
- mô phỏng comment, DM và webhook;
- dùng cho pitch/demo và CI.

### `sandbox`

- gọi tài khoản/page/test user do developer kiểm soát;
- không xử lý khách hàng thật;
- dùng để xác minh token, webhook và payload.

### `live`

- chỉ bật khi có permission hợp lệ;
- chỉ publish bài approved;
- có audit và kill switch;
- không bật mặc định.

---

## 8. Biến môi trường tối thiểu

```env
APP_ENV=development
SOCIAL_CONNECTOR_MODE=mock

MONGODB_URI=
MONGODB_DB_NAME=hivek
TOKEN_ENCRYPTION_KEY=

PUBLIC_BASE_URL=
INTERNAL_JOB_SECRET=
WEBHOOK_VERIFY_TOKEN=

META_APP_ID=
META_APP_SECRET=
META_GRAPH_API_VERSION=
META_REDIRECT_URI=

THREADS_APP_ID=
THREADS_APP_SECRET=
THREADS_REDIRECT_URI=

QSTASH_URL=
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

LLM_PROVIDER=
LLM_API_KEY=
```

Không commit secret. `.env.example` chỉ để tên biến.

---

## 9. Definition of Done toàn bộ

Hệ thống chỉ được xem là hoàn thành testing khi:

1. Tạo một bài, duyệt và lên lịch được.
2. Job vẫn tồn tại khi Render restart.
3. QStash/GitHub Actions gọi dispatcher và bài được publish đúng một lần.
4. Publish retry không tạo bài trùng.
5. Webhook duplicate không tạo message/reply trùng.
6. Comment FAQ đơn giản được auto-reply đúng.
7. Comment mơ hồ được đưa `needs_review`.
8. Khiếu nại, hoàn tiền, claim nhạy cảm được handoff.
9. Có mock mode chạy được toàn bộ demo không cần token Meta.
10. Có sandbox test ít nhất một nền tảng Meta/Threads.
11. Có báo cáo eval JSON và dashboard metric cơ bản.
12. Không rò dữ liệu giữa workspace.
13. Không log access token hoặc nội dung nhạy cảm.
14. Có kill switch để tắt auto-publish và auto-reply.

---

## 10. Prompt tổng hợp cho coding agent

```text
Bạn là kiến trúc sư backend AI cấp cao. Hãy mở rộng code hiện có trong thư mục ai-service của HIVE-K.

Không được viết lại hệ thống từ đầu. Database hiện tại là MongoDB. Trước khi sửa, hãy đọc toàn bộ code liên quan và tạo CURRENT_SYSTEM_AUDIT.md, trong đó map route, model, collection, service, agent graph và connector hiện có.

Sau audit, triển khai lần lượt bốn plan trong bộ tài liệu này. Giữ tương thích ngược với frontend/API hiện có. Tách deterministic logic khỏi LLM. Mọi external side effect phải có approval, idempotency, retry, audit và workspace isolation.

Ưu tiên chạy được ở chế độ miễn phí:
- Render Free cho web API.
- MongoDB Atlas Free cho database.
- Upstash QStash Free cho scheduler/retry HTTP.
- Cloudinary Free cho media.
- Meta/Threads API chính thức cho sandbox/live.
- Mock connector cho CI và pitching.

Đầu ra bắt buộc:
1. CURRENT_SYSTEM_AUDIT.md.
2. IMPLEMENTATION_CHANGELOG.md.
3. Source code patch tương thích code cũ.
4. MongoDB indexes/migration script dạng idempotent.
5. .env.example.
6. Fixtures và mock connector.
7. Unit, integration, contract và eval tests.
8. README chạy local và deploy Render.
9. Báo cáo các phần cần Meta App Review.
10. Không được tuyên bố tính năng live hoạt động nếu mới chỉ mock.
```

---

## 11. Nguồn kỹ thuật đã kiểm tra

- Meta Threads API: tạo bài text, image, video và carousel; quản lý replies và webhook tùy permission.
- Meta Pages API: tạo/quản lý post và reply với Page access token và permission phù hợp.
- Instagram Platform: professional accounts có luồng publish, quản lý comment và message tùy quyền/app review.
- Messenger Platform: nhận webhook và gửi trả lời qua Page, tuân thủ permission và messaging policy.
- Render Free: web service có thể sleep khi idle, không dùng filesystem làm storage bền vững.
- GitHub Actions: lịch chạy ngắn nhất 5 phút, phù hợp fallback/testing chứ không bảo đảm đúng từng giây.
- Upstash QStash Free: scheduler/HTTP delivery/retry phù hợp prototype.
- Cloudinary Free: upload, transformation và CDN cho media.
