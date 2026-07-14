# Thành phần 3 — Content Intelligence, Trend Learning và Vòng học

## 1. Mục tiêu

HIVE-K phải tạo nội dung dựa trên:

- dữ kiện thương hiệu đã được xác nhận;
- vai trò của từng tài khoản/kênh;
- tầng phễu;
- hành vi và ngôn ngữ khách hàng;
- bài cũ và kết quả thật;
- mẫu nội dung đang nổi;
- quy tắc nền tảng;
- phong cách người dùng thể hiện qua các lần sửa.

Hệ thống không được:

- chỉ đưa top-k bài tương tự vào prompt;
- sao chép câu chữ của bài public hoặc một creator;
- coi lượt thích là mục tiêu duy nhất;
- tự động học mọi chỉnh sửa như quy tắc vĩnh viễn;
- fine-tune mô hình quá sớm.

---

## 2. Pipeline nghiên cứu bài tương tự và xu hướng

```text
collect authorized/public samples
  ↓
normalize
  ↓
language + platform + content-type tagging
  ↓
near-duplicate detection
  ↓
feature extraction
  ↓
semantic clustering
  ↓
topic-over-time / burst detection
  ↓
pattern extraction
  ↓
risk + brand-fit scoring
  ↓
trend playbook
  ↓
planner/ranker
  ↓
generation
  ↓
validation
  ↓
human feedback + performance
```

---

## 3. Dữ liệu đầu vào

### Nội bộ

- Bài đã duyệt.
- Bài người dùng đã sửa.
- Bài bị từ chối và lý do.
- Bình luận/câu hỏi thật.
- FAQ.
- KPI từng bài.
- Kênh, thời điểm, định dạng, tầng phễu.
- Bài của cùng workspace và ngành.

### Bên ngoài

- Link/bài người dùng cung cấp.
- Bài public được lấy bằng API hoặc crawl hợp lệ.
- Bài tham khảo từ đối thủ.
- Tín hiệu chủ đề và định dạng theo nền tảng.
- Không dùng nguồn bên ngoài để suy diễn giá, ưu đãi hoặc claim của brand.

---

## 4. Biểu diễn một bài

```python
class ContentSample(BaseModel):
    sample_id: str
    workspace_id: str | None
    source_type: str
    source_id: str
    platform: str
    observed_at: str

    raw_text_ref: str
    normalized_text: str
    language: str

    hook: str | None
    body: str | None
    cta: str | None
    hashtags: list[str]
    media_type: str | None

    objective: str | None
    funnel_stage: str | None
    audience_tags: list[str]
    topic_tags: list[str]

    lexical_features: dict
    structural_features: dict
    embedding_ref: str | None

    rights_policy: str
    can_quote: bool
```

---

## 5. Feature extraction không phụ thuộc LLM

### Ngôn ngữ và cấu trúc

- số câu, số từ;
- độ dài câu trung vị;
- tỷ lệ câu hỏi;
- tỷ lệ câu mệnh lệnh;
- emoji;
- dấu câu;
- hashtag;
- mở đầu bằng câu hỏi/số liệu/tình huống/đối lập;
- vị trí CTA;
- độ lặp từ;
- lexical diversity;
- mức trang trọng;
- mật độ từ bán hàng;
- độ giống các bài cũ.

### Tín hiệu hiệu suất

- reach rate;
- save/share/comment rate;
- qualified comment rate;
- click rate;
- lead rate;
- conversion rate;
- response time;
- cost per lead;
- số người hỏi lặp;
- tỷ lệ user approve/edit/reject.

Các chỉ số phải được chuẩn hóa theo:

- nền tảng;
- số follower/reach;
- định dạng;
- thời điểm;
- mục tiêu;
- ngành;
- tuổi bài.

---

## 6. Deduplication và chống sao chép

Dùng nhiều tầng:

1. Exact hash.
2. Normalized text hash.
3. MinHash/SimHash cho near-duplicate.
4. Embedding similarity.
5. N-gram overlap.
6. Kiểm tra câu dài giống nguồn trước khi duyệt.

