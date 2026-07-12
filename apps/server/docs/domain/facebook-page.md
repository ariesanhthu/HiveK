# Facebook Page Domain

This document describes the business rules, state machines, aggregate roots, CQRS commands/queries, infrastructure flows, and known implementation gaps for the **Social Page Posting & Comment Auto-Reply** feature — introduced as the first platform integration in the HiveK server.

---

## 1. Domain Overview

This feature enables Enterprises to:
1. **Connect** their Facebook Pages to HiveK using OAuth.
2. **Schedule & Publish** text and media posts to those pages at a specified future time.
3. **Auto-Reply** to comments received on their posts, using keyword-based matching rules.

Three standalone **Aggregate Roots** own this domain. They are platform-agnostic by design — Facebook is the first concrete implementation:

| Aggregate | Responsibility |
|---|---|
| `SocialPageRoot` | Represents a connected social platform page (credentials + metadata) |
| `ScheduledPostRoot` | Represents a post scheduled to publish at a future time |
| `AutoReplyRuleRoot` | Represents a keyword-triggered reply configuration on a page |

---

## 2. Aggregate Roots

### 2.1 `SocialPageRoot`

**File**: `src/core/aggregate-roots/social-page.aggregate.ts`

Holds the OAuth credentials (page access token) for a connected page. Token is stored encrypted in MongoDB and decrypted transparently by the infrastructure mapper.

```
SocialPageProps {
  enterpriseId       : string          // owning enterprise
  platformId         : string          // references PlatformRoot
  platformCode       : string          // 'facebook' | 'tiktok' | ...
  pageId             : string          // external platform page ID
  pageName           : string
  pictureUrl         : string | null   // cached profile picture URL
  followerCount      : number | null   // cached follower count
  encryptedToken     : string          // plain in memory, AES-256 in DB
  tokenExpiresAt     : Date | null     // null = permanent page token
  webhookVerifyToken : string          // auto-generated random secret
  isActive           : boolean
  createdAt          : Date
  updatedAt          : Date
  deleteAt           : Date | null
  deleteBy           : string | null
}
```

**Domain methods**:
- `static create(props)` — auto-generates `webhookVerifyToken` (random UUID prefix)
- `activate()` / `deactivate()`
- `updateToken(encryptedToken, expiresAt?)` — for token refresh
- `updatePageInfo(pageName, pictureUrl?, followerCount?)` — sync metadata from Graph API
- `softDelete(deletedBy)` / `restore()`

**Domain events raised**:
- `SocialPageConnectedEvent` — on `create()`

---

### 2.2 `ScheduledPostRoot`

**File**: `src/core/aggregate-roots/scheduled-post.aggregate.ts`

Represents a piece of content scheduled to be published on a connected social page. Media is stored as Cloudinary `fileIds` and resolved to CDN URLs at publish time.

```
ScheduledPostProps {
  enterpriseId    : string
  socialPageId    : string          // references SocialPageRoot
  platformCode    : string          // denormalized for efficient cron query
  content         : string          // text body of the post
  mediaFileIds    : string[]        // Cloudinary fileIds, resolved at publish
  scheduledAt     : Date
  status          : EPostStatus
  publishedAt     : Date | null
  platformPostId  : string | null   // ID returned by Graph API after publish
  failReason      : string | null
  createdBy       : string          // userId
  createdAt       : Date
  updatedAt       : Date
}
```

**Status Lifecycle (`EPostStatus`)**:
```
DRAFT → SCHEDULED → PUBLISHING → PUBLISHED
                               ↘ FAILED → SCHEDULED (reschedule)
DRAFT | SCHEDULED → CANCELLED
```

| Status | Description |
|---|---|
| `DRAFT` | Created but not yet scheduled for publishing |
| `SCHEDULED` | Confirmed time set, waiting for cron tick |
| `PUBLISHING` | Cron picked up, Graph API call in-flight |
| `PUBLISHED` | Successfully published; `platformPostId` set |
| `FAILED` | Graph API call failed; `failReason` set |
| `CANCELLED` | Manually cancelled before publishing |

**Domain methods**:
- `schedule(scheduledAt)` — DRAFT → SCHEDULED; validates time is in the future
- `markPublishing()` — SCHEDULED → PUBLISHING; prevents double-pickup by cron
- `markPublished(platformPostId, publishedAt?)` — PUBLISHING → PUBLISHED
- `markFailed(reason)` — PUBLISHING → FAILED
- `cancel()` — DRAFT | SCHEDULED → CANCELLED
- `reschedule(newTime)` — FAILED | SCHEDULED | CANCELLED → SCHEDULED

