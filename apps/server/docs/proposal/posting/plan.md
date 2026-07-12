# Posting Feature — Implementation Plan

> **Scope**: Scheduled post publishing + Facebook comment webhook + comment auto-reply port.
> All code lives in the single NestJS server. Multi-platform design from day one; Facebook is implemented first.

---

## 1. High-Level Architecture

```
[Enterprise Admin]
     │  (A) Connect Facebook Page (OAuth)
     │  (B) CRUD Scheduled Posts
     │  (C) CRUD Auto-Reply Rules
     ▼
[Presentation Layer — REST Controllers]
     │
     ▼
[Application Layer — Command / Query Handlers]
     │                           │
     │                     [Cron Scheduler]
     │                    (@nestjs/schedule)
     │                           │ every 1 min
     │                           ▼
     │                  [PostPublishJob]
     │                  Queries PENDING posts
     │                  due for publishing
     │                           │
     ▼                           ▼
[Core Layer — Aggregate Roots]
  SocialPageRoot
  ScheduledPostRoot
  AutoReplyRuleRoot
     │
     ▼
[Infrastructure Layer]
  MongoDB repositories
  Facebook Graph API client
  RabbitMQ (webhook events)
  Redis (idempotency + rate-limit)

[Facebook Platform]
     │ Webhook (new comment)
     ▼
[POST /api/webhooks/facebook]  ← public, IP-guard recommended
     │  (1) Verify X-Hub-Signature-256
     │  (2) Filter own-page events (infinite-loop guard)
     │  (3) Fast 200 OK to Facebook
     │  (4) Publish raw event to RabbitMQ
     ▼
[RabbitMQ: comment-webhook-queue]
     │
     ▼
[CommentWebhookConsumer]
     │  (5) Redis SETNX idempotency check
     │  (6) Redis rate-limit per page_id
     │  (7) Execute auto-reply (if rule exists)
     ▼
[Facebook Graph API]
```

---

## 2. New Aggregate Roots (Core Layer)

### 2.1 SocialPageRoot
**File**: `src/core/aggregate-roots/social-page.aggregate.ts`

Generic across platforms. Infrastructure handles token encryption/decryption transparently.

```
SocialPageProps {
  enterpriseId       : string          // owning enterprise
  platformId         : string          // references PlatformRoot
  platformCode       : string          // 'facebook' | 'tiktok' | ...
  pageId             : string          // external page ID (e.g. Facebook Page ID)
  pageName           : string
  pictureUrl?        : string          // profile picture for UI display
  followerCount?     : number          // cached follower count
  encryptedToken     : string          // AES-256 encrypted access token
  tokenExpiresAt?    : Date | null     // null = permanent (Facebook page token)
  webhookVerifyToken : string          // random secret for webhook challenge
  isActive           : boolean
  createdAt          : Date
  updatedAt          : Date
  deleteAt?          : Date | null
  deleteBy?          : string | null
}
```

**Domain methods**:
- `static create(props)` — generates webhookVerifyToken (random UUID internally)
- `deactivate()` / `activate()`
- `updateToken(encryptedToken, expiresAt?)` — called after token refresh
- `updatePageInfo(pageName, pictureUrl?, followerCount?)` — sync from Graph API
- `softDelete(deletedBy)` / `restore()`

**DI token**: `SOCIAL_PAGE_REPOSITORY = Symbol('SocialPageRepository')`

---

### 2.2 ScheduledPostRoot
**File**: `src/core/aggregate-roots/scheduled-post.aggregate.ts`

Extracted from the old CampaignRoot.schedule design into a standalone root.

```
ScheduledPostProps {
  enterpriseId    : string
  socialPageId    : string          // target SocialPageRoot
  platformCode    : string          // denormalized for cron query efficiency
  content         : string          // post text body
  mediaFileIds    : string[]        // Cloudinary fileIds (resolved to URLs at publish time)
  scheduledAt     : Date            // target publish time
  status          : EPostStatus     // see enum below
  publishedAt?    : Date | null     // set when actually published
  platformPostId? : string | null   // returned by Graph API after publish
  failReason?     : string | null
  createdBy       : string          // userId
  createdAt       : Date
  updatedAt       : Date
}
```

**New enum** `EPostStatus` (post-status.enum.ts):
```
DRAFT      = 'draft'       -- being edited, not yet scheduled
SCHEDULED  = 'scheduled'   -- confirmed, waiting for cron
PUBLISHING = 'publishing'  -- cron picked up, API call in flight
PUBLISHED  = 'published'   -- successfully published
FAILED     = 'failed'      -- Graph API call failed
CANCELLED  = 'cancelled'   -- manually cancelled
```

