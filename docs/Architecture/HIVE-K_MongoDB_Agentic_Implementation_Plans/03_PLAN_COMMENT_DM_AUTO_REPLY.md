# PLAN 3 — Tự động trả lời Comment và Tin nhắn bằng TF-IDF, BM25 và Agent

## 1. Mục tiêu

Xây dựng `Reply Decision Engine` để:

- nhận comment/message từ webhook;
- chuẩn hóa hội thoại;
- truy xuất FAQ và facts được duyệt;
- chọn câu trả lời bằng thuật toán nhỏ trước;
- tự trả lời câu an toàn, rõ ràng, độ tin cậy cao;
- tạo draft cho câu trung bình;
- chuyển người thật cho câu nhạy cảm hoặc thiếu dữ kiện;
- học có kiểm soát từ approve/edit/reject;
- không bịa giá, lịch, ưu đãi, chính sách hoặc cam kết.

Plan này không phải chatbot LLM tự do.

---

## 2. Input sources

Chỉ dùng dữ liệu cùng workspace:

```text
approved FAQ
approved facts
brand profile
product/service records
current offers
current schedule/availability
policy
approved historical replies
conversation context
negative memories
channel policy
```

Nguồn public/đối thủ không được dùng để trả lời claim của thương hiệu.

---

## 3. MongoDB collections

### `conversations`

```json
{
  "_id": "ObjectId",
  "workspace_id": "ObjectId",
  "platform": "facebook|instagram|threads|mock",
  "social_account_id": "ObjectId",
  "external_conversation_id": "string",
  "participant": {
    "external_user_id_hash": "sha256",
    "display_name": "optional"
  },
  "status": "open|waiting_human|closed|blocked",
  "assigned_to": null,
  "last_message_at": "datetime",
  "summary": null,
  "summary_version": 0,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

Unique:

```javascript
db.conversations.createIndex(
  { platform: 1, social_account_id: 1, external_conversation_id: 1 },
  { unique: true }
)
```

### `messages`

```json
{
  "_id": "ObjectId",
  "workspace_id": "ObjectId",
  "conversation_id": "ObjectId",
  "external_message_id": "string",
  "direction": "inbound|outbound",
  "message_type": "comment|dm|reply",
  "text": "string",
  "normalized_text": "string",
  "attachments": [],
  "reply_to_message_id": null,
  "status": "received|decision_pending|sent|failed|ignored",
  "created_at": "datetime"
}
```

Unique:

```javascript
db.messages.createIndex(
  { platform: 1, external_message_id: 1 },
  { unique: true, sparse: true }
)
```

### `faq_entries`

```json
{
  "_id": "ObjectId",
  "workspace_id": "ObjectId",
  "question": "Học phí bao nhiêu?",
  "answer": "Dữ liệu đã duyệt",
  "intent": "ask_price",
  "product_id": "ObjectId|null",
  "keywords": [],
  "approved": true,
  "valid_from": "datetime|null",
  "valid_to": "datetime|null",
  "source_refs": [],
  "risk_level": "low|medium|high",
  "version": 3,
  "updated_at": "datetime"
}
```

### `reply_decisions`

```json
{
  "_id": "ObjectId",
  "workspace_id": "ObjectId",
  "message_id": "ObjectId",
  "decision": "auto_reply|needs_review|human_handoff|ignore",
  "intent": "ask_price",
  "risk_labels": [],
  "retrieved_candidates": [
    {
      "faq_id": "ObjectId",
      "bm25": 0.82,
      "tfidf_word": 0.79,
      "tfidf_char": 0.88,
      "intent_match": 1.0,
      "freshness": 1.0
    }
  ],
  "confidence": 0.91,
  "reply_text": "string|null",
  "fact_ids": [],
  "model_used": "none|classifier|llm",
  "reason_codes": [],
  "created_at": "datetime"
}
```

### `human_handoffs`

```json
{
  "_id": "ObjectId",
  "workspace_id": "ObjectId",
  "conversation_id": "ObjectId",
  "message_id": "ObjectId",
  "priority": "normal|high|urgent",
  "reason": "refund_request|complaint|low_confidence|missing_fact",
  "suggested_reply": null,
  "status": "open|assigned|resolved",
  "assigned_to": null,
  "created_at": "datetime",
  "resolved_at": null
}
```

---

## 4. Pipeline quyết định

```text
webhook event
→ verify + dedup
→ normalize message
→ language/noise/spam check
→ extract entities
→ classify risk
→ retrieve FAQ/facts
→ intent classify
→ score candidates
→ policy gate
→ choose:
   auto_reply
   needs_review
   human_handoff
   ignore
