# Meta Threads Integration — Implementation Plan

> **Scope**: Add Meta Threads as a supported platform in the existing posting infrastructure.
> **Approach**: Leverage existing strategy patterns (`ISocialPageConnector`, `ISocialPublisher`, `ISocialPageConnectorFactory`, `ISocialPublisherDiscovery`) — no new aggregates, no new repositories.
> **Status**: Draft for review

---

## 1. High-Level Architecture

```
                          ┌─────────────────────────────────────┐
                          │   Existing Posting System           │
                          │                                     │
                          │  SocialPageRoot / ScheduledPostRoot │
                          │                                     │
                          │  SocialPageConnectorFactory         │
                          │    .findByCode('threads') ──────────┤
                          │                                     │
                          │  SocialPublisherDiscoveryService    │
                          │    .findByCode('threads') ──────────┤
                          └──────────────┬──────────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    │                                         │
                    ▼                                         ▼
    ┌─────────────────────────────┐          ┌─────────────────────────────┐
    │  ThreadsSocialPageConnector  │          │  ThreadsPublisherService    │
    │                              │          │                             │
    │  - base URL: graph.threads.net│         │  - 2-step container model   │
    │  - separate permission scope │          │  - TEXT / IMAGE / VIDEO     │
    │  - token on threads user     │          │  - CAROUSEL (future)        │
    └──────────────┬──────────────┘          └────────────┬────────────────┘
                   │                                      │
                   ▼                                      ▼
    ┌─────────────────────────────┐          ┌─────────────────────────────┐
    │  Meta Threads Graph API     │          │                             │
    │  graph.threads.net/v1.0     │          │  + Container status polling │
    └─────────────────────────────┘          │  for video posts            │
                                             └─────────────────────────────┘
```

### Key Design Principles

| Principle | Rationale |
|-----------|-----------|
| **No new aggregates** | Threads reuses `SocialPageRoot` and `ScheduledPostRoot` — only the `platformCode` differs (`threads`) |
| **No new repositories** | Existing `MongoSocialPageRepository` and `MongoScheduledPostRepository` are platform-agnostic |
| **Strategy pattern** | Threads registers its own `ISocialPageConnector` and `ISocialPublisher` implementations |
| **Existing endpoints reused** | `/client/v1/social-pages` and `/client/v1/scheduled-posts` work for Threads without changes |
| **Different OAuth flow** | Threads has its own OAuth endpoints and redirect flow (separate from Facebook) |

### What Changes vs What Stays

| Component | Status | Reason |
|-----------|--------|--------|
| `SocialPageRoot` aggregate | ✅ Unchanged | Platform-agnostic; only `platformCode` changes |
| `ScheduledPostRoot` aggregate | ✅ Unchanged | Platform-agnostic; publishing is delegated to strategy |
| `EPostStatus` enum | ✅ Unchanged | Reused as-is |
| `ESocialPlatformCode` enum | 🔧 Add `THREADS = 'threads'` | New member needed |
| `ISocialPageConnector` | ✅ Unchanged | Threads implements this interface |
| `ISocialPublisher` | 🔧 Extended | Threads publisher needs access to `ScheduledPostRoot` for container status polling |
| `MongoSocialPageRepository` | ✅ Unchanged | Already handles any platform |
| `MongoScheduledPostRepository` | ✅ Unchanged | Already handles any platform |
| `PostingModule` | 🔧 Register Threads services | Add to provider registries |
| `SocialPageController` | ✅ Unchanged | Same endpoints serve all platforms |
| `ScheduledPostController` | ✅ Unchanged | Same endpoints serve all platforms |

---

## 2. Enum Changes

### `ESocialPlatformCode` — Add Threads Member

**File**: `src/core/enums/social-platform-code.enum.ts`

```typescript
export enum ESocialPlatformCode {
  FACEBOOK = 'facebook',
  TIKTOK = 'tiktok',
  INSTAGRAM = 'instagram',
  THREADS = 'threads',       // ← NEW
}
```

---

## 3. Core Layer: Domain Events (New)

| Event Class | File | Trigger |
|-------------|------|---------|
| `ThreadsOAuthInitiatedEvent` | `src/core/events/threads-oauth-initiated.domain-event.ts` | When enterprise admin starts Threads OAuth flow |
| `ThreadsConnectedEvent` | `src/core/events/threads-connected.domain-event.ts` | When Threads page is successfully connected |

