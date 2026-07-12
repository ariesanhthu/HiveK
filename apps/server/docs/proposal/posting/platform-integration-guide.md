# Platform Integration Guide

> **Living Document** — This guide is a skeleton. Update it as each platform is implemented (Facebook first).
> The goal is to give any developer a clear checklist and decision tree for adding a new social platform.

---

## 1. Overview

This server supports posting to and receiving webhooks from multiple social platforms (Facebook, TikTok, Instagram, etc.).
All platforms share the same **domain model** (`SocialPageRoot`, `ScheduledPostRoot`, `AutoReplyRuleRoot`) and plug into
the system through a set of **port interfaces** defined in the Core layer.

Adding a new platform means:
1. Implementing the port interfaces in the Infrastructure layer.
2. Adding an OAuth flow in the Presentation layer.
3. Registering the new implementation in the NestJS module.

No changes to Core or Application layers should be needed for a standard platform.

---

## 2. Architecture Diagram (per platform)

```
Core Layer (no changes per platform)
  ISocialPublisher         ← publish post to platform
  ICommentReplier          ← reply to a comment
  IWebhookVerifier         ← verify incoming webhook signature
  ITokenRefresher          ← refresh an expiring token (optional)

Infrastructure Layer (one impl per platform)
  {Platform}PublisherService        implements ISocialPublisher
  {Platform}CommentReplierService   implements ICommentReplier
  {Platform}WebhookVerifier         implements IWebhookVerifier
  {Platform}TokenService            OAuth helpers (exchange, refresh)
  {Platform}GraphApiClient          thin HTTP wrapper

Presentation Layer (one controller per platform)
  {Platform}WebhookController       GET (challenge) + POST (events)
  {Platform}OAuthController         OAuth redirect + callback + connect
```

---

## 3. Step-by-Step Checklist

### Step 1 — Register the Platform Code

Add the platform to the `ESocialPlatformCode` enum:

```ts
// src/core/enums/social-platform-code.enum.ts
export enum ESocialPlatformCode {
  FACEBOOK  = 'facebook',
  TIKTOK    = 'tiktok',    // ← add new entries here
  INSTAGRAM = 'instagram',
}
```

> No other Core changes needed unless the platform requires a new domain concept.

---

### Step 2 — Define Platform-Specific Interfaces (Infrastructure)

Create a folder:
```
src/infrastructure/{platform}/
  {platform}.module.ts
  {platform}-graph-api.client.ts       // HTTP client (uses @nestjs/axios)
  {platform}-publisher.service.ts      // implements ISocialPublisher
  {platform}-comment-replier.service.ts // implements ICommentReplier
  {platform}-token.service.ts          // OAuth token helpers
  {platform}-webhook.verifier.ts       // implements IWebhookVerifier (if needed)
  interfaces/
    {platform}-api.interface.ts        // typed API request/response shapes
```

#### Rules:
- **No `any`** — All API responses must be explicitly typed in `interfaces/`.
- The HTTP client (`{platform}-graph-api.client.ts`) is a thin wrapper. No business logic lives here.
- Token encryption/decryption happens in the **repository mapper**, not in the API client.

---

### Step 3 — Implement ISocialPublisher

```ts
@Injectable()
export class {Platform}PublisherService implements ISocialPublisher {
  async publishPost(params: {
    pageToken: string;
    pageId: string;
    content: string;
    mediaUrls: string[];
  }): Promise<{ platformPostId: string }> {
    // call platform API
  }
}
```

**Decision Points to document per platform:**
- How are images uploaded? (direct URL vs. upload then reference)
- Does video require a separate async upload job?
- What is the max content length?
- Are there rate limits per token or per app?

---

### Step 4 — Implement ICommentReplier

```ts
@Injectable()
export class {Platform}CommentReplierService implements ICommentReplier {
  async replyToComment(params: {
    pageToken: string;
    commentId: string;
    message: string;
  }): Promise<void> {
    // call platform API
  }
}
```

