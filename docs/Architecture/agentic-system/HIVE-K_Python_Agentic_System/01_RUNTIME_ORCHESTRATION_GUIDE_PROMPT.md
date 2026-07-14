# Thành phần 1 — Agentic Harness, Runtime và Orchestration

## 1. Mục tiêu

Xây dựng lớp điều phối trung tâm cho HIVE-K bằng Python. Lớp này không phải một chatbot và không phải một vòng lặp ReAct vô hạn. Nó là một **đồ thị công việc có trạng thái**, trong đó:

- Mỗi nút có input/output typed.
- Mỗi công cụ có quyền, timeout, retry và audit.
- Mỗi hành động có tác dụng phụ phải idempotent.
- Hệ thống có thể dừng để người dùng duyệt rồi tiếp tục.
- Tiến trình dài có thể khôi phục sau lỗi hoặc khởi động lại.
- Mô hình ngôn ngữ chỉ được gọi tại các nút cần suy luận.

---

## 2. Phân loại nút: deterministic trước, agent sau

| Loại nút | Ví dụ | Cách triển khai |
|---|---|---|
| Xác định | kiểm tra field thiếu, rate limit, hash, deduplicate, quyền | Python thuần |
| Truy xuất | tìm facts, bài cũ, graph neighborhood | SQL/Cypher/vector search |
| Mô hình nhỏ | intent, phân loại rủi ro, ngôn ngữ, chủ đề | model local/API rẻ |
| Mô hình ngôn ngữ | tổng hợp brief, lập kế hoạch, viết, giải thích | LLM có structured output |
| Duyệt người dùng | xác nhận claim, sửa dữ kiện, approve bài | LangGraph interrupt |
| Tác dụng phụ | đồng bộ, đăng bài, gửi thông báo | Temporal Activity |

Quy tắc: chỉ gọi agent nếu một hàm xác định hoặc mô hình phân loại chuyên biệt không giải quyết được.

---

## 3. Các vai trò logic

Không cần triển khai mỗi vai trò thành một tiến trình agent độc lập. Có thể là node hoặc capability.

### `RequestRouter`

- Phân loại yêu cầu: thiết lập, cập nhật dữ liệu, tạo kế hoạch, tạo bài, phân tích hiệu quả, đồng bộ.
- Chọn graph phù hợp.
- Không được tự gọi công cụ ghi dữ liệu.

### `SetupSupervisor`

- Điều phối quá trình thiết lập workspace.
- Gọi connector, bộ xử lý tài liệu, knowledge curator và gap detector.
- Tạo bản chụp thương hiệu.

### `KnowledgeCurator`

- Hợp nhất fact mới vào nguồn dữ liệu chuẩn và đồ thị.
- Phát hiện trùng, mâu thuẫn, lỗi thời.
- Không tự xác nhận claim quan trọng.

### `ContentPlanner`

- Chọn tầng phễu, pillar, angle, tài khoản, định dạng và thời điểm.
- Tạo kế hoạch có ràng buộc, không viết toàn bộ bài.

### `ContentComposer`

- Tạo bài theo đúng node kế hoạch.
- Chỉ nhận context đã được biên dịch.
- Trả về facts đã dùng và facts còn thiếu.

### `ContentValidator`

- Chạy kiểm tra xác định trước.
- Sau đó mới dùng LLM judge cho tiêu chí ngữ nghĩa.
- Không được tự “hợp thức hóa” claim thiếu bằng cách viết lại.

### `LearningProcessor`

- Xử lý approve/reject/edit/performance.
- Tạo feature và memory candidate.
- Chỉ nâng một quy tắc thành “ổn định” khi đủ bằng chứng.

---

## 4. Đồ thị cấp cao

```text
START
  ↓
authenticate_and_authorize
  ↓
route_request
  ├─ setup_graph
  ├─ update_knowledge_graph
  ├─ create_content_plan_graph
  ├─ create_post_graph
  ├─ analyze_performance_graph
  └─ sync_connector_workflow
```

### Đồ thị tạo bài

```text
load_request
  ↓
validate_required_facts
  ├─ thiếu blocking → interrupt: request_user_update
  └─ đủ
       ↓
compile_context
       ↓
select_skill_and_model
       ↓
generate_draft
       ↓
deterministic_checks
       ↓
semantic_validator
  ├─ red → human_review
  ├─ amber → human_review
  └─ green → save_as_needs_review
       ↓
user_action
  ├─ approve
  ├─ edit
  ├─ reject
  └─ regenerate_with_reason
       ↓
record_feedback
       ↓
END
```

---

## 5. State schema đề xuất

