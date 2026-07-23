# Harness Agent cho tính năng Lên bài tự động

## 1. Mục tiêu

Harness Agent là lớp điều phối agentic cho flow **Quản lý chiến dịch -> Lên bài tự động**. Nó nhận cấu hình chiến dịch, ảnh, Q&A mẫu, người tham gia, KOL/KOC, dữ liệu tracking và biến các dữ liệu đó thành:

- Lộ trình đăng bài theo ngày, mỗi ngày gồm nhiều node bài viết.
- Nội dung riêng cho từng nền tảng.
- Gợi ý media / ảnh phù hợp với từng bài.
- Câu trả lời mẫu để agent rep comment.
- Gợi ý KOL/KOC phù hợp và tin nhắn liên hệ.
- Tác vụ gửi email / nhắn tin / copy message có kiểm soát.
- Tracking KPI và insight sau chiến dịch.

Hiện UI liên quan nằm ở:

- `apps/client/src/features/campaign-management/`: quản lý list chiến dịch, config, ảnh, Q&A, participant, KPI tracking.
- `apps/client/src/features/campaign-planning/`: lên bài tự động, post editor, review, schedule.
- `apps/client/src/features/agentic-client/`: React Query client gọi API agentic.
- `apps/client/src/server/ai/`: workflow mock/server-side agentic.

## 2. Nguyên tắc UX/Product

Flow chính:

1. Người dùng tạo hoặc chọn chiến dịch ở `Quản lý Chiến dịch`.
2. Người dùng cấu hình campaign brief, platform content, ảnh, Q&A mẫu và participant.
3. Người dùng bấm `Đăng bài tự động` hoặc vào sidebar `Lên bài tự động`.
4. Harness Agent tạo lộ trình và bài viết theo campaign context.
5. Người dùng review từng bài, chỉnh content, duyệt, rồi lên lịch.
6. Sau khi chạy, tracking dashboard hiển thị KPI chiến dịch.

Quy tắc UI:

- Trang `Quản lý Chiến dịch` là campaign-first, không phải post-first.
- Trang `Lên bài tự động` là post/workflow-first.
- `Tracking` là dashboard KPI của chiến dịch, không phải lộ trình đăng bài.
- `Lộ trình` là danh sách ngày + sub-node bài đăng.
- Mỗi nền tảng có content strategy riêng, không dùng chung một caption cho tất cả.
- Mọi hành động gửi trực tiếp ra ngoài như đăng bài, gửi email, nhắn tin KOL/KOC phải có trạng thái review/confirm hoặc audit log.

## 3. Kiến trúc hiện tại

### Frontend modules

`campaign-management`

- `types.ts`: campaign brief, platform content, media, Q&A, participant, creator suggestion, posting plan, tracking metric.
- `data/mock-campaign-management.ts`: seed campaign thời trang, ảnh mẫu, Q&A, platform content, KOL/KOC, tracking.
- `hooks/use-campaign-management.ts`: local mock store cho campaign, participant, creator suggestion, invite link.
- `components/campaign-list-panel.tsx`: list campaign dạng thẻ ngang, tracking/edit/participant/đăng bài tự động.
- `components/campaign-config-panel.tsx`: config campaign, ảnh, upload ảnh, content theo nền tảng, Q&A.
- `components/posting-roadmap.tsx`: lộ trình đăng bài dạng day -> post nodes.
- `components/campaign-tracking-dashboard.tsx`: KPI dashboard.

`campaign-planning`

- `types/campaign-planning.ts`: data model post planning hiện tại.
- `services/campaign-planning-service.ts`: mock campaign/account/post data.
- `hooks/use-campaign-planning.ts`: orchestration hook gọi `agentic-client`.
- `components/campaign-planning-client.tsx`: layout page lên bài tự động.
- `components/publishing-timeline.tsx`: timeline bài đăng theo ngày.
- `components/PostDetailTabs/*`: content/review/schedule.

`agentic-client`

- `api/agentic-api-client.ts`: fetch wrapper và client methods.
- `hooks/use-agentic-queries.ts`: query/mutation hooks cho campaign plan, single post, validate, KOL/KOC matching, feedback.

### Server/API modules

API routes hiện có:

- `GET /api/ai/campaigns/:campaignId/planning`
- `POST /api/ai/campaigns/:campaignId/generate-plan`
- `POST /api/ai/campaigns/:campaignId/generate-post`
- `POST /api/ai/campaigns/:campaignId/insights`
- `POST /api/ai/validation/content`
- `POST /api/ai/matching/kol-koc`
- `POST /api/ai/feedback`

