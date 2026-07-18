# Social Page & Scheduled Post Domain

> **Last Updated**: 2026-07-18
> **Related Docs**: [`docs/domain/campaign-domain.md`](./campaign-domain.md), [`docs/domain/enterprise-domain.md`](./enterprise-domain.md), [`docs/refactor/social-network.md`](../refactor/social-network.md)

---

## 1. Domain Overview

The **Social Page & Scheduled Post** domain manages the connection of enterprise social media accounts (Facebook, Threads, TikTok, Instagram) and the lifecycle of scheduled content posting. It implements a **strategy pattern** via connectors and publishers, making it extensible for future platform integrations.

### Bounded Context

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                 Social Page & Scheduled Post Context                         │
│                                                                              │
│  ┌──────────────────────────────────────────────┐                            │
│  │             SocialPageRoot                    │                            │
│  │  enterpriseId | platformCode | pageId         │                            │
│  │  encryptedToken | tokenExpiresAt | isActive   │                            │
│  │  webhookVerifyToken | pictureUrl              │                            │
│  └────────────────────────────────┬─────────────┘                            │
│                                   │                                          │
│                                   │ has many                                 │
│                                   ▼                                          │
│  ┌──────────────────────────────────────────────┐                            │
│  │          ScheduledPostRoot                    │                            │
│  │  socialPageId | platformCode | content        │                            │
│  │  mediaFileIds | scheduledAt | status          │                            │
│  │  publishedAt | platformPostId | campaignId?   │                            │
│  └──────────────────────────────────────────────┘                            │
│                                   │                                          │
│                                   │ has many                                 │
│                                   ▼                                          │
│  ┌──────────────────────────────────────────────┐                            │
│  │        AutoReplyRuleRoot                      │                            │
│  │  socialPageId | keywords[] | replyContent     │                            │
│  │  isEnabled | name                             │                            │
│  └──────────────────────────────────────────────┘                            │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │  Connector / Publisher Strategy Layer (platform-agnostic)        │       │
│  │                                                                  │       │
│  │  ┌────────────┐  ┌──────────┐  ┌───────────┐  ┌───────────┐     │       │
│  │  │  Facebook  │  │ Threads  │  │  TikTok   │  │ Instagram │     │       │
│  │  │ Connector │  │Connector │  │ Connector │  │ Connector │     │       │
│  │  │ Publisher │  │Publisher │  │ Publisher │  │ Publisher │     │       │
│  │  └────────────┘  └──────────┘  └───────────┘  └───────────┘     │       │
│  │                                                                  │       │
│  │  ┌──────────────────────────────────────────────────────┐       │       │
│  │  │  ISocialPageConnectorFactory.findByCode(code)        │       │       │
│  │  │  ISocialPublisherDiscovery.findByCode(code)          │       │       │
│  │  └──────────────────────────────────────────────────────┘       │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│  ┌────────────────────────────────────┐   ┌────────────────────────────┐   │
│  │       Post Lifecycle               │   │    RMQ / Outbox Flow       │   │
│  │  DRAFT → SCHEDULED → PUBLISHING    │   │  PostScheduledEvent ─────────▶│   │
│  │               ↘ FAILED ↙           │   │  PostPublishedEvent ────────▶│   │
│  │  CANCELLED ← → (reschedule)        │   │  PostFailedEvent ───────────▶│   │
│  └────────────────────────────────────┘   └────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Key Concepts

| Concept | Description |
|---------|-------------|
| **SocialPageRoot** | Aggregate root representing a connected social media page (Facebook page, Threads account, TikTok account, etc.) |
| **ScheduledPostRoot** | Aggregate root for a scheduled content post to be published on a social page |
| **AutoReplyRuleRoot** | Aggregate root for keyword-triggered auto-reply rules on connected social pages |
| **ISocialPageConnector** | Strategy interface for platform-specific OAuth flows (exchange code, get pages, refresh tokens) |
| **ISocialPublisher** | Strategy interface for platform-specific post publishing |
| **ICommentReplier** | Strategy interface for platform-specific comment auto-reply |
| **Connector Factory** | `SocialPageConnectorFactoryService` — resolves connector by platform code |
| **Publisher Discovery** | `SocialPublisherDiscoveryService` — resolves publisher by platform code |
| **Platform Code** | `ESocialPlatformCode` — `facebook`, `threads`, `tiktok`, `instagram` |
| **Webhook Verify Token** | Random token generated per social page for platform webhook verification |

### Platform Strategy Architecture

```
                               ┌─────────────────────────────────────────────┐
                               │   SocialPageConnectorFactory                │
                               │  findByCode('facebook') → FacebookConnector │
                               │  findByCode('threads')  → ThreadsConnector  │
                               │  findByCode('tiktok')   → TiktokConnector   │
                               │  findByCode('instagram')→ InstagramConnector│
                               └─────────────────────────────────────────────┘
                                            │                    ▲
                        register('facebook')│                    │ lookup
                                            ▼                    │
                               ┌─────────────────────────────────┴───┐
                               │  ISocialPageConnector               │
                               │  ┌─────────────────────────────┐    │
                               │  │ exchangeCodeForToken()       │    │
                               │  │ exchangeForLongLivedToken()  │    │
                               │  │ getUserAccounts()            │    │
                               │  │ getPageDetails()             │    │
                               │  └─────────────────────────────┘    │
                               └─────────────────────────────────────┘

                               ┌─────────────────────────────────────────────┐
                               │   SocialPublisherDiscoveryService           │
                               │  findByCode('facebook') → FBPublisher       │
                               │  findByCode('threads')  → ThreadsPublisher  │
                               └─────────────────────────────────────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────────────────────────┐
                               │  ISocialPublisher                           │
                               │  ┌─────────────────────────────┐            │
                               │  │ publishPost({ pageToken,    │            │
                               │  │   pageId, content, media }) │            │
                               │  └─────────────────────────────┘            │
                               └─────────────────────────────────────────────┘
```

### Relations to Other Domains

- **Enterprise**: Social pages belong to an enterprise via `enterpriseId`
- **Campaign**: Scheduled posts can be linked to campaigns via `campaignId`; campaign schedule timeline references `ScheduledPost` IDs
- **Platform**: `platformId` references the Platform aggregate; `platformCode` is the logical key
- **UploadedFile**: `mediaFileIds[]` reference uploaded media files for posts
- **User**: `createdBy` tracks who created the scheduled post

---

## 2. Core Layer

### 2.1 Aggregate Root: `SocialPageRoot`

**File**: `src/core/aggregate-roots/social-page.aggregate.ts`

#### Properties (`SocialPageProps`)

| Property | Type | Description |
|----------|------|-------------|
| `enterpriseId` | `string` | Owning enterprise |
| `platformId` | `string` | FK to Platform aggregate |
| `platformCode` | `string` | Logical code: `facebook`, `threads`, `tiktok`, `instagram` |
| `pageId` | `string` | Platform-native page ID |
| `pageName` | `string` | Display name on the platform |
| `pictureUrl` | `Nullable<string>` | Page profile picture URL |
| `followerCount` | `Nullable<number>` | Current follower count |
| `encryptedToken` | `string` | Encrypted long-lived access token |
| `tokenExpiresAt` | `Nullable<Date>` | Token expiration timestamp |
| `webhookVerifyToken` | `string` | Random verify token for platform webhooks |
| `isActive` | `boolean` | Whether the page is active & connected |
| `deleteAt` / `deleteBy` | `Nullable<Date>` / `Nullable<string>` | Soft-delete metadata |

#### Factory Methods

| Method | Description |
|--------|-------------|
| `create(props, id?)` | Creates a new social page with auto-generated webhook verify token. Raises `SocialPageConnectedEvent`. |
| `instantiate(id, props)` | Reconstitutes from persistence |

#### Domain Methods

| Method | Description | Raises Event |
|--------|-------------|-------------|
| `deactivate()` | Sets `isActive = false` | — |
| `activate()` | Sets `isActive = true` | — |
| `updateToken(encryptedToken, tokenExpiresAt?)` | Updates encrypted access token | — |
| `updatePageInfo(pageName, pictureUrl?, followerCount?)` | Updates page metadata from platform | — |
| `softDelete(deletedBy)` | Soft-deletes + deactivates | — |
| `restore()` | Restores + reactivates | — |