**Domain events raised**:
- `PostScheduledEvent` — on `schedule()` and `reschedule()`
- `PostPublishedEvent` — on `markPublished()`
- `PostFailedEvent` — on `markFailed()`

---

### 2.3 `AutoReplyRuleRoot`

**File**: `src/core/aggregate-roots/auto-reply-rule.aggregate.ts`

Defines a rule that triggers an automatic text reply whenever a new comment matches one or more keywords on a page. Multiple rules can exist per page, evaluated in order.

```
AutoReplyRuleProps {
  enterpriseId  : string
  socialPageId  : string
  name          : string        // human label e.g. "Welcome Reply"
  isEnabled     : boolean
  keywords      : string[]      // empty array = match ALL comments (fallback)
  replyContent  : string        // plain text reply
  createdAt     : Date
  updatedAt     : Date
}
```

**Matching logic**:
1. Rules with **non-empty keywords** are evaluated first (case-insensitive `includes` match).
2. A rule with **empty keywords** is a fallback — matches any comment not caught by keyword rules.
3. First matching rule wins.

**Domain methods**:
- `enable()` / `disable()`
- `updateRule(name?, keywords?, replyContent?)` — partial update

---

## 3. State Machine — Post Lifecycle

```
                    ┌─────────┐
                    │  DRAFT  │◄──── create()
                    └────┬────┘
                         │ schedule(scheduledAt)
                         ▼
                  ┌────────────┐
                  │ SCHEDULED  │◄─── reschedule(newTime)
                  └─────┬──────┘
           cancel() │   │ [cron tick — markPublishing()]
                    ▼   ▼
             ┌──────────────┐
             │ CANCELLED    │  ┌─────────────┐
             └──────────────┘  │  PUBLISHING │
                               └──────┬──────┘
                      markPublished() │  │ markFailed()
                                      ▼  ▼
                              ┌─────────────────┐
                              │   PUBLISHED      │
                              └──────────────────┘
                              ┌─────────────────┐
                              │     FAILED       │──► reschedule()
                              └──────────────────┘
```

---

## 4. Facebook OAuth Connect Flow

Acquires a Facebook **Page Access Token** for an enterprise page. This is distinct from the KOL OAuth flow.

```
Enterprise Admin
    │
    │ 1. GET /api/v1/client/social-pages/facebook/oauth
    │    ← Returns { url: "https://facebook.com/dialog/oauth?..." }
    │
    │ 2. User visits URL, approves permissions on Facebook
    │    Facebook redirects to FACEBOOK_CALLBACK_URL with ?code=<auth_code>
    │
    │ 3. GET /api/v1/client/social-pages/facebook/callback?code=<auth_code>
    │    Server-side exchange:
    │      a. code → short-lived user token     (GET /oauth/access_token)
    │      b. user token → long-lived user token (grant_type=fb_exchange_token, ~60 days)
    │      c. GET /me/accounts → list of pages the user manages
    │    ← Returns [{ pageId, pageName, accessToken }]
    │
    │ 4. Frontend shows page list, user selects a page
    │
    │ 5. POST /api/v1/client/social-pages/facebook/connect
    │    Body: { pageId, pageName, accessToken, platformId, ... }
    │    Server:
    │      - Looks up or creates SocialPageRoot
    │      - Encrypts token (AES-256 via SOCIAL_PAGE_TOKEN_SECRET)
    │      - Persists to MongoDB
    │      - Raises SocialPageConnectedEvent
    │    ← Returns SocialPageDto
```

**Required OAuth Scopes**:
- `pages_manage_posts` — publish posts
- `pages_read_engagement` — read comments
- `pages_show_list` — list manageable pages
- `pages_messaging` — send replies to comments

---

## 5. Scheduled Post Publishing Flow (Cron)

