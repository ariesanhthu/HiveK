# PLAN 2 — Social Connectors, Lên lịch và Tự động đăng bài

## 1. Mục tiêu

Tạo connector có interface thống nhất cho:

- Facebook Page;
- Instagram Professional Account;
- Threads;
- mock connector để test;
- optional generic webhook connector cho service thứ ba.

Plan này sử dụng scheduler/job runtime của Plan 1.

Không tự động đăng bài ở trạng thái `draft` hoặc `needs_review`.

---

## 2. Bước 0 — Kiểm tra code hiện có

Coding agent phải tìm:

```text
connectors/
social/
meta/
threads/
publishing/
oauth/
webhooks/
```

và xác định:

- có connector nào đã tồn tại;
- có route OAuth callback nào;
- token đang lưu ở đâu;
- account/page discovery hiện có;
- media upload flow hiện có;
- content model hiện có;
- API version đang hard-code hay config;
- mock integration hiện có.

Nếu có code hoạt động, phải mở rộng chứ không viết connector song song.

---

## 3. Connector contract

```python
class SocialConnector(Protocol):
    platform: str

    async def authorize_url(
        self,
        workspace_id: str,
        redirect_uri: str,
        state: str,
    ) -> str: ...

    async def exchange_code(self, code: str) -> TokenBundle: ...

    async def refresh_token(self, account_id: str) -> TokenBundle: ...

    async def discover_accounts(self, token_ref: str) -> list[SocialAccount]: ...

    async def validate_publish(
        self,
        request: PublishRequest,
    ) -> ValidationResult: ...

    async def publish(self, request: PublishRequest) -> PublishResult: ...

    async def get_publish_status(
        self,
        platform_request_id: str,
    ) -> PublishStatus: ...

    async def delete_post(self, platform_post_id: str) -> OperationResult: ...

    async def verify_webhook(self, request: WebhookRequest) -> bool: ...

    async def parse_webhook(
        self,
        request: WebhookRequest,
    ) -> list[NormalizedSocialEvent]: ...
```

Mỗi implementation phải trả normalized error:

```python
class ConnectorErrorCode(str, Enum):
    AUTH_EXPIRED = "auth_expired"
    PERMISSION_DENIED = "permission_denied"
    RATE_LIMITED = "rate_limited"
    INVALID_MEDIA = "invalid_media"
    INVALID_CONTENT = "invalid_content"
    TRANSIENT_NETWORK = "transient_network"
    PLATFORM_UNAVAILABLE = "platform_unavailable"
    UNKNOWN_REMOTE_STATE = "unknown_remote_state"
```

---

## 4. MongoDB schema

### `social_accounts`

```json
{
  "_id": "ObjectId",
  "workspace_id": "ObjectId",
  "platform": "facebook|instagram|threads|mock",
  "external_account_id": "string",
  "display_name": "string",
  "account_type": "page|professional|threads_profile|mock",
  "status": "connected|expired|revoked|error",
  "capabilities": {
    "publish_text": true,
    "publish_image": true,
    "publish_video": false,
    "publish_carousel": false,
    "read_comments": true,
    "reply_comments": true,
    "read_messages": false,
    "reply_messages": false
  },
  "permission_snapshot": [],
  "token_ref": "ObjectId",
  "metadata": {},
  "connected_at": "datetime",
  "updated_at": "datetime"
}
```

Unique index:

```javascript
db.social_accounts.createIndex(
  { workspace_id: 1, platform: 1, external_account_id: 1 },
  { unique: true }
)
```

### `oauth_credentials`

Không lưu access token plain text.

```json
{
  "_id": "ObjectId",
  "workspace_id": "ObjectId",
  "provider": "meta|threads",
  "encrypted_access_token": "ciphertext",
  "encrypted_refresh_token": "ciphertext|null",
  "expires_at": "datetime|null",
  "scopes": [],
  "key_version": 1,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

Yêu cầu:

- envelope encryption abstraction;
- redaction trong log;
- revoke;
- refresh trước khi hết hạn;
- không trả token ra frontend;
- audit khi scope thay đổi.

---

## 5. Meta và Threads capabilities

### 5.1 Threads

Connector phải được thiết kế để hỗ trợ, tùy quyền và phiên bản API:

- publish text;
- publish image;
- publish video;
- publish carousel;
- đọc/quản lý replies;
- tạo reply;
- nhận webhook replies/mentions;
- lấy insight khi permission cho phép.

Không hard-code permission từ trí nhớ. Tạo config:

```yaml
threads:
  required_scopes:
    basic:
      - threads_basic
    publishing:
      - threads_content_publish
    replies:
      - threads_manage_replies
  optional_scopes:
    - threads_read_replies
    - threads_manage_insights