→ send or queue
→ record feedback
```

---

## 5. Chuẩn hóa tiếng Việt

### Deterministic normalization

- Unicode NFC;
- trim whitespace;
- lowercase cho search copy;
- giữ bản raw;
- chuẩn hóa dấu câu lặp;
- map từ viết tắt có kiểm soát;
- không tự bỏ dấu toàn bộ khi tạo reply;
- tạo thêm search form không dấu;
- thay URL/email/phone bằng token;
- tách emoji thành feature;
- không log PII không cần thiết.

Ví dụ:

```text
"ib giá vs ạ!!!"
→ raw: "ib giá vs ạ!!!"
→ normalized: "inbox giá với ạ"
→ search_no_diacritic: "inbox gia voi a"
```

Dictionary viết tắt phải theo workspace/locale và có test:

```text
ib → inbox
bn → bao nhiêu
dc → được
vs → với
đc → được
```

Không thay mù các từ có nhiều nghĩa.

---

## 6. Retrieval hybrid

### 6.1 Exact and rule lookup

Ưu tiên cao nhất:

- button/postback payload;
- exact FAQ key;
- regex rõ như hotline, địa chỉ, giờ mở cửa;
- structured fact query.

### 6.2 BM25

Dùng `rank_bm25` hoặc implementation tương đương trên corpus FAQ nhỏ.

BM25 phù hợp câu hỏi ngắn, từ khóa hiếm và tên sản phẩm.

### 6.3 TF-IDF word n-gram

```python
TfidfVectorizer(
    analyzer="word",
    ngram_range=(1, 2),
    sublinear_tf=True,
    norm="l2"
)
```

### 6.4 TF-IDF character n-gram

```python
TfidfVectorizer(
    analyzer="char_wb",
    ngram_range=(3, 5),
    sublinear_tf=True,
    norm="l2"
)
```

Character n-gram giúp:

- typo;
- không dấu;
- viết tắt;
- tokenization tiếng Việt chưa hoàn hảo.

### 6.5 Fuzzy matching

Dùng RapidFuzz cho:

- tên khóa học;
- tên chi nhánh;
- tên sản phẩm;
- địa điểm.

Không dùng fuzzy score một mình để auto-reply.

### 6.6 Optional Atlas Search

Nếu cluster hiện tại hỗ trợ Atlas Search, có thể tạo adapter BM25 server-side. Nhưng hệ thống phải vẫn chạy được bằng in-process BM25/TF-IDF trong mock/free testing.

---

## 7. Intent classification

### MVP

Rule + keyword + retrieval intent.

Intent gợi ý:

```text
greeting
ask_price
ask_schedule
ask_location
ask_availability
ask_promotion
ask_policy
ask_result_guarantee
ask_registration
ask_booking
complaint
refund
cancel
spam
abusive
other
```

### Khi có dữ liệu nhãn

Dùng:

- Logistic Regression;
- Linear SVM;
- char + word TF-IDF features;
- class weighting;
- probability calibration nếu model cần confidence.

Không train nếu chưa có đủ nhãn. Mock dataset phải tách train/test theo conversation, không random từng message gây leakage.

---

## 8. Entity extraction

Deterministic trước:

- money;
- date/time;
- phone;
- email;
- order/booking code;
- product/course;
- location/branch;
- quantity;
- duration.

Dùng regex + dictionary + date parser. LLM chỉ hỗ trợ entity khó và không được tạo entity mới không có trong text.

Ví dụ:

```json
{
  "intent": "ask_schedule",
  "entities": {
    "course": "TOPIK 2",
    "preferred_time": "buổi tối",
    "date": null
  }
}
```

---

## 9. Candidate scoring

Một công thức MVP:

```text
reply_score =
  0.30 * bm25
