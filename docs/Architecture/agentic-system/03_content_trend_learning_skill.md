# 03 — Content Writing & Trend Learning Skill for HIVE-K Agent

## 0. Mục tiêu

File này định nghĩa cách agent của HIVE-K học trend bài viết và viết nội dung social media cho campaign. Agent không được chỉ “generate caption”, mà phải hiểu: sản phẩm, khách hàng, brand voice, platform, trend pattern, dữ liệu performance và feedback của người dùng.

Mục tiêu:

- Viết bài tự nhiên, cụ thể, không giống template AI.
- Mỗi platform có cách viết riêng.
- Học trend theo pattern, không copy nội dung hoặc phong cách cá nhân của creator.
- Có điểm đánh giá trend trước khi dùng.
- Học dần từ bài được duyệt, bài bị sửa, bài có KPI tốt.

---

## 1. Trend trong hệ thống được hiểu là gì?

Trend không chỉ là meme hoặc câu hot. Trong HIVE-K, trend là một tín hiệu có thể áp dụng vào bài viết.

```ts
type TrendSignal = {
  id: string;
  sourceType:
    | 'user_pasted_post'
    | 'competitor_example'
    | 'creator_example'
    | 'brand_history'
    | 'performance_data'
    | 'manual_note'
    | 'platform_observation';
  platform: 'facebook' | 'instagram' | 'threads' | 'tiktok';
  rawText?: string;
  sourceUrl?: string;
  screenshotNote?: string;
  observedAt: string;
  trendType:
    | 'hook_pattern'
    | 'content_structure'
    | 'visual_format'
    | 'cta_pattern'
    | 'comment_pattern'
    | 'storytelling_angle'
    | 'meme_reference'
    | 'ugc_style';
  summary: string;
  extractedPattern: string;
  exampleWithoutCopying: string;
  riskNotes: string[];
};
```

Ví dụ:

- Không lưu: “copy câu mở đầu của creator A”.
- Nên lưu: “Hook bắt đầu bằng một quan sát trái kỳ vọng: ‘Tưởng X là vấn đề, nhưng thật ra Y mới làm khách do dự’.”

---

## 2. Nguồn học trend

### 2.1. Nguồn người dùng cung cấp

- Link bài viết public.
- Caption mẫu đã chạy tốt.
- Caption đối thủ.
- Screenshot/note về trend.
- Bài user thích/không thích.
- Comment thật của khách hàng.
- Q&A từ inbox/comment.

### 2.2. Nguồn nội bộ

- Bài đã approve.
- Bài bị reject.
- Diff trước/sau khi user chỉnh.
- Lý do regenerate: too AI, too salesy, too long, wrong tone.
- Performance theo post: reach, comment, click, lead, conversion.
- Creator/KOL/KOC được chọn hoặc bị bỏ qua.

### 2.3. Nguồn hệ thống

- Product marketing context.
- Brand memory.
- Campaign history.
- Platform strategy.
- Approved/rejected trend playbook.

---

## 3. Trend Learning Workflow

```text
Input trend samples
  ↓
Normalize samples
  ↓
Extract pattern, not copy
  ↓
Cluster similar patterns
  ↓
Score trend fit
  ↓
Build Trend Playbook
  ↓
Use playbook in ContentWritingAgent
  ↓
Validate content
  ↓
Store feedback and performance
```

---

## 4. Trend scoring

Agent phải chấm điểm trend trước khi dùng.

```ts
type TrendScore = {
  freshness: number; // mới/còn hợp thời không
  brandFit: number; // có hợp brand không
  audienceFit: number; // khách hàng mục tiêu có hiểu không
  platformFit: number; // hợp Facebook/Instagram/Threads không
  executionEase: number; // brand có đủ media/context để làm không
  riskScore: number; // càng cao càng rủi ro
  saturationScore: number; // đã bị dùng quá nhiều chưa
  finalScore: number;
};
```

Công thức MVP:

```text
finalScore =
  freshness * 0.20
+ brandFit * 0.25
+ audienceFit * 0.20
+ platformFit * 0.15
+ executionEase * 0.10
- riskScore * 0.20
- saturationScore * 0.10
```