Workflows hiện có:

- `get-campaign-planning-snapshot.workflow.ts`
- `generate-campaign-plan.workflow.ts`
- `generate-single-post.workflow.ts`
- `validate-content.workflow.ts`
- `match-kol-koc.workflow.ts`
- `generate-insight.workflow.ts`
- `save-feedback.workflow.ts`

Các workflow hiện vẫn là mock/heuristic. Harness Agent cần biến chúng thành pipeline có state, tools, audit và retry.

## 4. Data model cần chuẩn hóa

### CampaignBrief

Đại diện source-of-truth của chiến dịch.

```ts
type CampaignBrief = {
  id: string;
  name: string;
  status: 'draft' | 'generating' | 'reviewing' | 'scheduled' | 'published' | 'archived';
  objective: 'awareness' | 'engagement' | 'traffic' | 'leads' | 'sales' | 'creator_recruitment';
  platforms: PlatformId[];
  accountIds: string[];
  productIds: string[];
  productName?: string;
  description: string;
  keyMessage: string;
  targetAudience: string;
  customerInsight?: string;
  usp?: string;
  offer?: string;
  cta: string;
  landingUrl?: string;
  tone: CampaignToneConfig;
  media: CampaignMedia[];
  platformContent: CampaignPlatformContent[];
  commentReplyExamples: CampaignCommentReplyExample[];
  postingPlan: CampaignPostingDay[];
  tracking: CampaignTrackingMetric;
  invite: CampaignInviteConfig;
  aiConfig: CampaignAiConfig;
  createdAt: string;
  updatedAt: string;
};
```

### PlatformId

Hiện business flow mới dùng:

```ts
type PlatformId = 'facebook' | 'threads' | 'instagram';
```

Lưu ý: `campaign-planning` cũ vẫn còn `"tiktok"` trong type/mock. Cần migrate sang `"instagram"` để đồng bộ với campaign-management.

### CampaignPlatformContent

Mỗi nền tảng phải có content riêng:

```ts
type CampaignPlatformContent = {
  platform: PlatformId;
  postingStyle: string;
  primaryFormat: string;
  caption: string;
  contentAngle: string;
  mediaDirection: string;
  hashtags: string[];
};
```

Yêu cầu harness:

- Không copy nguyên caption Facebook sang Instagram/Threads.
- Facebook ưu tiên caption đầy đủ, album, CTA rõ.
- Threads ưu tiên câu hỏi/hội thoại, ngắn, có hook comment.
- Instagram ưu tiên visual-first, carousel/reels, caption ngắn và hashtag tinh gọn.

### CampaignMedia

```ts
type CampaignMedia = {
  id: string;
  type: 'image' | 'video' | 'document' | 'logo';
  url: string;
  name: string;
  role: 'brand' | 'product' | 'lifestyle' | 'reference' | 'generated';
  alt?: string;
};
```

Cần bổ sung:

- `source`: `uploaded | generated | external | brand_asset`.
- `checksum` hoặc `fileHash`.
- `dimensions`: width/height.
- `dominantColors`.
- `detectedObjects`.
- `moderationStatus`.
- `matchScoreByPostId`.

### CampaignCommentReplyExample

Dữ liệu Q&A mẫu để agent rep comment.

```ts
type CampaignCommentReplyExample = {
  id: string;
  question: string;
  answer: string;
  intent: 'pricing' | 'size' | 'shipping' | 'material' | 'styling' | 'general';
};
```

Cần bổ sung:

- `platform?: PlatformId`
- `keywords: string[]`
- `confidenceThreshold: number`
- `requiresHumanReview: boolean`
- `allowedActions`: `reply | ask_followup | move_to_inbox | create_lead`
- `lastUpdatedBy`

### CampaignPostingDay và CampaignPostNode

Lộ trình đăng bài không phải KPI. Nó là operational plan.

```ts
type CampaignPostingDay = {
  day: number;
  dateLabel: string;
  posts: CampaignPostNode[];
};

type CampaignPostNode = {
  id: string;
  title: string;
  platform: PlatformId;
  contentType: 'caption' | 'carousel' | 'reels' | 'thread' | 'album' | 'story';
  status: 'draft' | 'needs-review' | 'approved' | 'scheduled';
  time: string;
  owner: string;
  angle: string;
};
```

