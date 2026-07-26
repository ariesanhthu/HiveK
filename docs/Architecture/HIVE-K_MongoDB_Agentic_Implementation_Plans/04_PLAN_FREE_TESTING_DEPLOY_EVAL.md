# PLAN 4 — Free Testing, Render Deployment, Sandbox và Evaluation

## 1. Mục tiêu

Hoàn thiện môi trường test thực tế với chi phí 0 hoặc trong free tier:

- deploy riêng `ai-service` từ monorepo;
- chạy API trên Render Free;
- MongoDB Atlas Free;
- QStash Free cho scheduler/retry;
- Cloudinary Free cho media;
- Meta/Threads sandbox khi có token;
- mock mode chạy được ngay cả khi chưa qua App Review;
- CI có test, eval và fixture;
- dashboard/demo có bằng chứng kỹ thuật, không giả vờ live.

---

## 2. Free stack

| Nhu cầu | Service | Vai trò |
|---|---|---|
| Web API | Render Free | FastAPI/backend hiện có |
| Database | MongoDB Atlas Free | State, jobs, content, conversation |
| Scheduling | Upstash QStash Free | HTTP schedule, retry, wake Render |
| Media | Cloudinary Free | Public media URL |
| CI/fallback cron | GitHub Actions | Test, eval, dispatcher dự phòng |
| Social | Meta/Threads APIs | Sandbox/live theo permission |
| Demo không token | Mock Connector | End-to-end deterministic |
| LLM | Provider hiện có/free quota | Fallback, không bắt buộc cho mock |

---

## 3. Render monorepo config

Render service:

```text
Root Directory: ai-service
Branch: main
Runtime: Python/Docker theo code hiện tại
Instance: Free
Health Check Path: /health
```

Start command ví dụ FastAPI:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1
```

Phải dùng đúng module thật sau audit.

### Không được

- chạy nhiều worker trên 512 MB khi chưa đo RAM;
- tải sentence-transformers/BERTopic/model lớn;
- lưu upload vào disk local;
- chạy loop scheduler vô hạn trong web process;
- phụ thuộc in-memory checkpoint;
- dùng `BackgroundTasks` cho publish/reply quan trọng.

---

## 4. Health endpoints

```text
GET /health
GET /health/ready
GET /health/dependencies
```

`/health` không gọi LLM.

`/health/ready` kiểm tra nhẹ:

- config hợp lệ;
- Mongo ping;
- indexes sẵn sàng.

`/health/dependencies` chỉ dành admin/internal:

- Mongo;
- QStash;
- Cloudinary;
- Meta token status;
- connector mode.

Không trả secret.

---

## 5. QStash setup

### Dispatcher schedule

Tạo schedule 5 phút:

```text
POST https://<render-service>/internal/jobs/dispatch
```

Yêu cầu:

- verify QStash signature;
- log message ID;
- idempotency;
- trả 2xx nhanh;
- xử lý N job có giới hạn;
- không vượt timeout.

### Reply processing

Webhook lưu message trước, sau đó QStash gọi:

```text
POST /internal/replies/process/{message_id}
```

Điều này tránh chạy LLM/algorithm nặng trong webhook request.

### Free-tier guard

Config:

```env
QSTASH_MAX_JOBS_PER_DISPATCH=10
QSTASH_DISPATCH_INTERVAL_MINUTES=5
```

Theo dõi:

```text
qstash_messages_used
jobs_per_dispatch
retry_count
dead_letter_count
```

---

## 6. GitHub Actions

### CI

```yaml
name: AI Service CI

on:
  pull_request:
    paths:
      - "ai-service/**"
  push:
    branches: [main]
    paths:
      - "ai-service/**"

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ai-service

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - run: pip install -r requirements.txt
      - run: ruff check .
      - run: pytest -q
      - run: python -m evals.run_all
```

Điều chỉnh theo package manager thật.

### Dispatcher fallback

```yaml
name: HIVE-K Dispatcher Fallback

on:
  schedule:
    - cron: "*/5 * * * *"
  workflow_dispatch:

jobs:
  dispatch:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl --fail \
            -X POST "${{ secrets.HIVEK_API_URL }}/internal/jobs/dispatch" \
            -H "X-Internal-Secret: ${{ secrets.INTERNAL_JOB_SECRET }}"
