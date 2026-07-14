# Thành phần 2 — Thiết lập ban đầu, Connector, Ingestion và Đồ thị tri thức

## 1. Mục tiêu

Sau khi người dùng kết nối nguồn dữ liệu, HIVE-K phải tự thực hiện phần lớn công việc:

1. Khám phá nguồn.
2. Lấy snapshot.
3. Trích xuất nội dung.
4. Chuẩn hóa dữ liệu.
5. Nhận diện thực thể và quan hệ.
6. Hợp nhất với dữ liệu cũ.
7. Xây dựng bản chụp thương hiệu.
8. Phát hiện phần thiếu/mâu thuẫn.
9. Hướng dẫn người dùng cập nhật đúng nguồn.
10. Luôn cập nhật đồ thị khi có thay đổi.

Người dùng không phải tự điền lại tất cả thông tin đã có trong website, Drive, bài cũ hoặc tài khoản đã kết nối.

---

## 2. Luồng thiết lập đề xuất

```text
Bước 1 — Chọn nguồn
  Google Drive | Website | Facebook/Instagram | TikTok | Tải tệp

Bước 2 — Cấp quyền
  Hiển thị rõ dữ liệu đọc/ghi và lý do cần quyền

Bước 3 — Tự khám phá
  HIVE-K lập danh sách tệp, trang, tài khoản, bài, metadata

Bước 4 — Xử lý nền
  Snapshot → parse → chunk → fact extraction → entity resolution

Bước 5 — Bản chụp thương hiệu
  Hệ thống hiển thị những gì đã hiểu và nguồn

Bước 6 — Bổ sung thông tin thiếu
  Chỉ hỏi các mục blocking hoặc ảnh hưởng lớn

Bước 7 — Hiệu chỉnh giọng văn
  Tạo 3 bài mẫu khác nhau, người dùng chọn/sửa

Bước 8 — Xác nhận
  Khóa phiên bản `Brand Operating Profile v1`

Bước 9 — Đồng bộ liên tục
  Webhook/change token/schedule → delta update
```

---

## 3. Connector contract

```python
from typing import Protocol
from pydantic import BaseModel


class ConnectorCursor(BaseModel):
    connector_id: str
    cursor: str | None = None
    last_synced_at: str | None = None


class SourceObject(BaseModel):
    external_id: str
    object_type: str
    name: str
    mime_type: str | None = None
    modified_at: str | None = None
    parent_external_id: str | None = None
    content_ref: str | None = None
    metadata: dict = {}


class Connector(Protocol):
    async def authorize(self, user_id: str) -> dict: ...
    async def list_objects(self, cursor: ConnectorCursor) -> list[SourceObject]: ...
    async def fetch_object(self, external_id: str) -> SourceObject: ...
    async def fetch_changes(self, cursor: ConnectorCursor) -> tuple[list[SourceObject], ConnectorCursor]: ...
    async def revoke(self, user_id: str) -> None: ...
```

Mỗi connector cần:

- OAuth scope tối thiểu.
- Token mã hóa.
- Refresh và revoke.
- Cursor/change token.
- Backoff khi rate limit.
- Snapshot bất biến để audit.
- Mapping external ID → internal source ID.
- Không giả định mọi nền tảng cho phép đọc hoặc đăng mọi dữ liệu.

---

## 4. Chiến lược lấy dữ liệu

### Ưu tiên 1 — API chính thức

Dùng API chính thức cho dữ liệu tài khoản, bài, bình luận, insight, đăng bài và webhook khi được cho phép.

### Ưu tiên 2 — Nguồn do người dùng cung cấp

- Drive.
- Website thuộc quyền quản lý.
- Tệp tải lên.
- Link bài cụ thể.
- CSV xuất từ nền tảng.

### Ưu tiên 3 — Crawl public có kiểm soát

Chỉ crawl khi:

- nội dung public;
- không vượt robots/điều khoản;
- rate thấp;
- có user-agent rõ;
- lưu URL, thời gian và checksum;
- không thu dữ liệu cá nhân không cần thiết;
- không dùng để sao chép nguyên văn.

Không quảng bá tính năng “crawl bất kỳ thứ gì”. Khả năng thực tế phụ thuộc API, scope, audit ứng dụng và điều khoản từng nền tảng.

---

## 5. Ingestion pipeline

```text
discover
  ↓
snapshot
  ↓
malware/file validation
  ↓
parse
  ↓
language + document type classification
  ↓
layout-aware segmentation
  ↓
deduplication
  ↓
fact/entity/relation extraction
  ↓
entity resolution
  ↓
confidence + provenance
  ↓
write relational store
  ↓
update knowledge graph
  ↓
embed selected chunks
  ↓
quality checks
  ↓
generate missing-information tasks
```

### 5.1. Không embed tất cả

Không cần tạo embedding cho:

- ID;
- số đơn giản;
- trạng thái;
- field đã có cột cụ thể;
- dữ liệu tạm;
- secret;
- chunk trùng.

Embedding dùng cho đoạn mô tả, bài viết, FAQ, phản hồi, phong cách và tài liệu có nhu cầu semantic search.

### 5.2. Chunking theo cấu trúc

- Tài liệu: heading → paragraph/table/list.
- Website: DOM section → main content.
- Bài social: hook/body/CTA/comment.
- FAQ: một cặp question-answer là một đơn vị.
- Sheet: theo row/record, không cắt ngẫu nhiên theo token.

---

## 6. Bản thể tri thức cốt lõi

### 6.1. Node types

```text
Workspace
Brand
Product
Service
Offer
Price
Policy
Claim
Evidence
AudienceSegment
CustomerPain
Objection
BuyingTrigger
FAQ
Channel
Account
ContentPlan
Post
ContentPattern
TrendTopic
MediaAsset
SourceDocument
SourceSnapshot
FeedbackEvent
PerformanceEvent
Collaborator
Region
TimeWindow
```

### 6.2. Edge types

```text
BRAND_OWNS_PRODUCT
PRODUCT_HAS_OFFER
CLAIM_SUPPORTED_BY
CLAIM_CONTRADICTS
AUDIENCE_HAS_PAIN
AUDIENCE_HAS_OBJECTION
POST_TARGETS_AUDIENCE
POST_USES_PATTERN
POST_PUBLISHED_ON
POST_DERIVED_FROM_SOURCE
POST_RECEIVED_FEEDBACK
POST_HAS_PERFORMANCE
CHANNEL_SERVES_ROLE
ACCOUNT_BELONGS_TO_CHANNEL
FACT_EXTRACTED_FROM
FACT_SUPERSEDES
PATTERN_SIMILAR_TO
TREND_ACTIVE_ON
COLLABORATOR_FITS_AUDIENCE
```

### 6.3. Thuộc tính bắt buộc cho fact/edge

```python
class KnowledgeAssertion(BaseModel):
    assertion_id: str
    subject_id: str
    predicate: str
    object_value: str | float | bool | dict
    source_id: str
    source_version: str
    observed_at: str
    valid_from: str | None = None
    valid_to: str | None = None
    confidence: float
    approval_status: str
    extractor_version: str
    supersedes_id: str | None = None
```

Đây là thiết kế có provenance và version, không phải chỉ tạo node/edge trống nguồn.

---

## 7. Entity resolution

Quá trình hợp nhất thực thể dùng nhiều tầng:

1. Exact key: external ID, URL chuẩn, SKU, email doanh nghiệp.
2. Normalized string: bỏ dấu, chuẩn hóa viết tắt, số điện thoại.
3. Fuzzy match: Levenshtein/Jaro-Winkler.
4. Embedding similarity.
5. Graph neighborhood similarity.
6. LLM chỉ dùng để giải thích trường hợp khó.
7. Human review khi có nguy cơ gộp sai.

Không merge tự động khi:

- hai mức giá khác nhau nhưng không có thời gian hiệu lực;
- hai sản phẩm tên giống nhưng khác khu vực;
- claim mới xung đột claim đã duyệt;
- nguồn mới có độ tin cậy thấp hơn.

---

## 8. Quy tắc ưu tiên nguồn

Mặc định:

```text
user_confirmed
> approved_structured_source
> official_connected_api
> approved_drive_document
> owned_website
> approved_historical_content
> public_reference
> system_inference
```

Khi hai nguồn mâu thuẫn:

- Không chọn âm thầm.
- Lưu cả hai assertion.
- Đánh dấu `conflict`.
- Hiển thị nguồn, ngày và đề nghị người dùng xác nhận.
- Sau xác nhận, assertion cũ chuyển thành `superseded`, không xóa lịch sử.

---

## 9. Bản chụp thương hiệu

```python
class BrandOperatingProfile(BaseModel):
    workspace_id: str
    version: int

    identity: dict
    products: list[dict]
    audiences: list[dict]
    offers: list[dict]
    approved_claims: list[dict]
    blocked_claims: list[dict]
    faq: list[dict]

    voice_profile: dict
    channel_roles: list[dict]
    platform_rules: list[dict]

    missing_items: list[dict]
    conflicts: list[dict]
    source_coverage: dict
    readiness_score: float
```

`readiness_score` không phải điểm do LLM bịa. Nó được tính bằng rule:

```text
blocking coverage
+ approved claim coverage
+ audience coverage
+ voice examples
+ channel connection
+ source freshness
- unresolved conflicts
- stale critical facts
```

---

## 10. Gap Detector

### Ví dụ đầu ra