Nếu output quá giống một nguồn:

- block hoặc yêu cầu rewrite;
- lưu source đã kích hoạt cảnh báo;
- không chỉ paraphrase từng từ;
- chuyển sang dùng pattern trừu tượng.

---

## 7. Phát hiện xu hướng

### 7.1. Topic clustering

- Sentence embedding đa ngôn ngữ.
- HDBSCAN hoặc BERTopic cho cluster có nhiễu.
- KMeans/MiniBatchKMeans khi cần ổn định và online.
- Lưu centroid, representative samples và từ khóa c-TF-IDF.

### 7.2. Time-aware signals

Mỗi topic/pattern có chuỗi thời gian:

```text
volume
unique_accounts
engagement_normalized
growth_rate
acceleration
recency
saturation
cross_platform_spread
```

Các kỹ thuật:

- exponential time decay;
- z-score theo cửa sổ trượt;
- burst detection;
- change-point detection;
- topic-over-time;
- emerging signal classification.

### 7.3. Trend không chỉ là topic

Phân biệt:

- chủ đề đang tăng;
- kiểu hook;
- cấu trúc bài;
- định dạng hình/video;
- CTA;
- cách dùng comment đầu;
- chuỗi bài;
- góc kể chuyện;
- phong cách UGC;
- tần suất đăng.

---

## 8. TrendPattern schema

```python
class TrendPattern(BaseModel):
    pattern_id: str
    platform: str
    pattern_type: str

    abstract_pattern: str
    positive_examples_ref: list[str]
    prohibited_copy_fragments: list[str]

    first_seen_at: str
    last_seen_at: str
    freshness: float
    growth: float
    saturation: float

    brand_fit: float
    audience_fit: float
    channel_fit: float
    execution_ease: float
    risk: float

    evidence_count: int
    source_diversity: float
    status: str
```

Điểm đề xuất:

```text
trend_score =
  0.18 * freshness
+ 0.12 * growth
+ 0.22 * brand_fit
+ 0.18 * audience_fit
+ 0.12 * channel_fit
+ 0.08 * execution_ease
+ 0.10 * source_diversity
- 0.16 * risk
- 0.10 * saturation
```

Trọng số phải cấu hình và sau này học bằng dữ liệu, không hard-code vĩnh viễn.

---

## 9. Lập kế hoạch nội dung bằng tối ưu có ràng buộc

Planner không chọn ngẫu nhiên từng bài.

### Ràng buộc

- đủ tầng phễu;
- không lặp angle;
- phân biệt vai trò page chính, page khu vực, nhóm cộng đồng, tài khoản tư vấn;
- không quá nhiều bài bán hàng;
- dùng media sẵn có;
- không dùng fact sắp hết hạn;
- giới hạn số bài/ngày/tài khoản;
- không dùng cùng trend ở tất cả kênh;
- cân bằng thử nghiệm và mẫu đã chứng minh hiệu quả.

Có thể dùng:

- rule engine ở MVP;
- integer programming/constraint solver khi lịch phức tạp;
- ranker để chọn candidate;
- contextual bandit cho thử nghiệm.

---

## 10. Candidate generation + ranking

```text
1. Planner sinh 10–30 candidate node bằng rule/template.
2. Retrieval lấy pattern và memory liên quan.
3. LLM tạo mô tả candidate, chưa viết bài hoàn chỉnh.
4. Ranker chấm điểm.
5. Diversity reranker loại các candidate quá giống.
6. Chỉ top candidate mới được viết đầy đủ.
```

Feature cho ranker:

- brand fit;
- audience fit;
- channel role fit;
- funnel gap;
- novelty;
- fact readiness;
- media readiness;
- trend score;
- historical performance;
- user approval likelihood;
- risk;
- cost/token estimate.

MVP dùng weighted score. Khi đủ dữ liệu, dùng LightGBM/XGBoost learning-to-rank.

---

## 11. Học phong cách từ người dùng sửa

### 11.1. Không chỉ lưu before/after text