+ 0.24 * tfidf_word
+ 0.20 * tfidf_char
+ 0.12 * intent_match
+ 0.06 * entity_match
+ 0.05 * source_freshness
+ 0.03 * approved_reply_success
- 0.20 * conflict_penalty
- 0.25 * stale_fact_penalty
- 0.30 * policy_risk
```

Dùng top 3–5 candidates, sau đó diversity/dedup.

Threshold ban đầu:

```text
score >= 0.85 và risk=low và facts đầy đủ
→ auto_reply

0.65 <= score < 0.85
→ needs_review

score < 0.65
→ human_handoff
```

Các ngưỡng là baseline để eval, không phải truth cố định.

---

## 10. Policy gate

### Luôn handoff hoặc review

- hoàn tiền;
- khiếu nại;
- tranh chấp;
- đe dọa/pháp lý;
- y tế/tài chính;
- dữ liệu cá nhân;
- giảm giá riêng;
- lời hứa kết quả;
- cam kết đầu ra;
- thay đổi lịch/giá/chính sách;
- câu hỏi không có fact được duyệt;
- khách yêu cầu nói với người thật;
- sentiment tiêu cực mạnh;
- người dùng gửi nhiều lần vì bot không giải quyết.

### Comment public

- trả lời ngắn;
- không lộ PII;
- không yêu cầu khách gửi số điện thoại công khai;
- có thể hướng dẫn qua inbox khi cần;
- tránh nhắc thông tin đơn hàng công khai.

### DM

- có thể dùng conversation context;
- vẫn không lấy dữ liệu workspace khác;
- chỉ yêu cầu thông tin tối thiểu;
- có opt-out/stop handling khi policy yêu cầu.

---

## 11. LLM fallback

LLM chỉ chạy khi:

```text
retrieval có đủ approved facts
AND risk không high
AND deterministic answer template chưa đủ tự nhiên
AND token budget còn
```

Input tối đa:

- message hiện tại;
- summary hội thoại ngắn;
- top FAQ;
- immutable facts;
- brand voice;
- prohibited claims;
- channel rule.

Output typed:

```python
class ReplyDraft(BaseModel):
    reply_text: str
    used_fact_ids: list[str]
    missing_fact_ids: list[str]
    risk_flags: list[str]
    should_handoff: bool
    handoff_reason: str | None