Quy tắc:

- `riskScore >= 0.7` thì chỉ dùng trend ở mức inspiration, không viết trực tiếp.
- `brandFit < 0.5` thì không dùng.
- `platformFit < 0.5` thì chuyển sang platform khác hoặc bỏ.
- Trend từ một creator cụ thể chỉ dùng pattern, không bắt chước giọng cá nhân.

---

## 5. Trend Playbook output

```ts
type TrendPlaybook = {
  campaignId: string;
  platform: 'facebook' | 'instagram' | 'threads';
  trendMode: 'safe' | 'balanced' | 'aggressive';
  recommendedPatterns: Array<{
    patternName: string;
    patternType: TrendSignal['trendType'];
    description: string;
    whenToUse: string;
    whenNotToUse: string;
    sampleAdaptation: string;
    score: TrendScore;
  }>;
  hooksToTry: string[];
  structuresToTry: string[];
  visualDirections: string[];
  ctaDirections: string[];
  vocabularyToUse: string[];
  vocabularyToAvoid: string[];
  riskNotes: string[];
};
```

---

## 6. Cách viết bài theo platform

## 6.1. Facebook

Mục tiêu: giải thích rõ, đủ thông tin, tạo tin tưởng, có CTA.

Cấu trúc nên dùng:

```text
Hook tình huống / pain point
→ Vì sao vấn đề này xảy ra
→ Sản phẩm/giải pháp xuất hiện tự nhiên
→ 2–3 điểm đáng tin
→ CTA rõ nhưng không ép
```

Độ dài:

- Awareness: 80–150 từ.
- Consideration: 120–220 từ.
- Conversion: 100–180 từ.

Nên có:

- Album hoặc ảnh sản phẩm/lifestyle.
- CTA rõ: inbox, comment, xem link, đăng ký.
- Social proof nếu có chứng cứ thật.

Không nên:

- Viết quá ngắn như Threads.
- Dồn nhiều hashtag.
- Dùng claim chưa có proof.

Output Facebook:

```ts
type FacebookPostDraft = {
  hook: string;
  caption: string;
  firstComment?: string;
  cta: string;
  hashtags: string[];
  mediaDirection: string;
};
```

---

## 6.2. Instagram

Mục tiêu: visual-first, caption hỗ trợ ảnh/video, không ôm quá nhiều chữ.

Cấu trúc nên dùng:

```text
Short hook
→ 1 insight hoặc benefit chính
→ Caption gọn
→ CTA nhẹ
→ Hashtag tinh gọn
```

Định dạng:

- Carousel: mỗi slide một ý, caption tóm tắt.
- Reels: hook 1–3 giây đầu, caption ngắn.
- Story: sticker hỏi đáp/poll nếu mục tiêu engagement.

Nên có:

- Visual direction rõ.
- Alt text nếu có accessibility.
- Hashtag 3–8 tag có liên quan.

Không nên:

- Copy caption Facebook dài.
- Hashtag quá rộng hoặc spam.

Output Instagram:

```ts
type InstagramPostDraft = {
  hook: string;
  caption: string;
  carouselSlides?: Array<{ title: string; body: string; }>;
  reelsSceneIdea?: string;
  cta: string;
  hashtags: string[];
  visualDirection: string;
};
```

---

## 6.3. Threads

Mục tiêu: hội thoại, ngắn, giống người thật đang nêu quan sát hoặc hỏi ý kiến.

Cấu trúc nên dùng:

```text
Một câu hook có quan điểm/quan sát
→ 1–2 câu giải thích
→ Câu hỏi mở hoặc first comment
```

Nên có:

- Hook cụ thể.
- Giọng tự nhiên.
- First comment để mở rộng ý hoặc gắn link.
- Reply suggestions cho comment.

Không nên:

- Viết như brochure.
- CTA quá lộ.
- Dài như Facebook.

Output Threads:

```ts
type ThreadsPostDraft = {
  hook: string;
  post: string;
  firstComment?: string;
  replySuggestions: string[];
  cta?: string;
};
```

