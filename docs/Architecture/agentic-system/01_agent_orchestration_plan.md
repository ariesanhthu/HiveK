# 01 — HIVE-K Agent Orchestration Plan

## 0. Mục tiêu sửa thiết kế agent

Thiết kế agent mới không bắt người dùng tự nhập rải rác ở nhiều màn hình. Agent phải dẫn người dùng đi theo một flow tạo chiến dịch có thứ tự, tự kiểm tra thiếu dữ liệu, tự đề xuất nội dung, tự học cách viết theo trend nhưng vẫn giữ brand safety.

Mục tiêu sản phẩm:

- Tạo chiến dịch nhanh cho SME, Local Brand, freelancer bán hàng online, agency nhỏ.
- Biến dữ liệu rời rạc như brief, ảnh, Q&A, sản phẩm, ngân sách, KOL/KOC, platform thành một campaign plan có thể review.
- Tạo bài viết riêng cho từng nền tảng, không copy một caption cho mọi kênh.
- Có cơ chế học từ trend, bài đã duyệt, bài bị sửa, bài có performance tốt.
- Không publish, không gửi tin nhắn, không liên hệ KOL/KOC nếu chưa có review/approval.

---

## 1. Agent mới: Campaign Wizard Harness

### 1.1. Root agent

Tên đề xuất: `CampaignWizardHarnessAgent`

Nhiệm vụ:

- Điều phối toàn bộ flow từ tạo campaign đến lên lịch.
- Kiểm tra input theo từng bước.
- Chuyển campaign brief thành chiến lược nội dung.
- Gọi sub-agent đúng thời điểm.
- Trả về `statePatch` để UI cập nhật từng bước.
- Ghi audit log cho mọi action do agent tạo.
- Không ghi đè dữ liệu người dùng đã sửa nếu không có xác nhận.

### 1.2. Sub-agent cần có

| Agent | Vai trò | Khi nào chạy | Output chính |
|---|---|---|---|
| `CampaignIntakeAgent` | Chuẩn hóa brief, phát hiện thiếu input | Sau bước nhập thông tin cơ bản | `CampaignBriefAnalysis` |
| `ProductContextAgent` | Tóm tắt sản phẩm, offer, claim được phép nói | Sau bước sản phẩm | `ProductMessageMap` |
| `AudienceInsightAgent` | Xác định ICP, pain point, blocker, buying trigger | Sau bước khách hàng mục tiêu | `AudienceInsightMap` |
| `StrategyPlanningAgent` | Tạo pillar, angle, funnel, lịch đăng | Khi đủ campaign + audience + platform | `CampaignPostingPlan` |
| `TrendLearningAgent` | Học trend bài viết từ ví dụ, link, performance, trend note | Trước khi generate bài | `TrendPlaybook` |
| `ContentWritingAgent` | Viết bài theo platform, angle, trend, brand voice | Khi tạo từng post node | `PostContentDraft` |
| `MediaMatchingAgent` | Ghép ảnh/video với từng post | Sau khi có post node hoặc nội dung | `MediaMatchResult` |
| `QnAReplyAgent` | Sinh câu trả lời comment/inbox từ Q&A mẫu | Khi có Q&A hoặc comment import | `ReplyDraft` |
| `CreatorMatchingAgent` | Gợi ý KOL/KOC phù hợp | Sau khi có campaign objective + audience + budget | `CreatorRecommendation[]` |
| `OutreachDraftAgent` | Viết email/DM liên hệ KOL/KOC | Khi user chọn creator | `OutreachDraft` |
| `ValidatorAgent` | Kiểm tra factual, brand, platform, risk | Trước khi lưu, approve, schedule | `ValidationResult` |
| `LearningAgent` | Học từ approve/edit/reject/performance | Sau mỗi feedback hoặc sync KPI | `BrandMemoryPatch` |

---

## 2. Nguyên tắc thiết kế input

### 2.1. Không hỏi tất cả cùng lúc