These are lightweight audit events. The existing `SocialPageConnectedEvent` still fires from `SocialPageRoot.create()`.

---

## 4. Infrastructure Layer: Threads HTTP Client

### 4.1 Threads Graph API Client

**File**: `src/infrastructure/threads/threads-graph-api.client.ts`

Thin HTTP wrapper around `graph.threads.net/v1.0` using `@nestjs/axios` `HttpService`.

```typescript
@Injectable()
export class ThreadsGraphApiClient {
  private readonly baseUrl = 'https://graph.threads.net/v1.0';

  constructor(private readonly httpService: HttpService) {}

  /** Exchange OAuth code → short-lived token */
  async exchangeCodeForToken(params: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    code: string;
  }): Promise<ShortLivedTokenResponse> { /* ... */ }

  /** Exchange short-lived → long-lived token (60 days) */
  async exchangeForLongLivedToken(params: {
    accessToken: string;
    clientSecret: string;
  }): Promise<LongLivedTokenResponse> { /* ... */ }

  /** Refresh a long-lived token before expiry */
  async refreshToken(accessToken: string): Promise<TokenRefreshResponse> { /* ... */ }

  /** Get user profile */
  async getUserProfile(accessToken: string): Promise<UserProfileResponse> { /* ... */ }

  /** Step 1: Create media container */
  async createMediaContainer(params: CreateContainerParams): Promise<ContainerCreationResponse> { /* ... */ }

  /** Step 2: Poll container status (required for video) */
  async getContainerStatus(containerId: string): Promise<ContainerStatusResponse> { /* ... */ }

  /** Step 3: Publish container */
  async publishContainer(userId: string, creationId: string): Promise<PublishResponse> { /* ... */ }

  /** Delete a post */
  async deletePost(postId: string): Promise<PostDeletionResponse> { /* ... */ }
}
```

### 4.2 TypeScript Types (dedicated file)

**File**: `src/infrastructure/threads/threads-api.types.ts`

Full TypeScript type definitions from the research doc:

| Type | Purpose |
|------|---------|
| `ThreadsPermissionScope` | `threads_basic`, `threads_content_publish`, `threads_manage_insights`, `threads_manage_replies`, `threads_read_replies` |
| `ThreadsMediaType` | `TEXT`, `IMAGE`, `VIDEO`, `CAROUSEL` |
| `ShortLivedTokenRequest/Response` | Auth code → token exchange |
| `LongLivedTokenRequest/Response` | Short → long exchange |
| `TokenRefreshRequest/Response` | Token refresh |
| `UserProfileResponse` | User info |
| `BaseContainerRequest`, `ImageContainerRequest`, `VideoContainerRequest`, `CarouselChildContainerRequest`, `CarouselParentContainerRequest` | Container creation payloads |
| `ContainerStatusResponse` | Status polling result |
| `PublishRequest/Response` | Publish result |
| `PostAnalyticsResponse` | Metrics |

### 4.3 Threads Publisher Service

**File**: `src/infrastructure/threads/threads-publisher.service.ts`

Implements `ISocialPublisher` with the **two-step container model**:

```
ScheduledPostPublishHandler
       │
       ▼
ThreadsPublisherService.publishPost({ pageToken, pageId, content, mediaUrls })
       │
       ├── Determine media_type: TEXT | IMAGE | VIDEO
       │      (no media = TEXT, 1 image = IMAGE, 1 video = VIDEO)
       │
       ├── Step 1: Create media container
       │      POST /{user-id}/threads
       │      { media_type, text, image_url?, video_url? }
       │      → receives creation_id (24h TTL)
       │
       ├── [If VIDEO] Step 1.5: Poll container status
       │      GET /{container-id}?fields=status_code
       │      Poll every 2s until FINISHED | FAILED | EXPIRED
       │      Max retries: 30 (60 seconds)
       │
       └── Step 2: Publish container
              POST /{user-id}/threads_publish?creation_id={id}
              → receives final media_id (public Threads post ID)
```

**Important adaptation for `ISocialPublisher` interface**:

The existing `ISocialPublisher.publishPost` signature expects `{ pageToken, pageId, content, mediaUrls }` and returns `{ platformPostId }`. However, the Threads API requires:

