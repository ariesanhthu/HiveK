# 04 — HIVE-K Agent Implementation Execution Plan

## 0. Mục tiêu file

File này chuyển thiết kế agent + UX thành kế hoạch thực thi cho codebase. Agent/coder có thể dùng file này để chia task, tạo schema, API, workflow, component và test.

Stack giữ theo hướng MVP:

- Next.js backend.
- TypeScript.
- ADK TypeScript hoặc agent orchestration layer tương đương.
- Gemini API gọi từ server.
- MongoDB + MongoDB Atlas Vector Search.
- Zod validation.
- Không gọi Gemini trực tiếp từ frontend.
- Không nhét prompt dài vào `route.ts`.

---

## 1. Folder structure đề xuất

```text
apps/client/src/
├── features/
│   ├── campaign-management/
│   │   ├── components/
│   │   │   ├── campaign-list-panel.tsx
│   │   │   ├── campaign-card.tsx
│   │   │   ├── campaign-detail-tabs.tsx
│   │   │   └── campaign-status-badge.tsx
│   │   ├── hooks/
│   │   ├── types.ts
│   │   └── data/
│   │
│   ├── campaign-wizard/
│   │   ├── components/
│   │   │   ├── campaign-wizard-shell.tsx
│   │   │   ├── wizard-stepper.tsx
│   │   │   ├── ai-brief-panel.tsx
│   │   │   ├── ai-suggestion-card.tsx
│   │   │   ├── steps/
│   │   │   │   ├── basics-step.tsx
│   │   │   │   ├── product-offer-step.tsx
│   │   │   │   ├── audience-insight-step.tsx
│   │   │   │   ├── brand-voice-step.tsx
│   │   │   │   ├── platform-strategy-step.tsx
│   │   │   │   ├── trend-learning-step.tsx
│   │   │   │   ├── media-qna-step.tsx
│   │   │   │   ├── creators-step.tsx
│   │   │   │   └── final-review-step.tsx
│   │   │   └── fields/
│   │   ├── hooks/
│   │   │   ├── use-campaign-wizard-state.ts
│   │   │   └── use-campaign-wizard-validation.ts
│   │   ├── schemas/
│   │   └── types.ts
│   │
│   ├── campaign-planning/
│   │   ├── components/
│   │   │   ├── campaign-planner-shell.tsx
│   │   │   ├── timeline-panel.tsx
│   │   │   ├── post-editor-panel.tsx
│   │   │   ├── post-review-panel.tsx
│   │   │   ├── post-media-tab.tsx
│   │   │   ├── post-schedule-tab.tsx
│   │   │   └── post-history-tab.tsx
│   │   ├── hooks/
│   │   └── types/
│   │
│   └── agentic-client/
│       ├── api/agentic-api-client.ts
│       └── hooks/use-agentic-queries.ts
│
├── app/api/ai/
│   ├── campaigns/
│   │   ├── route.ts
│   │   └── [campaignId]/
│   │       ├── route.ts
│   │       ├── harness/run/route.ts
│   │       ├── planning/route.ts
│   │       ├── generate-plan/route.ts
│   │       ├── generate-post/route.ts
│   │       ├── media/match/route.ts
│   │       ├── trends/learn/route.ts
│   │       ├── creators/match/route.ts
│   │       ├── creators/[creatorId]/outreach-draft/route.ts
│   │       ├── tracking/route.ts
│   │       └── insights/route.ts
│   ├── validation/content/route.ts
│   └── feedback/route.ts
│
└── server/
    ├── ai/
    │   ├── agents/
    │   ├── workflows/
    │   ├── tools/
    │   ├── prompts/
    │   ├── schemas/
    │   ├── services/
    │   └── types/
    ├── db/
    ├── jobs/
    └── config/
```

---

## 2. Server agent files cần tạo/sửa

### 2.1. Agents

```text
src/server/ai/agents/
├── campaign-wizard-harness.agent.ts
├── campaign-intake.agent.ts
├── product-context.agent.ts
├── audience-insight.agent.ts
├── strategy-planning.agent.ts
├── trend-learning.agent.ts
├── content-writing.agent.ts
├── media-matching.agent.ts
├── qna-reply.agent.ts
├── creator-matching.agent.ts
├── outreach-draft.agent.ts
├── validator.agent.ts
└── learning.agent.ts
```