```json
{
  "field": "product.course_schedule",
  "severity": "blocking",
  "reason": "Các tài liệu hiện có nhắc ba lịch khai giảng khác nhau.",
  "searched_sources": [
    "Drive/Khóa học 2026.docx",
    "Website/trang-khoa-hoc",
    "Facebook post 2026-07-01"
  ],
  "suggested_action": "Cập nhật bảng 'Lịch khai giảng' trong Drive hoặc chọn lịch đang còn hiệu lực.",
  "ui_target": {
    "type": "open_source",
    "source_id": "src_123",
    "section": "Lịch khai giảng"
  }
}
```

Gap detector gồm:

- rule-based required fields theo ngành;
- freshness rule;
- conflict rule;
- source coverage;
- entropy/uncertainty của extraction;
- LLM chỉ dùng để viết câu hỏi dễ hiểu.

---

## 11. Đồng bộ tăng dần

Không chạy lại toàn bộ ingestion mỗi lần.

```text
change event
  ↓
compare checksum/version
  ├─ không đổi → skip
  └─ đổi
      ↓
invalidate affected assertions
      ↓
re-parse changed object
      ↓
recompute impacted graph neighborhood
      ↓
re-embed changed chunks
      ↓
rebuild affected summaries
      ↓
notify user only if blocking/conflict
```

Cần có dependency graph để biết thay đổi một nguồn ảnh hưởng:

- fact nào;
- bản chụp nào;
- prompt cache nào;
- bài nháp nào;
- lịch nào chưa đăng.

---

## 12. API và event cho frontend

### API

```text
POST /v1/workspaces
POST /v1/workspaces/{id}/connectors/{type}/authorize
POST /v1/workspaces/{id}/sources/upload
POST /v1/workspaces/{id}/setup/start
GET  /v1/runs/{run_id}
GET  /v1/workspaces/{id}/brand-profile
GET  /v1/workspaces/{id}/missing-items
POST /v1/workspaces/{id}/facts/{fact_id}/confirm
POST /v1/workspaces/{id}/facts/{fact_id}/correct
POST /v1/workspaces/{id}/conflicts/{id}/resolve
POST /v1/workspaces/{id}/voice-calibration
```

### UI gợi ý

Frontend chỉ cần bốn màn hình chính cho thiết lập:

1. `ConnectSourcesPage`
2. `SetupProgressPage`
3. `BrandSnapshotReviewPage`
4. `VoiceCalibrationPage`

Không cần 9 form dài. Các form chi tiết chỉ xuất hiện khi hệ thống thật sự thiếu dữ liệu.

---

## 13. Tiêu chí hoàn thành

- Kết nối một nguồn và tạo snapshot được.
- Chạy lại không tạo source object trùng.
- Tài liệu thay đổi chỉ cập nhật delta.
- Mỗi fact có source, version, thời gian và confidence.
- Mâu thuẫn không bị ghi đè.
- Gap detector dẫn người dùng đến đúng nguồn cần sửa.
- Graph query trả được product → offer → audience → approved evidence.
- Xóa/revoke connector không làm mất audit nhưng ngăn truy cập tiếp.
- Tất cả file upload qua kiểm tra type, kích thước và malware policy.

---

## 14. PROMPT TRIỂN KHAI CHO CODING AGENT

```text
Bạn là kỹ sư dữ liệu và AI backend. Hãy xây dựng thành phần onboarding tự động, connector framework, ingestion pipeline và knowledge graph cho HIVE-K.

Stack:
- Python 3.12
- FastAPI
- Pydantic v2
- PostgreSQL + SQLAlchemy/Alembic
- pgvector
- Neo4j
- Temporal Python SDK
- S3/MinIO
- Redis

Phạm vi sprint:
1. Connector framework typed.
2. Hai connector đầu:
   - upload file
   - Google Drive read-only
3. Snapshot/version/checksum.
4. Parser interface cho PDF, DOCX, Markdown, text và CSV.
5. Fact/entity/relation extraction pipeline.
6. Entity resolution cơ bản.
7. PostgreSQL schema cho source, snapshot, assertion, conflict, missing item.
8. Neo4j ontology và upsert.
9. BrandOperatingProfile builder.
10. Gap detector rule-based.
11. API và SSE progress.
12. Unit/integration tests.

Yêu cầu:
- Không embed secret hoặc field cấu trúc.
- Không merge thực thể mơ hồ.
- Mọi assertion phải có provenance.
- Đồng bộ phải tăng dần.
- OAuth scope tối thiểu và token mã hóa.
- Không viết crawler vi phạm điều khoản.
- Không đặt toàn bộ tài liệu vào một prompt.
- Extraction phải trả Pydantic schema và có retry giới hạn.
- Tạo mock LLM để test không phụ thuộc API thật.

Đầu ra:
- Source code chạy bằng Docker Compose.
- Migration PostgreSQL.
- Neo4j constraints/index.
- Sample dataset.
- Test cho duplicate, conflict, stale fact, delta sync, revoke.
- README mô tả cách thêm connector mới.
- Sơ đồ sequence cho setup flow.
```