- **`pageId` = user-id** (Threads user ID, not a page ID like Facebook)
- **`pageToken` = long-lived user token** (Threads has no page tokens — it's user-level)
- **Media URLs must be publicly accessible HTTPS URLs** (same as Facebook)
- **Video requires status polling** (unlike Facebook which handles it asynchronously)

The `ScheduledPostPublishHandler` currently uses a **multi-step UoW pattern**:
1. UoW: `markPublishing()` + `repo.save()`
2. Outside UoW: `publisher.publishPost(...)` — external API call
3. UoW: `markPublished()`/`markFailed()` + `eventService.publishEvents()`

The Threads publisher handles the **container creation + polling + publishing** inside step 2, abstracting the complexity from the handler. The handler does not need to change.

**Threads User ID resolution**: The publisher resolves the Threads user ID from the social page's `pageId` field (which stores the platform-native user ID at connect time).

### 4.4 Threads Connector Service

**File**: `src/infrastructure/threads/threads-social-page-connector.service.ts`

Implements `ISocialPageConnector`:

| Method | Implementation |
|--------|---------------|
| `getPlatformCode()` | Returns `ESocialPlatformCode.THREADS` |
| `exchangeCodeForToken(code, redirectUri)` | Calls `ThreadsGraphApiClient.exchangeCodeForToken()` |
| `exchangeForLongLivedToken(token)` | Calls `ThreadsGraphApiClient.exchangeForLongLivedToken()` |
| `getUserAccounts(token)` | Returns a single "account": the Threads user profile (Threads is user-level, not page-level) |
| `getPageDetails(pageToken, pageId)` | Fetches Threads user profile via `ThreadsGraphApiClient.getUserProfile()` |

**Key differences from Facebook connector**:

| Aspect | Facebook | Threads |
|--------|----------|---------|
| Auth base URL | `facebook.com/login` | `threads.net/oauth/authorize` |
| Graph API host | `graph.facebook.com` | `graph.threads.net` |
| Token scope | User token → Page token | Direct user token only (no page tokens) |
| `getUserAccounts()` | Returns multiple pages | Returns 1 entry (the user's own profile) |
| `getPageDetails()` | Fetches page metadata | Fetches user profile (id, username, name, picture, bio) |
| Token lifetime | 60 days (refreshable) | 60 days (refreshable via `th_refresh_token`) |
| Token refresh grant | `fb_exchange_token` | `th_refresh_token` |

### 4.5 Threads OAuth Config Service

**File**: `src/infrastructure/threads/threads-oauth-config.service.ts`

Provides Threads-specific OAuth configuration:

```typescript
@Injectable()
export class ThreadsOAuthConfigService {
  constructor(@Inject(CONFIG_SERVICE) private readonly config: IConfigService) {}

  get clientId()       { return this.config.get('THREADS_APP_ID'); }
  get clientSecret()   { return this.config.get('THREADS_APP_SECRET'); }
  get redirectUri()    { return this.config.get('THREADS_CALLBACK_URL'); }
  get scopes()         { return ['threads_basic', 'threads_content_publish']; }

  /** Build the OAuth authorization URL */
  buildAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(','),
      response_type: 'code',
      state,
    });
    return `https://threads.net/oauth/authorize?${params}`;
  }
}
```

### 4.6 Threads Module

**File**: `src/infrastructure/threads/threads.module.ts`

```typescript
@Module({
  imports: [HttpModule.register({ baseURL: 'https://graph.threads.net/v1.0' })],
  providers: [
    ThreadsGraphApiClient,
    ThreadsOAuthConfigService,
    { provide: SOCIAL_PAGE_CONNECTOR, useClass: ThreadsSocialPageConnectorService }, // concrete
    { provide: SOCIAL_PUBLISHER, useClass: ThreadsPublisherService },               // concrete
  ],
  exports: [
    ThreadsGraphApiClient,
    ThreadsOAuthConfigService,
    ThreadsPublisherService,
    ThreadsSocialPageConnectorService,
  ],
})
export class ThreadsModule {}
```

### 4.7 Register in PostingModule

The `PostingModule` needs two additional registrations:

```typescript
// In providers array:
{
  provide: SOCIAL_PAGE_CONNECTORS,
  inject: [
    FacebookSocialPageConnectorService,
    ThreadsSocialPageConnectorService,      // ← ADD
  ],
  useFactory: (
    facebook: FacebookSocialPageConnectorService,
    threads: ThreadsSocialPageConnectorService,  // ← ADD
  ) => ({
    facebook,
    threads,                                     // ← ADD
  }),
},
{
  provide: SOCIAL_PUBLISHERS,
  inject: [
    FacebookPublisherService,
    ThreadsPublisherService,                // ← ADD
  ],
  useFactory: (
    facebook: FacebookPublisherService,
    threads: ThreadsPublisherService,       // ← ADD
  ) => ({
    facebook,
    threads,                                // ← ADD
  }),
},
// Also export:
ThreadsModule,                              // ← ADD to imports
```

---

## 5. Presentation Layer: New OAuth Endpoints

### 5.1 Threads OAuth Controller

**File**: `src/presentation/controllers/http/client/threads-oauth.controller.ts`

Reuses the existing Facebook OAuth pattern (`StateAuthGuard`, `@WebHook()`, JWT state param).

| Method | Path | Guards | Description |
|--------|------|--------|-------------|
| `GET` | `/client/v1/social-pages/threads/oauth` | 🔒 JwtAuth + Roles(Enterprise) + UserVerified | Generate Threads OAuth URL with JWT state |
| `GET` | `/client/v1/social-pages/threads/callback` | 🔓 WebHook + StateAuthGuard | OAuth callback: exchange code → long-lived token → create SocialPageRoot |

### 5.2 OAuth Flow

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│  Threads OAuth → Callback → Connect → Redirect                                      │
│                                                                                     │
│  BROWSER              SERVER                      THREADS PLATFORM                  │
│    │                     │                            │                              │
│    │  1. GET /threads/oauth│                          │                              │
│    │────────►────────────│                            │                              │
│    │                     │  2. Sign JWT (sub, role)   │                              │
│    │                     │     as OAuth state          │                              │
│    │  { url } ◄─────────│                            │                              │
│    │                     │                            │                              │
│    │  3. Redirect to     │                            │                              │
│    │     threads.net     │                            │                              │
│    │     /oauth/authorize│                            │                              │
│    │─────────────────────────────────────────────────►│                              │
│    │                     │                            │                              │
│    │  4. User authorizes │                            │                              │
│    │◄─────────────────────────────────────────────────│                              │
│    │                     │                            │                              │
│    │  5. Redirect w/     │                            │                              │
│    │     code + state    │                            │                              │
│    │────────►────────────│                            │                              │
│    │                     │                            │                              │
│    │                     │  6. StateAuthGuard         │                              │
│    │                     │     verifies JWT state     │                              │
│    │                     │                            │                              │
│    │                     │  7. Exchange code + client │                              │
│    │                     │     secret → short token ─►│                              │
│    │                     │◄── short-lived token ──────│                              │
│    │                     │                            │                              │
│    │                     │  8. Exchange short → long  │                              │
│    │                     │     (th_exchange_token) ───►│                              │
│    │                     │◄── 60-day token ───────────│                              │
│    │                     │                            │                              │
│    │                     │  9. fetch /me (profile)    │                              │
│    │                     │───────────────────────────►│                              │
│    │                     │◄── id, username, name ─────│                              │
│    │                     │                            │                              │
│    │                     │  10. Upsert SocialPageRoot  │                              │
│    │                     │      platformCode: 'threads'│                              │
│    │                     │      pageId: user.id        │                              │
│    │                     │      pageName: user.name    │                              │
│    │                     │      encryptedToken: token  │                              │
│    │                     │                            │                              │
│    │  11. Redirect to FE  │                            │                              │
│    │◄── ?success=true ────│                            │                              │
│    │                     │                            │                              │
└───────────────────────────────────────────────────────────────────────────────────┘
```