```python
from __future__ import annotations

from typing import Any, Literal
from pydantic import BaseModel, Field


class SourceRef(BaseModel):
    source_id: str
    source_type: Literal[
        "user_input", "drive_file", "website", "social_api",
        "approved_memory", "performance", "system_inference"
    ]
    version_id: str | None = None
    observed_at: str
    confidence: float = Field(ge=0, le=1)
    approved: bool = False


class MissingItem(BaseModel):
    field: str
    severity: Literal["blocking", "quality", "optional"]
    reason: str
    searched_sources: list[str]
    suggested_action: str
    can_infer: bool = False


class HarnessState(BaseModel):
    run_id: str
    workspace_id: str
    user_id: str
    intent: str | None = None

    request_payload: dict[str, Any] = Field(default_factory=dict)
    authorized_tools: list[str] = Field(default_factory=list)

    facts: dict[str, Any] = Field(default_factory=dict)
    source_refs: dict[str, list[SourceRef]] = Field(default_factory=dict)
    missing_items: list[MissingItem] = Field(default_factory=list)

    retrieved_memories: list[dict[str, Any]] = Field(default_factory=list)
    graph_context: list[dict[str, Any]] = Field(default_factory=list)
    compiled_context: dict[str, Any] = Field(default_factory=dict)

    plan: dict[str, Any] | None = None
    draft: dict[str, Any] | None = None
    validation: dict[str, Any] | None = None

    approval_required: bool = False
    approval_payload: dict[str, Any] | None = None

    warnings: list[str] = Field(default_factory=list)
    audit_event_ids: list[str] = Field(default_factory=list)
```

Không lưu access token, mật khẩu hoặc nội dung tệp lớn trong graph state. Chỉ lưu ID tham chiếu.

---

## 6. Context Compiler

### 6.1. Vai trò

`ContextCompiler` là thành phần bắt buộc giữa retrieval và LLM. Nó quyết định dữ liệu nào được đưa vào model.

Input:

- loại tác vụ;
- ngân sách token;
- facts bắt buộc;
- neighborhood của đồ thị;
- memory liên quan;
- dữ liệu bài tương tự;
- policy và quy tắc nền tảng.

Output:

```python
class CompiledContext(BaseModel):
    task: str
    immutable_facts: list[dict]
    brand_rules: list[dict]
    audience_summary: dict
    platform_rules: dict
    relevant_examples: list[dict]
    trend_patterns: list[dict]
    negative_memories: list[dict]
    citations: list[SourceRef]
    omitted_sections: list[str]
    token_budget: int
```

### 6.2. Chiến lược giảm token

1. Dùng ID và dữ liệu có cấu trúc thay vì chèn nguyên văn tài liệu.
2. Tóm tắt phân tầng: tài liệu → mục → workspace snapshot → task context.
3. Chỉ lấy 3–8 memory có điểm cao và khác nhau.
4. Kết hợp full-text, vector và graph; không lấy top-k vector đơn thuần.
5. Loại trùng bằng cosine similarity + MinHash/SimHash.
6. Không gửi tool schema không liên quan.
7. Dùng model nhỏ cho routing, extraction, tagging và kiểm tra.
8. Cache theo `input_context_hash + prompt_version + model`.
9. Chỉ cập nhật delta khi nguồn thay đổi.
10. Giới hạn số vòng agent và số lần gọi công cụ theo run policy.

---

## 7. Tool registry

```python
class ToolPolicy(BaseModel):
    tool_name: str
    risk: Literal["read", "write", "external_side_effect"]
    required_scopes: list[str]
    requires_human_approval: bool
    timeout_seconds: int
    max_retries: int
    idempotent: bool
```

Mỗi công cụ phải có:

- tên rõ nghĩa;
- một nhiệm vụ duy nhất;
- input/output schema;
- quyền;
- giới hạn;
- lỗi có thể retry và không retry;
- idempotency key;
- log source/result;
- cơ chế redaction.

Nhóm công cụ:

```text
connectors.read.*
connectors.sync.*
knowledge.search.*
knowledge.upsert_candidate.*
content.read.*
content.save_draft.*
publishing.queue.*
analytics.read.*
feedback.write.*
```

Agent không được nhìn thấy toàn bộ tool registry. Tool được nạp theo intent và quyền của user.

---

## 8. LangGraph và Temporal phối hợp

### LangGraph dùng cho

- routing theo trạng thái;
- reasoning graph;
- pause/resume để duyệt;
- checkpoint của một run;
- thay đổi state sau khi user sửa;
- time-travel/debug trong môi trường phát triển.

### Temporal dùng cho

- OAuth callback và token refresh;
- đồng bộ Drive định kỳ;
- crawl website nhiều trang;
- retry API mạng xã hội;
- chờ webhook;
- lên lịch đăng;
- thu KPI sau 1 giờ, 24 giờ, 7 ngày;
- chạy learning batch;
- compensation khi publish một phần thất bại.

### Ranh giới quan trọng

Không đặt lời gọi LLM không xác định trực tiếp trong mã workflow deterministic của Temporal. Đặt chúng trong Activity có retry policy và lưu kết quả.

---

## 9. Model routing

```python
class ModelRoute(BaseModel):
    task: str
    model_tier: Literal["local", "fast", "reasoning", "creative"]
    max_output_tokens: int
    temperature: float
    fallback_chain: list[str]
    cacheable: bool
```