### 2.2 Aggregate Root: `ScheduledPostRoot`

**File**: `src/core/aggregate-roots/scheduled-post.aggregate.ts`

#### Properties (`ScheduledPostProps`)

| Property | Type | Description |
|----------|------|-------------|
| `enterpriseId` | `string` | Owning enterprise |
| `socialPageId` | `string` | Target social page ID |
| `campaignId` | `string` (optional) | Linked campaign (if any) |
| `platformCode` | `string` | Platform code extracted from social page |
| `content` | `string` | Post content/text |
| `mediaFileIds` | `string[]` | Uploaded media file IDs |
| `scheduledAt` | `Date` | Scheduled publish time |
| `status` | `EPostStatus` | Current lifecycle status |
| `publishedAt` | `Nullable<Date>` | Actual publish time |
| `platformPostId` | `Nullable<string>` | Platform-native post ID after publish |
| `failReason` | `Nullable<string>` | Failure reason if publishing failed |
| `createdBy` | `string` | User who created the post |

#### Factory Methods

| Method | Description |
|--------|-------------|
| `create(props, id?)` | Creates new post in `DRAFT` status |
| `instantiate(id, props)` | Reconstitutes from persistence |

#### Domain Methods

| Method | Description | Raises Event |
|--------|-------------|-------------|
| `schedule(scheduledAt)` | Transitions to `SCHEDULED`; validates future time | ✅ `PostScheduledEvent` |
| `markPublishing()` | Transitions to `PUBLISHING` | — |
| `markPublished(platformPostId, publishedAt?)` | Marks as `PUBLISHED` with platform post ID | ✅ `PostPublishedEvent` |
| `markFailed(reason)` | Marks as `FAILED` with reason | ✅ `PostFailedEvent` |
| `cancel()` | Transitions to `CANCELLED` (only from DRAFT/SCHEDULED) | — |
| `reschedule(newTime)` | Re-schedules to new future time (from FAILED/SCHEDULED/CANCELLED) | ✅ `PostScheduledEvent` |

### 2.3 Aggregate Root: `AutoReplyRuleRoot`

**File**: `src/core/aggregate-roots/auto-reply-rule.aggregate.ts`

#### Properties (`AutoReplyRuleProps`)

| Property | Type | Description |
|----------|------|-------------|
| `enterpriseId` | `string` | Owning enterprise |
| `socialPageId` | `string` | Target social page ID |
| `name` | `string` | Rule display name |
| `isEnabled` | `boolean` | Whether the rule is active |
| `keywords` | `string[]` | Trigger keywords (empty = fallback rule) |
| `replyContent` | `string` | Content to reply with |

#### Factory Methods

| Method | Description |
|--------|-------------|
| `create(props, id?)` | Creates new rule, defaults `isEnabled = true` |
| `instantiate(id, props)` | Reconstitutes from persistence |

#### Domain Methods

| Method | Description |
|--------|-------------|
| `enable()` | Activates the rule |
| `disable()` | Deactivates the rule |
| `updateRule(name?, keywords?, replyContent?)` | Updates rule fields |

### 2.4 Enums

#### `ESocialPlatformCode` (`src/core/enums/social-platform-code.enum.ts`)

| Member | Value | Description | Implementation Status |
|--------|-------|-------------|----------------------|
| `FACEBOOK` | `'facebook'` | Facebook pages | ✅ **Implemented** |
| `THREADS` | `'threads'` | Threads accounts | ✅ **Implemented** |
| `TIKTOK` | `'tiktok'` | TikTok accounts | 🔜 Planned |
| `INSTAGRAM` | `'instagram'` | Instagram accounts | 🔜 Planned |

#### `EPostStatus` (`src/core/enums/post-status.enum.ts`)

| Member | Value | Description |
|--------|-------|-------------|
| `DRAFT` | `'draft'` | Initial editable state |
| `SCHEDULED` | `'scheduled'` | Awaiting publish time |
| `PUBLISHING` | `'publishing'` | Currently being published |
| `PUBLISHED` | `'published'` | Successfully published |
| `FAILED` | `'failed'` | Publishing failed |
| `CANCELLED` | `'cancelled'` | Cancelled by user |

#### `ESchedulePostStatus` (`src/core/enums/schedule-post-status.enum.ts`)

> **Note**: This enum (`DRAFT`, `APPROVED`, `NEEDS_REVIEW`, `REJECTED`) is **deprecated/legacy** — all scheduling now uses `EPostStatus`. Remains for backward compatibility with campaign entity references.

### 2.5 Strategy Interfaces

#### `ISocialPageConnector`

**File**: `src/core/interfaces/services/social-page-connector.interface.ts`

| Method | Returns | Description |
|--------|---------|-------------|
| `getPlatformCode()` | `ESocialPlatformCode` | Identifies which platform |
| `exchangeCodeForToken(code, redirectUri)` | `Promise<string>` | OAuth code → short-lived user token |
| `exchangeForLongLivedToken(token)` | `Promise<string>` | Short-lived → long-lived token |
| `getUserAccounts(token)` | `Promise<ISocialPageAccount[]>` | List pages/accounts manageable with token |
| `getPageDetails(pageToken, pageId)` | `Promise<ISocialPageDetails>` | Fetch page details (name, followers, picture) |

#### `ISocialPublisher`

**File**: `src/core/interfaces/services/social-publisher.interface.ts`

| Method | Returns | Description |
|--------|---------|-------------|
| `publishPost({ pageToken, pageId, content, mediaUrls })` | `Promise<{ platformPostId }>` | Publish content to platform |

#### `ICommentReplier`

**File**: `src/core/interfaces/services/comment-replier.interface.ts`

| Method | Returns | Description |
|--------|---------|-------------|
| `replyToComment({ pageToken, commentId, message })` | `Promise<{ replyId }>` | Reply to a comment on a platform post |

### 2.6 Domain Events

| Event | File | Trigger | Payload |
|-------|------|---------|---------|
| `SocialPageConnectedEvent` | `src/core/events/social-page-connected.domain-event.ts` | `SocialPageRoot.create()` | `socialPageId`, `enterpriseId`, `platformCode`, `pageId`, `pageName` |
| `ThreadsOAuthInitiatedEvent` | `src/core/events/threads-oauth-initiated.domain-event.ts` | Threads OAuth flow start | `enterpriseId`, `userId` |
| `ThreadsConnectedEvent` | `src/core/events/threads-connected.domain-event.ts` | Threads page connected | `socialPageId`, `enterpriseId`, `threadsUserId`, `threadsUsername` |
| `PostScheduledEvent` | `src/core/events/post-scheduled.domain-event.ts` | `ScheduledPostRoot.schedule()` / `.reschedule()` | `postId`, `enterpriseId`, `socialPageId`, `scheduledAt` |
| `PostPublishedEvent` | `src/core/events/post-published.domain-event.ts` | `ScheduledPostRoot.markPublished()` | `postId`, `enterpriseId`, `socialPageId`, `platformPostId`, `publishedAt` |
| `PostFailedEvent` | `src/core/events/post-failed.domain-event.ts` | `ScheduledPostRoot.markFailed()` | `postId`, `enterpriseId`, `socialPageId`, `failReason`, `failedAt` |

### 2.7 Domain Exceptions

| Exception | File | Trigger |
|-----------|------|---------|
| `InvalidOperationException` | `src/core/exceptions/general.exception.ts` | Invalid status transitions on scheduled post (wrong state for schedule/publish/cancel) |

---

## 3. State Machines

### 3.1 Scheduled Post Status

```
                    ┌──────────┐
                    │  DRAFT   │
                    └────┬─────┘
                         │ schedule(scheduledAt)
                         ▼
                   ┌────────────┐
                   │ SCHEDULED  │◄──────────────┐
                   └─────┬──────┘               │
                         │                      │
              ┌──────────┼──────────┐           │
              │          │          │           │
     publish()│  cancel()│          │ reschedule(newTime)
              ▼          ▼          │           │
        ┌──────────┐ ┌──────────┐   │           │
        │PUBLISHING│ │CANCELLED │   │           │
        └─────┬────┘ └──────────┘   │           │
              │                     │           │
     ┌────────┼────────┐            │           │
     │        │        │            │           │
     ▼        ▼        ▼            │           │
  ┌──────┐ ┌──────┐ ┌──────┐       │           │
  │PUB-  │ │FAILED│ │     │        │           │
  │LISHED│ └──┬───┘ │     │        │           │
  └──────┘   │     │     │        │           │
             └─────┴─────┴────────┘───────────┘
                  reschedule(newTime)
```