Mỗi step chỉ hỏi đúng nhóm thông tin cần thiết. Agent có thể tự điền nháp từ dữ liệu cũ, website, campaign mẫu, hoặc product marketing context nếu có.

### 2.2. Chia input thành 4 mức

| Mức | Ý nghĩa | Ví dụ | UI xử lý |
|---|---|---|---|
| Required | Thiếu thì không generate plan được | Tên campaign, objective, platform, sản phẩm, audience, CTA | Hiện warning đỏ, không cho qua step cuối |
| Important | Thiếu vẫn generate được nhưng chất lượng giảm | Brand voice, offer, customer insight, ảnh | Hiện warning vàng, cho phép AI gợi ý |
| Optional | Có thì cá nhân hóa tốt hơn | Hashtag, blacklist word, ví dụ bài thích/không thích | Thu gọn trong advanced |
| Auto-learned | Agent tự học dần | Pattern hook được duyệt, phrase bị xóa, KOL match tốt | Không bắt nhập, lưu vào memory |

### 2.3. Mọi input phải có source

Mỗi field nên lưu `source` để biết dữ liệu đến từ đâu:

```ts
type FieldSource =
  | "user_input"
  | "ai_suggestion"
  | "brand_memory"
  | "uploaded_file"
  | "campaign_history"
  | "trend_learning"
  | "performance_data";
```

Quy tắc:

- Field do user nhập có quyền ưu tiên cao nhất.
- Field do AI gợi ý phải có trạng thái `suggested` trước khi dùng để publish hoặc outreach.
- Claim sản phẩm, giá, ưu đãi, cam kết phải đến từ `user_input`, `brand_memory` đã duyệt, hoặc dữ liệu campaign đã xác nhận.

---

## 3. Step input chuẩn cho flow tạo campaign

### Step 1 — Campaign Basics

Mục tiêu: xác định chiến dịch này để làm gì.

Input cần có:

| Field | Required | Gợi ý UI | Agent xử lý |
|---|---:|---|---|
| `campaignName` | Yes | Text input | Chuẩn hóa tên chiến dịch |
| `objective` | Yes | Card chọn: Awareness, Engagement, Traffic, Leads, Sales, Creator Recruitment | Map sang funnel |
| `businessStage` | Optional | Select: pre-launch, early, growth, scale | Dùng để ưu tiên kênh và tốc độ test |
| `startDate`, `endDate` | Important | Date range | Tạo lịch đăng |
| `budgetRange` | Important | Slider hoặc preset | Dùng cho KOL/KOC và plan |
| `successMetric` | Important | Multi-select | Map sang KPI dashboard |

Output:

```ts
type CampaignGoalSummary = {
  campaignName: string;
  primaryObjective: string;
  funnelPriority: Array<"awareness" | "consideration" | "conversion" | "retention">;
  successMetrics: string[];
  missingFields: string[];
};
```

### Step 2 — Product & Offer

Mục tiêu: xác định sản phẩm, thông điệp được phép nói, ưu đãi, CTA.

Input cần có:

| Field | Required | Gợi ý UI | Agent xử lý |
|---|---:|---|---|
| `productName` | Yes | Text input | Tên sản phẩm trong bài |
| `productDescription` | Yes | Textarea ngắn | Tóm tắt thành 1–2 câu |
| `category` | Important | Select/free text | Map ngành hàng |
| `usp` | Important | Bullet input | Tạo message map |
| `offer` | Optional | Text input | Dùng cho conversion post |
| `price` | Optional | Text input | Chỉ dùng nếu user xác nhận |
| `mandatoryFacts` | Important | Tag input | Bắt buộc đưa vào bài |
| `forbiddenClaims` | Important | Tag input | Validator dùng để chặn |
| `cta` | Yes | Select + custom | CTA cuối bài |
| `landingUrl` | Optional | URL input | Gắn link/first comment |

Output:

```ts
type ProductMessageMap = {
  oneLineProduct: string;
  allowedClaims: string[];
  forbiddenClaims: string[];
  proofNeededClaims: string[];
  offerMessage?: string;
  ctaDirection: string;
};
```