```

GitHub cron là fallback/test. Không bảo đảm chạy đúng từng phút.

---

## 7. Test pyramid

### Unit tests

Không gọi internet:

- schema;
- normalization;
- TF-IDF;
- BM25;
- intent;
- risk;
- planner score;
- MMR;
- idempotency;
- state transitions;
- permission gates.

### Contract tests

Mock HTTP:

- Meta/Threads payload;
- QStash signature;
- Cloudinary response;
- OAuth callback;
- connector errors;
- webhook replay.

### Integration tests

Dùng MongoDB test instance/container:

- indexes;
- atomic lease;
- concurrent dispatcher;
- conversation persistence;
- workspace isolation;
- restart recovery.

### Sandbox tests

Chỉ chạy thủ công hoặc protected workflow:

- Threads publish test;
- Page publish test;
- comment webhook;
- reply test;
- token refresh/revoke.

Không chạy sandbox test tự động trên pull request công khai.

### End-to-end demo

Mode `mock`:

```text
create workspace
→ seed profile/FAQ
→ generate plan
→ approve content
→ schedule
→ mock publish
→ inject mock comment
→ auto-reply/review/handoff
→ show metrics
```

---

## 8. Fixture package

```text
ai-service/tests/fixtures/
├── workspace/
│   ├── language_center.json
│   └── homestay.json
├── content/
│   ├── approved_posts.json
│   └── duplicate_posts.json
├── faq/
│   ├── language_center_faq.json
│   └── homestay_faq.json
├── conversations/
│   ├── low_risk.json
│   ├── ambiguous.json
│   ├── complaint.json
│   └── multi_turn.json
└── social/
    ├── threads/
    ├── facebook/
    ├── instagram/
    └── mock/
```

Fixture không chứa dữ liệu khách thật.

---

## 9. Seed demo

CLI:

```bash
python -m hivek.cli.seed_demo --workspace language-center
python -m hivek.cli.seed_demo --workspace homestay
```

Seed phải:

- idempotent;
- tạo workspace riêng;
- tạo 20–30 FAQ;
- tạo 20 bài lịch sử;
- tạo 7 ngày content plan;
- tạo 10 comment/DM;
- không yêu cầu LLM;
- có lệnh cleanup.

---

## 10. Eval suite

### Planner report

```json
{
  "funnel_coverage": 0.92,
  "duplicate_rate": 0.0,
  "mean_pairwise_similarity": 0.31,
  "constraint_violations": 0,
  "scheduler_drift_p95_seconds": 45
}
```

### Reply report

```json
{
  "recall_at_1": 0.88,
  "recall_at_3": 0.96,
  "intent_macro_f1": 0.91,
  "low_risk_precision": 0.94,
  "unsupported_claim_rate": 0.0,
  "high_risk_auto_send": 0,
  "duplicate_send": 0,
  "cross_workspace_leakage": 0
}
```

### Connector report

```json
{
  "mock_publish_success": 1.0,
  "idempotent_retry_pass": true,
  "webhook_replay_pass": true,
  "auth_expired_mapping_pass": true,
  "unknown_remote_state_recovery_pass": true
}
```

---

## 11. Demo evidence API

Để frontend hiển thị bằng chứng thật:

```text
GET /v1/workspaces/{id}/demo/evidence
```

Response:

```json
{
  "mode": "mock|sandbox|live",
  "last_publish": {
    "status": "published",
    "platform": "threads",
    "duration_ms": 420,
    "idempotency_pass": true
  },
  "reply_engine": {
    "retrieval_method": ["bm25", "tfidf_word", "tfidf_char"],
    "confidence": 0.91,
    "decision": "auto_reply",
    "fact_ids": ["..."]
  },
  "eval": {
    "unsupported_claim_rate": 0.0,
    "duplicate_send": 0
  }
}
```

Không trả raw prompt, token hoặc PII.

---

## 12. Observability tối thiểu

Structured log:

```json
{
  "trace_id": "uuid",
  "workspace_id": "redacted-or-id",
  "component": "reply_engine",
  "event": "decision.completed",
  "duration_ms": 82,
  "model_used": "none",
  "retrieval": ["bm25", "tfidf"],
  "decision": "needs_review",
  "confidence": 0.73
}
```

Metrics:

```text
agent_run_total
publish_job_total
publish_failure_total
scheduler_drift_seconds
webhook_duplicate_total
reply_decision_total
auto_reply_total
handoff_total
unsupported_claim_total
llm_call_total
llm_token_total
```

Không cần self-host Prometheus cho demo. Có thể lưu daily aggregate vào MongoDB và hiển thị dashboard hiện có.

---

## 13. Security test checklist

- [ ] Secret không nằm trong Git.
- [ ] Token mã hóa.
- [ ] Webhook signature verified.
- [ ] OAuth state verified.
- [ ] Internal endpoint protected.
- [ ] Workspace isolation test.
- [ ] IDOR test.
- [ ] Duplicate webhook test.
- [ ] Duplicate publish test.
- [ ] Prompt injection fixture.
- [ ] PII redaction test.
- [ ] Kill switch test.
- [ ] Auto-reply high-risk block.
- [ ] App Review scope documented.
- [ ] Mock/sandbox/live label rõ trên UI.

---

## 14. Meta sandbox checklist

- Tạo Meta developer app.
- Thêm đúng product/API cần dùng.
- Thêm app roles/test users.
- Kết nối Page/Instagram professional/Threads account do nhóm kiểm soát.
- Cấu hình redirect URI HTTPS.
- Cấu hình webhook callback và verify token.
- Xin scope tối thiểu.
- Ghi lại token expiry và refresh behavior.
- Test publish.
- Test webhook.
- Test reply.
- Test revoke.
- Không dùng dữ liệu khách thật trước khi policy/app review phù hợp.

Lưu kết quả trong:

```text
docs/meta_sandbox_test_report.md
```

---

## 15. Release modes

### `demo`

```env
APP_ENV=demo
SOCIAL_CONNECTOR_MODE=mock
AUTO_PUBLISH_ENABLED=true
AUTO_REPLY_ENABLED=true
```

Chỉ mock data.

### `sandbox`

```env
APP_ENV=sandbox
SOCIAL_CONNECTOR_MODE=sandbox
AUTO_PUBLISH_ENABLED=true
AUTO_REPLY_ENABLED=false
```

Bật reply sau khi test riêng.

### `production`

```env
APP_ENV=production
SOCIAL_CONNECTOR_MODE=live
AUTO_PUBLISH_ENABLED=false
AUTO_REPLY_ENABLED=false
```

Hai automation phải được bật có chủ đích theo workspace/account.

---

## 16. Definition of Done

- Render deploy riêng `ai-service`.
- `/health` ổn định.
- MongoDB giữ state qua restart.
- QStash dispatch được.
- Cloudinary URL publish được trong mock/sandbox.
- Full mock demo chạy một lệnh.
- CI chạy test/eval.
- Có 3 report planner/reply/connector.
- Có sandbox report hoặc ghi rõ chưa đủ permission.
- UI hiển thị mode mock/sandbox/live.
- Không có tuyên bố sai về tính năng live.

---

## 17. Prompt triển khai cho coding agent

```text
Hãy triển khai PLAN 4 sau khi PLAN 1–3 đã pass unit tests.