#### Transition Table

| From | To | Method | Conditions |
|------|----|--------|------------|
| `DRAFT` | `SCHEDULED` | `schedule(scheduledAt)` | `scheduledAt` must be in the future |
| `DRAFT` | `CANCELLED` | `cancel()` | Allowed from DRAFT |
| `SCHEDULED` | `PUBLISHING` | `markPublishing()` | Auto-called by publish job |
| `SCHEDULED` | `CANCELLED` | `cancel()` | Allowed from SCHEDULED |
| `SCHEDULED` | `PUBLISHED` | `markPublished()` | If publish job completes directly |
| `PUBLISHING` | `PUBLISHED` | `markPublished()` | Platform returned success |
| `PUBLISHING` | `FAILED` | `markFailed(reason)` | Platform returned error |
| `FAILED` | `SCHEDULED` | `reschedule(newTime)` | Re-schedule for retry |
| `SCHEDULED` | `SCHEDULED` | `reschedule(newTime)` | Change publish time |
| `CANCELLED` | `SCHEDULED` | `reschedule(newTime)` | Re-activate cancelled post |

#### Guard Constraints

- `schedule()` / `reschedule()` require `scheduledAt > now()`
- `cancel()` only allowed from `DRAFT` or `SCHEDULED`
- `markPublished()` / `markFailed()` only allowed from `PUBLISHING` or `SCHEDULED`

### 3.2 Social Page Lifecycle

```
                ┌──────────┐
                │  ACTIVE  │
                │ (isActive│
                │  = true) │
                └────┬─────┘
                     │
            softDelete() / deactivate()
                     │
                     ▼
                ┌───────────┐
                │ INACTIVE  │
                │ (isActive │
                │  = false) │
                └─────┬─────┘
                      │
                  restore() / activate()
                      │
                      ▼
                ┌──────────┐
                │  ACTIVE  │
                └──────────┘
```

### 3.3 Auto-Reply Rule Lifecycle

Auto-reply rules have a simple binary lifecycle — they are either **enabled** or **disabled** — with no complex state machine. The matching logic is:

1. Rules with **non-empty keywords** evaluated first (case-insensitive `includes` match)
2. A rule with **empty keywords** acts as a fallback (matches any uncaptured comment)
3. **First matching rule wins** (deterministic ordering)

---

## 4. Application Layer

The Application layer implements CQRS with separate commands (write-side) and queries (read-side).

### 4.1 Social Page Commands

| Command | Handler | DTO | Uses UoW | Emits Events | Description |
|---------|---------|-----|----------|-------------|-------------|
| `SocialPageConnectCommand` | `SocialPageConnectHandler` | `SocialPageConnectInputDto` | ✅ (start/commit) | ✅ | Connect/upsert a single social page. Validates token via platform connector. |
| `SocialPageBulkConnectCommand` | `SocialPageBulkConnectHandler` | `SocialPageBulkConnectInputDto` | ✅ (execute) | ✅ | Fetch all pages from a platform token, upsert each. Resolves `platformId` internally. |
| `SocialPageDisconnectCommand` | `SocialPageDisconnectHandler` | — | ✅ (start/commit) | ✅ | Soft-delete a social page. Validates enterprise ownership. |
| `SocialPageRefreshTokenCommand` | `SocialPageRefreshTokenHandler` | — | ✅ (start/commit) | — | Refresh a page's access token via the connector, sync page details. |

### 4.2 Scheduled Post Commands

| Command | Handler | DTO | Uses UoW | Emits Events | Description |
|---------|---------|-----|----------|-------------|-------------|
| `ScheduledPostCreateCommand` | `ScheduledPostCreateHandler` | `ScheduledPostCreateInputDto` | ✅ (execute) | ✅ | Create post (DRAFT) and optionally schedule it. Validates page ownership. |
| `ScheduledPostCreateAndPublishCommand` | `ScheduledPostCreateAndPublishHandler` | `ScheduledPostCreateAndPublishInputDto` | ✅ (execute) | ❌ (intentionally skipped) | [TEST] Create post then immediately call `ScheduledPostPublishCommand`. Bypasses event outbox. |
| `ScheduledPostPublishCommand` | `ScheduledPostPublishHandler` | — | ✅ (execute, multi-step) | ✅ | **Multi-step publish**: mark PUBLISHING → publish via platform → mark PUBLISHED/FAILED. |
| `ScheduledPostCancelCommand` | `ScheduledPostCancelHandler` | — | ✅ (start/commit) | ✅ | Cancel a DRAFT or SCHEDULED post. |
| `ScheduledPostRescheduleCommand` | `ScheduledPostRescheduleHandler` | — | ✅ (start/commit) | ✅ | Reschedule a post (FAILED/SCHEDULED/CANCELLED → SCHEDULED). |
| `ScheduledPostScheduleCommand` | `ScheduledPostScheduleHandler` | — | ✅ (start/commit) | ✅ | Transition a DRAFT post to SCHEDULED. |

### 4.3 Auto-Reply Rule Commands

| Command | Handler | DTO | Uses UoW | Emits Events | Description |
|---------|---------|-----|----------|-------------|-------------|
| `AutoReplyRuleCreateCommand` | `AutoReplyRuleCreateHandler` | `AutoReplyRuleCreateInputDto` | ✅ (execute) | — | Create a new auto-reply rule for a social page. |
| `AutoReplyRuleUpdateCommand` | `AutoReplyRuleUpdateHandler` | `AutoReplyRuleUpdateInputDto` | ✅ (start/commit) | — | Update an existing auto-reply rule. |
| `AutoReplyRuleDeleteCommand` | `AutoReplyRuleDeleteHandler` | — | ✅ (start/commit) | — | Delete an auto-reply rule. |

### 4.4 Other Commands

| Command | Handler | Uses UoW | Description |
|---------|---------|----------|-------------|
| `CommentWebhookHandleCommand` | `CommentWebhookHandleHandler` | ❌ | Process incoming comment webhook → find matching auto-reply rule → reply via platform. Includes infinite loop guard (drops self-comments). |

### 4.5 Queries

| Query | Handler | Description |
|-------|---------|-------------|
| `SocialPageGetListQuery` | `SocialPageGetListHandler` | Get all social pages for an enterprise. Reads from repository. |
| `ScheduledPostGetListQuery` | `ScheduledPostGetListHandler` | Get all scheduled posts for an enterprise. |
| `ScheduledPostGetByIdQuery` | `ScheduledPostGetByIdHandler` | Get a single post by ID. Validates enterprise ownership. |
| `AutoReplyRuleGetListQuery` | `AutoReplyRuleGetListHandler` | Get all auto-reply rules for a social page. Validates page ownership. |

### 4.6 Mappers & DTOs

| Artifact | File |
|----------|------|
| `SocialPageDto` | `src/application/dtos/social-page.dto.ts` — `id`, `enterpriseId`, `platformId`, `platformCode`, `pageId`, `pageName`, `pictureUrl`, `followerCount`, `webhookVerifyToken`, `isActive`, timestamps |
| `ScheduledPostDto` | `src/application/dtos/scheduled-post.dto.ts` — `id`, `enterpriseId`, `socialPageId`, `campaignId?`, `platformCode`, `content`, `mediaFileIds`, `scheduledAt`, `status`, `publishedAt`, `platformPostId`, `failReason`, `createdBy`, timestamps |
| `AutoReplyRuleDto` | `src/application/dtos/auto-reply-rule.dto.ts` — `id`, `enterpriseId`, `socialPageId`, `name`, `isEnabled`, `keywords`, `replyContent`, timestamps |
| `SocialPageMapper` | `src/application/mappers/social-page.mapper.ts` — `toDto()`, `toListDto()` |
| `ScheduledPostMapper` | `src/application/mappers/scheduled-post.mapper.ts` — `toDto()`, `toListDto()` |
| `AutoReplyRuleMapper` | `src/application/mappers/auto-reply-rule.mapper.ts` — `toDto()`, `toListDto()` |
| `EventMapper` | `src/application/mappers/event.mapper.ts` — Maps `PostScheduledEvent` → `PostScheduledIntegrationEvent` (RMQ: `post.scheduled`). `SocialPageConnectedEvent`, `PostPublishedEvent`, `PostFailedEvent` return `[]` (not currently mapped to integration events). |