### Step 3 — Audience & Customer Insight

Mục tiêu: hiểu người đọc là ai, vì sao họ quan tâm, điều gì làm họ chưa mua.

Input cần có:

| Field | Required | Gợi ý UI | Agent xử lý |
|---|---:|---|---|
| `targetAudience` | Yes | Textarea + template | Tóm tắt ICP |
| `location` | Optional | Select/text | Dùng cho local angle |
| `ageRange` | Optional | Select | Chỉnh tone |
| `painPoints` | Important | Chip input | Tạo hook |
| `buyingTriggers` | Important | Chip input | Tạo CTA/angle |
| `objections` | Important | Chip input | Tạo reply và FAQ |
| `customerLanguage` | Optional | Textarea: khách hay nói câu gì | Dùng để viết tự nhiên |

Output:

```ts
type AudienceInsightMap = {
  icpSummary: string;
  pains: string[];
  blockers: string[];
  buyingTriggers: string[];
  languageToUse: string[];
  languageToAvoid: string[];
};
```

### Step 4 — Brand Voice & Guardrails

Mục tiêu: làm bài viết giống brand, không giống bài AI chung chung.

Input cần có:

| Field | Required | Gợi ý UI | Agent xử lý |
|---|---:|---|---|
| `tone` | Important | Multi-select: thân thiện, chuyên nghiệp, vui, sắc sảo, tối giản | Tạo tone profile |
| `writingPreference` | Optional | Ví dụ câu thích/không thích | Lưu brand memory |
| `emojiPolicy` | Optional | None / Low / Medium | Validator kiểm tra |
| `bannedWords` | Optional | Tag input | Validator chặn |
| `approvedExamples` | Optional | Paste post cũ | Học pattern tốt |
| `rejectedExamples` | Optional | Paste post không thích | Học pattern xấu |

Output:

```ts
type BrandVoiceProfile = {
  toneLabels: string[];
  voiceRules: string[];
  preferredStructures: string[];
  bannedWords: string[];
  emojiPolicy: "none" | "low" | "medium";
};
```

### Step 5 — Platform Setup

Mục tiêu: mỗi nền tảng có cách viết riêng.

Input cần có:

| Field | Required | Gợi ý UI | Agent xử lý |
|---|---:|---|---|
| `platforms` | Yes | Checkbox: Facebook, Instagram, Threads | Tạo content strategy riêng |
| `accountIds` | Important | Account selector | Chỉ schedule nếu có account |
| `postingStyleByPlatform` | Important | Card per platform | Không copy caption giữa platform |
| `contentFormats` | Important | Caption, album, carousel, reels, thread, story | Chọn post node |
| `postingFrequency` | Important | Preset: 3/5/7/14 ngày | Tạo timeline |

Output:

```ts
type PlatformContentStrategy = {
  platform: "facebook" | "instagram" | "threads";
  primaryFormat: string;
  writingRules: string[];
  mediaRules: string[];
  ctaRules: string[];
};
```

### Step 6 — Trend Learning Setup

Mục tiêu: cho agent học cách viết theo trend một cách có kiểm soát.

Input cần có:

| Field | Required | Gợi ý UI | Agent xử lý |
|---|---:|---|---|
| `trendGoal` | Important | Select: bắt trend nhẹ, viral hook, educational, review, UGC | Chọn trend mode |
| `trendSources` | Optional | Paste link/post/reference note | Tạo trend sample |
| `competitorExamples` | Optional | Paste bài đối thủ | Trích pattern, không copy |
| `creatorExamples` | Optional | Paste bài KOL/KOC | Học format, không bắt chước cá nhân |
| `trendAvoidance` | Optional | Những trend không muốn dùng | Chặn rủi ro |
| `recencyWindow` | Optional | 7 ngày / 30 ngày / 90 ngày | Chấm trend freshness |

Output:

```ts
type TrendPlaybook = {
  trendMode: "safe" | "balanced" | "aggressive";
  trendSignals: TrendSignal[];
  hookPatterns: string[];
  contentStructures: string[];
  visualDirections: string[];
  risks: string[];
};
```

### Step 7 — Media & Q&A

Mục tiêu: chuẩn bị ảnh/video và câu trả lời mẫu để bài viết có đủ ngữ cảnh.

Input cần có:

| Field | Required | Gợi ý UI | Agent xử lý |
|---|---:|---|---|
| `mediaAssets` | Important | Upload/dropzone, library | Match với post |
| `mediaRole` | Important | Brand/product/lifestyle/reference/generated | Chấm score media |
| `qnaExamples` | Optional | Table question/answer/intent | Dùng cho reply draft |
| `replyPolicy` | Optional | Auto draft only / human review | Quy định comment agent |

Output:

```ts
type CampaignAssetContext = {
  mediaSummary: MediaSummary[];
  qnaMap: QnAIntentMap[];
  missingMediaNeeds: string[];
};
```

### Step 8 — KOL/KOC & Participant

Mục tiêu: chọn người tham gia chiến dịch nếu campaign cần creator.

Input cần có:

| Field | Required | Gợi ý UI | Agent xử lý |
|---|---:|---|---|
| `creatorNeed` | Optional | Toggle: cần KOL/KOC không | Bật/tắt creator matching |
| `creatorBudget` | Optional | Budget range | Filter creator |
| `creatorCriteria` | Optional | Niche, platform, audience, risk | Rerank |
| `inviteMode` | Optional | Manual / invite link / outreach draft | Tạo link/mã mời |

Output:

```ts
type CreatorCampaignSetup = {
  needsCreator: boolean;
  creatorFilters: Record<string, unknown>;
  suggestedRoles: string[];
};
```

### Step 9 — Generate Plan & Review

Mục tiêu: tạo lộ trình đăng bài rõ ràng, user chỉ cần review.

Input cần có:

| Field | Required | Gợi ý UI | Agent xử lý |
|---|---:|---|---|
| `days` | Yes | Từ date range/frequency | Tạo lịch |
| `approvalMode` | Yes | Human review / auto approve draft only | Quy định status |
| `selectedPlatforms` | Yes | Lấy từ Step 5 | Tạo post node |
| `selectedTrendMode` | Important | Lấy từ Step 6 | Viết bài theo trend |

Output:

```ts
type CampaignPlanOutput = {
  strategySummary: string;
  days: CampaignPostingDay[];
  validationSummary: ValidationSummary;
  nextActions: string[];
};
```

---

## 4. Workflow tổng quát

```text
User opens Campaign Wizard
  ↓
CampaignWizardHarnessAgent initializes draft campaign
  ↓
Step 1–5: collect core brief
  ↓
Agent validates required fields
  ↓
Step 6: learn trend signals
  ↓
Step 7–8: media, Q&A, creator setup
  ↓
Generate plan
  ↓
Generate posts per platform
  ↓
Validate each post
  ↓
Match media
  ↓
User reviews timeline + editor
  ↓
User approves / edits / regenerates
  ↓
LearningAgent stores feedback
  ↓
Schedule only approved posts
```

---

## 5. Run modes

```ts
type HarnessRunMode =
  | "analyze_brief"
  | "suggest_missing_inputs"
  | "learn_trends"
  | "generate_strategy"
  | "generate_plan"
  | "generate_posts"
  | "validate_posts"
  | "match_media"
  | "match_creators"
  | "draft_creator_outreach"
  | "draft_comment_replies"
  | "schedule_posts"
  | "generate_insights";
```

Quy tắc:

- `analyze_brief`: chạy sau mỗi step để cập nhật brief score.
- `suggest_missing_inputs`: chỉ gợi ý, không tự lưu nếu là claim quan trọng.
- `learn_trends`: chỉ học pattern, không copy nội dung.
- `generate_posts`: phải chạy validator trước khi lưu vào post node.
- `schedule_posts`: chỉ nhận post status `approved`.
- `draft_creator_outreach`: mặc định draft/copy, không gửi thật nếu chưa có connector và approval.