**Step-by-step**:

1. **Frontend calls** `GET /client/v1/social-pages/threads/oauth`
2. **Controller** signs short-lived JWT (`{ sub: userId, email, role }`, 10-min expiry) as OAuth `state`
3. **Browser redirects** to Threads consent screen
   - URL: `https://threads.net/oauth/authorize?client_id={app-id}&redirect_uri={callback}&scope=threads_basic,threads_content_publish&response_type=code&state={jwt}`
   - **Scopes**: `threads_basic` (profile), `threads_content_publish` (posting)
4. **User authorizes** → Threads redirects to callback with `?code=...&state=...`
5. **Callback** hits `GET /client/v1/social-pages/threads/callback` with `@WebHook()` and `StateAuthGuard`
6. **Connector** exchanges code → short-lived token (POST to `graph.threads.net/oauth/access_token`)
7. **Connector** exchanges short-lived → long-lived token (GET `graph.threads.net/access_token?grant_type=th_exchange_token`)
8. **Connector** fetches user profile (GET `graph.threads.net/v1.0/{user-id}?fields=id,username,name`)
9. **Controller** executes `SocialPageConnectCommand` (existing handler):
   - Uses Threads connector via `SocialPageConnectorFactory.findByCode('threads')`
   - Upserts `SocialPageRoot` with `platformCode: 'threads'`, `pageId: threads_user_id`, `pageName: threads_username`
