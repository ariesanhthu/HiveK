# PLAN 1 — MongoDB Runtime, Agent State, Planner và Scheduler

## 1. Mục tiêu

Mở rộng runtime hiện có để:

- agent run có thể pause/resume;
- state không mất khi service restart;
- mọi job được lưu trong MongoDB;
- bài chỉ được schedule sau khi approved;
- dispatcher có thể được gọi bởi QStash hoặc GitHub Actions;
- planner sử dụng rule/TF-IDF/MMR/weighted score trước khi dùng LLM;
- giữ nguyên API hiện có hoặc cung cấp adapter tương thích.

Không triển khai connector Meta thật trong plan này. Plan này tạo nền cho Plan 2 và Plan 3.

---

## 2. Bước 0 — Audit code hiện tại

Coding agent phải tìm và ghi rõ:

```text
- Mongo client/repository hiện có.
- ODM đang dùng: Motor, PyMongo, Beanie, MongoEngine hoặc khác.
- Cách tạo ObjectId và serialize response.
- Collection và index hiện tại.
- Model content plan/content asset.
- Agent graph và checkpoint hiện tại.
- Các background task/scheduler hiện có.
- Route schedule/publish hiện có.
- Timezone hiện dùng.
```

Không được tạo repository layer thứ hai nếu hệ thống đã có một abstraction ổn định.

---

## 3. Collection và schema

### 3.1 `agent_runs`

```json
{
  "_id": "ObjectId",
  "workspace_id": "ObjectId",
  "user_id": "ObjectId",
  "graph_name": "create_post",
  "status": "running|needs_user_input|needs_approval|completed|failed",
  "current_node": "validate_content",
  "state_ref": "ObjectId",
  "request_hash": "sha256",
  "prompt_version": "content.compose@1.0.0",
  "model_route": "fast|reasoning|creative|none",
  "error": null,
  "started_at": "datetime",
  "updated_at": "datetime",
  "completed_at": null
}
```

Indexes:

```javascript
db.agent_runs.createIndex({ workspace_id: 1, updated_at: -1 })
db.agent_runs.createIndex({ workspace_id: 1, status: 1 })
db.agent_runs.createIndex(
  { workspace_id: 1, request_hash: 1 },
  { unique: true, sparse: true }
)
```

### 3.2 `agent_checkpoints`

```json
{
  "_id": "ObjectId",
  "workspace_id": "ObjectId",
  "run_id": "ObjectId",
  "checkpoint_seq": 5,
  "current_node": "human_review",
  "state": {},
  "state_schema_version": 1,
  "created_at": "datetime"
}
```

Không lưu:

- access token;
- file binary lớn;
- raw secret;
- object không serialize ổn định.

Indexes:

```javascript
db.agent_checkpoints.createIndex(
  { workspace_id: 1, run_id: 1, checkpoint_seq: -1 },
  { unique: true }
)
```

### 3.3 `scheduled_posts`