```

Validator phải block:

- số/giá không nằm trong facts;
- claim bị cấm;
- answer không cite fact;
- PII exposure;
- quá dài cho public comment.

---

## 12. Conversation memory

Không gửi toàn bộ thread vào prompt.

Lưu:

- 10–20 message gần nhất;
- summary có version;
- unresolved intent;
- confirmed entities;
- last human action;
- bot failure count.

Khi summary update, giữ source message IDs.

Sau 2 lần bot không giải quyết cùng intent:

```text
force human_handoff
```

---

## 13. Learning có kiểm soát

Khi người dùng:

- approve;
- edit;
- reject;
- handoff;
- đánh dấu câu trả lời tốt/xấu;

tạo feedback event.

Không tự biến một edit thành rule vĩnh viễn.

Lifecycle:

```text
candidate
→ repeated
→ stable
→ deprecated
→ rejected
```

Chỉ promote khi:

- lặp lại nhiều conversation;
- hoặc user pin;
- không vi phạm policy;
- eval không regression.

---

## 14. Reply API

```text
POST /internal/replies/process/{message_id}
POST /v1/workspaces/{id}/reply-decisions/{decision_id}/approve
POST /v1/workspaces/{id}/reply-decisions/{decision_id}/edit-and-send
POST /v1/workspaces/{id}/reply-decisions/{decision_id}/reject
POST /v1/workspaces/{id}/conversations/{conversation_id}/handoff
POST /v1/workspaces/{id}/conversations/{conversation_id}/resolve
GET  /v1/workspaces/{id}/conversations
GET  /v1/workspaces/{id}/conversations/{conversation_id}
```

---

## 15. Kill switch và rate limit

```env
AUTO_REPLY_ENABLED=false
```

Per workspace/account:

```json
{
  "auto_reply": {
    "enabled": false,
    "max_replies_per_minute": 10,
    "max_bot_turns_per_conversation": 2,
    "allowed_intents": [
      "greeting",
      "ask_location",
      "ask_schedule"
    ]
  }
}
```

Mặc định chỉ auto-reply low-risk intents.

---

## 16. Dataset test

Tạo ít nhất:

```text
120 inbound messages
30 FAQ
8 intents low-risk
5 intents handoff
15 typo/không dấu
10 ambiguous
10 duplicate webhook/message
10 stale/conflicting facts
10 multi-turn conversations
```

Không chỉ dùng câu sạch. Phải có:

- “hoc phi bn”
- “ib giá”
- “còn phòng t7 k”
- “bên mình cam kết đậu không”
- “tôi muốn hoàn tiền”
- “cho xin sdt”
- spam/link
- comment có PII.

---

## 17. Metrics

### Retrieval

- Recall@1, Recall@3;
- MRR;
- intent macro-F1;
- exact fact accuracy;
- stale fact retrieval rate.

### Safety

- unsupported claim rate;
- unsafe auto-reply rate;
- PII exposure rate;
- high-risk auto-send count;
- cross-workspace leakage = 0.

### Operations

- auto_reply_rate;
- review_rate;
- handoff_rate;
- median/p95 response latency;
- duplicate send count;
- user edit distance;
- bot failure per conversation.

Release gate đề xuất:

```text
unsupported claim = 0 trên critical set
high-risk auto-send = 0
duplicate send = 0
cross-workspace leakage = 0
low-risk precision >= 0.90 trên fixture
```

---

## 18. Test bắt buộc

### Unit

- normalization;
- abbreviations;
- BM25;
- TF-IDF word/char;
- fuzzy entity;
- intent;
- risk rules;
- score threshold;
- fact validator;
- public comment PII rule;
- repeat failure handoff.

### Integration

- webhook → message → decision;
- decision → connector reply;
- duplicate event;
- connector timeout;
- review and edit;
- conversation summary;
- stale FAQ;
- cross-workspace query.

### Eval

Xuất:

```text
evals/reply_engine_report.json
evals/reply_engine_confusion_matrix.csv
evals/reply_engine_failures.json
```

---

## 19. Definition of Done

- Mock comment/DM đi hết flow.
- Low-risk FAQ có thể auto-reply.
- Medium confidence vào review.
- High-risk vào handoff.
- TF-IDF + BM25 + intent có metric.
- LLM fallback không bịa claim.
- Duplicate webhook không gửi hai lần.
- Có UI contract để thấy agent reply và takeover.
- Auto-reply mặc định tắt trong live.
- Có eval report.

---

## 20. Prompt triển khai cho coding agent

```text
Hãy triển khai PLAN 3 trên code hiện có, sử dụng MongoDB và connector contract của PLAN 2.

Không tạo chatbot LLM monolithic. Xây Reply Decision Engine theo deterministic-first.

Nhiệm vụ:
1. Audit inbox/chat/comment code hiện có.
2. Tạo/extend conversations, messages, faq_entries, reply_decisions và human_handoffs.
3. Tạo webhook-to-message pipeline.
4. Tạo Vietnamese normalization.
5. Tạo exact/rule retrieval.
6. Tạo BM25.
7. Tạo TF-IDF word và char n-gram.
8. Tạo fuzzy entity matching.
9. Tạo intent/risk classification.
10. Tạo weighted scorer và configurable thresholds.
11. Tạo policy gate.
12. Tạo typed LLM fallback.
13. Tạo conversation summary và repeat-failure handoff.
14. Tạo feedback lifecycle.
15. Tạo mock fixtures, tests và eval reports.
16. Tích hợp UI/API hiện có để người dùng xem bot reply và takeover.

Ràng buộc:
- Không dùng dữ liệu workspace khác.
- Không auto-send high-risk content.
- Không bịa giá/lịch/ưu đãi/cam kết.
- Không gửi toàn bộ conversation vào LLM.
- Không lưu PII không cần thiết.
- Không dùng LLM trước exact/BM25/TF-IDF/rules.
- Không promote một edit thành stable rule ngay.
- Không gửi reply hai lần khi webhook replay.

Đầu ra:
- source patch;
- Mongo indexes;
- dataset fixtures;
- unit/integration/eval tests;
- report JSON/CSV;
- README điều chỉnh threshold;
- changelog;
- danh sách intents đang cho auto-send.
```