10. **Redirect** to frontend with `?success=true`

### 5.3 Thread-Specific Endpoints (Future)

The existing `ScheduledPostController` already handles all CRUD for scheduled posts across platforms. No new REST endpoints are needed for the creation/scheduling/cancellation flows.

---

## 6. Publishing Flow Detail

### 6.1 Standard Publish (Text / Single Image)

```
PostPublishJob picks up SCHEDULED post
       │
       ▼
ScheduledPostPublishHandler.execute(postId)
       │
       ├─ Step 1 (UoW):
       │   ├─ Load post (platformCode === 'threads')
       │   ├─ post.markPublishing()
       │   └─ repo.save()
       │
       ├─ Step 2 (outside UoW):
       │   ├─ Load SocialPageRoot → decrypted token
       │   ├─ Resolve media URLs from mediaFileIds (Cloudinary)
       │   ├─ publisher = SocialPublisherDiscovery.findByCode('threads')
       │   └─ publisher.publishPost({
       │        pageToken: longLivedUserToken,
       │        pageId: threadsUserId,
       │        content: post.content,         // max 500 chars
       │        mediaUrls: [...]
       │      })
       │       │
       │       ├── No media → create TEXT container
       │       │     POST /{user-id}/threads?media_type=TEXT&text=...
       │       │     → creation_id
       │       │     → POST /{user-id}/threads_publish?creation_id=...
       │       │     → media_id
       │       │
       │       ├── Single image → create IMAGE container
       │       │     POST /{user-id}/threads?media_type=IMAGE&image_url=...
       │       │     → creation_id
       │       │     → POST /{user-id}/threads_publish?creation_id=...
       │       │     → media_id
       │       │
       │       └── Single video → create VIDEO container + poll status
       │             POST /{user-id}/threads?media_type=VIDEO&video_url=...
       │             → creation_id
       │             → poll GET /{container-id}?fields=status_code every 2s
       │             → FINISHED → POST /{user-id}/threads_publish?creation_id=...
       │             → media_id
       │
       └─ Step 3 (UoW):
           ├─ post.markPublished(media_id)
           ├─ repo.save()
           └─ eventService.publishEvents(post)
```

### 6.2 Content Length Validation

Threads imposes a **500 grapheme** limit on post content. The `ThreadsPublisherService` validates content length before creating the container. If the content exceeds 500 characters, it throws a domain exception.

This validation could also be done at the DTO/command level for earlier feedback, but the publisher is the authoritative check.

### 6.3 Video Polling Strategy

For video posts, the publisher polls the container status:

```typescript
private async waitForContainerReady(containerId: string): Promise<void> {
  const maxAttempts = 30;  // ~60 seconds max wait
  const delayMs = 2000;    // Poll every 2 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await this.apiClient.getContainerStatus(containerId);
    
    switch (status.status_code) {
      case 'FINISHED':
        return;
      case 'FAILED':
        throw new Error(`Threads video processing failed: ${status.error_message}`);
      case 'EXPIRED':
        throw new Error('Threads container expired before publishing');
      case 'IN_PROGRESS':
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
    }
  }

  throw new Error('Threads video processing timed out after 60 seconds');
}
```

### 6.4 Carousel Support (Future Phase)

Carousels require a more complex flow:

1. Create N child containers with `is_carousel_item=true`
2. Poll each child until FINISHED
3. Create parent CAROUSEL container linking all children
4. Publish parent container

Deferred to a future phase. The initial implementation supports TEXT, IMAGE, and VIDEO only.

---

## 7. Infrastructure Layer: Folder Structure