### 2.2. Workflows

```text
src/server/ai/workflows/
├── analyze-campaign-brief.workflow.ts
├── suggest-missing-inputs.workflow.ts
├── learn-campaign-trends.workflow.ts
├── generate-campaign-strategy.workflow.ts
├── generate-campaign-plan.workflow.ts
├── generate-post-drafts.workflow.ts
├── validate-posts.workflow.ts
├── match-media-to-posts.workflow.ts
├── match-creators.workflow.ts
├── draft-creator-outreach.workflow.ts
├── schedule-approved-posts.workflow.ts
└── save-learning-feedback.workflow.ts
```

### 2.3. Tools

```text
src/server/ai/tools/
├── get-campaign-context.tool.ts
├── update-campaign-context.tool.ts
├── list-campaign-posts.tool.ts
├── upsert-campaign-posts.tool.ts
├── list-campaign-media.tool.ts
├── attach-media-to-post.tool.ts
├── list-qna-examples.tool.ts
├── search-brand-memory.tool.ts
├── save-brand-memory.tool.ts
├── search-trend-memory.tool.ts
├── save-trend-memory.tool.ts
├── search-creator-profile.tool.ts
├── save-agent-run.tool.ts
├── save-audit-event.tool.ts
└── save-feedback-event.tool.ts
```

### 2.4. Prompts

```text
src/server/ai/prompts/
├── base-system.prompt.ts
├── campaign-intake.prompt.ts
├── product-context.prompt.ts
├── audience-insight.prompt.ts
├── strategy-planning.prompt.ts
├── trend-learning.prompt.ts
├── content-writing.prompt.ts
├── media-matching.prompt.ts
├── qna-reply.prompt.ts
├── creator-matching.prompt.ts
├── outreach-draft.prompt.ts
└── validator.prompt.ts
```

Prompt file format:

```ts
export const contentWritingPrompt = {
  name: "content-writing",
  version: "v1.0.0",
  purpose: "Generate platform-native campaign post content",
  inputContract: "ContentWritingInput",
  outputContract: "ContentWritingOutput",
  rules: [...],
  template: `...`,
};
```

---

## 3. Core schemas

### 3.1. Wizard step IDs

```ts
export const campaignWizardStepIds = [
  "basics",
  "product_offer",
  "audience_insight",
  "brand_voice",
  "platform_strategy",
  "trend_learning",
  "media_qna",
  "creators",
  "final_review",
] as const;

export type CampaignWizardStepId = typeof campaignWizardStepIds[number];
```

### 3.2. Campaign brief

```ts
export const CampaignBriefSchema = z.object({
  id: z.string(),
  brandId: z.string(),
  name: z.string().min(1),
  status: z.enum([
    "draft",
    "briefing",
    "ready_to_generate",
    "generating",
    "reviewing",
    "scheduled",
    "published",
    "archived",
  ]),
  objective: z.enum([
    "awareness",
    "engagement",
    "traffic",
    "leads",
    "sales",
    "creator_recruitment",
  ]),
  product: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    category: z.string().optional(),
    usp: z.array(z.string()).default([]),
    offer: z.string().optional(),
    price: z.string().optional(),
    mandatoryFacts: z.array(z.string()).default([]),
    forbiddenClaims: z.array(z.string()).default([]),
  }),
  audience: z.object({
    description: z.string().min(1),
    location: z.string().optional(),
    ageRange: z.string().optional(),
    painPoints: z.array(z.string()).default([]),
    buyingTriggers: z.array(z.string()).default([]),
    objections: z.array(z.string()).default([]),
    customerLanguage: z.array(z.string()).default([]),
  }),
  brandVoice: z.object({
    tone: z.array(z.string()).default([]),
    emojiPolicy: z.enum(["none", "low", "medium"]).default("low"),
    wordsToUse: z.array(z.string()).default([]),
    wordsToAvoid: z.array(z.string()).default([]),
    approvedExamples: z.array(z.string()).default([]),
    rejectedExamples: z.array(z.string()).default([]),
  }),
  platforms: z.array(z.enum(["facebook", "instagram", "threads"])).min(1),
  cta: z.string().min(1),
  landingUrl: z.string().url().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
```

### 3.3. Trend schemas