---

## 6. Agent response contract

Mọi workflow trả về JSON có thể patch vào UI.

```ts
type HarnessRunResponse = {
  runId: string;
  campaignId: string;
  runMode: HarnessRunMode;
  status: "success" | "partial_success" | "failed" | "needs_human_review";
  statePatch: {
    campaign?: Partial<CampaignBrief>;
    plan?: CampaignPostingDay[];
    posts?: Partial<CampaignPostNode>[];
    mediaMatches?: MediaMatchResult[];
    creators?: CreatorRecommendation[];
    warnings?: string[];
  };
  missingInputs: MissingInputItem[];
  nextActions: NextAction[];
  auditEventIds: string[];
};
```

---

## 7. Missing input logic

```ts
type MissingInputItem = {
  stepId: string;
  field: string;
  severity: "blocking" | "quality_warning" | "optional";
  reason: string;
  suggestedQuestion: string;
  aiCanSuggest: boolean;
};
```

Ví dụ:

```json
{
  "stepId": "product_offer",
  "field": "forbiddenClaims",
  "severity": "quality_warning",
  "reason": "Chưa có claim bị cấm nên bài viết có thể nói quá mức.",
  "suggestedQuestion": "Có điều gì về sản phẩm không được phép nói không? Ví dụ: cam kết 100%, trị bệnh, chính hãng nếu chưa có chứng nhận.",
  "aiCanSuggest": true
}
```

---

## 8. Learning loop

### 8.1. Agent học từ đâu

- Bài user approve.
- Bài user reject.
- Phần user sửa trực tiếp.
- Lý do regenerate.
- Performance từng bài.
- Comment/lead/conversion.
- Trend sample user đưa vào.
- KOL/KOC được chọn hoặc bị bỏ qua.

### 8.2. Agent lưu gì

```ts
type BrandLearningMemory = {
  brandId: string;
  type:
    | "approved_hook"
    | "approved_structure"
    | "rejected_phrase"
    | "preferred_cta"
    | "trend_pattern"
    | "creator_fit_signal"
    | "performance_signal";
  text: string;
  platform?: string;
  campaignObjective?: string;
  confidence: number;
  source: FieldSource;
  createdAt: string;
};
```

### 8.3. Không fine-tune trong MVP

MVP chỉ cần:

- Memory có embedding.
- Retrieval theo brandId/platform/objective.
- Prompt có version.
- Score theo approval/edit/performance.

Không cần custom ML, không cần Python service trong giai đoạn đầu.

---

## 9. Guardrails bắt buộc

### Content

- Không bịa fact, giá, ưu đãi, chứng nhận, kết quả.
- Không copy y nguyên style của một creator cụ thể.
- Không dùng claim nhạy cảm nếu chưa có proof.
- Không tạo nội dung quá sales nếu objective là awareness/engagement.
- Không dùng trend gây tranh cãi nếu brand safety score thấp.

### Publish / schedule

- Không publish post `draft` hoặc `needs-review`.
- Không schedule nếu account/platform không hợp lệ.
- Không tự chọn ảnh generated làm final nếu user chưa duyệt.

### Creator / outreach

- Không gửi email/DM thật nếu user chưa approve.
- Không hứa phí hợp tác nếu budget chưa xác nhận.
- Không gắn creator vào participant nếu creator chưa được invite/accepted.

---

## 10. Definition of done

Agent orchestration đạt yêu cầu khi:

- User có thể tạo campaign từ một wizard duy nhất.
- Mỗi step có checklist input rõ ràng.
- Agent biết thiếu gì, hỏi đúng chỗ, không hỏi lan man.
- Agent tạo được plan theo ngày + post node.
- Mỗi post có content riêng theo platform.
- Agent có trend learning playbook trước khi viết bài.
- User review, edit, approve, schedule trong cùng một màn hình planner.
- Mọi feedback được lưu để lần sau viết tốt hơn.