```json
{
  "_id": "ObjectId",
  "workspace_id": "ObjectId",
  "content_asset_id": "ObjectId",
  "social_account_id": "ObjectId",
  "platform": "facebook|instagram|threads|mock",
  "status": "scheduled",
  "scheduled_for": "UTC datetime",
  "timezone": "Asia/Ho_Chi_Minh",
  "media_refs": [],
  "approval": {
    "status": "approved",
    "approved_by": "ObjectId",
    "approved_at": "datetime",
    "content_hash": "sha256"
  },
  "idempotency_key": "sha256",
  "dispatch_after": "UTC datetime",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

Indexes:

```javascript
db.scheduled_posts.createIndex(
  { workspace_id: 1, status: 1, scheduled_for: 1 }
)
db.scheduled_posts.createIndex(
  { idempotency_key: 1 },
  { unique: true }
)
```

### 3.4 `publish_jobs`

```json
{
  "_id": "ObjectId",
  "workspace_id": "ObjectId",
  "scheduled_post_id": "ObjectId",
  "status": "queued|leased|running|succeeded|retryable|terminal",
  "attempt": 0,
  "max_attempts": 4,
  "lease_owner": null,
  "lease_expires_at": null,
  "next_attempt_at": "datetime",
  "platform_request_id": null,
  "platform_post_id": null,
  "last_error": null,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

Indexes:

```javascript
db.publish_jobs.createIndex(
  { status: 1, next_attempt_at: 1, lease_expires_at: 1 }
)
db.publish_jobs.createIndex(
  { scheduled_post_id: 1 },
  { unique: true }
)
```

### 3.5 `audit_events`

Mỗi thay đổi trạng thái phải ghi:

```json
{
  "workspace_id": "ObjectId",
  "actor_type": "user|agent|scheduler|webhook",
  "actor_id": "string",
  "action": "post.approved|post.scheduled|publish.started|publish.failed",
  "resource_type": "content_asset|scheduled_post|publish_job",
  "resource_id": "ObjectId",
  "before": {},
  "after": {},
  "trace_id": "uuid",
  "created_at": "datetime"
}
```

---

## 4. Job leasing bằng MongoDB

Không dùng `find()` rồi update sau vì có thể hai request cùng lấy một job.

Dùng atomic operation:

```python
find_one_and_update(
    {
        "status": {"$in": ["queued", "retryable"]},
        "next_attempt_at": {"$lte": now},
        "$or": [
            {"lease_expires_at": None},
            {"lease_expires_at": {"$lte": now}}
        ]
    },
    {
        "$set": {
            "status": "leased",
            "lease_owner": worker_id,
            "lease_expires_at": now + lease_duration,
            "updated_at": now
        },
        "$inc": {"attempt": 1}
    },
    sort=[("next_attempt_at", 1)],
    return_document=AFTER
)
```

Yêu cầu:

- lease có thời hạn;
- worker chết thì job được lấy lại;
- success ghi terminal;
- retry dùng exponential backoff + jitter;
- lỗi auth/permission là terminal;
- timeout/network/5xx có thể retry;
- trạng thái platform không rõ thì phải query lại trước khi retry.

---

## 5. Internal dispatcher API

```text
POST /internal/jobs/dispatch
POST /internal/jobs/publish/{job_id}
GET  /internal/jobs/health
```

Bảo vệ bằng:

- QStash signature verification hoặc;
- `X-Internal-Secret` cho fallback;
- rate limit;
- không public trong OpenAPI production nếu framework hỗ trợ.

Dispatcher flow:

```text
verify caller
→ fetch due scheduled_posts
→ create publish_jobs idempotently
→ lease one or N jobs
→ call connector
→ persist result
→ audit
→ return summary
```

Response:

```json
{
  "claimed": 5,
  "succeeded": 4,
  "retryable": 1,
  "terminal": 0,
  "duration_ms": 842
}
```

---

## 6. Scheduler miễn phí

### Phương án chính — QStash

Hai cách hỗ trợ song song:

#### A. Direct delayed delivery

Khi bài được schedule trong 7 ngày gần nhất:

```text
QStash
→ POST /internal/jobs/publish/{job_id}
→ đúng thời điểm scheduled_for
```

#### B. Dispatcher cron

Tạo schedule gọi mỗi 5 phút:

```text
QStash
→ POST /internal/jobs/dispatch
→ query MongoDB scheduled_for <= now
→ enqueue/publish
```

Cách B xử lý lịch dài hơn và là fallback cho direct delivery.

### Phương án dự phòng — GitHub Actions

```yaml
name: Dispatch scheduled posts

on:
  schedule:
    - cron: "*/5 * * * *"
  workflow_dispatch:

jobs:
  dispatch:
    runs-on: ubuntu-latest
    steps:
      - name: Call dispatcher
        run: |
          curl --fail \
            -X POST "${{ secrets.HIVEK_API_URL }}/internal/jobs/dispatch" \
            -H "X-Internal-Secret: ${{ secrets.INTERNAL_JOB_SECRET }}"
```

Không tuyên bố chính xác từng giây. Phải đo `scheduler_drift_seconds`.

---

## 7. Content planning không chỉ dùng LLM

### 7.1 Input

- content pillars;
- funnel stage;
- social account role;
- lịch sử bài;
- bài đã approved;
- KPI;
- thời điểm hợp lệ;
- media hiện có;
- campaign constraints.

### 7.2 Candidate generation

Sinh candidate deterministic trước:

```text
pillar × funnel_stage × channel_role × format × time_slot
```

Loại candidate:

- dùng fact hết hạn;
- trùng angle gần đây;
- vượt số bài/ngày;
- quá nhiều bài bán hàng;
- thiếu media bắt buộc;
- không phù hợp vai trò kênh.

### 7.3 TF-IDF và chống trùng

Dùng:

```python
TfidfVectorizer(
    analyzer="word",
    ngram_range=(1, 2),
    min_df=1,
    sublinear_tf=True
)
```

Kết hợp character n-gram cho tiếng Việt viết tắt/sai chính tả:

```python
TfidfVectorizer(
    analyzer="char_wb",
    ngram_range=(3, 5)
)
```

Đo similarity giữa candidate và 30–100 bài gần nhất.

Rule:

```text
similarity >= 0.90 → block exact/near duplicate
0.78–0.90         → penalty mạnh
0.60–0.78         → penalty nhẹ
< 0.60            → không phạt
```

Ngưỡng phải cấu hình và eval, không hard-code vĩnh viễn.

### 7.4 Weighted score

```text
candidate_score =
  0.22 * funnel_gap
+ 0.18 * audience_fit
+ 0.16 * channel_role_fit
+ 0.12 * historical_performance
+ 0.10 * media_readiness
+ 0.10 * freshness
+ 0.07 * time_slot_fit
+ 0.05 * user_approval_likelihood
- 0.18 * duplication_risk
- 0.15 * policy_risk
```

Sau scoring dùng MMR để chọn danh sách đa dạng:

```text
MMR = λ * relevance - (1 - λ) * max_similarity_to_selected
```

MVP đặt `λ` trong config, ví dụ 0.65–0.80, rồi đánh giá trên fixture.

### 7.5 LLM role

LLM chỉ:

- viết mô tả candidate;
- tạo caption sau khi candidate đã được chọn;
- không tự chọn account hoặc thời gian ngoài constraints;
- không tự publish.

---

## 8. API công khai

Giữ API cũ. Chỉ thêm khi thiếu:

```text
POST /v1/workspaces/{id}/content-plans/generate
POST /v1/workspaces/{id}/content-assets/{asset_id}/approve
POST /v1/workspaces/{id}/content-assets/{asset_id}/schedule
PATCH /v1/workspaces/{id}/scheduled-posts/{scheduled_id}
DELETE /v1/workspaces/{id}/scheduled-posts/{scheduled_id}
GET /v1/workspaces/{id}/scheduled-posts
GET /v1/workspaces/{id}/publish-jobs/{job_id}
```

Schedule request:

```json
{
  "social_account_id": "...",
  "scheduled_for": "2026-07-30T09:00:00+07:00",
  "timezone": "Asia/Ho_Chi_Minh"
}
```

Backend phải convert và lưu UTC nhưng trả lại timezone người dùng.

---

## 9. Test bắt buộc

### Unit

- content chưa approved không schedule được;
- content hash thay đổi sau approve thì approval invalid;
- duplicate schedule bị unique key chặn;
- job leasing atomic;
- expired lease được reclaim;
- retryable và terminal error mapping;
- timezone conversion;
- TF-IDF duplicate threshold;
- MMR diversity;
- workspace isolation.

### Integration

- MongoDB transaction/session khi deployment hỗ trợ;
- nếu không dùng transaction, state transition phải idempotent;
- QStash signature;
- dispatcher tạo đúng một publish job;
- restart service không mất job;
- two concurrent dispatcher requests không publish trùng.

### Eval

- 50 candidate giả lập;
- ít nhất 10 duplicate/near-duplicate;
- đo diversity và funnel coverage;
- xuất `evals/planner_report.json`.

---

## 10. Definition of Done

- Có migration/index script idempotent.
- Có persistent run/checkpoint.
- Có scheduler QStash + GitHub fallback.
- Có job leasing.
- Có content approval hash.
- Có TF-IDF duplicate detection.
- Có weighted planner + MMR.
- Không có LLM trong scheduler/permission/idempotency.
- Test concurrency không publish trùng.
- Có metric scheduler drift.

---

## 11. Prompt triển khai cho coding agent

```text
Hãy triển khai PLAN 1 trên code hiện có trong ai-service.

Bắt đầu bằng audit, không tạo project mới. Database là MongoDB và phải giữ ODM/repository hiện có. Hãy map schema mới vào model/collection hiện tại, giữ tương thích ngược.

Nhiệm vụ:
1. Tạo persistent agent_runs và agent_checkpoints.
2. Tạo scheduled_posts, publish_jobs và audit_events hoặc mở rộng collection tương đương.
3. Tạo index script idempotent.
4. Tạo atomic job leasing.
5. Tạo internal dispatcher API.
6. Tích hợp QStash signature và GitHub Actions fallback.
7. Bổ sung planner deterministic:
   - candidate generation;
   - TF-IDF word + char n-gram;
   - duplicate penalty;
   - weighted score;
   - MMR reranking.
8. Giữ human approval trước schedule/publish.
9. Thêm unit/integration/eval tests.
10. Viết README mô tả state machine và recovery.

Ràng buộc:
- Không đổi MongoDB.
- Không thêm Temporal.
- Không dùng filesystem làm state.
- Không dùng BackgroundTasks cho job quan trọng.
- Không hard-code timezone.
- Không log secret/token.
- Không rewrite API frontend.
- Không để hai dispatcher publish trùng.

Đầu ra:
- patch source code;
- migration/index script;
- fixture;
- test;
- eval report;
- IMPLEMENTATION_CHANGELOG.md;
- TODO rõ cho các connector chưa làm.
```