Ví dụ:

| Tác vụ | Model tier |
|---|---|
| intent, tag, language | local/fast |
| trích fact có schema | fast |
| hợp nhất mâu thuẫn | reasoning |
| tạo kế hoạch | reasoning |
| viết biến thể | creative |
| validator fact/rule | deterministic + fast |
| tóm tắt hiệu suất | fast/reasoning tùy dữ liệu |

---

## 10. Hợp đồng phản hồi cho frontend

```python
class UIAction(BaseModel):
    type: Literal[
        "show_summary", "request_confirmation", "request_upload",
        "open_drive_file", "review_draft", "approve_action",
        "show_progress", "show_error"
    ]
    label: str
    payload: dict


class HarnessResponse(BaseModel):
    run_id: str
    status: Literal[
        "running", "completed", "partial", "needs_user_input",
        "needs_approval", "failed"
    ]
    state_patch: dict
    missing_items: list[MissingItem]
    next_actions: list[UIAction]
    progress: dict
    warnings: list[str]
    trace_id: str
```

Frontend không cần hiểu prompt hoặc graph. Frontend chỉ:

- gửi intent + data;
- hiển thị event;
- patch state;
- gửi quyết định approve/edit/reject;
- theo dõi run bằng SSE/WebSocket.

---

## 11. Chính sách duyệt

Bắt buộc dừng trước khi:

- xác nhận giá, ưu đãi, lịch, chính sách hoặc cam kết mới;
- đăng bài;
- gửi tin nhắn;
- sửa nguồn dữ liệu;
- xóa fact;
- hợp nhất hai thực thể có độ chắc chắn thấp;
- dùng xu hướng có rủi ro tranh cãi;
- dùng nội dung có yếu tố pháp lý, y tế, tài chính hoặc lời hứa kết quả.

---

## 12. Khả năng quan sát

Mỗi node ghi:

```text
trace_id
run_id
workspace_id
graph_name
node_name
prompt_version
model
tool_calls
latency_ms
input_tokens
output_tokens
cache_hit
retrieval_ids
validation_scores
error_class
retry_count
user_outcome
```

Không ghi raw access token, dữ liệu cá nhân nhạy cảm hoặc toàn bộ prompt chưa redaction.

---

## 13. Tiêu chí hoàn thành

- Run dừng và tiếp tục được sau human review.
- Restart worker không làm mất tiến trình.
- Gọi lại cùng idempotency key không tạo bản ghi hoặc bài đăng trùng.
- Mỗi output LLM được validate bằng Pydantic.
- Tool ngoài quyền không xuất hiện trong context.
- Mỗi fact trong bài có thể truy về source.
- Có ngân sách token và số bước tối đa cho từng run mode.
- Có trace xuyên suốt LangGraph → Temporal Activity → DB.

---

## 14. PROMPT TRIỂN KHAI CHO CODING AGENT

```text
Bạn là kỹ sư backend AI cấp cao. Hãy xây dựng thành phần Agentic Harness cho HIVE-K bằng Python.

Bối cảnh:
- HIVE-K là hệ thống quản trị nội dung đa kênh cho workspace có nhiều tài khoản.
- Không xây chatbot monolithic.
- Dùng FastAPI, Pydantic v2, LangGraph, PostgreSQL.
- Temporal chịu trách nhiệm cho workflow dài và tác dụng phụ.
- Mọi output LLM phải có schema.
- Mọi tool phải có quyền, timeout, retry, idempotency và audit.
- Không triển khai frontend.

Nhiệm vụ:
1. Tạo package `src/hivek_agent/`.
2. Tạo state model, run policy, tool policy, response contract.
3. Tạo LangGraph tối thiểu cho:
   - route_request
   - create_post
   - human_review
   - record_feedback
4. Tạo interface cho ContextCompiler và ModelRouter.
5. Tạo interface Temporal Activity, không cần triển khai connector thật.
6. Tạo SSE endpoint để frontend theo dõi run.
7. Tạo PostgreSQL repository interface cho runs, checkpoints, audit.
8. Tạo unit test cho:
   - blocking missing fact
   - unauthorized tool
   - pause/resume
   - idempotent save
   - Pydantic validation failure
9. Viết README chạy local và sơ đồ sequence.

Ràng buộc:
- Không đặt prompt dài trong route.
- Không dùng dict tự do khi đã có thể định nghĩa Pydantic model.
- Không cho model tự quyết định publish.
- Không dùng LLM cho validation có thể viết bằng mã.
- Không log secret.
- Không tạo thêm framework orchestration ngoài LangGraph và Temporal.

Đầu ra:
- Cây thư mục.
- Toàn bộ source code cần thiết.
- Migration/schema tối thiểu.
- Test chạy được.
- README.
- Danh sách phần chưa triển khai thật được đánh dấu TODO rõ ràng.
```