```
Every 1 minute
    │
    ▼
PostPublishJob (@Cron — EVERY_MINUTE)
    │ findDueForPublishing(now, limit=50)
    │ query: status = SCHEDULED AND scheduledAt <= NOW
    │ Mutex flag prevents overlapping ticks
    │
    ├── For each due post → execute(ScheduledPostPublishCommand(post.id))
    │
    ▼
ScheduledPostPublishHandler
    │
    │ Transaction 1: post.markPublishing() → save (prevents double-pick)
    │
    │ Fetch SocialPage → if not found: post.markFailed("page not found")
    │
    │ Resolve mediaFileIds → Cloudinary URLs via UploadedFileRepository
    │
    │ SocialPublisherDiscoveryService.findByCode(platformCode)
    │   └─► FacebookPublisherService.publishPost({pageToken, pageId, content, mediaUrls})
    │         └─► FacebookGraphApiClient
    │               ├── Text only    → POST /{pageId}/feed
    │               ├── Single image → POST /{pageId}/photos
    │               └── Multi-image  → POST /{pageId}/photos (unpublished) × N
    │                                  POST /{pageId}/feed (attached_media)
    │
    │ Success → Transaction 2: post.markPublished(platformPostId)
    │           Raises PostPublishedEvent
    │
    └── Failure → Transaction 2: post.markFailed(errorMessage)
                  Raises PostFailedEvent
```

---

## 6. Facebook Webhook & Auto-Reply Flow

```
Facebook Platform
    │ New comment event (POST request)
    ▼
FacebookWebhookController  (public — /api/webhooks/facebook)
    │
    │ [1] Verify X-Hub-Signature-256 HMAC-SHA256
    │     FACEBOOK_WEBHOOK_SIGNATURE_VERIFICATION=true to enable
    │
    │ [2] Early loop guard:
    │     if entry.id === value.from.id → drop (self-reply by page bot)
    │
    │ [3] Filter: only forward value.item==="comment" && value.verb==="add"
    │
    │ [4] messageQueueService.emit("webhook.facebook.comment", rawBody)
    │     → RabbitMQ: comment_webhook_queue
    │
    └── Return 200 OK immediately (Facebook requires fast response)

                    │ (async)
                    ▼
CommentWebhookConsumer  (RabbitMQ consumer)
    │
    │ [5] Redis idempotency check:
    │     GET fb_comment:{commentId} → exists? skip (duplicate webhook)
    │     SET fb_comment:{commentId} "processed" EX 300
    │
    │ [6] Execute(CommentWebhookHandleCommand(platformCode, rawPayload))
    │
    ▼
CommentWebhookHandleHandler
    │
    │ Parse: entry.id = pageId, value.comment_id, value.message, value.from.id
    │
    │ [A] Domain loop guard: senderId === pageId → return (self-comment)
    │
    │ [B] SocialPageRepository.findByPageId(platformCode, pageId)
    │     → Not found or inactive → return { success: false }
    │
    │ [C] AutoReplyRuleRepository.findActiveByPageId(socialPage.id)
    │     → No active rules → return { success: true, reason: "no rules" }
    │
    │ [D] Keyword matching (case-insensitive):
    │     1. Rules with keywords: find first where comment includes any keyword
    │     2. Fallback: rule with empty keywords (matches everything)
    │     → No match → return { success: true, reason: "no matching rule" }
    │
    │ [E] CommentReplierDiscoveryService.findByCode(platformCode)
    │       └─► FacebookCommentReplierService.replyToComment({pageToken, commentId, message})
    │             └─► POST /{commentId}/comments  (Graph API)
    │
    └── Return { success: true }
```

---

## 7. Infrastructure Layer

### 7.1 MongoDB Collections

| Collection | Schema File | Repository |
|---|---|---|
| `social_pages` | `social-page.schema.ts` | `social-page.repository.ts` |
| `scheduled_posts` | `scheduled-post.schema.ts` | `scheduled-post.repository.ts` |
| `auto_reply_rules` | `auto-reply-rule.schema.ts` | `auto-reply-rule.repository.ts` |

**Token Encryption**: `SocialPageRoot.encryptedToken` is stored as AES-256-CBC encrypted ciphertext in MongoDB. The `MongoSocialPageRepository` mapper calls `encrypt()`/`decrypt()` from `src/shared/utils/crypto.util.ts` using `SOCIAL_PAGE_TOKEN_SECRET` env variable. The aggregate always holds the plaintext token in memory — decryption is fully transparent to the application layer.

### 7.2 Platform Service Discovery

The `PostingModule` registers a **Map** of platform-specific service implementations:

```
SOCIAL_PUBLISHERS token → { facebook: FacebookPublisherService }
COMMENT_REPLIERS  token → { facebook: FacebookCommentReplierService }

SocialPublisherDiscoveryService.findByCode(platformCode)
  → throws if platform not registered
  → returns the matching ISocialPublisher implementation

CommentReplierDiscoveryService.findByCode(platformCode)
  → same pattern for ICommentReplier
```

To add a new platform (e.g., TikTok), only the discovery map needs a new entry — all handler code is unchanged.

### 7.3 RabbitMQ