Cần bổ sung:

- `campaignId`
- `scheduledAt`
- `accountId`
- `content`
- `firstComment`
- `replySuggestions`
- `mediaAssetIds`
- `selectedImageId`
- `imageMatchScore`
- `approvalLog`
- `publishJobId`
- `externalPostId`

### CampaignTrackingMetric

Tracking là dashboard KPI.

```ts
type CampaignTrackingMetric = {
  impressions: number;
  reach: number;
  engagementRate: number;
  clicks: number;
  comments: number;
  leads: number;
  conversionRate: number;
  spend: number;
  revenue: number;
};
```

Cần bổ sung:

- KPI theo platform.
- KPI theo post.
- KPI theo creator/KOL.
- Time series theo ngày.
- Comment intent distribution.
- Sentiment score.
- Cost per lead.
- Revenue attribution source.

## 5. Agent harness design

### 5.1 Root agent

Tên đề xuất: `CampaignHarnessAgent`.

Nhiệm vụ:

- Nhận `campaignId` và `runMode`.
- Load campaign state.
- Validate dữ liệu campaign.
- Chọn sub-agent phù hợp.
- Ghi `AgentRunSummary`.
- Ghi audit event cho mọi action.
- Trả về state patch để UI cập nhật.

Input:

```ts
type HarnessRunRequest = {
  campaignId: string;
  runMode:
    | 'generate_plan'
    | 'generate_posts'
    | 'validate_posts'
    | 'match_images'
    | 'reply_comments'
    | 'match_creators'
    | 'contact_creators'
    | 'schedule_posts'
    | 'generate_insights';
  dryRun?: boolean;
  humanReviewRequired?: boolean;
  selectedPostIds?: string[];
  selectedCreatorIds?: string[];
};
```

Output:

```ts
type HarnessRunResponse = {
  runId: string;
  campaignId: string;
  status: 'success' | 'partial_success' | 'failed' | 'needs_human_review';
  changedEntities: Array<{
    entityType: 'campaign' | 'post' | 'media' | 'comment' | 'creator' | 'participant';
    entityId: string;
    changeType: 'created' | 'updated' | 'queued' | 'sent' | 'failed';
  }>;
  warnings: string[];
  nextActions: string[];
  agentRun: AgentRunSummary;
};
```

### 5.2 Sub-agents

`BriefUnderstandingAgent`

- Chuẩn hóa objective, audience, tone, CTA.
- Tạo missing-field checklist.
- Output: `CampaignBriefAnalysis`.

`PlanningAgent`

- Tạo `CampaignPostingDay[]`.
- Chọn funnel stage, platform, format, time slot.
- Output: posting plan.

`ContentAgent`

- Tạo caption, first comment, reply suggestions cho từng post.
- Dùng `CampaignPlatformContent` và Q&A mẫu.
- Output: post content patch.

`MediaMatchingAgent`

- Match ảnh đã upload / ảnh brand / ảnh generated với post node.
- Chấm điểm dựa trên role, platform format, aspect ratio, object/style match.
- Output: `selectedImageId`, `mediaPrompt`, `imageMatchScore`.

`ImageGenerationAgent`

- Tạo prompt ảnh mới khi media không đủ.
- Không tự publish ảnh.
- Output: generated media assets.

`CommentReplyAgent`

- Phân loại comment intent.
- Match với `CampaignCommentReplyExample`.
- Tạo reply.
- Quyết định reply trực tiếp hay cần human review.

`CreatorMatchingAgent`

- Gọi hoặc thay thế `matchKolKocWorkflow`.
- Match KOL/KOC theo audience, platform, cost, style, risk.
- Output: creator suggestions.

`CreatorOutreachAgent`

- Tạo email/message/DM template.
- Có thể copy message, queue email, hoặc queue inbox message.
- Không gửi thật nếu chưa có connector và approval.

`PublishingAgent`

- Lên lịch bài đã approved.
- Tạo publish job.
- Ghi external post id sau khi publish.

`InsightAgent`

- Tổng hợp KPI, post performance, KOL performance.
- Output campaign insight và next recommendations.

## 6. Tool/actions cần build cho harness

### Data tools