```
src/infrastructure/threads/
├── threads.module.ts                  # NestJS module
├── threads-graph-api.client.ts       # HTTP client for graph.threads.net
├── threads-api.types.ts              # Full TypeScript type definitions
├── threads-publisher.service.ts      # Implements ISocialPublisher
├── threads-social-page-connector.service.ts  # Implements ISocialPageConnector
└── threads-oauth-config.service.ts   # OAuth configuration & URL builder
```

---

## 8. Rate Limiting & Error Handling

### 8.1 Publishing Rate Limit

Threads allows **250 posts per 24 hours** per user profile (sliding window).

```typescript
// In ThreadsPublisherService.publishPost() — after successful publish:
await this.cacheService.set(
  `threads_rate:{userId}:${Date.now()}`,
  1,
  24 * 60 * 60, // 24h TTL
);
```

The system should track recently published posts per social page and reject publishing if approaching the limit. This can be implemented as a Redis sorted set with timestamp scores.

### 8.2 Token Refresh

Threads long-lived tokens expire in **60 days**. The existing `SocialPageRefreshTokenHandler` is extended to support Threads:

```typescript
// In ThreadsSocialPageConnectorService:
async exchangeForLongLivedToken(token: string): Promise<string> {
  return this.apiClient.exchangeForLongLivedToken({
    accessToken: token,
    clientSecret: this.config.clientSecret,
  }).then(r => r.access_token);
}

// Token refresh (called by SocialPageRefreshTokenHandler via connector factory):
// This already works because SocialPageRefreshTokenHandler uses
// connectorFactory.findByCode(socialPage.platformCode).exchangeForLongLivedToken(...)
```

The existing daily cron job that checks tokens expiring within 7 days will automatically handle Threads tokens, because it uses `SocialPageConnectorFactory.findByCode()` which delegates to the threads connector.

### 8.3 Error Code Reference

| HTTP Status | Threads Error | Handling |
|-------------|---------------|----------|
| `400` | Invalid parameter (e.g., content > 500 chars) | Throw domain exception, catch in handler → `markFailed()` |
| `401` | Token expired/invalid | Mark token as expired → trigger reconnection flow |
| `429` | Rate limit exceeded | Backoff + retry with exponential delay (max 3 retries) |
| `500` | Server error | Transient failure → retry up to 3 times |

### 8.4 Token Failure Handling

If a token refresh fails (HTTP 401), follow the existing pattern:
1. Mark the `SocialPageRoot` as inactive (`deactivate()`)
2. `markFailed()` any pending scheduled posts for that page
3. Emit alert event for enterprise notification

---

## 9. Environment Variables

Add to `.env.example`:

```bash
# Threads API (Meta)
THREADS_APP_ID=your_threads_app_id
THREADS_APP_SECRET=your_threads_app_secret
THREADS_CALLBACK_URL=https://api.yourdomain.com/client/v1/social-pages/threads/callback
```

---

## 10. File Map (Summary of New/Modified Files)

### New Files

| File | Layer | Description |
|------|-------|-------------|
| `src/core/enums/social-platform-code.enum.ts` | Core | 🔧 Modified — add `THREADS = 'threads'` |
| `src/core/events/threads-oauth-initiated.domain-event.ts` | Core | New event |
| `src/core/events/threads-connected.domain-event.ts` | Core | New event |
| `src/infrastructure/threads/threads.module.ts` | Infrastructure | NestJS module |
| `src/infrastructure/threads/threads-graph-api.client.ts` | Infrastructure | HTTP client |
| `src/infrastructure/threads/threads-api.types.ts` | Infrastructure | TypeScript types |
| `src/infrastructure/threads/threads-publisher.service.ts` | Infrastructure | ISocialPublisher impl |
| `src/infrastructure/threads/threads-social-page-connector.service.ts` | Infrastructure | ISocialPageConnector impl |
| `src/infrastructure/threads/threads-oauth-config.service.ts` | Infrastructure | OAuth config |
| `src/presentation/controllers/http/client/threads-oauth.controller.ts` | Presentation | OAuth endpoints |
| `docs/proposal/platform-thread/plan.md` | Docs | This document |

### Modified Files

| File | Change |
|------|--------|
| `src/core/enums/social-platform-code.enum.ts` | Add `THREADS = 'threads'` |
| `src/infrastructure/modules/posting.module.ts` | Register Threads services in SOCIAL_PAGE_CONNECTORS and SOCIAL_PUBLISHERS providers |