### 4.7 Command Flow Architecture

The **ScheduledPostPublishHandler** demonstrates the most complex flow — a **multi-step UoW pattern**:

```
Controller.receive(postId)
  │
  ▼
ScheduledPostPublishHandler.execute()
  │
  ├─ Step 1: uow.execute()
  │   ├─ Load post
  │   ├─ post.markPublishing()
  │   └─ repo.save(post)
  │
  ├─ Step 2 (outside UoW):
  │   ├─ Fetch socialPage → get token
  │   ├─ Fetch uploadedFiles → get media URLs
  │   └─ publisher.publishPost({ token, content, media })
  │
  └─ Step 3: uow.execute()
      ├─ post.markPublished(postId) or post.markFailed(reason)
      ├─ repo.save(post)
      └─ eventService.publishEvents(post)
```

This pattern ensures:
- **Step 1** prevents double-processing (idempotency)
- **Step 2** runs outside any transaction (external API call, may be slow)
- **Step 3** persists the final result and emits integration events via the outbox

### 4.8 RMQ Integration Event Flow

```
ScheduledPostRoot.schedule()     ScheduledPostRoot.markPublished()    ScheduledPostRoot.markFailed()
       │                                 │                                   │
       ▼                                 ▼                                   ▼
PostScheduledEvent              PostPublishedEvent               PostFailedEvent
       │                                 │                                   │
       ▼                                 ▼                                   ▼
EventMapper.mapToIntegrationEvent()
       │
       ▼
PostScheduledIntegrationEvent (RMQ transport: exchange=kpi_exchange, routingKey=post.scheduled)
       │
       ▼
Outbox → RabbitMQ
  queue: scheduled_post_queue
  pattern: post.scheduled
       │
       ▼
ScheduledPostRmqController
  handlePostScheduled(data)
       │
       ▼
CommandBus.execute(new ScheduledPostPublishCommand(postId))
```

**Note**: `SocialPageConnectedEvent`, `PostPublishedEvent`, and `PostFailedEvent` are currently **not mapped** to integration events in `EventMapper` (return `[]`). This means only `PostScheduledEvent` triggers an outbox/RMQ flow.

### 4.9 DI Tokens

| Token | Type |
|-------|------|
| `SOCIAL_PAGE_REPOSITORY` | `ISocialPageRepository` |
| `SCHEDULED_POST_REPOSITORY` | `IScheduledPostRepository` |
| `AUTO_REPLY_RULE_REPOSITORY` | `IAutoReplyRuleRepository` |
| `SOCIAL_PAGE_CONNECTORS` | `Record<string, ISocialPageConnector>` |
| `SOCIAL_PAGE_CONNECTOR_FACTORY` | `ISocialPageConnectorFactory` |
| `SOCIAL_PUBLISHERS` | `Record<string, ISocialPublisher>` |
| `SOCIAL_PUBLISHER_DISCOVERY` | `ISocialPublisherDiscovery` |
| `COMMENT_REPLIERS` | `Record<string, ICommentReplier>` |
| `COMMENT_REPLIER_DISCOVERY` | `ICommentReplierDiscovery` |

---

## 5. Infrastructure Layer

The Infrastructure layer contains all framework adapters, organized under the `social-network/` directory structure:

```
src/infrastructure/social-network/
├── facebook/          ← Facebook platform implementation
├── threads/           ← Threads platform implementation
├── common/            ← Platform-agnostic orchestration
│   ├── factories/     ← Connector + Publisher + Replier discovery services
│   ├── jobs/          ← Post publishing cron job
│   └── social-network.module.ts
└── (instagram/, tiktok/ — future)
```

Mongoose schemas and repositories remain in `infrastructure/mongo/` — they are persistence concerns, not platform concerns.

### 5.1 Mongoose Schemas

#### `SocialPageModel` (`src/infrastructure/mongo/schemas/social-page.schema.ts`)

**Collection**: `social_pages`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `ObjectId` | Primary key |
| `enterprise_id` | `ObjectId` (ref: EnterpriseModel) | Owning enterprise |
| `platform_id` | `ObjectId` (ref: PlatformModel) | Platform reference |
| `platform_code` | `String` | `facebook`, `threads`, `tiktok`, `instagram` |
| `page_id` | `String` | Platform-native page ID |
| `page_name` | `String` | Page display name |
| `picture_url` | `String?` | Profile picture URL |
| `follower_count` | `Number?` | Follower count |
| `encrypted_token` | `String` | AES-encrypted access token |
| `token_expires_at` | `Date?` | Token expiry |
| `webhook_verify_token` | `String` | Webhook verification token |
| `is_active` | `Boolean` | `true` = connected |
| `delete_at` / `delete_by` | `Date?` / `String?` | Soft-delete metadata |

**Plugins**: `softDeletePlugin`

#### `ScheduledPostModel` (`src/infrastructure/mongo/schemas/scheduled-post.schema.ts`)

**Collection**: `scheduled_posts`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `ObjectId` | Primary key |
| `enterprise_id` | `ObjectId` (ref: EnterpriseModel) | Owning enterprise |
| `social_page_id` | `ObjectId` (ref: SocialPageModel) | Target social page |
| `campaign_id` | `ObjectId?` (ref: CampaignModel) | Linked campaign |
| `platform_code` | `String` | Platform code |
| `content` | `String` | Post content |
| `media_file_ids` | `String[]` | Uploaded file IDs |
| `scheduled_at` | `Date` | Scheduled publish time |
| `status` | `String` (enum: EPostStatus) | Lifecycle status |
| `published_at` | `Date?` | Actual publish time |
| `platform_post_id` | `String?` | Platform post ID |
| `fail_reason` | `String?` | Failure reason |
| `created_by` | `ObjectId` (ref: UserModel) | Creator |
| `delete_at` / `delete_by` | `Date?` / `String?` | Soft-delete metadata |

**Plugins**: `softDeletePlugin`

#### `AutoReplyRuleModel` (`src/infrastructure/mongo/schemas/auto-reply-rule.schema.ts`)

**Collection**: `auto_reply_rules`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `ObjectId` | Primary key |
| `enterprise_id` | `ObjectId` (ref: EnterpriseModel) | Owning enterprise |
| `social_page_id` | `ObjectId` (ref: SocialPageModel) | Target social page |
| `name` | `String` | Rule display name |
| `is_enabled` | `Boolean` | Whether rule is active |
| `keywords` | `String[]` | Trigger keywords (empty = fallback) |
| `reply_content` | `String` | Reply text |
| `delete_at` / `delete_by` | `Date?` / `String?` | Soft-delete metadata |

**Plugins**: `softDeletePlugin`

### 5.2 Repositories

#### `MongoSocialPageRepository`

**File**: `src/infrastructure/mongo/repositories/social-page.repository.ts`

| Method | Description |
|--------|-------------|
| `findById(id)` | Find by primary key |
| `findByPageId(platformCode, pageId)` | Find by platform code + native page ID (upsert key) |
| `findByEnterpriseId(enterpriseId)` | List all pages for an enterprise |
| `findByWebhookVerifyToken(verifyToken)` | Find by webhook verify token |
| `save(socialPage)` | Insert or upsert; encrypts token transparently |
| `saveMany(socialPages)` | Batch save |
| `delete(id)` | Hard delete |

**Token Encryption**: The repository transparently encrypts/decrypts `encrypted_token` using `encrypt()` / `decrypt()` from `@/shared/utils/crypto.util` with `SOCIAL_PAGE_TOKEN_SECRET` environment variable.

#### `MongoScheduledPostRepository`

**File**: `src/infrastructure/mongo/repositories/scheduled-post.repository.ts`