| Queue | Routing Key | Producer | Consumer |
|---|---|---|---|
| `comment_webhook_queue` | `webhook.facebook.comment` | `FacebookWebhookController` | `CommentWebhookConsumer` |

### 7.4 Redis Keys

| Key Pattern | TTL | Purpose |
|---|---|---|
| `fb_comment:{commentId}` | 5 min | Deduplicate retried webhook deliveries |

### 7.5 Environment Variables

| Variable | Purpose |
|---|---|
| `FACEBOOK_APP_ID` | OAuth app ID |
| `FACEBOOK_APP_SECRET` | OAuth app secret; also used for webhook HMAC |
| `FACEBOOK_CALLBACK_URL` | OAuth redirect URI |
| `FACEBOOK_GRAPH_API_URL` | Base URL (default: `https://graph.facebook.com/v19.0`) |
| `FACEBOOK_WEBHOOK_VERIFY_TOKEN` | Shared token for webhook challenge verification |
| `FACEBOOK_WEBHOOK_SIGNATURE_VERIFICATION` | `true` to enforce X-Hub-Signature-256 check |
| `SOCIAL_PAGE_TOKEN_SECRET` | AES-256 key for encrypting page access tokens |

---

## 8. CQRS — Commands & Queries Reference

### Commands

| Command | Handler | Description |
|---|---|---|
| `SocialPageConnectCommand` | `SocialPageConnectHandler` | OAuth result → create/update `SocialPageRoot`, encrypt token |
| `SocialPageDisconnectCommand` | `SocialPageDisconnectHandler` | Soft-delete `SocialPageRoot` |
| `ScheduledPostCreateCommand` | `ScheduledPostCreateHandler` | Create post in `DRAFT`; auto-schedule if `scheduledAt` provided |
| `ScheduledPostScheduleCommand` | `ScheduledPostScheduleHandler` | Move `DRAFT` → `SCHEDULED` |
| `ScheduledPostCancelCommand` | `ScheduledPostCancelHandler` | Cancel `DRAFT` or `SCHEDULED` post |
| `ScheduledPostRescheduleCommand` | `ScheduledPostRescheduleHandler` | Move `FAILED`/`SCHEDULED`/`CANCELLED` → `SCHEDULED` with new time |
| `ScheduledPostPublishCommand` | `ScheduledPostPublishHandler` | Internal: invoked by cron; publishes to Graph API |
| `AutoReplyRuleCreateCommand` | `AutoReplyRuleCreateHandler` | Create new keyword rule |
| `AutoReplyRuleUpdateCommand` | `AutoReplyRuleUpdateHandler` | Update name, keywords, reply content, or enabled state |
| `AutoReplyRuleDeleteCommand` | `AutoReplyRuleDeleteHandler` | Hard-delete rule |
| `CommentWebhookHandleCommand` | `CommentWebhookHandleHandler` | Process raw comment payload → match rule → reply |

### Queries

| Query | Handler | Description |
|---|---|---|
| `SocialPageGetListQuery` | `SocialPageGetListHandler` | All connected pages for an enterprise |
| `ScheduledPostGetListQuery` | `ScheduledPostGetListHandler` | Post list filtered by enterpriseId |
| `ScheduledPostGetByIdQuery` | `ScheduledPostGetByIdHandler` | Single post detail with ownership check |
| `AutoReplyRuleGetListQuery` | `AutoReplyRuleGetListHandler` | All rules for a given `socialPageId` |

---

## 9. REST API Endpoints

### Social Pages — `/api/v1/client/social-pages`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | 🔒 Enterprise JWT | List all connected pages |
| `DELETE` | `/:id` | 🔒 Enterprise JWT | Disconnect a page |
| `GET` | `/facebook/oauth` | 🔒 Enterprise JWT | Get Facebook OAuth redirect URL |
| `GET` | `/facebook/callback` | 🔒 Enterprise JWT | Exchange auth code → page list |
| `POST` | `/facebook/connect` | 🔒 Enterprise JWT | Link selected page to enterprise |

### Scheduled Posts — `/api/v1/client/scheduled-posts`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/` | 🔒 Enterprise JWT | Create (and optionally schedule) a post |
| `GET` | `/` | 🔒 Enterprise JWT | List all posts |
| `GET` | `/:id` | 🔒 Enterprise JWT | Get post details |
| `POST` | `/:id/cancel` | 🔒 Enterprise JWT | Cancel a pending post |
| `POST` | `/:id/reschedule` | 🔒 Enterprise JWT | Move to new publish time |