Tạo `EditLearningEvent`:

```python
class EditLearningEvent(BaseModel):
    asset_id: str
    before_text: str
    after_text: str
    edit_operations: list[dict]

    removed_phrases: list[str]
    added_phrases: list[str]
    structural_changes: list[str]

    feature_delta: dict
    inferred_preferences: list[dict]
    explicit_reason: str | None
    confidence: float
```

### 11.2. Feature delta

Ví dụ:

- giảm độ dài 35%;
- bỏ mở đầu sáo rỗng;
- đổi “chúng tôi” thành “bạn”;
- bỏ 4 emoji;
- chuyển CTA cứng thành CTA tư vấn;
- thêm ví dụ địa phương;
- chia đoạn ngắn hơn;
- bỏ claim thiếu chứng cứ.

### 11.3. Memory lifecycle

```text
candidate
  → repeated
  → stable
  → deprecated
  → rejected
```

Không nâng preference thành stable chỉ từ một lần sửa. Cần:

- lặp lại ở nhiều bài;
- hoặc user pin/xác nhận rõ;
- hoặc có performance tốt và không tạo rủi ro.

---

## 12. Brand Voice Profile

```python
class BrandVoiceProfile(BaseModel):
    version: int
    tone_dimensions: dict
    sentence_length_range: tuple[int, int]
    paragraph_length_range: tuple[int, int]

    preferred_openings: list[str]
    avoided_openings: list[str]
    preferred_cta_types: list[str]
    banned_phrases: list[str]

    pronoun_rules: dict
    emoji_policy: dict
    punctuation_policy: dict
    vocabulary_preferences: dict
    platform_overrides: dict

    positive_example_ids: list[str]
    negative_example_ids: list[str]
    confidence_by_rule: dict[str, float]
```

Profile là dữ liệu có cấu trúc; không phải một đoạn prompt dài duy nhất.

---

## 13. Vòng học hiệu suất

```text
publish
  ↓
collect metrics at T+1h, T+24h, T+7d
  ↓
normalize by platform/format/reach
  ↓
attribute to post, angle, pattern, channel, time
  ↓
update feature store
  ↓
offline evaluation
  ↓
promote/demote rules and ranker
```

Không kết luận từ một bài. Dùng:

- minimum sample;
- shrinkage/Bayesian estimate;
- confidence interval;
- control for reach;
- delayed conversion;
- separate vanity metrics from business metrics.

---

## 14. Contextual bandit

Sau khi có đủ traffic, dùng Thompson Sampling hoặc LinUCB để chọn giữa:

- 70–90% mẫu có kỳ vọng tốt;
- 10–30% mẫu thử nghiệm.

Context:

- ngành;
- audience;
- nền tảng;
- thời điểm;
- funnel;
- media;
- account role.

Reward:

- weighted business outcome;
- không dùng likes đơn lẻ;
- có penalty cho edit/reject/risk.

Bandit chỉ chọn candidate đã qua brand safety.

---

## 15. Fine-tuning policy

Chỉ fine-tune khi:

1. Prompt + retrieval + structured voice profile + ranker đã được tối ưu.
2. Có tập train được phép sử dụng, không lẫn dữ liệu workspace trái quyền.
3. Có tập test cố định và baseline.
4. Dữ liệu đủ đa dạng và có nhãn chất lượng.
5. Mục tiêu rõ: style adherence, classification hoặc ranking.
6. Chi phí vận hành có lợi hơn phương án hiện tại.

Ưu tiên:

- classifier nhỏ;
- embedding model;
- reranker;
- adapter/LoRA cho model nhỏ;
- không bắt đầu bằng fine-tune LLM lớn.

---

## 16. Prompt contracts

### 16.1. Trích pattern, không sao chép