---

## 11. Implementation Phases

### Phase 1 — Core & Infrastructure Foundation
- [ ] Add `THREADS = 'threads'` to `ESocialPlatformCode` enum
- [ ] Create `threads-api.types.ts` — all Threads API TypeScript types
- [ ] Create `threads-graph-api.client.ts` — HTTP client for `graph.threads.net`
- [ ] Create `threads-oauth-config.service.ts` — OAuth config and URL builder
- [ ] Create `threads-social-page-connector.service.ts` — implements `ISocialPageConnector`
- [ ] Create `threads-publisher.service.ts` — implements `ISocialPublisher` with container model + video polling
- [ ] Create `threads.module.ts` — NestJS module
- [ ] Register Threads services in `PostingModule` (connectors + publishers)

### Phase 2 — OAuth Flow
- [ ] Create `threads-oauth.controller.ts` — OAuth endpoints (`/threads/oauth`, `/threads/callback`)
- [ ] Test full OAuth flow: init → authorize → callback → connect

### Phase 3 — Publishing & Scheduling
- [ ] Verify `ScheduledPostCreateHandler` works with `platformCode: 'threads'`
- [ ] Verify `PostPublishJob` picks up Threads posts via `findDueForPublishing()`
- [ ] Verify `ScheduledPostPublishHandler` resolves the Threads publisher via `SocialPublisherDiscovery.findByCode('threads')`
- [ ] End-to-end test: create scheduled post → cron picks up → publish via Threads API

### Phase 4 — Token Refresh
- [ ] Verify `SocialPageRefreshTokenHandler` works with Threads connector (uses `th_refresh_token` grant type)
- [ ] Verify daily token refresh cron covers Threads tokens

### Phase 5 — Polish & Error Handling
- [ ] Rate limit tracking per Threads user (Redis)
- [ ] Exponential backoff on transient failures
- [ ] Test error scenarios: invalid token, rate limit, content too long, video timeout

### Future Phases (Out of Scope Now)
- [ ] Carousel support (multi-image/mixed-media)
- [ ] Reply threading (`reply_to_id` parameter)
- [ ] Analytics/insights (`threads_manage_insights` scope)
- [ ] Auto-reply to comments on Threads posts (`threads_manage_replies`, `threads_read_replies`)

---

## 12. Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Video processing delay in polls | Timeout & failure | Set reasonable max poll time (60s), fail gracefully with `markFailed()` |
| OAuth desync (code 100 / subcode 10) | Connection failures | Add documentation for troubleshooting (toggle Live/Development mode in Meta Dashboard) |
| 500-char content limit | Post rejection | Validate at publisher level with clear error message; consider frontend character counter |
| Token expiry without refresh | Silent failures | Daily cron + early warning (7 days before expiry) |
| 429 rate limit (250/day) | Publishing blocked | Track via Redis sorted set; queue and defer posts when approaching limit |

---

## 13. Testing Strategy

### Unit Tests
- `ThreadsPublisherService` — container creation params, status polling logic, content validation
- `ThreadsSocialPageConnectorService` — OAuth exchange, profile fetch, token refresh
- `ThreadsGraphApiClient` — URL construction, response parsing (with mocked HTTP)

### Integration Tests
- OAuth flow: mock `ThreadsGraphApiClient` responses, test controller behavior
- Publishing: mock API responses, verify `ScheduledPostRoot` status transitions

### E2E Tests
- Full scheduled post lifecycle with mocked Threads API
- Token refresh cycle

---

## 14. Key Conventions Reference

| Rule | Application |
|------|-------------|
| File naming: kebab-case + suffix | `threads-publisher.service.ts` |
| Class naming: PascalCase + Domain | `ThreadsPublisherService` |
| DI token: SCREAMING_SNAKE_CASE | `SOCIAL_PAGE_CONNECTORS` (reused) |
| No `any` | All Threads API responses typed via `threads-api.types.ts` |
| Enum members: SCREAMING_SNAKE_CASE | `ESocialPlatformCode.THREADS = 'threads'` |
| DB fields: snake_case | Reused existing schemas |
| Transactions: all writes in `uow.execute()` | Publishing handler uses multi-step UoW (pre-existing pattern) |
| Events: via outbox | Existing `PostScheduledEvent`, `PostPublishedEvent`, `PostFailedEvent` reused |