### Auto-Reply Rules — `/api/v1/client/auto-reply-rules`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/` | 🔒 Enterprise JWT | Create a new rule |
| `GET` | `/?socialPageId=` | 🔒 Enterprise JWT | List rules for a page |
| `PATCH` | `/:id` | 🔒 Enterprise JWT | Update rule |
| `DELETE` | `/:id` | 🔒 Enterprise JWT | Delete rule |

### Webhook — `/api/webhooks/facebook`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | 🌐 Public | Facebook webhook verification challenge |
| `POST` | `/` | 🌐 Public | Receive Facebook events |

---

## 10. Known Gaps & Deferred Items

The following items were identified during the plan vs. code audit. They must be resolved before production use.

### ❌ Missing — Must Implement Before Production

**1. `FacebookIpGuard`**
- **Plan**: Validate incoming webhook `POST /api/webhooks/facebook` requests against Meta's published IP CIDR ranges.
- **Current**: No IP restriction on the webhook endpoint; any host can send crafted payloads even if signature verification is disabled.
- **Fix**: Create a `FacebookIpGuard` implementing `CanActivate`. Read `req.ip` and compare against a hardcoded (or remotely-fetched) list of Meta IP ranges. Toggle via `FACEBOOK_WEBHOOK_IP_GUARD=true` env.

**2. `SocialPageRefreshTokenHandler`**
- **Plan**: `social-page-refresh-token` command to renew a page's access token before it expires.
- **Current**: Facebook page tokens are long-lived but the underlying user token (used to fetch page tokens) expires after 60 days. No mechanism exists to refresh it — pages will fail silently after expiry.
- **Fix**: Implement `SocialPageRefreshTokenCommand` → handler calls `exchangeUserTokenForLongLivedToken()` → updates `SocialPageRoot.updateToken()`. Schedule periodic execution (cron or on-demand check).

**3. Redis Rate-Limit Per Page (`fb_rate:{pageId}`)**
- **Plan**: Token-bucket rate limiter in `CommentWebhookConsumer` keyed `fb_rate:{pageId}` with 1-hour TTL to prevent Graph API quota exhaustion on high-traffic pages.
- **Current**: Only idempotency dedup (`fb_comment:{commentId}`) is implemented. No per-page reply rate limiting.
- **Fix**: Inside `CommentWebhookConsumer`, before calling `commandBus.execute()`, check and increment a Redis counter for `fb_rate:{pageId}`. Skip if over threshold, reset counter after TTL.

---

### ⚠️ Deviations — Should Fix Before Production

**4. Webhook Challenge Uses Global Token (not per-page)**
- **Plan**: `GET /api/webhooks/facebook` should look up `SocialPageRoot.webhookVerifyToken` by the token received in `hub.verify_token`.
- **Current**: Checks against a single `FACEBOOK_WEBHOOK_VERIFY_TOKEN` env variable. All page subscriptions share one token.
- **Fix**: Query `ISocialPageRepository.findByWebhookVerifyToken(token)` and respond only if a matching active page is found.

**5. OAuth Scopes Incorrect (Test Scopes Active)**
- **Plan**: `pages_manage_posts, pages_read_engagement, pages_show_list, pages_messaging`
- **Current**: `public_profile,pages_show_list` is live; correct scopes are commented out in `social-page.controller.ts:80`.
- **Fix**: Uncomment and use the correct production scopes.

**6. OAuth `state` Has No CSRF Protection**
- **Plan**: `state` should carry `enterpriseId + CSRF token`.
- **Current**: `state` is `userId` only.
- **Fix**: Generate a short-lived signed CSRF token (e.g., HMAC of `userId + timestamp + secret`), include in `state`, and verify on callback.

**7. Page Token Trusted from Frontend**
- **Plan**: On `POST /facebook/connect`, server independently calls `GET /{page-id}?fields=access_token` to fetch the page token from Graph API using the stored user token.
- **Current**: Page access token is accepted directly from the frontend request body.
- **Fix**: After user selects a page, use the long-lived user token (stored server-side from callback step) to call `getPageDetails()` and extract the page token server-side. Do not trust the client-supplied token.

---

### 🔮 Phase 5 — Future (Out of Scope Now)

- AI-generated reply content (currently plain text only)
- TikTok / Instagram platform implementations (add to discovery map)
- Inbox / Direct Message webhook support
- Post performance analytics (reactions, reach, comments count)
- Post templates library
- Video post support via `/{pageId}/videos` Graph API endpoint
- Webhook event types beyond `comment` (e.g., `reaction`, `mention`)