```

Coding agent phải đối chiếu tên permission với tài liệu Meta tại thời điểm triển khai và ghi:

```text
docs/meta_permission_matrix.md
```

### 5.2 Facebook Page

Thiết kế cho:

- tạo và quản lý Page posts;
- reply comment dưới danh nghĩa Page;
- đọc engagement/comment cần thiết;
- nhận Page webhook;
- Messenger reply khi có `pages_messaging` và policy hợp lệ.

Scope thường liên quan đến:

```text
pages_manage_posts
pages_read_engagement
pages_manage_engagement
pages_messaging
```

Không yêu cầu tất cả scope ngay từ đầu. Chỉ xin quyền tối thiểu theo capability người dùng bật.

### 5.3 Instagram Professional

Thiết kế cho professional account:

- content publishing;
- comment read/reply;
- messaging;
- webhook;
- insight tùy quyền.

Các permission/capability phải được phát hiện sau OAuth và lưu vào `capabilities`, không giả định mọi account đều hỗ trợ mọi tính năng.

---

## 6. Publishing flow

```text
content approved
→ schedule request
→ validate account capability
→ validate content/media
→ create scheduled_post
→ register QStash delivery
→ create/lease publish_job
→ connector.publish()
→ persist remote request/post ID
→ confirm remote state
→ mark published
→ emit audit + event
```

### Hai-phase publish khi platform yêu cầu media container

```text
create media container
→ poll/verify container ready
→ publish container
→ verify post ID
```

Mỗi phase lưu state để restart không làm lại từ đầu.

---

## 7. Idempotency

Idempotency key:

```text
sha256(
  workspace_id
  + social_account_id
  + content_asset_id
  + approved_content_hash
  + scheduled_for_utc
)
```

Trước khi retry:

1. kiểm tra `platform_post_id`;
2. nếu có, query remote state;
3. nếu remote đã published, mark success;
4. chỉ gọi publish lại khi chắc chắn chưa tạo post.

Không retry mù khi response timeout sau khi platform có thể đã tạo bài.

---

## 8. Media flow

### Cloudinary Free

Dùng Cloudinary cho:

- upload ảnh/video;
- stable HTTPS URL;
- resize/crop/transformation;
- CDN;
- media fixture cho sandbox.

MongoDB chỉ lưu metadata:

```json
{
  "provider": "cloudinary",
  "public_id": "hivek/workspaces/...",
  "secure_url": "https://...",
  "resource_type": "image",
  "width": 1080,
  "height": 1080,
  "bytes": 123456,
  "checksum": "sha256"
}
```

Không upload raw binary lớn qua Mongo document. Có thể dùng GridFS nếu code hiện tại đã dùng và có lý do rõ, nhưng media publish vẫn cần URL public ổn định.

### Validation

- MIME allowlist;
- file size;
- aspect ratio;
- platform limits từ connector config;
- URL HTTPS;
- media ownership;
- checksum;
- alt text khi hỗ trợ.

---

## 9. Webhook normalization

Endpoint:

```text
GET  /webhooks/meta
POST /webhooks/meta
GET  /webhooks/threads
POST /webhooks/threads
```

Flow:

```text
verify signature/challenge
→ calculate event_id
→ insert webhook_events unique
→ duplicate? return 200 without reprocessing
→ parse normalized event
→ route event
→ enqueue reply/metric job
→ return 200 quickly
```

`webhook_events`:

```json
{
  "_id": "ObjectId",
  "provider": "meta|threads|mock",
  "external_event_id": "string",
  "event_type": "comment.created|message.created|reply.created|post.status",
  "workspace_id": "ObjectId|null",
  "account_id": "ObjectId|null",
  "payload_redacted": {},
  "processing_status": "received|processed|ignored|failed",
  "received_at": "datetime",
  "processed_at": null
}
```

Unique index:

```javascript
db.webhook_events.createIndex(
  { provider: 1, external_event_id: 1 },
  { unique: true }
)
```

Không chạy LLM trong request webhook trước khi trả 200.

---

## 10. Mock connector

Mock connector là bắt buộc, không phải TODO.

### Fixtures

```text
tests/fixtures/social/
├── facebook_publish_success.json
├── facebook_publish_rate_limit.json
├── instagram_container_processing.json
├── threads_publish_success.json
├── comment_created.json
├── message_created.json
└── duplicate_webhook.json
```

### Behavior

Configurable:

```env
MOCK_PUBLISH_LATENCY_MS=300
MOCK_PUBLISH_FAILURE_RATE=0.10
MOCK_PUBLISH_ERROR=none
```

Mock phải:

- tạo deterministic remote ID;
- mô phỏng timeout;
- mô phỏng 429;
- mô phỏng auth expired;
- mô phỏng remote published nhưng local timeout;
- hỗ trợ replay webhook.

---

## 11. Generic webhook connector

Để test với service thứ ba mà không phụ thuộc Meta:

```python
class GenericWebhookConnector:
    platform = "generic_webhook"