| Method | Description |
|--------|-------------|
| `findById(id)` | Find by primary key |
| `findDueForPublishing(now, limit)` | Find SCHEDULED posts where `scheduled_at <= now` (polled by publish job) |
| `findByEnterpriseId(enterpriseId)` | List all posts for an enterprise |
| `save(scheduledPost)` | Insert or upsert |
| `saveMany(scheduledPosts)` | Batch save |
| `delete(id)` | Hard delete |

#### `MongoAutoReplyRuleRepository`

**File**: `src/infrastructure/mongo/repositories/auto-reply-rule.repository.ts`

| Method | Description |
|--------|-------------|
| `findById(id)` | Find by primary key |
| `findActiveByPageId(socialPageId)` | Find active rules for a page (used by comment webhook) |
| `findByPageId(socialPageId)` | Find all rules for a page |
| `save(rule)` | Insert or upsert |
| `saveMany(rules)` | Batch save |
| `delete(id)` | Hard delete |

### 5.3 Strategy Implementations

#### Facebook Connector (`src/infrastructure/social-network/facebook/facebook-social-page-connector.service.ts`)

Implements `ISocialPageConnector` with:
- `getPlatformCode()` → `ESocialPlatformCode.FACEBOOK`
- `exchangeCodeForToken(code, redirectUri)` — Facebook OAuth code → short-lived user token
- `exchangeForLongLivedToken(token)` — Facebook `/oauth/access_token?grant_type=fb_exchange_token` → 60-day token
- `getUserAccounts(token)` — Facebook `/me/accounts` → list of manageable pages
- `getPageDetails(pageToken, pageId)` — Facebook `/{page-id}?fields=name,picture,access_token,followers_count`

#### Facebook Publisher (`src/infrastructure/social-network/facebook/facebook-publisher.service.ts`)

Implements `ISocialPublisher` with:
- `publishPost({ pageToken, pageId, content, mediaUrls })` — Facebook `/{page-id}/feed` or `/{page-id}/photos`/`/{page-id}/videos`

#### Facebook Comment Replier (`src/infrastructure/social-network/facebook/facebook-comment-replier.service.ts`)

Implements `ICommentReplier` with:
- `replyToComment({ pageToken, commentId, message })` — Facebook `/{comment-id}/comments`

#### Threads Connector (`src/infrastructure/social-network/threads/threads-social-page-connector.service.ts`)

Implements `ISocialPageConnector` with:
- `getPlatformCode()` → `ESocialPlatformCode.THREADS`
- `exchangeCodeForToken(code, redirectUri)` — Threads OAuth code → short-lived token
- `exchangeForLongLivedToken(token)` — `GET /access_token?grant_type=th_exchange_token` → 60-day token
- `getUserAccounts(token)` — Threads is user-level (no "pages"); fetches user profile as single account
- `getPageDetails(pageToken, pageId)` — Threads `/{user-id}?fields=id,username,name,threads_profile_picture_url`

> **Key difference**: Threads is user-account based, not page-based. `getUserAccounts()` returns a single-entry array with the authenticated user.

#### Threads Publisher (`src/infrastructure/social-network/threads/threads-publisher.service.ts`)

Implements `ISocialPublisher` with a two-step container model:
- **Text posts**: Create TEXT container → Publish container
- **Image posts**: Create IMAGE container → Publish container
- **Video posts**: Create VIDEO container → Poll container status (up to 60s) → Publish container

**Constraints**: Max 500 characters, single image/video only (carousel not yet implemented).

### 5.4 Strategy Wiring: `SocialNetworkModule`

**File**: `src/infrastructure/social-network/common/social-network.module.ts`

The `SocialNetworkModule` replaces the previous `PostingModule` and wires all platforms and orchestration:

```typescript
@Module({
  imports: [CqrsModule, FacebookModule, ThreadsModule],
  controllers: [
    SocialPageController, ScheduledPostController,
    AutoReplyRuleController, FacebookWebhookController,
    ThreadsOAuthController,
  ],
  providers: [
    // Strategy registry — platform services registered as multi-provider maps
    {
      provide: SOCIAL_PUBLISHERS,
      inject: [FacebookPublisherService, ThreadsPublisherService],
      useFactory: (fb, thr) => ({ facebook: fb, threads: thr }),
    },
    {
      provide: SOCIAL_PAGE_CONNECTORS,
      inject: [FacebookSocialPageConnectorService, ThreadsSocialPageConnectorService],
      useFactory: (fb, thr) => ({ facebook: fb, threads: thr }),
    },
    {
      provide: COMMENT_REPLIERS,
      inject: [FacebookCommentReplierService],
      useFactory: (fb) => ({ facebook: fb }),
    },
    // Discovery services
    { provide: SOCIAL_PUBLISHER_DISCOVERY, useClass: SocialPublisherDiscoveryService },
    { provide: SOCIAL_PAGE_CONNECTOR_FACTORY, useClass: SocialPageConnectorFactoryService },
    { provide: COMMENT_REPLIER_DISCOVERY, useClass: CommentReplierDiscoveryService },
    // Jobs, guards, handlers...
    PostPublishJob, CommentWebhookConsumer, StateAuthGuard,
    ...allHandlers, ScheduledPostRmqController,
  ],
})
export class SocialNetworkModule {}
```

To add a new platform:
1. Create `social-network/<platform>/` with its own module implementing `ISocialPageConnector` + `ISocialPublisher` (± `ICommentReplier`)
2. Import its module and register its services in `SocialNetworkModule`'s provider factories
3. **No code outside `social-network/` changes**

### 5.5 Scheduled Post Publish Job (`src/infrastructure/social-network/common/jobs/post-publish.job.ts`)

Polling job that runs `@Cron(CronExpression.EVERY_MINUTE)`:
1. Queries `findDueForPublishing(now, 50)` — finds SCHEDULED posts with `scheduled_at <= now`
2. Dispatches `ScheduledPostPublishCommand` for each due post via `CommandBus`
3. Implements re-entrancy guard (`isRunning` flag) to prevent overlapping runs

---

## 6. Presentation Layer

### 6.1 REST Endpoints — Social Page Controller

**File**: `src/presentation/controllers/http/client/social-page.controller.ts`

| Method | Path | Guards | Description |
|--------|------|--------|-------------|
| `GET` | `/client/v1/social-pages` | 🔒 JwtAuth + Roles(Enterprise) + UserVerified | List all connected social pages |
| `DELETE` | `/client/v1/social-pages/:id` | 🔒 JwtAuth + Roles(Enterprise) + UserVerified | Disconnect (soft-delete) a social page |
| `GET` | `/client/v1/social-pages/facebook/oauth` | 🔒 JwtAuth + Roles(Enterprise) + UserVerified | Get Facebook OAuth redirect URL with JWT state param |
| `GET` | `/client/v1/social-pages/facebook/callback` | 🔓 WebHook + StateAuthGuard | Facebook OAuth callback — exchange code, bulk connect pages, redirect to FE |
| `POST` | `/client/v1/social-pages/facebook/connect` | 🔒 JwtAuth + Roles(Enterprise) + UserVerified | Connect/upsert a single Facebook page |
| `POST` | `/client/v1/social-pages/facebook/refresh-token` | 🔒 JwtAuth + Roles(Enterprise) + UserVerified | Refresh a page access token |

### 6.2 REST Endpoints — Threads OAuth Controller

**File**: `src/presentation/controllers/http/client/threads-oauth.controller.ts`

| Method | Path | Guards | Description |
|--------|------|--------|-------------|
| `GET` | `/client/v1/social-pages/threads/oauth` | 🔒 JwtAuth + Roles(Enterprise) + UserVerified | Get Threads OAuth redirect URL with JWT state param |
| `GET` | `/client/v1/social-pages/threads/callback` | 🔓 WebHook + StateAuthGuard | Threads OAuth callback — exchange code, bulk connect, redirect to FE |

### 6.3 REST Endpoints — Scheduled Post Controller

**File**: `src/presentation/controllers/http/client/scheduled-post.controller.ts`