```text
SYSTEM
Bạn là bộ phân tích cấu trúc nội dung. Không được sao chép câu chữ hoặc bắt chước giọng cá nhân.

INPUT
- Danh sách sample đã chuẩn hóa
- Platform
- Topic cluster
- Thông tin thời gian và hiệu suất
- Brand constraints

TASK
1. Trích pattern trừu tượng: hook, structure, CTA, visual direction.
2. Chỉ ra bằng chứng từ nhiều nguồn.
3. Tạo prohibited_copy_fragments.
4. Chấm risk, saturation, brand fit.
5. Trả về TrendPattern schema.
6. Nếu không đủ bằng chứng, status = insufficient_evidence.

OUTPUT
JSON hợp lệ, không thêm prose.
```

### 16.2. Viết bài

```text
SYSTEM
Bạn là bộ soạn nội dung của HIVE-K. Chỉ sử dụng facts đã cung cấp. Không sáng tạo giá, lịch, claim hoặc số liệu.

INPUT
- PostNode
- Immutable facts
- BrandVoiceProfile
- Platform rules
- Audience language
- TrendPattern được duyệt
- Positive/negative memories
- Media context

TASK
- Viết một bài native cho platform.
- Nêu delivered_fact_ids.
- Nêu missing_fact_ids.
- Nêu pattern_id đã dùng và cách biến đổi.
- Không lặp câu từ source.
- Không dùng cụm bị cấm.
- Trả về typed JSON.

OUTPUT
PostDraft schema.
```

### 16.3. Học từ chỉnh sửa

```text
SYSTEM
Bạn phân tích diff để đề xuất memory candidate, không tự biến một lần sửa thành quy tắc vĩnh viễn.

INPUT
- before
- after
- explicit reason
- platform
- existing voice profile

TASK
- Tách sửa nội dung và sửa dữ kiện.
- Trích feature delta.
- Đề xuất preference candidate.
- Gán confidence.
- Đánh dấu nếu thay đổi chỉ phù hợp bài hiện tại.

OUTPUT
EditLearningEvent schema.
```

---

## 17. Đánh giá

### Retrieval

- Recall@k cho fact cần dùng.
- Precision@k.
- MRR/NDCG cho memory.
- Source diversity.
- Conflict retrieval rate.

### Content

- factual precision;
- unsupported claim rate;
- brand-rule compliance;
- platform fit;
- duplication score;
- human approval rate;
- edit distance;
- regenerate rate;
- business KPI sau chuẩn hóa.

### Learning

- prediction of user approval;
- rank correlation với outcome;
- uplift so với rule baseline;
- false promotion of preference;
- cross-workspace leakage = 0.

---

## 18. PROMPT TRIỂN KHAI CHO CODING AGENT

```text
Bạn là kỹ sư NLP/ML và AI product. Hãy xây dựng Content Intelligence Engine cho HIVE-K.

Stack:
- Python
- PostgreSQL/pgvector
- Neo4j
- sentence-transformers
- scikit-learn
- BERTopic hoặc module clustering thay thế có interface
- LightGBM là optional dependency
- LangGraph node integration
- Pydantic v2

Sprint này phải tạo:
1. ContentSample schema và ingestion.
2. Text normalization.
3. Exact + near-duplicate detector.
4. Structural feature extractor.
5. Embedding + clustering interface.
6. Topic-over-time statistics.
7. TrendPattern builder và scorer.
8. Candidate planner rule-based.
9. Diversity reranker.
10. BrandVoiceProfile.
11. Edit diff analyzer.
12. Feedback/performance feature store.
13. Typed prompt contracts.
14. Evaluation scripts.

Ràng buộc:
- Không sao chép source.
- Không dùng likes làm reward duy nhất.
- Không fine-tune model trong sprint này.
- Mọi feature phải có test.
- Phải chạy được khi không có LLM bằng mock.
- Mọi trend cần evidence_count và source_diversity.
- Không đưa raw corpus dài vào prompt.
- Tách deterministic feature khỏi LLM extraction.

Đầu ra:
- Package `content_intelligence/`.
- CLI import sample.
- Notebook hoặc script demo phát hiện cluster/trend.
- API tạo plan và tạo draft.
- Bộ test với ít nhất 30 sample giả lập.
- Báo cáo eval JSON.
- README giải thích cách thay model embedding/ranker.
```
