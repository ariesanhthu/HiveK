# Thành phần 4 — Kế hoạch triển khai, API, đánh giá và bảo mật

## 1. Mục tiêu

Chuyển kiến trúc thành một codebase có thể phát triển theo sprint, không phụ thuộc frontend và không nhét mọi thứ vào một dịch vụ duy nhất.

---

## 2. Cấu trúc repository đề xuất

```text
hivek-ai/
├── apps/
│   ├── api/
│   │   ├── main.py
│   │   ├── routes/
│   │   ├── dependencies/
│   │   └── middleware/
│   ├── worker/
│   │   ├── temporal_worker.py
│   │   └── activities/
│   └── cli/
│
├── src/hivek/
│   ├── domain/
│   │   ├── workspace/
│   │   ├── knowledge/
│   │   ├── content/
│   │   ├── feedback/
│   │   └── publishing/
│   │
│   ├── agentic/
│   │   ├── graphs/
│   │   ├── nodes/
│   │   ├── state/
│   │   ├── context_compiler/
│   │   ├── model_router/
│   │   ├── prompts/
│   │   ├── tools/
│   │   └── policies/
│   │
│   ├── connectors/
│   │   ├── base/
│   │   ├── upload/
│   │   ├── drive/
│   │   ├── website/
│   │   ├── meta/
│   │   └── tiktok/
│   │
│   ├── ingestion/
│   │   ├── discovery/
│   │   ├── parsers/
│   │   ├── chunking/
│   │   ├── extraction/
│   │   ├── dedup/
│   │   └── entity_resolution/
│   │
│   ├── knowledge_graph/
│   │   ├── ontology/
│   │   ├── repositories/
│   │   ├── retrieval/
│   │   └── sync/
│   │
│   ├── content_intelligence/
│   │   ├── features/
│   │   ├── trends/
│   │   ├── planning/
│   │   ├── generation/
│   │   ├── validation/
│   │   ├── ranking/
│   │   └── learning/
│   │
│   ├── infrastructure/
│   │   ├── postgres/
│   │   ├── neo4j/
│   │   ├── redis/
│   │   ├── object_storage/
│   │   ├── temporal/
│   │   ├── telemetry/
│   │   └── llm_gateway/
│   │
│   └── shared/
│       ├── ids/
│       ├── errors/
│       ├── security/
│       └── utils/
│
├── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── contract/
│   ├── evals/
│   └── fixtures/
├── evals/
│   ├── datasets/
│   ├── scorers/
│   ├── experiments/
│   └── reports/
├── prompts/
│   ├── registry.yaml
│   └── versions/
├── docker/
├── docker-compose.yml
├── pyproject.toml
├── .env.example
└── README.md
```

---

## 3. PostgreSQL schema tối thiểu

```text
users
workspaces
workspace_members
connector_accounts
connector_tokens_encrypted
source_objects
source_snapshots
source_chunks
knowledge_entities
knowledge_assertions
knowledge_conflicts
brand_profiles
voice_profiles
channels
social_accounts
content_plans
content_nodes
content_assets
validation_results
agent_runs
agent_node_runs
tool_calls
audit_events
feedback_events
edit_learning_events
performance_events
trend_patterns
model_routes
prompt_versions
eval_datasets
eval_runs
```

### Quy tắc

- Mọi bảng có `workspace_id` khi phù hợp.
- Row-level access phải được kiểm tra ở repository/service.
- Dùng soft delete hoặc tombstone cho dữ liệu cần audit.
- `source_snapshot` bất biến.
- `knowledge_assertion` có version/supersede.
- `content_asset` lưu prompt version, context hash và model.
- `agent_run` không lưu secret.

---

## 4. API đề xuất

### Workspace và setup

```text
POST /v1/workspaces
GET  /v1/workspaces/{id}
POST /v1/workspaces/{id}/setup
GET  /v1/workspaces/{id}/readiness
GET  /v1/workspaces/{id}/brand-profile
GET  /v1/workspaces/{id}/missing-items
```

### Connector