| Method | Path | Guards | Description |
|--------|------|--------|-------------|
| `POST` | `/client/v1/scheduled-posts` | 🔒 JwtAuth + Roles(Enterprise) + UserVerified | Create (and optionally schedule) a post |
| `GET` | `/client/v1/scheduled-posts` | 🔒 JwtAuth + Roles(Enterprise) + UserVerified | List all scheduled posts |
| `GET` | `/client/v1/scheduled-posts/:id` | 🔒 JwtAuth + Roles(Enterprise) + UserVerified | Get post by ID |
| `POST` | `/client/v1/scheduled-posts/test` | 🔒 JwtAuth + Roles(Enterprise) + UserVerified | [TEST] Create + publish immediately |
| `POST` | `/client/v1/scheduled-posts/:id/cancel` | 🔒 JwtAuth + Roles(Enterprise) + UserVerified | Cancel a pending post |
| `POST` | `/client/v1/scheduled-posts/:id/reschedule` | 🔒 JwtAuth + Roles(Enterprise) + UserVerified | Reschedule a post |

### 6.4 REST Endpoints — Auto-Reply Rule Controller

**File**: `src/presentation/controllers/http/client/auto-reply-rule.controller.ts`

| Method | Path | Guards | Description |
|--------|------|--------|-------------|
| `POST` | `/client/v1/auto-reply-rules` | 🔒 JwtAuth + Roles(Enterprise) + UserVerified | Create a new auto-reply rule |
| `GET` | `/client/v1/auto-reply-rules` | 🔒 JwtAuth + Roles(Enterprise) + UserVerified | List rules for a social page (requires `socialPageId` query param) |
| `PUT` | `/client/v1/auto-reply-rules/:id` | 🔒 JwtAuth + Roles(Enterprise) + UserVerified | Update an existing auto-reply rule |
| `DELETE` | `/client/v1/auto-reply-rules/:id` | 🔒 JwtAuth + Roles(Enterprise) + UserVerified | Delete an auto-reply rule |

### 6.5 Webhook Controllers

#### Facebook Webhook (`src/presentation/controllers/http/facebook-webhook.controller.ts`)

| Method | Path | Guards | Description |
|--------|------|--------|-------------|
| `GET` | `/webhook/facebook` | 🔓 `@WebHook()` | Facebook webhook verification (hub.challenge) |
| `POST` | `/webhook/facebook` | 🔓 `@WebHook()` | Receive Facebook page webhook events (comments, leads) |

> **Note**: `@WebHook()` bypasses all guards (ApiKeyGuard, JwtAuthGuard). The Facebook webhook endpoint has a `FacebookIpGuard` placeholder for IP restriction — currently unimplemented (see Known Gaps below).

### 6.6 RMQ Controller

**File**: `src/presentation/controllers/rmq/scheduled-post.rmq.controller.ts`

| Queue | Pattern | Handler | Description |
|-------|---------|---------|-------------|
| `scheduled_post_queue` | `post.scheduled` | `handlePostScheduled()` | Listens for `PostScheduledEvent` via outbox, dispatches `ScheduledPostPublishCommand` |

**File**: `src/presentation/controllers/rmq/comment-webhook.consumer.ts`

| Queue | Pattern | Handler | Description |
|-------|---------|---------|-------------|
| `facebook_webhook_queue` | `facebook.comment` | `handleCommentWebhook()` | Listens for Facebook comment webhook events, dispatches `CommentWebhookHandleCommand` |

### 6.7 Guard Stack Reference

- `JwtAuthGuard` — Validates JWT access token
- `RolesGuard` — Validates user role against `@Roles()` decorator (ENTERPRISE for all endpoints)
- `UserVerifiedGuard` — Ensures user account is verified
- `StateAuthGuard` — Validates JWT state parameter (used on OAuth callbacks for both Facebook and Threads)
- `@WebHook()` — Bypasses all guards for external platform callbacks

---

## 7. Workflow Flows

### 7.1 Facebook OAuth & Bulk Connect Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Facebook OAuth → Callback → Bulk Connect → Redirect                        │
│                                                                              │
│  BROWSER              SERVER                      FACEBOOK API               │
│    │                     │                            │                       │
│    │  1. GET /oauth      │                            │                       │
│    │────────►────────────│                            │                       │
│    │                     │  2. Sign JWT (sub, role)   │                       │
│    │                     │     as OAuth state          │                       │
│    │  { url } ◄─────────│                            │                       │
│    │                     │                            │                       │
│    │  3. Redirect to     │                            │                       │
│    │     Facebook Login  │                            │                       │
│    │─────────────────────────────────────────────────►│                       │
│    │                     │                            │                       │
│    │  4. User authorizes │                            │                       │
│    │◄──────────────────────────────────────────────────│                       │
│    │                     │                            │                       │
│    │  5. Redirect w/     │                            │                       │
│    │     code + state    │                            │                       │
│    │────────►────────────│                            │                       │
│    │                     │                            │                       │
│    │                     │  6. StateAuthGuard         │                       │
│    │                     │     verifies JWT state     │                       │
│    │                     │                            │                       │
│    │                     │  7. Exchange code → short  │                       │
│    │                     │───── token ───────────────►│                       │
│    │                     │◄──── short-lived token ────│                       │
│    │                     │                            │                       │
│    │                     │  8. Exchange short → long  │                       │
│    │                     │───── lived token ─────────►│                       │
│    │                     │◄──── 60-day token ─────────│                       │
│    │                     │                            │                       │
│    │                     │  9. SocialPageBulkConnect  │                       │
│    │                     │     Command (inside UoW)   │                       │
│    │                     │     ├─ findByCode('fb')     │                       │
│    │                     │     ├─ getUserAccounts()───►│                       │
│    │                     │     │◄── page list ────────│                       │
│    │                     │     ├─ PlatformRepo.find() │                       │
│    │                     │     └─ For each page:      │                       │
│    │                     │        ├─ upsert SocialPage│                       │
│    │                     │        ├─ repo.save()      │                       │
│    │                     │        └─ publishEvents    │                       │
│    │                     │                            │                       │
│    │  10. Redirect to FE  │                            │                       │
│    │◄── ?success=true ────│                            │                       │
│    │                     │                            │                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Step-by-step**:

1. **Frontend calls** `GET /client/v1/social-pages/facebook/oauth`
2. **Controller** signs a short-lived JWT (`{ sub: userId, email, role }`) with 10-min expiry as the OAuth `state` param. Returns the Facebook OAuth URL.
3. **Browser redirects** to Facebook Login dialog with the JWT state.
4. **User authorizes** the app. Facebook redirects back to the callback URL with `?code=...&state=...`.
5. **Callback** hits `GET /client/v1/social-pages/facebook/callback` with `@WebHook()` and `StateAuthGuard`:
   - `StateAuthGuard` verifies the JWT `state` parameter → extracts `userId`, `email`, `role`
   - `@CurrentUser('sub')` provides the verified user ID
6. **Connector**`exchangeCodeForToken(code, redirectUri)` → short-lived user access token.
7. **Connector**`exchangeForLongLivedToken(token)` → 60-day long-lived user token.
8. **Controller** resolves `enterpriseId` from userId, executes `SocialPageBulkConnectCommand`.
9. **Handler** (inside UoW):
   - Resolves `Platform` by code via `platformRepository.findByName('facebook')`
   - Calls `connector.getUserAccounts(longLivedUserToken)` → list of pages
   - For each page: upserts `SocialPageRoot` via repository, publishes domain events
10. **Redirect** to `REDIRECT_ENDPOINT?success=true` (or `?success=false&error=...` on failure).

### 7.2 Threads OAuth Flow

The Threads OAuth flow follows the same pattern as Facebook but uses Threads-specific endpoints:

1. **Frontend calls** `GET /client/v1/social-pages/threads/oauth`
2. **Controller** signs JWT state, returns `ThreadsOAuthConfigService.buildAuthUrl(state)` → `https://threads.net/oauth/authorize?...`
3. **User authorizes** on Threads. Callback at `GET /client/v1/social-pages/threads/callback`
4. **StateAuthGuard** verifies JWT state
5. **Connector**`exchangeCodeForToken()` → short-lived token → `exchangeForLongLivedToken()` → 60-day token
6. **`SocialPageBulkConnectCommand`** — Threads `getUserAccounts()` returns single account (user profile)
7. **Redirect** to frontend with success/failure