**Domain methods**:
- `static create(props)`
- `schedule(scheduledAt)` — DRAFT → SCHEDULED, validates scheduledAt > now
- `markPublishing()` — SCHEDULED → PUBLISHING
- `markPublished(platformPostId, publishedAt)` — PUBLISHING → PUBLISHED
- `markFailed(reason)` — PUBLISHING → FAILED
- `cancel()` — DRAFT | SCHEDULED → CANCELLED
- `reschedule(newTime)` — FAILED | SCHEDULED → SCHEDULED

**DI token**: `SCHEDULED_POST_REPOSITORY = Symbol('ScheduledPostRepository')`

---

### 2.3 AutoReplyRuleRoot
**File**: `src/core/aggregate-roots/auto-reply-rule.aggregate.ts`

One page can have multiple independent rules (keyword-based). Port only — AI execution deferred.

```
AutoReplyRuleProps {
  enterpriseId  : string
  socialPageId  : string
  name          : string          // human label e.g. "Welcome Reply"
  isEnabled     : boolean
  keywords      : string[]        // empty = reply to ALL comments
  replyContent  : string          // plain text for now
  createdAt     : Date
  updatedAt     : Date
}
```

**Domain methods**:
- `static create(props)`
- `enable()` / `disable()`
- `updateRule(name?, keywords?, replyContent?)` — partial update

**DI token**: `AUTO_REPLY_RULE_REPOSITORY = Symbol('AutoReplyRuleRepository')`

---

## 3. Enums (Core Layer)

| File | Enum | Notes |
|------|------|-------|
| `post-status.enum.ts` | `EPostStatus` | New — full lifecycle for standalone post |
| `social-platform-code.enum.ts` | `ESocialPlatformCode` | New — FACEBOOK, TIKTOK, INSTAGRAM |
| `schedule-post-status.enum.ts` | `ESchedulePostStatus` | Existing — keep as-is for Campaign use |

---

## 4. Domain Events (Core Layer)

| Event Class | Trigger | Purpose |
|-------------|---------|---------|
| `PostScheduledEvent` | `ScheduledPostRoot.schedule()` | Notification, audit log |
| `PostPublishedEvent` | `ScheduledPostRoot.markPublished()` | Notify enterprise admin |
| `PostFailedEvent` | `ScheduledPostRoot.markFailed()` | Alert enterprise admin |
| `SocialPageConnectedEvent` | `SocialPageRoot.create()` | Audit trail |

---

## 5. Interfaces / Ports (Core Layer)

### 5.1 Repository Contracts
```
src/core/interfaces/repositories/
  social-page.repository.interface.ts
  scheduled-post.repository.interface.ts
  auto-reply-rule.repository.interface.ts
```

Key query methods:
- `ISocialPageRepository.findByPageId(platformCode, pageId)` — for webhook routing
- `IScheduledPostRepository.findDueForPublishing(now: Date, limit: number)` — used by cron
- `IAutoReplyRuleRepository.findActiveByPageId(socialPageId)` — used by webhook consumer

### 5.2 Service Contracts
```
src/core/interfaces/services/
  social-publisher.interface.ts    // port for posting to any platform
  comment-replier.interface.ts     // port for sending a comment reply
```

```ts
// social-publisher.interface.ts
export interface ISocialPublisher {
  publishPost(params: {
    pageToken: string;
    pageId: string;
    content: string;
    mediaUrls: string[];
  }): Promise<{ platformPostId: string }>;
}

// comment-replier.interface.ts
export interface ICommentReplier {
  replyToComment(params: {
    pageToken: string;
    commentId: string;
    message: string;
  }): Promise<void>;
}
```

**DI tokens**:
- `SOCIAL_PUBLISHER = Symbol('SocialPublisher')`
- `COMMENT_REPLIER  = Symbol('CommentReplier')`

---

## 6. Application Layer

### 6.1 Commands