```text
POST   /v1/workspaces/{id}/connectors/{type}/authorize
GET    /v1/workspaces/{id}/connectors
POST   /v1/workspaces/{id}/connectors/{connector_id}/sync
DELETE /v1/workspaces/{id}/connectors/{connector_id}
POST   /v1/workspaces/{id}/sources/upload
```

### Knowledge

```text
GET  /v1/workspaces/{id}/knowledge/search
GET  /v1/workspaces/{id}/knowledge/entities/{entity_id}
POST /v1/workspaces/{id}/facts/{assertion_id}/confirm
POST /v1/workspaces/{id}/facts/{assertion_id}/correct
POST /v1/workspaces/{id}/conflicts/{conflict_id}/resolve
```

### Nội dung

```text
POST /v1/workspaces/{id}/content-plans
GET  /v1/workspaces/{id}/content-plans/{plan_id}
POST /v1/workspaces/{id}/content-nodes/{node_id}/generate
POST /v1/workspaces/{id}/content-assets/{asset_id}/validate
POST /v1/workspaces/{id}/content-assets/{asset_id}/approve
POST /v1/workspaces/{id}/content-assets/{asset_id}/reject
PATCH /v1/workspaces/{id}/content-assets/{asset_id}
POST /v1/workspaces/{id}/content-assets/{asset_id}/schedule
```

### Feedback và hiệu suất

```text
POST /v1/workspaces/{id}/feedback
POST /v1/workspaces/{id}/performance/import
GET  /v1/workspaces/{id}/insights
GET  /v1/workspaces/{id}/voice-profile
```

### Run

```text
GET  /v1/runs/{run_id}
GET  /v1/runs/{run_id}/events
POST /v1/runs/{run_id}/resume
POST /v1/runs/{run_id}/cancel
```

---

## 5. Temporal workflows

```text
WorkspaceSetupWorkflow
ConnectorSyncWorkflow
WebsiteCrawlWorkflow
KnowledgeRebuildWorkflow
ContentPlanWorkflow
ContentGenerationBatchWorkflow
PublishWorkflow
MetricsCollectionWorkflow
FeedbackAggregationWorkflow
TrendUpdateWorkflow
EvaluationWorkflow
```

Mỗi workflow định nghĩa:

- input typed;
- timeout;
- retry;
- schedule;
- signal;
- cancellation;
- compensation;
- idempotency.

---

## 6. Prompt registry

```yaml
name: content.compose
version: 1.2.0
owner: content-intelligence
input_schema: ContentComposeInput
output_schema: PostDraft
allowed_models:
  - fast
  - creative
max_input_tokens: 12000
max_output_tokens: 1800
cache_policy: context_hash
eval_suite:
  - factual_precision
  - brand_compliance
  - duplication
  - platform_fit
status: production
```

Không sửa prompt production trực tiếp. Mỗi thay đổi:

1. tạo version;
2. chạy eval dataset;
3. so baseline;
4. review;
5. canary;
6. promote hoặc rollback.

---

## 7. Evals bắt buộc

### 7.1. Tập dữ liệu

Tối thiểu tạo các nhóm:

- setup extraction;
- fact conflict;
- missing information;
- retrieval;
- planning;
- platform writing;
- brand voice;
- unsupported claim;
- duplicate/copy;
- edit learning;
- tool authorization;
- human approval;
- connector failure.

### 7.2. Kiểm tra xác định

- JSON/Pydantic validity.
- required fields.
- source IDs tồn tại.
- không có banned phrase.
- không có unsupported number.
- duplication threshold.
- permission policy.
- idempotency.
- latency và token budget.

### 7.3. LLM judge

Chỉ dùng sau deterministic checks cho:

- brand fit;
- naturalness;
- audience relevance;
- platform fit;
- coherence.

LLM judge phải được hiệu chuẩn bằng nhãn người và không là nguồn đánh giá duy nhất.

### 7.4. Chỉ số phát hành

Một phiên bản chỉ được promote khi:

- factual regression = 0 trên critical set;
- unsupported claim không tăng;
- schema pass ≥ ngưỡng;
- approval prediction không giảm đáng kể;
- token/cost không vượt ngân sách;
- latency p95 trong giới hạn;
- không có cross-workspace leakage;
- security tests pass.

---

## 8. Bảo mật và quyền riêng tư

### 8.1. OAuth và secret

- Scope tối thiểu.
- Token mã hóa bằng KMS/envelope encryption.
- Không log token.
- Có revoke.
- Access token ngắn hạn khi nền tảng hỗ trợ.
- Tách credential store khỏi application log.

### 8.2. Workspace isolation

- Mọi request xác định `workspace_id`.
- Không lấy memory từ workspace khác.
- Cache key chứa workspace.
- Vector query có filter workspace.
- Neo4j query luôn giới hạn tenant.
- Test tấn công IDOR và cross-tenant retrieval.

### 8.3. Prompt injection từ nguồn

Tài liệu và website là dữ liệu không đáng tin. Parser phải:

- đánh dấu source content;
- không cho nội dung nguồn thay system policy;
- không thực thi instruction trong tài liệu;
- sandbox parser;
- chặn URL/file nguy hiểm;
- redaction dữ liệu nhạy cảm;
- tool call cần policy độc lập với text nguồn.

### 8.4. Publishing safety

- explicit approval;
- preview nội dung;
- account target;
- thời gian;
- media;
- audit;
- idempotency;
- status webhook;
- rollback/mark failed;
- không retry mù quáng nếu nền tảng trả trạng thái không rõ.

---

## 9. Tối ưu chi phí

### Bắt buộc ngay từ đầu

- model routing;
- input hash cache;
- embedding cache;
- selective tool loading;
- compact structured context;
- batch embeddings;
- delta ingestion;
- skip unchanged;
- max steps;
- timeout;
- cost per workspace/run.

### Sau khi có traffic

- semantic cache cho yêu cầu giống nhau;
- local classifier;
- distilled reranker;
- prompt compression;
- precomputed graph neighborhoods;
- scheduled batch learning;
- adaptive retrieval top-k;
- token quota theo gói.

---

## 10. Backlog triển khai theo sprint

### Sprint 1 — Foundation

- Monorepo.
- FastAPI.
- PostgreSQL migration.
- Redis.
- Langfuse/OpenTelemetry.
- Auth/workspace.
- Agent run + audit.
- Docker Compose.

**Đầu ra kiểm chứng:** tạo workspace, tạo run, trace đầy đủ.

### Sprint 2 — Setup và ingestion

- Upload.
- Drive read-only.
- Snapshot.
- Parser.
- Extraction.
- Gap detector.

**Đầu ra kiểm chứng:** tự tạo bản chụp thương hiệu từ bộ tệp mẫu.

### Sprint 3 — Knowledge

- Ontology.
- Neo4j sync.
- pgvector/full-text.
- Hybrid retrieval.
- Conflict resolution.

**Đầu ra kiểm chứng:** truy vấn fact có source và quan hệ.

### Sprint 4 — Content harness

- Planner.
- Composer.
- Validator.
- Human review.
- Voice calibration.

**Đầu ra kiểm chứng:** tạo kế hoạch và 3 bài có facts/citations nội bộ.

### Sprint 5 — Learning

- Feedback.
- Edit diff.
- Voice profile update.
- KPI import.
- Insight.

**Đầu ra kiểm chứng:** sửa bài làm thay đổi preference candidate có kiểm soát.

### Sprint 6 — Trend và ranking

- Sample collector.
- Dedup.
- clustering.
- time signals.
- trend playbook.
- candidate ranker.

**Đầu ra kiểm chứng:** so sánh plan baseline và plan dùng trend/ranker.

### Sprint 7 — Connector social và publish

- OAuth.
- account discovery.
- publish queue.
- webhook/status.
- KPI sync.

**Đầu ra kiểm chứng:** sandbox/test account publish có approval và audit.

### Sprint 8 — Hardening

- eval gate.
- load test.
- chaos/retry.
- security review.
- cost dashboard.
- canary prompt/model.