```ts
export const TrendSignalSchema = z.object({
  id: z.string(),
  sourceType: z.enum([
    "user_pasted_post",
    "competitor_example",
    "creator_example",
    "brand_history",
    "performance_data",
    "manual_note",
    "platform_observation",
  ]),
  platform: z.enum(["facebook", "instagram", "threads", "tiktok"]),
  rawText: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  screenshotNote: z.string().optional(),
  observedAt: z.string(),
  trendType: z.enum([
    "hook_pattern",
    "content_structure",
    "visual_format",
    "cta_pattern",
    "comment_pattern",
    "storytelling_angle",
    "meme_reference",
    "ugc_style",
  ]),
  summary: z.string(),
  extractedPattern: z.string(),
  exampleWithoutCopying: z.string(),
  riskNotes: z.array(z.string()).default([]),
});

export const TrendScoreSchema = z.object({
  freshness: z.number().min(0).max(1),
  brandFit: z.number().min(0).max(1),
  audienceFit: z.number().min(0).max(1),
  platformFit: z.number().min(0).max(1),
  executionEase: z.number().min(0).max(1),
  riskScore: z.number().min(0).max(1),
  saturationScore: z.number().min(0).max(1),
  finalScore: z.number(),
});
```

### 3.4. Post node

```ts
export const CampaignPostNodeSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  dayIndex: z.number().int().positive(),
  scheduledAt: z.string().optional(),
  platform: z.enum(["facebook", "instagram", "threads"]),
  contentType: z.enum(["caption", "carousel", "reels", "thread", "album", "story"]),
  funnelStage: z.enum(["awareness", "consideration", "conversion", "retention"]),
  status: z.enum(["draft", "needs-review", "approved", "scheduled", "published", "rejected"]),
  title: z.string(),
  goal: z.string(),
  angle: z.string(),
  hook: z.string().optional(),
  content: z.string().optional(),
  firstComment: z.string().optional(),
  replySuggestions: z.array(z.string()).default([]),
  cta: z.string().optional(),
  mediaAssetIds: z.array(z.string()).default([]),
  selectedImageId: z.string().optional(),
  validation: z.any().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
```

---

## 4. API endpoints cần build

### 4.1. Campaign CRUD

```http
GET    /api/ai/campaigns
POST   /api/ai/campaigns
GET    /api/ai/campaigns/:campaignId
PATCH  /api/ai/campaigns/:campaignId
```

Mục tiêu:

- Persist campaign-management thay vì local mock.
- Wizard dùng chung campaign source-of-truth.

### 4.2. Harness run

```http
POST /api/ai/campaigns/:campaignId/harness/run
```

Request:

```ts
type HarnessRunRequest = {
  runMode: HarnessRunMode;
  dryRun?: boolean;
  humanReviewRequired?: boolean;
  selectedPostIds?: string[];
  selectedCreatorIds?: string[];
  userInstruction?: string;
};
```

Route chỉ làm:

1. Auth.
2. Validate request.
3. Gọi `runCampaignHarnessWorkflow()`.
4. Return response.

Không viết prompt hoặc business logic trong route.

### 4.3. Trend learning

```http
POST /api/ai/campaigns/:campaignId/trends/learn
```

Request:

```ts
type LearnTrendsRequest = {
  platform?: "facebook" | "instagram" | "threads";
  trendMode: "safe" | "balanced" | "aggressive";
  samples: Array<{
    sourceType: string;
    platform: string;
    rawText?: string;
    sourceUrl?: string;
    screenshotNote?: string;
  }>;
};
```

Response:

```ts
type LearnTrendsResponse = {
  trendPlaybook: TrendPlaybook;
  warnings: string[];
  nextActions: string[];
};
```

### 4.4. Planner APIs

```http
GET  /api/ai/campaigns/:campaignId/planning
POST /api/ai/campaigns/:campaignId/generate-plan
POST /api/ai/campaigns/:campaignId/generate-post
POST /api/ai/campaigns/:campaignId/media/match
POST /api/ai/validation/content
POST /api/ai/feedback
```

### 4.5. Creator APIs

```http
POST /api/ai/campaigns/:campaignId/creators/match
POST /api/ai/campaigns/:campaignId/creators/:creatorId/outreach-draft
POST /api/ai/campaigns/:campaignId/creators/:creatorId/mark-contacted
```