Nhiệm vụ:
1. Cấu hình Render monorepo Root Directory = ai-service.
2. Tạo health/readiness/dependency endpoints.
3. Tích hợp QStash schedule/signature.
4. Tạo GitHub Actions CI và dispatcher fallback.
5. Tạo fixture package và seed CLI.
6. Tạo mock E2E flow không cần LLM/token.
7. Tạo sandbox test commands cho Meta/Threads.
8. Tạo eval runner và ba report JSON.
9. Tạo demo evidence API.
10. Tạo structured logs và Mongo daily metrics.
11. Tạo security checklist tests.
12. Viết Render deployment README.
13. Tạo meta_sandbox_test_report.md.
14. Gắn nhãn mock/sandbox/live rõ trong response/API.

Ràng buộc:
- Không chạy model local nặng.
- Không lưu file vào Render disk.
- Không chạy scheduler loop trong web process.
- Không đưa secret vào repo/log.
- Không gọi sandbox/live trong public CI.
- Không dùng dữ liệu khách thật trong fixture.
- Không tuyên bố live nếu mới mock.
- Không làm frontend mới; chỉ cung cấp contract và patch tối thiểu cho UI hiện có.

Đầu ra:
- render config/README;
- GitHub Actions;
- seed CLI;
- fixtures;
- E2E test;
- eval reports;
- security report;
- sandbox report;
- changelog;
- known limitations.
```

---

## 18. Nguồn chính thức cần đối chiếu khi triển khai

- Meta for Developers — Threads API posts, replies, webhooks và changelog.
- Meta for Developers — Facebook Pages API posts.
- Meta for Developers — Messenger Platform.
- Meta for Developers — Instagram Platform.
- Render Docs — Free web service, monorepo và service limits.
- GitHub Docs — scheduled workflows.
- Upstash Docs — QStash scheduling, retry, deduplication và pricing.
- Cloudinary Docs/Pricing — media upload/delivery.
- MongoDB Atlas Docs — cluster và index limits.