| Folder | Handler | Description |
|--------|---------|-------------|
| `social-page-connect` | `SocialPageConnectHandler` | Save OAuth result, store encrypted token |
| `social-page-disconnect` | `SocialPageDisconnectHandler` | Soft-delete SocialPageRoot |
| `social-page-refresh-token` | `SocialPageRefreshTokenHandler` | Update encrypted token in-place |
| `scheduled-post-create` | `ScheduledPostCreateHandler` | Create post in DRAFT |
| `scheduled-post-schedule` | `ScheduledPostScheduleHandler` | DRAFT → SCHEDULED |
| `scheduled-post-cancel` | `ScheduledPostCancelHandler` | Cancel a SCHEDULED post |
| `scheduled-post-reschedule` | `ScheduledPostRescheduleHandler` | Move scheduled time |
| `scheduled-post-publish` | `ScheduledPostPublishHandler` | Internal: cron calls this, SCHEDULED → PUBLISHED/FAILED |
| `auto-reply-rule-create` | `AutoReplyRuleCreateHandler` | Create new rule (port, no AI yet) |
| `auto-reply-rule-update` | `AutoReplyRuleUpdateHandler` | Update rule content/keywords |
| `auto-reply-rule-delete` | `AutoReplyRuleDeleteHandler` | Delete rule |
| `comment-webhook-handle` | `CommentWebhookHandleHandler` | Process incoming comment event |

### 6.2 Queries

| Folder | Handler | Description |
|--------|---------|-------------|
| `social-page-get-list` | `SocialPageGetListHandler` | Get pages by enterpriseId |
| `scheduled-post-get-list` | `ScheduledPostGetListHandler` | Paginated post list with filters |
| `scheduled-post-get-by-id` | `ScheduledPostGetByIdHandler` | Single post detail |
| `auto-reply-rule-get-list` | `AutoReplyRuleGetListHandler` | Rules for a page |

### 6.3 Cron Job — PostPublishJob
**File**: `src/application/jobs/post-publish.job.ts`

```
@Cron('*/1 * * * *')
async handleCron() {
  const duePosts = await scheduledPostRepo.findDueForPublishing(new Date(), 50);
  for (const post of duePosts) {
    commandBus.execute(new ScheduledPostPublishCommand(post.id));
  }
}
```

- Uses `@nestjs/schedule` `@Cron` decorator
- `findDueForPublishing` query: `status = SCHEDULED AND scheduledAt <= NOW()`
- Limit 50 per tick; posts immediately set to PUBLISHING to avoid double-pick

---

## 7. Presentation Layer

### 7.1 Controllers
```
src/presentation/controllers/
  social-page.controller.ts         // /api/social-pages
  scheduled-post.controller.ts      // /api/scheduled-posts
  auto-reply-rule.controller.ts     // /api/auto-reply-rules
  facebook-webhook.controller.ts    // /api/webhooks/facebook
```

### 7.2 Facebook Webhook Endpoint

**GET /api/webhooks/facebook** — Webhook verification challenge (public)
- Reads hub.mode, hub.verify_token, hub.challenge
- Finds SocialPageRoot by webhookVerifyToken, responds with hub.challenge

**POST /api/webhooks/facebook** — Incoming events (public, IP guard recommended)
- Verifies X-Hub-Signature-256 HMAC with FACEBOOK_APP_SECRET
- Filters out events where from.id === page_id (infinite loop guard)
- Responds 200 OK immediately
- Dispatches CommentWebhookHandleCommand via CommandBus

**FacebookIpGuard**: validates request IP against Meta's documented IP ranges.
Configurable via env `FACEBOOK_WEBHOOK_IP_GUARD=true`.

---

## 8. Infrastructure Layer

### 8.1 Repositories (MongoDB)
```
src/infrastructure/mongo/repositories/
  social-page/
    social-page.repository.ts
    social-page.schema.ts
    social-page.mapper.ts          // encrypts/decrypts token here
  scheduled-post/
    scheduled-post.repository.ts
    scheduled-post.schema.ts
    scheduled-post.mapper.ts
  auto-reply-rule/
    auto-reply-rule.repository.ts
    auto-reply-rule.schema.ts
    auto-reply-rule.mapper.ts
```

Token encryption: SocialPageMapper uses `encrypt()`/`decrypt()` from
`src/shared/utils/crypto.util.ts` with dedicated env `SOCIAL_PAGE_TOKEN_SECRET`.

### 8.2 Facebook Platform Services
```
src/infrastructure/facebook/
  facebook.module.ts
  facebook-publisher.service.ts           // implements ISocialPublisher
  facebook-comment-replier.service.ts     // implements ICommentReplier
  facebook-token.service.ts               // token exchange helpers (short→long→page)
  facebook-graph-api.client.ts            // thin HTTP wrapper for Graph API calls
```

### 8.3 RabbitMQ Queues

| Queue | Producer | Consumer | Notes |
|-------|----------|----------|-------|
| `comment-webhook-queue` | FacebookWebhookController | CommentWebhookConsumer | High priority |
| `dlx-failed-queue` | RabbitMQ DLX | Manual ops review | Debugging/alerts |

### 8.4 Redis Keys