### 7.3 Create & Publish Scheduled Post Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Create → Schedule → Outbox → RMQ → Publish                                 │
│                                                                              │
│  CLIENT              CONTROLLER              HANDLER              RMQ        │
│    │                     │                       │                     │     │
│    │ POST /scheduled-post│                       │                     │     │
│    │  { socialPageId,   │                       │                     │     │
│    │   content,          │                       │                     │     │
│    │   scheduledAt }     │                       │                     │     │
│    │────────►────────────│                       │                     │     │
│    │                     │ CommandBus.execute()  │                     │     │
│    │                     │──────────────────────►│                     │     │
│    │                     │                       │                     │     │
│    │                     │                       │ 1. uow.execute()    │     │
│    │                     │                       │    ├─ verify page   │     │
│    │                     │                       │    ├─ create post   │     │
│    │                     │                       │    ├─ post.schedule │     │
│    │                     │                       │    ├─ repo.save     │     │
│    │                     │                       │    └─ publishEvents │     │
│    │                     │                       │         │           │     │
│    │                     │                       │         │ 2. Outbox │     │
│    │                     │                       │         │──insert──►│     │
│    │  { post } ◄─────────│◄──────────────────────│         │           │     │
│    │                     │                       │         │           │     │
│    │                     │                       │         │   3. RMQ   │     │
│    │                     │                       │         │── consume ─►│     │
│    │                     │                       │         │    queue    │     │
│    │                     │                       │ 4. PublishCmd      │     │
│    │                     │                       │◄────────│──────────│     │
│    │                     │                       │         │           │     │
│    │                     │                       │ 5. multi-step UoW  │     │
│    │                     │                       │    ├─ markPub.     │     │
│    │                     │                       │    ├─ API call     │     │
│    │                     │                       │    └─ markDone     │     │
│    │                     │                       │                     │     │
└────────────────────────────────────────────────────────────────────────────┘
```

**Step-by-step**:

1. **Client** calls `POST /scheduled-posts` with `{ socialPageId, content, scheduledAt }`
2. **Controller** validates DTO via Zod, resolves `enterpriseId` from user
3. **Handler** executes inside `uow.execute()`:
   - Verifies social page belongs to enterprise
   - Creates `ScheduledPostRoot.create({ ... })`
   - If `scheduledAt` was provided: calls `post.schedule(scheduledAt)` → transitions to SCHEDULED, raises `PostScheduledEvent`
   - Saves via repository
   - `eventService.publishEvents()` maps domain events → outbox
4. **Outbox processor** polls the outbox, publishes to RabbitMQ `scheduled_post_queue` with routing key `post.scheduled`
5. **RMQ Controller** `handlePostScheduled()` consumes the message
6. **CommandBus** executes `ScheduledPostPublishCommand(postId)`
7. **Publish handler** executes multi-step UoW:
   - **Step 1** (UoW): mark post as `PUBLISHING` to prevent double-processing
   - **Step 2** (outside UoW): fetch social page token, resolve media URLs, call platform publisher
   - **Step 3** (UoW): mark as `PUBLISHED` (with platform post ID) or `FAILED` (with reason)

### 7.4 Cron-Driven Publish Job

Every minute, `PostPublishJob.handleCron()`:
1. Checks `isRunning` re-entrancy guard
2. Queries `findDueForPublishing(now, 50)` — SCHEDULED posts with `scheduled_at <= now`
3. Dispatches `ScheduledPostPublishCommand` for each due post
4. Errors are caught per-post (one failure doesn't stop the batch)

### 7.5 Comment Auto-Reply Flow

```
Facebook Webhook POST
  │
  ▼
FacebookWebhookController.handleWebhook()
  │
  ▼ (RMQ producer — via internal event)
CommentWebhookConsumer (RMQ consumer)
  │
  ▼
CommentWebhookHandleHandler.execute()
  │
  ├─ 1. Infinite loop guard: drop self-comments
  ├─ 2. Fetch SocialPage by platformCode + pageId
  │      → Not found? Return error
  ├─ 3. Fetch active auto-reply rules for page
  │      → No rules? Return "no matching rule"
  ├─ 4. Match comment text against rule keywords
  │      - Non-empty keywords: case-insensitive includes match
  │      - Empty keywords: fallback (matches any uncaptured comment)
  │      - First matching rule wins
  └─ 5. CommentReplierDiscovery.findByCode(platform)
       → replier.replyToComment({ token, commentId, message })
```

### 7.6 Query Flow (Get Scheduled Posts)

```
CLIENT              CONTROLLER              QUERY HANDLER           REPOSITORY
  │                     │                       │                       │
  │ GET /scheduled-posts│                       │                       │
  │────────►────────────│                       │                       │
  │                     │ QueryBus.execute()    │                       │
  │                     │──────────────────────►│                       │
  │                     │                       │ findByEnterpriseId() │
  │                     │                       │──────────────────────►│
  │                     │                       │◄── ScheduledPost[] ───│
  │                     │                       │                       │
  │                     │ toListDto()           │                       │
  │                     │◄── ScheduledPostDto[]─│                       │
  │                     │                       │                       │
  │  ScheduledPostDto[] │                       │                       │
  │◄────────────────────│                       │                       │
  │                     │                       │                       │