Không build `outreach-send` thật trước khi có connector/permission.

---

## 5. Workflow implementation detail

### 5.1. `runCampaignHarnessWorkflow()`

```ts
export async function runCampaignHarnessWorkflow(input: HarnessRunRequest) {
  const campaign = await getCampaignContext(input.campaignId);
  const validation = validateCampaignReadiness(campaign, input.runMode);

  if (validation.hasBlockingMissingFields) {
    return buildNeedsInputResponse(validation);
  }

  switch (input.runMode) {
    case "analyze_brief":
      return analyzeCampaignBriefWorkflow(campaign);
    case "learn_trends":
      return learnCampaignTrendsWorkflow(campaign, input);
    case "generate_plan":
      return generateCampaignPlanWorkflow(campaign, input);
    case "generate_posts":
      return generatePostDraftsWorkflow(campaign, input);
    case "validate_posts":
      return validatePostsWorkflow(campaign, input);
    case "match_media":
      return matchMediaToPostsWorkflow(campaign, input);
    case "match_creators":
      return matchCreatorsWorkflow(campaign, input);
    case "draft_creator_outreach":
      return draftCreatorOutreachWorkflow(campaign, input);
    case "schedule_posts":
      return scheduleApprovedPostsWorkflow(campaign, input);
    default:
      throw new Error("Unsupported run mode");
  }
}
```

### 5.2. Generate plan workflow

```text
1. Load campaign context.
2. Retrieve brand memory.
3. Retrieve trend playbook if available.
4. Run CampaignIntakeAgent.
5. Run StrategyPlanningAgent.
6. Create day → post node plan.
7. Save post nodes as draft.
8. Save agent run and audit events.
9. Return timeline to UI.
```

### 5.3. Generate posts workflow

```text
1. Load selected post nodes.
2. For each post:
   - Load platform strategy.
   - Load product/audience/brand context.
   - Load trend playbook and relevant memories.
   - Run ContentWritingAgent.
   - Run ValidatorAgent.
   - If green and humanReviewRequired=false: mark approved.
   - Else mark needs-review.
3. Save generated assets.
4. Save audit.
5. Return post patches.
```

### 5.4. Trend learning workflow

```text
1. Validate trend samples.
2. Normalize each sample.
3. Run TrendLearningAgent.
4. Score each trend pattern.
5. Filter risky/low-fit trends.
6. Save trend memory.
7. Return TrendPlaybook.
```

### 5.5. Learning feedback workflow

```text
1. Save raw feedback event.
2. If approve: save approved hook/structure/CTA.
3. If reject: save rejected phrase/pattern.
4. If edit: compute before/after summary.
5. If performance sync: save outcome signal.
6. Update memory confidence.
```

---

## 6. UI implementation order

### Phase 1 — Persist campaign data

Tasks:

- Replace local mock state with API-backed hooks.
- Add campaign CRUD endpoints.
- Add MongoDB collections: campaigns, campaign_posts, campaign_media, qna_examples, creators, participants, agent_runs, audit_events, brand_memories, trend_memories.
- Keep mock fallback only for demo/dev.

Acceptance:

- Refresh page không mất campaign.
- Campaign card đọc data từ API.
- Edit brief lưu thật.

### Phase 2 — Campaign Wizard

Tasks:

- Build `features/campaign-wizard`.
- Build 9 steps.
- Build step validation.
- Build AI brief panel.
- Build auto-save.
- Build `harness/run` integration for `analyze_brief` and `suggest_missing_inputs`.

Acceptance:

- User tạo campaign từ đầu đến final review.
- Missing field hiển thị đúng.
- AI suggestion có Apply/Edit/Dismiss.

### Phase 3 — Plan + post generation

Tasks:

- Implement `generate_plan` run mode.
- Implement `generate_posts` run mode.
- Build planner layout: timeline/editor/review.
- Add post status transitions.
- Add validation panel.

Acceptance:

- User tạo lộ trình theo ngày.
- Mỗi post có platform riêng.
- User review và approve từng post.

### Phase 4 — Trend learning

Tasks:

- Build trend learning step UI.
- Build `/trends/learn` API.
- Build TrendLearningAgent.
- Add trend playbook preview.
- Add trendUsed metadata vào post draft.