---

## 11. Hợp đồng tối thiểu với frontend

Frontend cần các object:

```text
SetupProgress
BrandSnapshot
MissingItem
ConflictItem
ContentPlan
ContentNode
PostDraft
ValidationResult
ApprovalRequest
AgentRunEvent
InsightSummary
```

Sự kiện SSE:

```text
run.started
step.started
step.progress
source.discovered
fact.extracted
conflict.detected
input.required
approval.required
draft.created
validation.completed
run.completed
run.failed
```

Frontend không gửi raw prompt; gửi intent và structured fields.

---

## 12. Definition of Done toàn hệ thống

- Có thể setup workspace từ nguồn thật.
- Có thể giải thích một fact đến từ đâu.
- Có thể phát hiện nguồn mâu thuẫn.
- Có thể tạo bài không bịa claim.
- Có thể dừng để duyệt và tiếp tục.
- Có thể khôi phục sau restart.
- Có thể học từ edit mà không biến một edit thành luật vĩnh viễn.
- Có eval regression trước khi đổi prompt/model.
- Có audit cho publish.
- Không rò dữ liệu giữa workspace.
- Có dashboard chi phí, token, latency, failure.
- Có hướng dẫn thêm connector, skill, model và evaluator.

---

## 13. PROMPT TỔNG HỢP CHO CODING AGENT

```text
Bạn là kiến trúc sư và kỹ sư triển khai hệ thống AI production. Hãy dựng skeleton hoàn chỉnh cho HIVE-K Python Agentic System dựa trên bốn tài liệu thiết kế.

Mục tiêu:
- Hệ thống có FastAPI, LangGraph, Temporal, PostgreSQL/pgvector, Neo4j, Redis, MinIO và observability.
- Không triển khai frontend.
- Cung cấp API/event contract để frontend tích hợp.
- Tách deterministic services khỏi LLM nodes.
- Có knowledge graph luôn cập nhật.
- Có onboarding tự động.
- Có content planning, writing, validation và feedback learning.
- Có eval và security từ đầu.

Thứ tự:
1. Tạo repository và Docker Compose.
2. Tạo domain model và migration.
3. Tạo infrastructure adapter.
4. Tạo agent harness.
5. Tạo upload ingestion demo.
6. Tạo knowledge graph demo.
7. Tạo content plan/draft demo.
8. Tạo feedback/edit learning demo.
9. Tạo eval pipeline.
10. Viết README.

Ràng buộc:
- Python 3.12.
- Type hints strict.
- Ruff, mypy/pyright, pytest.
- Async I/O.
- Repository pattern vừa đủ, không over-engineer.
- Pydantic schema cho mọi boundary.
- Secrets trong env/KMS abstraction.
- Không gọi model từ route.
- Không auto-publish.
- Không có dữ liệu cross-workspace.
- Không dùng LLM nếu deterministic code giải quyết được.
- Có mock provider để test.
- Mỗi module có unit test và contract test.

Đầu ra bắt buộc:
- Cây thư mục.
- Source code.
- Docker Compose.
- Alembic migration.
- Neo4j init constraints.
- `.env.example`.
- Seed data.
- Test.
- Eval dataset mẫu.
- README chạy local.
- Kiến trúc sequence và data flow.
- Danh sách TODO theo sprint.
```

---

## 14. Nguồn nghiên cứu kỹ thuật

- LangGraph documentation: persistence, durable execution, interrupts và human-in-the-loop.
- Temporal Python documentation: durable workflows, retry và error handling.
- Neo4j GraphRAG Python documentation: knowledge graph construction và vector/Cypher retrievers.
- pgvector documentation: exact/approximate nearest-neighbor và hybrid search cùng PostgreSQL full-text.
- PydanticAI documentation: typed dependencies, tools và structured outputs.
- MCP specification: tools, resources, prompts, authorization và security best practices.
- Langfuse documentation: traces, datasets, experiments, scores và LLM-as-a-judge.
- BERTopic documentation: topic modeling và topics-over-time.