```

Publish bằng POST:

```json
{
  "workspace_id": "...",
  "content": "...",
  "media": [],
  "scheduled_for": "...",
  "idempotency_key": "..."
}
```

Use case:

- Pipedream endpoint;
- n8n self-host;
- request inspector;
- internal demo receiver.

Đây chỉ là connector testing. Không ghi nhãn nó là Facebook/Threads live.

---

## 12. API

```text
GET  /v1/workspaces/{id}/social/accounts
POST /v1/workspaces/{id}/social/{provider}/authorize
GET  /v1/social/{provider}/callback
POST /v1/workspaces/{id}/social/accounts/{account_id}/refresh
DELETE /v1/workspaces/{id}/social/accounts/{account_id}

POST /v1/workspaces/{id}/content-assets/{asset_id}/schedule
POST /v1/workspaces/{id}/scheduled-posts/{scheduled_id}/publish-now
POST /v1/workspaces/{id}/scheduled-posts/{scheduled_id}/cancel
GET  /v1/workspaces/{id}/publish-jobs/{job_id}
```

`publish-now` vẫn yêu cầu approved content.

---

## 13. Kill switch

Global:

```env
AUTO_PUBLISH_ENABLED=false
```

Workspace:

```json
{
  "automation": {
    "auto_publish_enabled": false,
    "auto_reply_enabled": false
  }
}
```

Account:

```json
{
  "automation_enabled": false
}
```

Publish chỉ chạy khi cả ba cấp cho phép.

---

## 14. Test bắt buộc

### Contract

- connector output schema giống nhau;
- capability detection;
- normalized errors;
- token redaction;
- webhook verification;
- duplicate webhook.

### Publish

- text post;
- image post;
- media container;
- rate limit retry;
- auth expired terminal/handoff;
- timeout with remote success;
- idempotent retry;
- cancel before dispatch;
- content edited after approval;
- unsupported capability.

### Security

- OAuth state/PKCE nếu flow hỗ trợ;
- workspace access;
- webhook signature;
- secret log scan;
- token never returned to browser;
- replay event.

---

## 15. Definition of Done

- Mock end-to-end hoạt động.
- Một sandbox connector publish thành công.
- QStash gọi đúng job.
- Duplicate dispatch không tạo bài trùng.
- Token mã hóa và revoke được.
- Webhook replay không xử lý hai lần.
- Capability matrix hiển thị đúng.
- Có tài liệu những scope cần App Review.
- Live mode mặc định tắt.

---

## 16. Prompt triển khai cho coding agent

```text
Hãy triển khai PLAN 2 trên code hiện có, sử dụng job runtime của PLAN 1.

Đầu tiên, tìm connector/social/OAuth code đã có và mở rộng. Không tạo implementation song song nếu code hiện tại dùng được.

Nhiệm vụ:
1. Tạo SocialConnector contract và normalized models.
2. Tạo MockSocialConnector đầy đủ.
3. Tạo Threads connector.
4. Tạo Facebook Page connector.
5. Tạo Instagram Professional connector theo capability.
6. Tạo OAuth token store mã hóa trên MongoDB.
7. Tạo publish flow idempotent, hỗ trợ media container.
8. Tích hợp Cloudinary media refs.
9. Tạo webhook verification, dedup và normalization.
10. Tạo kill switch.
11. Tạo docs/meta_permission_matrix.md dựa trên tài liệu Meta mới nhất.
12. Viết contract/integration/security tests.

Ràng buộc:
- Không auto-publish bài chưa approved.
- Không hard-code Graph API version.
- Không lưu token plain text.
- Không retry mù khi remote state không rõ.
- Không xử lý LLM trước khi webhook trả 200.
- Không dùng unofficial scraping.
- Không tuyên bố live nếu chưa qua sandbox/App Review.
- Mọi request phải giới hạn workspace.

Đầu ra:
- source patch;
- mock fixtures;
- connector contract tests;
- OAuth/webhook docs;
- permission matrix;
- README sandbox;
- changelog;
- danh sách giới hạn nền tảng còn tồn tại.
```