```

---

## 8. File Map

### Core Layer

| File | Description |
|------|-------------|
| `src/core/aggregate-roots/social-page.aggregate.ts` | `SocialPageRoot` — connected social page aggregate |
| `src/core/aggregate-roots/scheduled-post.aggregate.ts` | `ScheduledPostRoot` — scheduled content post aggregate |
| `src/core/aggregate-roots/auto-reply-rule.aggregate.ts` | `AutoReplyRuleRoot` — keyword trigger auto-reply aggregate |
| `src/core/enums/social-platform-code.enum.ts` | `ESocialPlatformCode` — `facebook`, `threads`, `tiktok`, `instagram` |
| `src/core/enums/post-status.enum.ts` | `EPostStatus` — DRAFT, SCHEDULED, PUBLISHING, PUBLISHED, FAILED, CANCELLED |
| `src/core/enums/schedule-post-status.enum.ts` | `ESchedulePostStatus` — **deprecated** legacy enum |
| `src/core/enums/aggregate-type.enum.ts` | `EAggregateType` — includes `SOCIAL_PAGE`, `SCHEDULED_POST`, `AUTO_REPLY_RULE` |
| `src/core/events/social-page-connected.domain-event.ts` | Raised when a social page is first connected |
| `src/core/events/threads-oauth-initiated.domain-event.ts` | Raised when Threads OAuth flow starts |
| `src/core/events/threads-connected.domain-event.ts` | Raised when a Threads page is connected |
| `src/core/events/post-scheduled.domain-event.ts` | Raised when a post is scheduled/rescheduled |
| `src/core/events/post-published.domain-event.ts` | Raised when a post is successfully published |
| `src/core/events/post-failed.domain-event.ts` | Raised when publishing fails |
| `src/core/interfaces/repositories/social-page.repository.ts` | `ISocialPageRepository` interface |
| `src/core/interfaces/repositories/scheduled-post.repository.ts` | `IScheduledPostRepository` interface |
| `src/core/interfaces/repositories/auto-reply-rule.repository.ts` | `IAutoReplyRuleRepository` interface |
| `src/core/interfaces/services/social-page-connector.interface.ts` | `ISocialPageConnector` + `ISocialPageConnectorFactory` interfaces |
| `src/core/interfaces/services/social-publisher.interface.ts` | `ISocialPublisher` + `ISocialPublisherDiscovery` interfaces |
| `src/core/exceptions/general.exception.ts` | `InvalidOperationException` for invalid state transitions |

### Application Layer

| File | Description |
|------|-------------|
| `src/application/commands/social-page-connect/` | Connect/upsert single social page |
| `src/application/commands/social-page-bulk-connect/` | Bulk connect from platform token |
| `src/application/commands/social-page-disconnect/` | Soft-delete social page |
| `src/application/commands/social-page-refresh-token/` | Refresh page access token |
| `src/application/commands/scheduled-post-create/` | Create (and optionally schedule) post |
| `src/application/commands/scheduled-post-create-and-publish/` | [TEST] Create + publish immediately |
| `src/application/commands/scheduled-post-publish/` | Multi-step publish to platform |
| `src/application/commands/scheduled-post-cancel/` | Cancel pending post |
| `src/application/commands/scheduled-post-reschedule/` | Reschedule post |
| `src/application/commands/scheduled-post-schedule/` | Transition DRAFT to SCHEDULED |
| `src/application/commands/auto-reply-rule-create/` | Create auto-reply rule |
| `src/application/commands/auto-reply-rule-update/` | Update auto-reply rule |
| `src/application/commands/auto-reply-rule-delete/` | Delete auto-reply rule |
| `src/application/commands/comment-webhook-handle/` | Process comment webhook → auto-reply |
| `src/application/queries/social-page-get-list/` | List social pages |
| `src/application/queries/scheduled-post-get-list/` | List scheduled posts |
| `src/application/queries/scheduled-post-get-by-id/` | Get post by ID |
| `src/application/queries/auto-reply-rule-get-list/` | List auto-reply rules for a page |
| `src/application/mappers/social-page.mapper.ts` | SocialPage mapper |
| `src/application/mappers/scheduled-post.mapper.ts` | ScheduledPost mapper |
| `src/application/mappers/auto-reply-rule.mapper.ts` | AutoReplyRule mapper |
| `src/application/mappers/event.mapper.ts` | Domain → Integration event mapper |
| `src/application/dtos/social-page.dto.ts` | SocialPage DTO |
| `src/application/dtos/scheduled-post.dto.ts` | ScheduledPost DTO |
| `src/application/dtos/auto-reply-rule.dto.ts` | AutoReplyRule DTO |

### Infrastructure Layer

| File | Description |
|------|-------------|
| `src/infrastructure/social-network/facebook/facebook.module.ts` | Facebook platform module |
| `src/infrastructure/social-network/facebook/facebook-graph-api.client.ts` | Facebook Graph API HTTP client |
| `src/infrastructure/social-network/facebook/facebook-publisher.service.ts` | Facebook publisher (`ISocialPublisher`) |
| `src/infrastructure/social-network/facebook/facebook-social-page-connector.service.ts` | Facebook connector (`ISocialPageConnector`) |
| `src/infrastructure/social-network/facebook/facebook-token.service.ts` | Facebook token exchange utilities |
| `src/infrastructure/social-network/facebook/facebook-comment-replier.service.ts` | Facebook comment replier (`ICommentReplier`) |
| `src/infrastructure/social-network/facebook/interfaces/facebook-api.interface.ts` | Facebook API type definitions |
| `src/infrastructure/social-network/threads/threads.module.ts` | Threads platform module |
| `src/infrastructure/social-network/threads/threads-graph-api.client.ts` | Threads Graph API HTTP client |
| `src/infrastructure/social-network/threads/threads-publisher.service.ts` | Threads publisher (`ISocialPublisher`) |
| `src/infrastructure/social-network/threads/threads-social-page-connector.service.ts` | Threads connector (`ISocialPageConnector`) |
| `src/infrastructure/social-network/threads/threads-oauth-config.service.ts` | Threads OAuth config (client ID, scopes, auth URL builder) |
| `src/infrastructure/social-network/threads/threads-api.types.ts` | Threads API type definitions |
| `src/infrastructure/social-network/common/social-network.module.ts` | **SocialNetworkModule** — wires all platforms + orchestration + handlers |
| `src/infrastructure/social-network/common/factories/social-page-connector-factory.service.ts` | Connector factory (resolves by code) |
| `src/infrastructure/social-network/common/factories/social-publisher-discovery.service.ts` | Publisher discovery (resolves by code) |
| `src/infrastructure/social-network/common/factories/comment-replier-discovery.service.ts` | Comment replier discovery (resolves by code) |
| `src/infrastructure/social-network/common/jobs/post-publish.job.ts` | Post publishing cron job (every minute) |
| `src/infrastructure/mongo/schemas/social-page.schema.ts` | Mongoose schema for `social_pages` collection |
| `src/infrastructure/mongo/schemas/scheduled-post.schema.ts` | Mongoose schema for `scheduled_posts` collection |
| `src/infrastructure/mongo/schemas/auto-reply-rule.schema.ts` | Mongoose schema for `auto_reply_rules` collection |
| `src/infrastructure/mongo/repositories/social-page.repository.ts` | `MongoSocialPageRepository` (with token encryption) |
| `src/infrastructure/mongo/repositories/scheduled-post.repository.ts` | `MongoScheduledPostRepository` |
| `src/infrastructure/mongo/repositories/auto-reply-rule.repository.ts` | `MongoAutoReplyRuleRepository` |

### Presentation Layer

| File | Description |
|------|-------------|
| `src/presentation/controllers/http/client/social-page.controller.ts` | Social page REST endpoints |
| `src/presentation/controllers/http/client/threads-oauth.controller.ts` | Threads OAuth endpoints |
| `src/presentation/controllers/http/client/scheduled-post.controller.ts` | Scheduled post REST endpoints |
| `src/presentation/controllers/http/client/auto-reply-rule.controller.ts` | Auto-reply rule REST endpoints |
| `src/presentation/controllers/http/facebook-webhook.controller.ts` | Facebook webhook receiver |
| `src/presentation/controllers/rmq/scheduled-post.rmq.controller.ts` | RMQ consumer for `post.scheduled` events |
| `src/presentation/controllers/rmq/comment-webhook.consumer.ts` | RMQ consumer for Facebook comment webhooks |
| `src/presentation/middleware/guards/state-auth.guard.ts` | JWT state parameter validator |

---

## 9. Key Invariants

1. **Platform code must exist in `ESocialPlatformCode` enum.** Only `facebook`, `threads`, `tiktok`, and `instagram` are valid.
2. **Social page pageId + platformCode is unique per enterprise.** The repository checks `findByPageId()` before insert to upsert rather than duplicate.
3. **Access tokens must be encrypted at rest.** The `MongoSocialPageRepository` transparently encrypts/decrypts via AES using `SOCIAL_PAGE_TOKEN_SECRET`.
4. **A social page can only be soft-deleted by its owning enterprise.** `DisconnectHandler` validates `enterpriseId` match.
5. **Schedule/reschedule requires `scheduledAt > now()`.** Domain method validates future timestamp.
6. **Cancel is only allowed from `DRAFT` or `SCHEDULED` status.** Domain method throws `InvalidOperationException` otherwise.
7. **Mark published/failed is only allowed from `PUBLISHING` or `SCHEDULED`.** Ensures valid state transitions.
8. **Double-publishing is prevented.** The `PUBLISHING` marking in Step 1 acts as a pessimistic lock.
9. **Enterprise ownership must match.** All commands and queries validate `post.enterpriseId === command.enterpriseId`.
10. **Social page must exist before creating scheduled posts.** `ScheduledPostCreateHandler` validates via `socialPageRepository.findById()` first.
11. **Domain events are always emitted via outbox.** All state changes on `ScheduledPostRoot` raise domain events that flow through `eventService.publishEvents()` → Outbox → RabbitMQ.
12. **Threads is user-account based, not page-based.** `getUserAccounts()` returns a single-entry array (the authenticated user), unlike Facebook which returns multiple pages.
13. **Threads content limited to 500 characters.** The publisher validates and rejects content exceeding this limit.
14. **Auto-reply infinite loop guard.** Comments from the page itself are dropped immediately by `CommentWebhookHandleHandler`.
15. **First matching auto-reply rule wins.** Non-empty keyword rules evaluated before empty-keyword fallback rules.
16. **Future platform integrations** (TikTok, Instagram) must implement `ISocialPageConnector` and `ISocialPublisher` (± `ICommentReplier`) and register with the factories in `SocialNetworkModule`. No code outside `social-network/` needs changes.

### Known Gaps

- `FacebookIpGuard` — missing IP restriction on Facebook webhook endpoint
- `SocialPageRefreshTokenHandler` — no automatic token refresh mechanism (manual only via API)
- `PostPublishedEvent` / `PostFailedEvent` — not mapped to integration events in `EventMapper` (no RMQ flow)
- Redis rate-limit per page — missing token-bucket limiter for publish API calls