**Decision Points:**
- Does the platform support reply-to-comment, or only top-level comments?
- Is there a dedicated endpoint or is it the same "create comment" endpoint?

---

### Step 5 — Token Lifecycle

Document the token lifecycle for each platform in the table below.

| Platform | Token Type | Expiry | Refresh Strategy |
|----------|-----------|--------|-----------------|
| Facebook | Permanent Page Access Token | Never (unless password change) | Re-run OAuth if 401 received |
| TikTok | *(fill when implemented)* | *(fill)* | *(fill)* |
| Instagram | *(fill when implemented)* | *(fill)* | *(fill)* |

**Implement `{Platform}TokenService` with at minimum:**
- `exchangeCodeForToken(code)` — converts OAuth callback code to access token
- `getPageToken(userToken, pageId)` — gets a page-specific token
- `refreshToken?(token)` — if the platform uses expiring tokens

**Storage**: tokens are always stored **AES-256 encrypted** in `SocialPageRoot.encryptedToken`.
Encryption/decryption is handled in `SocialPageMapper` (Infrastructure), transparent to Core.

---

### Step 6 — OAuth Flow (Presentation Layer)

Create a controller:
```
src/presentation/controllers/{platform}-oauth.controller.ts
```

Required endpoints:
```
GET  /api/social-pages/{platform}/oauth       → redirect to platform OAuth
GET  /api/social-pages/{platform}/callback    → handle OAuth callback, return page list
POST /api/social-pages/{platform}/connect     → finalize: save SocialPageRoot
```

**OAuth scopes needed (document per platform):**

| Platform | Required Scopes |
|----------|----------------|
| Facebook | `pages_manage_posts`, `pages_read_engagement`, `pages_messaging` |
| TikTok | *(fill when implemented)* |
| Instagram | *(fill when implemented)* |

---

### Step 7 — Webhook Endpoint (Presentation Layer)

Create a controller:
```
src/presentation/controllers/{platform}-webhook.controller.ts
```

Required endpoints:
```
GET  /api/webhooks/{platform}   → challenge verification (platform calls this on setup)
POST /api/webhooks/{platform}   → incoming events (comments, messages, etc.)
```

#### Mandatory webhook guardrails (implement for every platform):

| Guardrail | Implementation |
|-----------|---------------|
| **Signature verification** | Verify HMAC header using app secret before processing |
| **Infinite loop guard** | Drop events where the sender ID matches the page/bot ID |
| **Idempotency** | Redis `SETNX {platform}_comment:{eventId}` with 5-min TTL |
| **Rate limiting** | Redis token bucket per `pageId` (configurable per platform) |
| **Fast 200 OK** | Respond immediately, push to RabbitMQ for async processing |

**Document the signature header per platform:**

| Platform | Signature Header | Algorithm |
|----------|-----------------|-----------|
| Facebook | `X-Hub-Signature-256` | HMAC-SHA256 with app secret |
| TikTok | *(fill when implemented)* | *(fill)* |
| Instagram | `X-Hub-Signature-256` | HMAC-SHA256 with app secret |

---

### Step 8 — NestJS Module Registration

Add a `{Platform}Module` and import it into `PostingModule`:

```ts
// src/infrastructure/modules/posting.module.ts
@Module({
  imports: [
    FacebookModule,
    TikTokModule,   // ← add new platform module here
  ],
  providers: [
    // Bind the platform implementation to the DI token using a factory
    // or a named provider if multi-platform is needed simultaneously.
  ],
})
export class PostingModule {}
```

**DI binding strategy:**

Since `ISocialPublisher` and `ICommentReplier` are resolved by platform code at runtime,
use a **discovery service** pattern (similar to `PaymentProviderDiscoveryService`):

```ts
// Application layer resolves the correct publisher at runtime:
const publisher = this.publisherDiscovery.findByCode(post.platformCode);
await publisher.publishPost({ ... });
```

This avoids re-binding DI tokens for every new platform.

---

### Step 9 — Environment Variables

Document required env vars per platform:

```env
# Facebook
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_CALLBACK_URL=
FACEBOOK_WEBHOOK_IP_GUARD=true     # optional IP-based guard

# TikTok (fill when implemented)
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_CALLBACK_URL=

# Shared
SOCIAL_PAGE_TOKEN_SECRET=          # AES-256 key for token encryption
```

---

### Step 10 — Testing Checklist

Before marking a platform integration as complete, verify:

- [ ] OAuth flow: connect a real page, token stored encrypted in DB
- [ ] `publishPost`: text-only post publishes successfully
- [ ] `publishPost`: post with 1 image publishes successfully
- [ ] `publishPost`: post with video publishes successfully
- [ ] Webhook: platform sends challenge → server responds correctly
- [ ] Webhook: create a comment → server receives and processes event
- [ ] Webhook: duplicate webhook retry → idempotency guard deduplicates
- [ ] Webhook: self-comment (page replies) → infinite loop guard drops event
- [ ] Token refresh: if applicable, expired token triggers refresh flow
- [ ] Rate limit: rapid comments do not cause API ban (rate limiter activates)

---

## 4. Platform-Specific Notes

### 4.1 Facebook *(implemented)*
> Update this section as implementation progresses.

- **Token type**: Permanent Page Access Token — does not expire unless user changes password.
- **Media**: images passed as direct URLs to Graph API. Videos require async upload via Resumable Upload API.
- **Webhook event filter**: check `entry[].changes[].value.from.id !== page_id`.
- **Webhook signature**: `X-Hub-Signature-256` — `sha256=HMAC(body, FACEBOOK_APP_SECRET)`.
- **Known limits**: 200 API calls per hour per page token (as of Graph API v19+).
- **Page token acquisition**: User token → `GET /{page-id}?fields=access_token`.

### 4.2 TikTok *(planned)*
> Fill in when implementation begins.

### 4.3 Instagram *(planned)*
> Fill in when implementation begins. Note: Instagram uses the same Graph API as Facebook for business accounts.

---

## 5. Discovery Service Pattern (recommended)

To avoid tight coupling between the Application layer and specific platform implementations,
use a discovery registry (same pattern as `PaymentProviderDiscoveryService`):

```ts
// src/infrastructure/posting/social-publisher-discovery.service.ts
@Injectable()
export class SocialPublisherDiscoveryService {
  constructor(
    @Inject(SOCIAL_PUBLISHERS)
    private readonly publishers: Record<string, ISocialPublisher>
  ) {}

  findByCode(platformCode: string): ISocialPublisher {
    const publisher = this.publishers[platformCode];
    if (!publisher) throw new Error(`No publisher for platform: ${platformCode}`);
    return publisher;
  }
}
```

```ts
// Registered in PostingModule:
{
  provide: SOCIAL_PUBLISHERS,
  inject: [FacebookPublisherService],
  useFactory: (facebook: FacebookPublisherService) => ({
    facebook: facebook,
    // tiktok: tiktokService,  ← add new platform here
  }),
}
```

**DI tokens:**
```ts
export const SOCIAL_PUBLISHERS          = Symbol('SocialPublishers');
export const SOCIAL_PUBLISHER_DISCOVERY = Symbol('SocialPublisherDiscovery');
export const COMMENT_REPLIERS           = Symbol('CommentRepliers');
export const COMMENT_REPLIER_DISCOVERY  = Symbol('CommentReplierDiscovery');
```

---

## 6. Conventions Recap

| Rule | Detail |
|------|--------|
| Platform code | Lowercase string, stored in `ESocialPlatformCode` enum |
| Token storage | Always AES-256 encrypted; decrypted only in mapper |
| No `any` | Type all platform API shapes in `interfaces/` per platform folder |
| Webhook response | Always 200 OK immediately; processing is async |
| Idempotency key | `{platform}_{entityType}:{externalId}` in Redis |
| Rate limit key | `{platform}_rate:{pageId}` in Redis |
| Publisher discovery | Runtime lookup by `platformCode`, not compile-time DI binding |
| Module isolation | Each platform has its own NestJS module; imported into `PostingModule` |