---

## 7. Content angle library

Agent không chọn angle ngẫu nhiên. Angle phải map với objective và audience blocker.

| Objective           | Angle nên ưu tiên                             | Ví dụ                                                           |
| ------------------- | --------------------------------------------- | --------------------------------------------------------------- |
| Awareness           | Quan sát thị trường, pain point, myth-busting | “Nhiều shop không thiếu sản phẩm, họ thiếu cách làm khách tin.” |
| Engagement          | Câu hỏi, tranh luận nhẹ, trải nghiệm thật     | “Bạn tin review KOC hơn hay quảng cáo brand hơn?”               |
| Traffic             | Checklist, hướng dẫn, tài nguyên              | “3 bước chọn KOC trước khi chạy campaign.”                      |
| Leads               | Problem-solution, case mini, audit offer      | “Gửi campaign brief, HIVE-K gợi ý KOC phù hợp.”                 |
| Sales               | Offer, proof, urgency thật                    | “Gói Standard cho local brand muốn lên bài đều hơn.”            |
| Creator recruitment | Lợi ích creator, minh bạch, quyền lợi         | “KOC không cần tự đi tìm brand thủ công nữa.”                   |

---

## 8. Hook patterns

### 8.1. Hook pain point

```text
Không phải brand thiếu KOC, mà là thiếu cách chọn đúng người ngay từ đầu.
```

Dùng khi:

- Objective awareness/consideration.
- Audience đã biết vấn đề nhưng chưa rõ nguyên nhân.

### 8.2. Hook contrast

```text
Một campaign có thể có nhiều bài đăng, nhưng chỉ một vài bài thật sự kéo được khách hỏi mua.
```

Dùng khi:

- Muốn mở bài tự nhiên.
- Có insight cụ thể.

### 8.3. Hook question

```text
Nếu phải chọn giữa KOC nhiều follower và KOC có tệp khách đúng hơn, bạn chọn ai?
```

Dùng khi:

- Threads.
- Engagement post.

### 8.4. Hook checklist

```text
Trước khi mời KOC, brand nên kiểm tra 3 thứ này.
```

Dùng khi:

- Facebook/Instagram carousel.
- Traffic/lead magnet.

### 8.5. Hook micro-story

```text
Một local brand có thể mất cả tuần chỉ để lọc danh sách KOC, nhắn tin, chờ phản hồi và sửa caption.
```

Dùng khi:

- Awareness/consideration.
- Cần làm vấn đề có hình ảnh hơn.

---

## 9. Content generation prompt contract

Input bắt buộc cho `ContentWritingAgent`:

```ts
type ContentWritingInput = {
  campaign: CampaignGoalSummary;
  product: ProductMessageMap;
  audience: AudienceInsightMap;
  brandVoice: BrandVoiceProfile;
  platformStrategy: PlatformContentStrategy;
  trendPlaybook?: TrendPlaybook;
  postNode: {
    platform: string;
    funnelStage: string;
    angle: string;
    contentType: string;
    goal: string;
  };
  retrievedBrandMemories: BrandLearningMemory[];
  userInstruction?: string;
};
```

Output bắt buộc:

```ts
type ContentWritingOutput = {
  platform: string;
  hook: string;
  content: string;
  firstComment?: string;
  replySuggestions: string[];
  cta?: string;
  hashtags?: string[];
  mediaDirection?: string;
  trendUsed?: {
    patternName: string;
    adaptationNote: string;
  };
  deliveredFacts: string[];
  missingFacts: string[];
  riskNotes: string[];
};
```

---

## 10. Validator rules cho bài viết

Validator phải kiểm tra trước khi lưu post.

```ts
type ContentValidationResult = {
  brandFitScore: number;
  humanLikenessScore: number;
  factualConsistencyScore: number;
  platformFitScore: number;
  trendFitScore: number;
  salesPressureScore: number;
  riskLevel: 'green' | 'amber' | 'red';
  issues: string[];
  suggestedRevision?: string;
  finalDecision: 'approve' | 'revise' | 'human_review';
};
```

Rules:

- Nếu có claim không nằm trong `allowedClaims` hoặc `mandatoryFacts`, giảm factual score.
- Nếu bài dùng trend có risk cao, tối thiểu `amber`.
- Nếu bài nghe như template quảng cáo, giảm human-likeness.
- Nếu Threads quá dài hoặc quá sales, giảm platform fit.
- Nếu Instagram không có visual direction, warning.
- Nếu Facebook thiếu CTA với objective conversion/leads, warning.

---

## 11. Cách agent học từ feedback

### 11.1. Khi user approve

Lưu:

- Hook style.
- Structure.
- CTA.
- Platform.
- Campaign objective.
- Trend pattern đã dùng.

```ts
memory.type = 'approved_structure';
memory.confidence += 0.1;
```

### 11.2. Khi user reject

Lưu:

- Phrase bị chê.
- Tone không phù hợp.
- Angle yếu.
- Lý do reject.

```ts
memory.type = 'rejected_phrase';
memory.confidence += 0.1;
```

### 11.3. Khi user edit

Agent so sánh before/after:

```text
Before: “Giải pháp hoàn hảo giúp doanh nghiệp tối ưu marketing.”
After:  “Một cách nhẹ hơn để local brand lên bài đều và kiểm tra hiệu quả từng campaign.”
```

Learning:

- User thích câu cụ thể hơn.
- Tránh cụm “giải pháp hoàn hảo”.
- Tone nên nhẹ, ít quảng cáo.

### 11.4. Khi có performance

Agent không chỉ học theo likes. Cần ưu tiên:

- Qualified comments.
- Clicks.
- Leads.
- Conversion.
- Cost per lead.
- Creator acceptance.
- Recommendation acceptance.

---

## 12. Trend memory schema

```ts
type TrendMemory = {
  id: string;
  brandId: string;
  campaignId?: string;
  platform: string;
  patternType: TrendSignal['trendType'];
  patternSummary: string;
  exampleAdaptation: string;
  score: TrendScore;
  outcome?: {
    approvalRate?: number;
    editRate?: number;
    engagementRate?: number;
    clickRate?: number;
    leadRate?: number;
  };
  status: 'active' | 'watch' | 'deprecated' | 'rejected';
  createdAt: string;
  updatedAt: string;
};
```

---

## 13. Prompt skeleton cho TrendLearningAgent

```text
Task:
Analyze the provided trend samples and extract reusable writing/content patterns for this campaign.

Input:
- Campaign objective
- Product and allowed claims
- Target audience
- Brand voice
- Platform
- Trend samples
- Approved/rejected examples

Rules:
1. Extract patterns, not exact wording.
2. Do not copy a specific creator's voice.
3. Do not recommend risky trends if brand fit is low.
4. Separate hook pattern, structure, CTA pattern, visual direction.
5. Mention what should not be used.
6. Return valid JSON only.

Output:
TrendPlaybook JSON
```

---

## 14. Prompt skeleton cho ContentWritingAgent

```text
Task:
Write one platform-native post for the selected campaign step.

Input:
- Campaign brief
- Product message map
- Audience insight
- Brand voice rules
- Platform strategy
- Trend playbook
- Post node
- Brand memories

Writing rules:
1. Vietnamese must sound natural and specific.
2. Do not invent facts, price, guarantee, certification, or results.
3. Use the selected trend as adaptation, not copying.
4. Match the platform format.
5. Use soft CTA unless campaign objective requires conversion.
6. Avoid generic AI wording and brochure tone.
7. Include mandatory facts naturally.
8. Return valid JSON only.
```

---

## 15. Quality checklist

Một bài viết đạt yêu cầu khi:

- Có hook cụ thể, không mở đầu chung chung.
- Có lý do để người đọc quan tâm.
- Có thông tin sản phẩm đúng brief.
- Có CTA phù hợp objective.
- Có platform fit rõ ràng.
- Có trend adaptation nếu user bật trend mode.
- Không bịa fact.
- Không quá sales khi đang ở awareness.
- Có media direction nếu platform cần visual.
- Validator không trả `red`.