- `getCampaignBrief(campaignId)`
- `updateCampaignBrief(campaignId, patch)`
- `listCampaignPosts(campaignId)`
- `upsertCampaignPosts(campaignId, posts)`
- `listCampaignMedia(campaignId)`
- `attachMediaToPost(postId, mediaId, score)`
- `listCommentReplyExamples(campaignId)`
- `saveAgentRun(runSummary)`
- `saveAuditEvent(event)`

### Content tools

- `generatePostContent(postNode, campaignContext)`
- `validatePostContent(platform, content)`
- `generateReply(comment, qnaExamples, campaignContext)`
- `classifyCommentIntent(comment)`

### Media tools

- `analyzeImage(mediaId)`
- `matchImageToPost(media, postNode, campaignContext)`
- `generateImagePrompt(postNode, campaignContext)`
- `createGeneratedImageAsset(prompt)`

### KOL/KOC tools

- `searchCreators(filters)`
- `scoreCreatorForCampaign(creator, campaignContext)`
- `createCreatorInviteLink(campaignId, creatorId)`
- `createOutreachMessage(campaign, creator, channel)`
- `queueCreatorOutreach(channel, message)`
- `markCreatorContacted(creatorId, status)`

### Publishing tools

- `schedulePost(postId, accountId, scheduledAt)`
- `publishPost(postId)`
- `syncExternalPostMetrics(externalPostId)`
- `cancelScheduledPost(jobId)`

### Notification tools

- `sendEmail(to, subject, body)`
- `sendZaloMessage(to, body)`
- `sendFacebookInbox(to, body)`
- `sendInstagramDm(to, body)`

Giai đoạn đầu nên implement dạng queue/mock:

- `queueEmail`
- `queueMessage`
- `copyToClipboardPayload`
- `markAsContacted`

Không gửi thật nếu thiếu OAuth/connector/permission.

## 7. API đề xuất bổ sung

Hiện có API cho plan/post/validate/matching/feedback. Cần thêm:

### Campaign management

- `GET /api/ai/campaigns`
- `POST /api/ai/campaigns`
- `GET /api/ai/campaigns/:campaignId`
- `PATCH /api/ai/campaigns/:campaignId`
- `POST /api/ai/campaigns/:campaignId/media`
- `POST /api/ai/campaigns/:campaignId/qna`

### Harness runs

- `POST /api/ai/campaigns/:campaignId/harness/run`
- `GET /api/ai/campaigns/:campaignId/harness/runs`
- `GET /api/ai/harness/runs/:runId`

### Comment reply

- `POST /api/ai/campaigns/:campaignId/comments/classify`
- `POST /api/ai/campaigns/:campaignId/comments/reply-draft`
- `POST /api/ai/campaigns/:campaignId/comments/reply`

### Media matching

- `POST /api/ai/campaigns/:campaignId/media/match`
- `POST /api/ai/campaigns/:campaignId/media/generate`

### Creator outreach

- `POST /api/ai/campaigns/:campaignId/creators/match`
- `POST /api/ai/campaigns/:campaignId/creators/:creatorId/outreach-draft`
- `POST /api/ai/campaigns/:campaignId/creators/:creatorId/outreach-send`
- `POST /api/ai/campaigns/:campaignId/creators/:creatorId/mark-contacted`

### Tracking

- `GET /api/ai/campaigns/:campaignId/tracking`
- `POST /api/ai/campaigns/:campaignId/tracking/sync`
- `POST /api/ai/campaigns/:campaignId/insights`

## 8. Workflow chi tiết

### 8.1 Generate plan

Input:

- Campaign brief.
- Platform list.
- AI config.
- Existing media/Q&A.

Steps:

1. Validate required fields.
2. Build campaign context.
3. Generate posting days.
4. Generate post nodes per day.
5. Assign platform, content type, owner, tentative time.
6. Save plan as draft.

Failure cases:

- Missing objective.
- Missing CTA.
- No platform selected.
- No target audience.

### 8.2 Generate posts

Steps:

1. For each selected post node, load platform strategy.
2. Generate caption.
3. Generate first comment.
4. Generate suggested replies.
5. Validate content.
6. Mark post `needs-review` or `approved` depending approval mode.

Validation dimensions:

- Brand fit.
- Human-likeness.
- Platform fit.
- Factual consistency.
- Sales pressure.
- Banned keywords.

### 8.3 Match ảnh với bài

Steps:

1. Analyze image metadata.
2. Score image against post content angle and platform format.
3. Prefer product image for sales post.
4. Prefer lifestyle image for awareness/UGC post.
5. Check aspect ratio:
   - Instagram carousel: 1:1 hoặc 4:5.
   - Instagram reels/story: 9:16.
   - Facebook album: flexible.
   - Threads: image optional.
6. Assign best image or request generation.

Output:

```ts
type ImageMatchResult = {
  postId: string;
  selectedMediaId?: string;
  matchScore: number;
  reason: string;
  generatedPrompt?: string;
  warnings: string[];
};
```

### 8.4 Rep comment

Steps:

1. Receive comment event from platform webhook or manual import.
2. Detect language and intent.
3. Match with Q&A mẫu.
4. Generate reply draft.
5. Apply safety rules.
6. If high confidence and allowed, queue reply.
7. If sensitive, send to human review.

Intent examples:

- `pricing`
- `size`
- `shipping`
- `material`
- `styling`
- `complaint`
- `order_status`
- `general`

Reply policy:

- Không hứa giá nếu chưa có giá trong campaign data.
- Không cam kết chống nước/chống thấm quá mức nếu brief chỉ nói "chống thấm nhẹ".
- Không tự nhận đơn hàng nếu chưa có integration.
- Comment có khiếu nại, hoàn tiền, sức khỏe, pháp lý phải human review.

### 8.5 Match KOL/KOC

Steps:

1. Build creator filters từ campaign.
2. Search creator candidates.
3. Score theo audience fit, brand fit, style fit, trust, cost, risk.
4. Suggest campaign role.
5. Generate reason/evidence/concerns.

Output nên lưu:

- `overallMatchScore`
- `audienceFit`
- `brandFit`
- `styleFit`
- `trustScore`
- `riskScore`
- `estimatedCost`
- `suggestedCampaignRole`
- `reason`
- `evidence`
- `concerns`

### 8.6 Liên hệ KOL/KOC qua mail/nhắn tin

Steps:

1. User chọn creator.
2. Agent tạo invite code/link riêng.
3. Agent tạo message theo channel.
4. User review message.
5. Nếu connector chưa sẵn sàng: copy message hoặc mark contacted.
6. Nếu connector đã sẵn sàng: queue send.
7. Save outreach event.
8. Add creator to participants nếu invited.

Channel-specific fields:

```ts
type CreatorOutreachDraft = {
  campaignId: string;
  creatorId: string;
  channel: 'email' | 'zalo' | 'facebook' | 'instagram';
  recipient: string;
  subject?: string;
  body: string;
  inviteCode: string;
  inviteLink: string;
  requiresApproval: boolean;
};
```

## 9. State machine

### Campaign status

- `draft`: vừa tạo brief.
- `generating`: agent đang tạo plan/post/media.
- `reviewing`: chờ human review.
- `scheduled`: đã lên lịch.
- `published`: đã publish.
- `archived`: lưu trữ.

### Post status

- `draft`: agent tạo nháp.
- `needs-review`: cần user review.
- `approved`: đã duyệt.
- `scheduled`: đã có lịch.
- `published`: đã publish.
- `rejected`: bị từ chối.

### Creator contact status

- `not_contacted`
- `invited`
- `discussing`
- `joined`
- `rejected`

## 10. Audit log

Mọi hành động agent phải ghi log.

```ts
type AgentAuditEvent = {
  id: string;
  runId: string;
  campaignId: string;
  actor: 'agent' | 'user' | 'system';
  action:
    | 'generate_plan'
    | 'generate_post'
    | 'validate_content'
    | 'match_image'
    | 'reply_comment'
    | 'match_creator'
    | 'draft_outreach'
    | 'send_outreach'
    | 'schedule_post'
    | 'publish_post';
  entityType: 'campaign' | 'post' | 'media' | 'comment' | 'creator' | 'participant';
  entityId: string;
  before?: unknown;
  after?: unknown;
  status: 'success' | 'failed' | 'needs_review';
  error?: string;
  createdAt: string;
};
```

## 11. Guardrails

Content:

- Không dùng claim chưa có trong brief.
- Không nói "chống nước 100%" nếu chỉ là chống thấm nhẹ.
- Không cam kết kết quả tuyệt đối.
- Không dùng banned keywords.
- Không dùng quá nhiều emoji nếu campaign tone không cho phép.

Publishing:

- Không publish bài chưa approved.
- Không schedule vào account không thuộc platform.
- Không đăng bài thiếu media nếu content type yêu cầu media.

Comment reply:

- Không tự xử lý complaint nghiêm trọng.
- Không trả lời thông tin cá nhân/đơn hàng nếu không có order context.
- Không spam cùng một reply nhiều lần.

KOL/KOC outreach:

- Không gửi trực tiếp nếu user chưa approve.
- Không gửi qua channel chưa có consent.
- Không tự hứa chi phí hợp tác nếu chưa có budget.

## 12. Những phần còn thiếu cần build

High priority:

- Persist campaign-management data thay vì local mock state.
- Đồng bộ `PlatformId` giữa campaign-management và campaign-planning, thay TikTok bằng Instagram nếu business đã đổi.
- API CRUD cho campaign brief, media, Q&A, participant.
- Harness run endpoint.
- Agent audit log.
- Comment reply agent dựa trên Q&A mẫu.
- Media/image matching agent.
- KOL/KOC outreach draft + mark contacted.
- Campaign tracking sync API.

Medium priority:

- Real image upload storage.
- Image analysis metadata.
- Generated image asset pipeline.
- OAuth/connector cho Facebook, Threads, Instagram.
- Email/Zalo/Facebook/Instagram message queue.
- Human approval queue.
- Post publish job runner.
- Webhook ingest cho comments/metrics.

Low priority:

- A/B testing caption variants.
- Auto budget recommendation.
- Creator contract/payment workflow.
- Sentiment dashboard.
- Learning loop từ feedback để cải thiện prompt.

## 13. Implementation order đề xuất

Phase 1: Data persistence và schema

- Tạo bảng/collection campaign.
- Tạo bảng media.
- Tạo bảng Q&A.
- Tạo bảng post node.
- Tạo bảng participant.
- Tạo bảng agent run/audit.

Phase 2: Harness shell

- `POST /harness/run`.
- Root orchestrator.
- AgentRunSummary.
- Audit log.
- Dry-run mode.

Phase 3: Planning/content

- Generate plan từ campaign brief.
- Generate post content theo platform.
- Validate content.
- Save feedback.

Phase 4: Media/Q&A

- Upload ảnh.
- Match ảnh với post.
- Generate image prompt nếu thiếu ảnh.
- Comment intent classifier.
- Reply draft từ Q&A.

Phase 5: Creator/KOL

- Match creator.
- Outreach draft.
- Invite link/code.
- Mark contacted.
- Add participant.

Phase 6: Publishing/tracking

- Schedule post.
- Publish job.
- Sync metrics.
- Tracking dashboard.
- Insight agent.

## 14. Acceptance checklist

- User tạo campaign brief đầy đủ.
- User upload ảnh và agent match ảnh vào bài.
- User thêm Q&A mẫu và agent tạo reply draft từ Q&A.
- User xem list campaign dạng thẻ ngang.
- User mở tracking dashboard KPI của từng campaign.
- User mở lộ trình đăng bài dạng day -> post node.
- User bấm `Đăng bài tự động` từ campaign card để vào planner.
- Agent tạo bài viết theo từng platform.
- Agent validate bài viết trước khi duyệt/lên lịch.
- User match KOL/KOC và xem lý do match.
- User tạo message liên hệ KOL/KOC.
- User copy hoặc mark contacted nếu chưa có connector.
- Khi connector có sẵn, outreach được queue và audit.
- Không có action publish/send trực tiếp thiếu review.

## 15. Mapping với code hiện tại

Nên giữ module boundaries:

- Campaign CRUD/config: `features/campaign-management`.
- Automatic posting UI: `features/campaign-planning`.
- Agent API client: `features/agentic-client`.
- Agent workflows: `server/ai/workflows`.
- Agent types: `server/ai/types/agent.types.ts`.
- Agent schemas: `server/ai/schemas/agent.schemas.ts`.

Các files nên mở rộng tiếp:

- `apps/client/src/server/ai/types/agent.types.ts`
- `apps/client/src/server/ai/schemas/agent.schemas.ts`
- `apps/client/src/features/agentic-client/api/agentic-api-client.ts`
- `apps/client/src/features/agentic-client/hooks/use-agentic-queries.ts`
- `apps/client/src/features/campaign-planning/types/campaign-planning.ts`
- `apps/client/src/features/campaign-management/types.ts`

Nguyên tắc: UI không tự chứa business logic agent. UI gọi hook/action, hook gọi API client, API route gọi workflow/harness, harness gọi sub-agent/tool.