Acceptance:

- User paste 2–5 trend samples.
- Agent trích pattern, không copy.
- Content output ghi rõ trend adaptation.

### Phase 5 — Media/Q&A

Tasks:

- Build media library persistence.
- Build media matching workflow.
- Build Q&A table.
- Build reply draft workflow.

Acceptance:

- Media được match vào post.
- Q&A tạo reply draft.
- Sensitive reply cần human review.

### Phase 6 — Creator matching/outreach

Tasks:

- Build creator recommendation UI.
- Build creator match workflow.
- Build outreach draft.
- Build invite code/link.
- Build mark contacted.

Acceptance:

- User thấy reason/evidence/concerns.
- User copy outreach message.
- Không gửi thật nếu chưa có connector.

### Phase 7 — Tracking + insights

Tasks:

- Build tracking endpoint.
- Build KPI dashboard by platform/post/creator.
- Build insight generation.
- Feed performance to LearningAgent.

Acceptance:

- KPI không lẫn với posting roadmap.
- Insight có data limitations.
- Performance signal được lưu vào memory.

---

## 7. Acceptance tests

### 7.1. Campaign wizard

- Tạo campaign mới với name/objective/product/audience/platform/CTA.
- Bỏ trống product thì không generate plan.
- Bỏ trống brand voice vẫn generate được nhưng warning.
- AI suggestion không tự apply claim nhạy cảm.

### 7.2. Trend learning

- Trend sample có nội dung đối thủ → agent chỉ trích pattern.
- Trend rủi ro cao → không dùng trực tiếp.
- Trend không hợp platform → warning.
- Trend playbook lưu vào campaign.

### 7.3. Content writing

- Facebook caption không giống Threads.
- Instagram có visual direction.
- Threads có first comment hoặc reply suggestions.
- Mandatory facts xuất hiện tự nhiên.
- Forbidden claim không xuất hiện.

### 7.4. Validation

- Claim chưa có proof → risk amber hoặc red.
- Content quá sales ở awareness → warning.
- Content quá generic → human-likeness thấp.

### 7.5. Learning loop

- Approve post → lưu approved memory.
- Reject post → lưu rejected pattern.
- Edit post → lưu writing preference.
- Performance tốt → lưu performance signal.

### 7.6. Creator matching

- Không rank chỉ theo follower.
- Có reason/evidence/concerns.
- Creator risk cao bị trừ điểm.
- Outreach chỉ tạo draft/copy nếu chưa có connector.

---

## 8. Metrics cần log

### Agent quality

- Agent run success rate.
- Latency.
- Validation pass rate.
- Hallucination issue count.
- Human review rate.
- Regenerate rate.
- Edit distance before/after.

### Content quality

- Approval rate.
- Rejection reason distribution.
- Brand fit score.
- Human-likeness score.
- Platform fit score.
- Trend fit score.

### Recommendation quality

- Creator recommendation acceptance rate.
- Evidence grounding score.
- Human usefulness score.
- Precision@K / Recall@K nếu có labelled data.
- MRR / nDCG nếu có ranking labels.

### Business outcome

- Reach.
- Engagement.
- Qualified comments.
- Clicks.
- Leads.
- Conversion.
- Cost per lead.
- Creator response rate.

---

## 9. Developer guardrails

- Route chỉ validate/call workflow/return response.
- Prompt nằm trong `src/server/ai/prompts`.
- Gemini key chỉ ở server env.
- Mọi AI output phải validate bằng Zod.
- Mọi generated post phải qua ValidatorAgent trước khi lưu.
- Mọi action publish/send phải có audit.
- Không dùng hardcoded URL.
- Không migrate platform lẫn lộn: MVP ưu tiên Facebook, Instagram, Threads. TikTok để future nếu business chưa cần.

---

## 10. Done criteria tổng

Hoàn thành phiên bản này khi:

- Có wizard tạo campaign theo 9 step.
- Có AI brief panel và missing input checklist.
- Có trend learning step và trend playbook.
- Có planner timeline/editor/review.
- Generate được plan + post theo platform.
- Validate và lưu audit đầy đủ.
- Feedback tạo brand memory/trend memory.
- Creator matching/outreach hoạt động ở mức draft/copy/mark contacted.
- Không có action nguy hiểm chạy tự động thiếu approval.