| Key Pattern | TTL | Purpose |
|-------------|-----|---------|
| `fb_comment:{commentId}` | 5 min | Deduplicate webhook retries |
| `fb_rate:{pageId}` | 1 hour | Token bucket per page for Graph API calls |

### 8.5 NestJS Module
```
src/infrastructure/modules/
  posting.module.ts   // registers all repositories, Facebook services, cron, consumers
```

---

## 9. Facebook OAuth Flow (Enterprise Page Connect)

Separate from KOL Facebook OAuth — this acquires Page Access Tokens.

1. **GET /api/social-pages/facebook/oauth**
   - Redirect to Facebook OAuth
   - Scopes: `pages_manage_posts`, `pages_read_engagement`, `pages_messaging`
   - `state` carries `enterpriseId + CSRF token`

2. **GET /api/social-pages/facebook/callback**
   - Exchange auth code → short-lived user token
   - Exchange → long-lived user token (60-day)
   - Call `GET /me/accounts` to list all pages the user manages
   - Return page list to frontend for selection

3. **POST /api/social-pages/facebook/connect**
   - Frontend sends selected `pageId`
   - Server calls `GET /{page-id}?fields=access_token` → permanent page token
   - Encrypt token with AES-256, save as new SocialPageRoot
   - Dispatch SocialPageConnectedEvent

---

## 10. Media Handling Best Practice

1. Enterprise uploads media (images/videos) via existing Cloudinary upload flow.
2. Cloudinary returns a `fileId` which is stored in `ScheduledPostRoot.mediaFileIds`.
3. At publish time, `ScheduledPostPublishHandler` resolves fileIds → Cloudinary CDN URLs.
4. CDN URLs are passed to Facebook Graph API for the post.

This keeps the post aggregate lean (no binary data) and reuses existing infrastructure.

---

## 11. Implementation Phases

### Phase 1 — Core Domain (Start here)
- [ ] `EPostStatus` enum
- [ ] `ESocialPlatformCode` enum
- [ ] `SocialPageRoot` aggregate + domain events
- [ ] `ScheduledPostRoot` aggregate + domain events
- [ ] `AutoReplyRuleRoot` aggregate (port)
- [ ] Repository interfaces + DI tokens
- [ ] Service port interfaces (ISocialPublisher, ICommentReplier)

### Phase 2 — Infrastructure & MongoDB
- [ ] Mongoose schemas + mappers for all 3 new aggregates
- [ ] Token encryption/decryption in SocialPageMapper
- [ ] FacebookGraphApiClient (thin HTTP wrapper via @nestjs/axios)
- [ ] FacebookPublisherService implements ISocialPublisher
- [ ] FacebookCommentReplierService implements ICommentReplier
- [ ] FacebookTokenService (OAuth token exchange helpers)
- [ ] PostingModule wiring

### Phase 3 — Application Layer
- [ ] All commands and handlers (§6.1)
- [ ] All queries and handlers (§6.2)
- [ ] PostPublishJob cron
- [ ] CommentWebhookConsumer (RabbitMQ consumer with dedup + rate-limit)

### Phase 4 — Presentation Layer
- [ ] SocialPageController
- [ ] ScheduledPostController
- [ ] AutoReplyRuleController
- [ ] FacebookWebhookController (GET challenge + POST events)
- [ ] FacebookIpGuard
- [ ] Facebook OAuth endpoints (§9)

### Phase 5 — Future (Out of Scope Now)
- AI-generated replies
- TikTok / Instagram implementations
- Inbox (DM) webhook support
- Analytics on reply rates
- Post templates

---

## 12. Key Conventions Summary

| Rule | Application |
|------|-------------|
| Enum values in `snake_case` | `EPostStatus.SCHEDULED = 'scheduled'` |
| Enum members in `SCREAMING_SNAKE_CASE` | `EPostStatus.SCHEDULED` |
| DI tokens as Symbol | `export const SOCIAL_PAGE_REPOSITORY = Symbol('SocialPageRepository')` |
| No `any` | All Graph API responses typed with explicit interfaces |
| DB field names `snake_case` | Mongoose schema: `social_page_id`, `scheduled_at` |
| TS code `camelCase` / `PascalCase` | Mappers translate between the two |
| Aggregate naming: `{Domain}Root` | `SocialPageRoot`, `ScheduledPostRoot` |
| Command naming: `{Feature}Command` | `ScheduledPostPublishCommand` |
| Handler naming: `{Feature}Handler` | `ScheduledPostPublishHandler` |
| Repository naming: `I{Name}Repository` | `ISocialPageRepository` |
