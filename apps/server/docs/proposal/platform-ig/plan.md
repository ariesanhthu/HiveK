# Instagram Graph API — Implementation Plan

> **Scope**: Add Instagram (Business/Creator accounts) as a supported platform in the existing social-network infrastructure.
> **Approach**: Leverage existing strategy patterns (`ISocialPageConnector`, `ISocialPublisher`, `ISocialPageConnectorFactory`, `ISocialPublisherDiscovery`) — no new aggregates, no new repositories.
> **Research**: [`docs/proposal/platform-ig/research.md`](./research.md)
> **Integration guide**: [`docs/tech/social-network/SUMMARY.md`](../../tech/social-network/SUMMARY.md)
> **Domain doc**: [`docs/domain/social-page-domain.md`](../../domain/social-page-domain.md)
> **Status**: Draft for review

---

## 1. High-Level Architecture

```
                          ┌──────────────────────────────────────────────────┐
                          │           SocialNetworkModule                    │
                          │                                                  │
                          │  SocialPageConnectorFactory                      │
                          │    .findByCode('instagram') ─────────────────────┤
                          │                                                  │
                          │  SocialPublisherDiscoveryService                 │
                          │    .findByCode('instagram') ─────────────────────┤
                          └─────────────────┬────────────────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    │                                               │
                    ▼                                               ▼
    ┌──────────────────────────────────┐      ┌─────────────────────────────────┐
    │ InstagramSocialPageConnector      │      │ InstagramPublisherService       │
    │                                   │      │                                  │
    │  Uses **Facebook OAuth** flow    │      │  3-step container model:         │
    │  (same graph.facebook.com host)   │      │   1. Create container            │
    │                                   │      │   2. Poll container status       │
    │  Key diff: discovers IG Business  │      │   3. Publish container           │
    │  Account ID from Facebook Pages   │      │                                  │
    │  (/me/accounts?fields=ig_biz_acct)│      │  Media types: IMAGE, VIDEO,      │
    └──────────────────────────────────┘      │  REELS, STORIES, CAROUSEL         │
                                               └─────────────────────────────────┘
```

### Key Design Principles

| Principle | Rationale |
|-----------|-----------|
| **Instagram reuses Facebook OAuth** | Facebook User Token (from FB OAuth) grants Instagram access — no separate IG login. The IG Business Account ID is discovered through the user's Facebook Pages. |
| **Same Graph API host** | `graph.facebook.com/v21.0` — unlike Threads which uses `graph.threads.net`, Instagram routes through the same host as Facebook. However, Instagram also uses a **dedicated Graph API endpoint** for containers (`/{ig-user-id}/media`). |
| **Strategy pattern** | Instagram registers its own `ISocialPageConnector` and `ISocialPublisher` via the existing multi-provider DI maps |
| **No new aggregates** | Reuses `SocialPageRoot` and `ScheduledPostRoot` — only `platformCode` differs (`instagram`) |
| **3-step publish** vs 1-step (FB) / 2-step (Threads): Instagram requires create container → poll status → publish container |

### What Changes vs What Stays

| Component | Status | Reason |
|-----------|--------|--------|
| `SocialPageRoot` aggregate | ✅ Unchanged | Platform-agnostic; only `platformCode` changes |
| `ScheduledPostRoot` aggregate | ✅ Unchanged | Platform-agnostic; publishing is delegated to strategy |
| `EPostStatus` enum | ✅ Unchanged | Reused as-is |
| `ESocialPlatformCode` enum | 🔧 Add `INSTAGRAM = 'instagram'` | Already defined; verify it's in the enum |
| `ISocialPageConnector` | ✅ Unchanged | Instagram implements this interface |
| `ISocialPublisher` | ✅ Unchanged | Signature `publishPost({pageToken, pageId, content, mediaUrls})` works |
| `ICommentReplier` | ❌ Not applicable | Instagram Graph API does not support comment reply via Graph API for Business Accounts (use Facebook's commenting API instead — out of scope) |
| `MongoSocialPageRepository` | ✅ Unchanged | Already handles any platform |
| `MongoScheduledPostRepository` | ✅ Unchanged | Already handles any platform |
| `SocialNetworkModule` | 🔧 Register Instagram services | Add to 3 provider registries (connectors, publishers) |
| `SocialPageController` | ✅ Unchanged | Same endpoints serve all platforms |
| `ScheduledPostController` | ✅ Unchanged | Same endpoints serve all platforms |
| OAuth endpoints | 🔧 Add `/instagram/oauth` + `/instagram/callback` | Instagram redirects through Facebook OAuth; callback is same `graph.facebook.com` flow but the connector handles IG-specific post-callback logic |

---

## 2. Instagram Architecture: Unique Patterns

### 2.1 Facebook Dependency Chain

```
Instagram Professional Account (Business or Creator)
        │
        │ MUST be linked to a...
        │
        ▼
  Facebook Page (admin control required)
        │
        │ Discovered via /me/accounts?fields=instagram_business_account{id,name,username}
        │
        ▼
  Instagram Business Account ID (ig-user-id)
        │
        │ Used as {ig-user-id} in all API calls:
        │   POST /{ig-user-id}/media
        │   POST /{ig-user-id}/media_publish
        │
        ▼
  Uses same Facebook Long-Lived User Token
```

**Critical implication**: Instagram cannot be connected independently. The user must:
1. Have a Facebook Page they manage
2. Have that Page linked to an Instagram Business/Creator account
3. Authorize via Facebook OAuth (not a separate Instagram login)

### 2.2 Token Architecture

Instagram uses the **same Facebook Long-Lived User Token** for API calls — there is no separate Instagram access token. The token is obtained through the standard Facebook OAuth flow with Instagram-specific scopes:

| Scope | Purpose |
|-------|---------|
| `instagram_basic` | Read profile data, identify linked IG accounts |
| `instagram_content_publish` | Upload media, publish posts/reels/stories |
| `pages_show_list` | List Facebook Pages (required to discover IG Business Account) |
| `pages_read_engagement` | Read Page metadata (required to bridge auth gap) |

### 2.3 Instagram vs Threads Container Model

| Aspect | Threads | Instagram |
|--------|---------|-----------|
| Publish steps | 2-step (create → publish) | 3-step (create → **poll status** → publish) |
| Polling required | Only for video | **Always** (images also processed async, though near-instant) |
| Container TTL | 24h | 24h |
| Text-only | ✅ Supported (TEXT type) | ❌ **Not supported** — every post needs media |
| Content limit | 500 chars | 2,200 chars |
| Media types | TEXT, IMAGE, VIDEO, CAROUSEL | IMAGE, VIDEO, REELS, STORIES, CAROUSEL |
| Auth base | `graph.threads.net` | `graph.facebook.com` (same as FB) |

### 2.4 Media Container Types

| Type | Description | Notes |
|------|-------------|-------|
| **IMAGE** | Single image post | JPEG/PNG, max 8MB, min 200x200px |
| **VIDEO / REELS** | Single video post | MP4/MOV, max 300MB, 3s–60min duration |
| **STORIES** | Ephemeral story | Sets `media_type=STORIES`; captions ignored |
| **CAROUSEL** | 2–10 slides (mixed image/video) | Create child containers first, then parent with `media_type=CAROUSEL`; consistent aspect ratio required |

---

## 3. Enum Changes

### `ESocialPlatformCode` — Verify Instagram Entry

**File**: `src/core/enums/social-platform-code.enum.ts`

```typescript
export enum ESocialPlatformCode {
  FACEBOOK = 'facebook',
  THREADS = 'threads',
  TIKTOK = 'tiktok',
  INSTAGRAM = 'instagram',       // ← verify this exists (should already be there)
}
```

---

## 4. Core Layer: Domain Events

Instagram reuses the existing domain events:

| Event | Trigger | Status |
|-------|---------|--------|
| `SocialPageConnectedEvent` | `SocialPageRoot.create()` | ✅ Reused — fires when IG account is upserted |
| `PostScheduledEvent` | `ScheduledPostRoot.schedule()` | ✅ Reused |
| `PostPublishedEvent` | `ScheduledPostRoot.markPublished()` | ✅ Reused |
| `PostFailedEvent` | `ScheduledPostRoot.markFailed()` | ✅ Reused |

**No new domain events needed**. The Instagram OAuth flow uses the same Facebook OAuth events mechanism (JWT state → callback → connect). Unlike Threads which had dedicated `ThreadsOAuthInitiatedEvent` and `ThreadsConnectedEvent`, Instagram routes through the same Facebook callback and connector flow — the standard `SocialPageConnectedEvent` is sufficient.

---

## 5. Infrastructure Layer: Instagram HTTP Client

### 5.1 Instagram Graph API Client

**File**: `src/infrastructure/social-network/instagram/instagram-graph-api.client.ts`

Thin HTTP wrapper around the Meta Graph API (`graph.facebook.com/v21.0`) — **same host** as the Facebook connector, but Instagram-specific endpoint patterns.

```typescript
@Injectable()
export class InstagramGraphApiClient {
  private readonly baseUrl = 'https://graph.facebook.com/v21.0';

  constructor(private readonly httpService: HttpService) {}

  // ─── OAuth (reuses Facebook's /oauth/access_token endpoint) ───

  /** Exchange OAuth code → short-lived user token */
  async exchangeCodeForToken(params: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    code: string;
  }): Promise<{ access_token: string }> {
    // POST https://graph.facebook.com/v21.0/oauth/access_token
    // Same endpoint as Facebook OAuth
  }

  /** Exchange short-lived → long-lived token (60 days) */
  async exchangeForLongLivedToken(params: {
    accessToken: string;
    clientSecret: string;
  }): Promise<{ access_token: string; expires_in: number }> {
    // GET /oauth/access_token?grant_type=fb_exchange_token&...
    // Same endpoint as Facebook
  }

  /** Refresh a long-lived token */
  async refreshToken(accessToken: string): Promise<{ access_token: string }> {
    // GET /oauth/access_token?grant_type=fb_exchange_token&...
    // Same as Facebook refresh
  }

  // ─── Account Discovery ───

  /** Discover linked Instagram Business Accounts from Facebook Pages */
  async discoverInstagramAccounts(userAccessToken: string): Promise<InstagramBusinessAccount[]> {
    // GET /me/accounts?fields=id,name,instagram_business_account{id,name,username,profile_picture_url}
    // Returns pages → extracts instagram_business_account data
  }

  /** Get Instagram Business Account details */
  async getBusinessAccountDetails(igUserId: string, accessToken: string): Promise<InstagramAccountDetails> {
    // GET /{ig-user-id}?fields=id,name,username,profile_picture_url,followers_count,media_count
  }

  // ─── Publishing (Container Model) ───

  /** Step 1a: Create IMAGE container */
  async createImageContainer(params: {
    igUserId: string;
    imageUrl: string;       // Public HTTPS URL
    caption?: string;       // Max 2,200 chars
    accessToken: string;
  }): Promise<{ id: string }> {
    // POST /{ig-user-id}/media
    // { image_url, caption }
  }

  /** Step 1b: Create VIDEO/REELS container */
  async createVideoContainer(params: {
    igUserId: string;
    videoUrl: string;        // Public HTTPS URL
    mediaType: 'VIDEO' | 'REELS';
    caption?: string;        // Max 2,200 chars
    accessToken: string;
  }): Promise<{ id: string }> {
    // POST /{ig-user-id}/media
    // { media_type, video_url, caption }
  }

  /** Step 1c: Create STORIES container */
  async createStoryContainer(params: {
    igUserId: string;
    mediaUrl: string;        // Image or video URL
    mediaType: 'IMAGE' | 'VIDEO';
    accessToken: string;
  }): Promise<{ id: string }> {
    // POST /{ig-user-id}/media
    // { media_type=STORIES, image_url|video_url }
    // Captions are ignored for Stories
  }

  /** Step 1d: Create CAROUSEL child container */
  async createCarouselChild(params: {
    igUserId: string;
    isCarouselItem: true;
    imageUrl?: string;
    videoUrl?: string;
    accessToken: string;
  }): Promise<{ id: string }> {
    // POST /{ig-user-id}/media
    // { is_carousel_item=true, image_url|video_url }
    // No caption on children
  }

  /** Step 1e: Create CAROUSEL parent container */
  async createCarouselParent(params: {
    igUserId: string;
    children: string[];       // Ordered child container IDs
    caption?: string;         // Caption goes on parent only
    accessToken: string;
  }): Promise<{ id: string }> {
    // POST /{ig-user-id}/media
    // { media_type=CAROUSEL, children=id1,id2,..., caption }
  }

  /** Step 2: Poll container status */
  async getContainerStatus(containerId: string, accessToken: string): Promise<ContainerStatus> {
    // GET /{container-id}?fields=status_code,error_message
    // Returns: EXPIRED | FAILED | FINISHED | IN_PROGRESS
  }

  /** Step 3: Publish processed container */
  async publishContainer(params: {
    igUserId: string;
    creationId: string;
    accessToken: string;
  }): Promise<{ id: string }> {
    // POST /{ig-user-id}/media_publish
    // { creation_id }
    // Returns final Instagram Media ID
  }

  // ─── Analytics ───
  async getMediaInsights(mediaId: string, accessToken: string): Promise<MediaInsights> {
    // GET /{media-id}/insights?metric=engagement,impressions,reach,saved
  }
}
```

### 5.2 TypeScript Types

**File**: `src/infrastructure/social-network/instagram/instagram-api.types.ts`

| Type | Purpose |
|------|---------|
| `InstagramMediaType` | `'IMAGE' \| 'VIDEO' \| 'REELS' \| 'STORIES' \| 'CAROUSEL'` |
| `ContainerStatusCode` | `'EXPIRED' \| 'FAILED' \| 'FINISHED' \| 'IN_PROGRESS'` |
| `ShortLivedTokenResponse` | OAuth token exchange response |
| `LongLivedTokenResponse` | Short→long exchange response |
| `InstagramBusinessAccount` | Account discovered from Facebook Pages |
| `LinkedFacebookPage` | Page with optional IG business account |
| `FacebookAccountsResponse` | `/me/accounts` response wrapper |
| `ImageContainerRequest` / `VideoContainerRequest` | Container creation params |
| `CarouselChildRequest` / `CarouselParentRequest` | Carousel creation params |
| `ContainerCreationResponse` | `{ id: string }` |
| `ContainerStatusResponse` | `{ id, status_code, error_message? }` |
| `PublishRequest` / `PublishResponse` | Publish result |
| `MediaInsights` | Analytics data |
| `BusinessUsage` | Rate limit monitoring (`X-Business-Use-Case-Usage`) |
| `InstagramOAuthScope` | `instagram_basic \| instagram_content_publish \| pages_show_list \| pages_read_engagement` |

### 5.3 Instagram Publisher Service

**File**: `src/infrastructure/social-network/instagram/instagram-publisher.service.ts`

Implements `ISocialPublisher` with the **3-step container model**:

```
ScheduledPostPublishHandler
       │
       ▼
InstagramPublisherService.publishPost({ pageToken, pageId, content, mediaUrls })
       │
       ├── Validate: at least 1 mediaUrl required (Instagram does not support text-only posts)
       │
       ├── Determine media_type based on media count & type:
       │
       ├── [Single Image] ── IMAGE flow
       │     Step 1: POST /{ig-user-id}/media { image_url, caption }
       │             → container_id
       │     Step 2: Poll GET /{container-id}?fields=status_code every 2s
       │             (images process near-instantly but should poll anyway)
       │     Step 3: POST /{ig-user-id}/media_publish { creation_id }
       │             → media_id
       │
       ├── [Single Video] ── VIDEO/REELS flow
       │     Step 1: POST /{ig-user-id}/media { media_type, video_url, caption }
       │             → container_id
       │     Step 2: Poll container status every 2s (may take 5-30s)
       │             Max attempts: 60 (120 seconds)
       │     Step 3: POST /{ig-user-id}/media_publish { creation_id }
       │             → media_id
       │
       ├── [Multiple Media] ── CAROUSEL flow (2-10 items)
       │     Step 1: For each item, create child container (no caption)
       │             POST /{ig-user-id}/media { is_carousel_item=true, image_url|video_url }
       │             → child_container_ids[]
       │     Step 2: Poll each child container until ALL FINISHED
       │     Step 3: Create parent container
       │             POST /{ig-user-id}/media { media_type=CAROUSEL, children=ids, caption }
       │             → parent_container_id
       │     Step 4: Poll parent container status
       │     Step 5: POST /{ig-user-id}/media_publish { creation_id }
       │             → media_id
       │
       └── Return { platformPostId: media_id }
```

**Content validation**:
- Max caption: **2,200 characters** (validate before API call)
- **No text-only posts**: Reject with clear error if `mediaUrls` is empty
- Caption truncation: if content exceeds 2,200 chars, truncate with `...`

**Polling strategy**:
```typescript
private async waitForContainerReady(containerId: string, accessToken: string, maxAttempts = 60): Promise<void> {
  const delayMs = 2000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await this.apiClient.getContainerStatus(containerId, accessToken);

    switch (status.status_code) {
      case 'FINISHED':
        return;
      case 'FAILED':
        throw new InstagramPublishError(
          `Instagram container processing failed: ${status.error_message ?? 'Unknown error'}`,
        );
      case 'EXPIRED':
        throw new InstagramPublishError('Instagram container expired (24h TTL) before publishing');
      case 'IN_PROGRESS':
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
    }
  }

  throw new InstagramPublishError('Instagram container processing timed out');
}
```

### 5.4 Instagram Connector Service

**File**: `src/infrastructure/social-network/instagram/instagram-social-page-connector.service.ts`

Implements `ISocialPageConnector`:

| Method | Implementation |
|--------|---------------|
| `getPlatformCode()` | Returns `ESocialPlatformCode.INSTAGRAM` |
| `exchangeCodeForToken(code, redirectUri)` | Facebook OAuth code → short-lived user token (POST `graph.facebook.com/oauth/access_token`) |
| `exchangeForLongLivedToken(token)` | Short-lived → 60-day Facebook user token (GET `graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token`) |
| `getUserAccounts(token)` | **Discovers Instagram Business Accounts** via `GET /me/accounts?fields=id,name,instagram_business_account{id,name,username,profile_picture_url}` → returns one entry per linked Instagram account with `{ id: ig_biz_id, name: ig_name, accessToken }` |
| `getPageDetails(pageToken, pageId)` | Fetches IG Business Account details via `GET /{ig-user-id}?fields=id,name,username,profile_picture_url,followers_count,media_count` |

**Critical differences from Facebook connector**:

| Aspect | Facebook Connector | Instagram Connector |
|--------|--------------------|--------------------|
| Auth URL | `facebook.com/login` | **Same** (`facebook.com/login`) — both use Facebook OAuth |
| Graph API host | `graph.facebook.com` | **Same** (`graph.facebook.com`) — same host |
| Token type | Facebook User Token | **Same** Facebook User Token (no separate IG token) |
| `getUserAccounts()` | Returns multiple pages from `/me/accounts` | Also calls `/me/accounts` but **filters** for entries with `instagram_business_account` |
| Account ID type | Facebook Page ID (`page_id`) | Instagram Business Account ID (`ig_user_id`) — different from Facebook Page ID |
| Scopes | `pages_show_list, pages_read_engagement, pages_manage_posts` | Includes all FB scopes **plus** `instagram_basic, instagram_content_publish` |
| Redirect URI for OAuth | `.../facebook/callback` | `.../instagram/callback` (separate controller route) |

### 5.5 Instagram OAuth Config Service

**File**: `src/infrastructure/social-network/instagram/instagram-oauth-config.service.ts`

```typescript
@Injectable()
export class InstagramOAuthConfigService {
  constructor(@Inject(CONFIG_SERVICE) private readonly config: IConfigService) {}

  get clientId()       { return this.config.get('FACEBOOK_APP_ID'); } // Same FB app!
  get clientSecret()   { return this.config.get('FACEBOOK_APP_SECRET'); }
  get redirectUri()    { return this.config.get('INSTAGRAM_CALLBACK_URL'); }
  get scopes() {
    return [
      'instagram_basic',
      'instagram_content_publish',
      'pages_show_list',
      'pages_read_engagement',
    ];
  }

  buildAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(','),
      response_type: 'code',
      state,
    });
    return `https://www.facebook.com/v21.0/dialog/oauth?${params}`;
  }
}
```

**Key insight**: Instagram uses the **same Facebook App credentials** (`FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`) for OAuth. The difference is:
- Scopes include `instagram_basic` + `instagram_content_publish`
- The redirect URI is the Instagram callback endpoint
- The `facebook.com/dialog/oauth` URL includes IG-specific scopes

### 5.6 Instagram Module

**File**: `src/infrastructure/social-network/instagram/instagram.module.ts`

```typescript
@Module({
  imports: [HttpModule.register({ baseURL: 'https://graph.facebook.com/v21.0' })],
  providers: [
    InstagramGraphApiClient,
    InstagramOAuthConfigService,
    InstagramConnectorService,
    InstagramPublisherService,
  ],
  exports: [
    InstagramGraphApiClient,
    InstagramOAuthConfigService,
    InstagramConnectorService,
    InstagramPublisherService,
  ],
})
export class InstagramModule {}
```

### 5.7 Register in SocialNetworkModule

In `src/infrastructure/social-network/common/social-network.module.ts`:

```typescript
import { InstagramModule } from '../instagram/instagram.module';
// ... other imports

@Module({
  imports: [
    CqrsModule,
    FacebookModule,
    ThreadsModule,
    InstagramModule,                          // ← ADD
  ],
  providers: [
    // SOCIAL PAGE CONNECTORS
    {
      provide: SOCIAL_PAGE_CONNECTORS,
      inject: [
        FacebookSocialPageConnectorService,
        ThreadsSocialPageConnectorService,
        InstagramConnectorService,            // ← ADD
      ],
      useFactory: (
        fb: FacebookSocialPageConnectorService,
        threads: ThreadsSocialPageConnectorService,
        instagram: InstagramConnectorService,  // ← ADD
      ) => ({
        facebook: fb,
        threads,
        instagram,                            // ← ADD
      }),
    },
    // SOCIAL PUBLISHERS
    {
      provide: SOCIAL_PUBLISHERS,
      inject: [
        FacebookPublisherService,
        ThreadsPublisherService,
        InstagramPublisherService,            // ← ADD
      ],
      useFactory: (
        fb: FacebookPublisherService,
        threads: ThreadsPublisherService,
        instagram: InstagramPublisherService,  // ← ADD
      ) => ({
        facebook: fb,
        threads,
        instagram,                            // ← ADD
      }),
    },
    // COMMENT REPLIERS — Instagram does not support comment reply via IG API
    // (Facebook commenting API is separate; out of scope)
    // ... rest of module
  ],
})
export class SocialNetworkModule {}
```

---

## 6. Presentation Layer: New OAuth Endpoints

### 6.1 Instagram OAuth Controller

**File**: `src/presentation/controllers/http/client/instagram-oauth.controller.ts`

Reuses the existing Facebook OAuth pattern (`StateAuthGuard`, `@WebHook()`, JWT state param).

| Method | Path | Guards | Description |
|--------|------|--------|-------------|
| `GET` | `/client/v1/social-pages/instagram/oauth` | 🔒 JwtAuth + Roles(Enterprise) + UserVerified | Generate Instagram OAuth URL (Facebook dialog with IG scopes) |
| `GET` | `/client/v1/social-pages/instagram/callback` | 🔓 WebHook + StateAuthGuard | OAuth callback: exchange code → discover IG business account → create SocialPageRoot |

**Why separate from Facebook callback**: Although both use Facebook OAuth, the Instagram callback needs to:
1. Exchange code for Facebook User Token
2. Discover Instagram Business Account ID from Facebook Pages (not just get pages)
3. Upsert SocialPageRoot with `platformCode: 'instagram'` and `pageId` = IG Business Account ID

### 6.2 OAuth Flow

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│  Instagram OAuth → Facebook Login → Callback → Discover IG Account → Connect → Redirect     │
│                                                                                              │
│  BROWSER                    SERVER                          FACEBOOK / GRAPH API             │
│    │                           │                                  │                           │
│    │  1. GET /instagram/oauth  │                                  │                           │
│    │────────►─────────────────│                                  │                           │
│    │                           │  2. Sign JWT as OAuth state     │                           │
│    │                           │     (sub, email, role)          │                           │
│    │  { url } ◄───────────────│                                  │                           │
│    │                           │                                  │                           │
│    │  3. Redirect to Facebook  │                                  │                           │
│    │     Login dialog with IG  │                                  │                           │
│    │     scopes:               │                                  │                           │
│    │     instagram_basic,      │                                  │                           │
│    │     instagram_content_    │                                  │                           │
│    │     publish,              │                                  │                           │
│    │     pages_show_list,      │                                  │                           │
│    │     pages_read_engagement │                                  │                           │
│    │─────────────────────────────────────────────────────────────►│                           │
│    │                           │                                  │                           │
│    │  4. User authorizes       │                                  │                           │
│    │◄─────────────────────────────────────────────────────────────│                           │
│    │                           │                                  │                           │
│    │  5. Redirect w/           │                                  │                           │
│    │     code + state          │                                  │                           │
│    │────────►─────────────────│                                  │                           │
│    │                           │                                  │                           │
│    │                           │  6. StateAuthGuard               │                           │
│    │                           │     verifies JWT state            │                           │
│    │                           │                                  │                           │
│    │                           │  7. Exchange code → short token  │                           │
│    │                           │─────────────────────────────────►│                           │
│    │                           │◄──── short-lived token ─────────│                           │
│    │                           │                                  │                           │
│    │                           │  8. Exchange short → long token  │                           │
│    │                           │─────────────────────────────────►│                           │
│    │                           │◄──── 60-day token ──────────────│                           │
│    │                           │                                  │                           │
│    │                           │  9. Discover IG accounts         │                           │
│    │                           │     GET /me/accounts             │                           │
│    │                           │     ?fields=...instagram_biz_acct│                           │
│    │                           │─────────────────────────────────►│                           │
│    │                           │◄── pages + IG accounts ─────────│                           │
│    │                           │                                  │                           │
│    │                           │  10. SocialPageConnectCommand    │                           │
│    │                           │      (inside UoW)                │                           │
│    │                           │      ├─ findByCode('instagram')  │                           │
│    │                           │      ├─ getPageDetails(igUserId) │                           │
│    │                           │      └─ upsert SocialPageRoot    │                           │
│    │                           │         platformCode: 'instagram'│                           │
│    │                           │         pageId: ig_biz_account_id│                           │
│    │                           │                                  │                           │
│    │  11. Redirect to FE       │                                  │                           │
│    │◄── ?success=true ─────────│                                  │                           │
│    │                           │                                  │                           │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Step-by-step**:

1. **Frontend calls** `GET /client/v1/social-pages/instagram/oauth`
2. **Controller** signs short-lived JWT (`{ sub: userId, email, role }`, 10-min expiry) as OAuth `state`
3. **Browser redirects** to Facebook Login dialog with Instagram scopes
   - URL: `https://www.facebook.com/v21.0/dialog/oauth?client_id={app-id}&redirect_uri={instagram-callback}&scope=instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement&response_type=code&state={jwt}`
4. **User authorizes** the app (Facebook dialog shows Instagram permissions)
5. **Facebook redirects** to the Instagram callback URL with `?code=...&state=...`
6. **Callback** hits `GET /client/v1/social-pages/instagram/callback` with `@WebHook()` and `StateAuthGuard`
7. **Connector**`exchangeCodeForToken(code, redirectUri)` → Facebook short-lived user token
8. **Connector**`exchangeForLongLivedToken(token)` → 60-day Facebook user token
9. **Connector**`discoverInstagramAccounts(longLivedToken)` — calls `GET /me/accounts?fields=id,name,instagram_business_account{id,name,username,profile_picture_url}` → extracts IG Business Account IDs
10. **Controller** executes `SocialPageConnectCommand` for each discovered IG account:
    - Uses `InstagramConnectorService` via `SocialPageConnectorFactory.findByCode('instagram')`
    - Upserts `SocialPageRoot` with `platformCode: 'instagram'`, `pageId: ig_biz_account_id`, `pageName: ig_username`
11. **Redirect** to frontend with `?success=true`

### 6.3 Existing Endpoints (No Changes Needed)

Instagram posts are created, scheduled, cancelled, and listed via the existing endpoints:

| Method | Path | Controller | Description |
|--------|------|------------|-------------|
| `POST` | `/client/v1/scheduled-posts` | `ScheduledPostController` | Create (and optionally schedule) an Instagram post |
| `GET` | `/client/v1/scheduled-posts` | `ScheduledPostController` | List all scheduled posts (Instagram included) |
| `POST` | `/client/v1/scheduled-posts/:id/cancel` | `ScheduledPostController` | Cancel a pending Instagram post |
| `POST` | `/client/v1/scheduled-posts/:id/reschedule` | `ScheduledPostController` | Reschedule an Instagram post |
| `DELETE` | `/client/v1/social-pages/:id` | `SocialPageController` | Disconnect an Instagram page |

---

## 7. Publishing Flow Detail

### 7.1 Standard Publish (Single Image)

```
PostPublishJob picks up SCHEDULED post (platformCode === 'instagram')
       │
       ▼
ScheduledPostPublishHandler.execute(postId)
       │
       ├─ Step 1 (UoW):
       │   ├─ Load post (platformCode === 'instagram')
       │   ├─ post.markPublishing()
       │   └─ repo.save()
       │
       ├─ Step 2 (outside UoW):
       │   ├─ Load SocialPageRoot → decrypted token
       │   ├─ Resolve media URLs from mediaFileIds (Cloudinary)
       │   │   (Media MUST be publicly accessible HTTPS URLs)
       │   ├─ Validate: at least 1 media file required
       │   ├─ Validate: content length ≤ 2,200 chars
       │   ├─ publisher = SocialPublisherDiscovery.findByCode('instagram')
       │   └─ publisher.publishPost({
       │        pageToken: longLivedUserToken,
       │        pageId: igBusinessAccountId,
       │        content: post.content,    // max 2,200 chars
       │        mediaUrls: [...]
       │      })
       │       │
       │       ├── 1 media (image) → IMAGE container
       │       │   Step 1: POST /{ig-user-id}/media { image_url, caption }
       │       │           → container_id
       │       │   Step 2: Poll status every 2s (wait for FINISHED)
       │       │   Step 3: POST /{ig-user-id}/media_publish { creation_id }
       │       │           → media_id (final IG Media ID)
       │       │
       │       ├── 1 media (video) → VIDEO/REELS container
       │       │   Step 1: POST /{ig-user-id}/media { media_type=REELS, video_url, caption }
       │       │           → container_id
       │       │   Step 2: Poll status every 2s (max 60 attempts = 120s)
       │       │   Step 3: POST /{ig-user-id}/media_publish { creation_id }
       │       │           → media_id
       │       │
       │       └── 2-10 media → CAROUSEL
       │           Step 1: For each item, create child container (no caption)
       │                   POST /{ig-user-id}/media { is_carousel_item=true, image_url|video_url }
       │                   → child_container_ids[]
       │           Step 2: Poll ALL child containers until FINISHED
       │           Step 3: Create parent container
       │                   POST /{ig-user-id}/media { media_type=CAROUSEL, children=ids, caption }
       │                   → parent_container_id
       │           Step 4: Poll parent container status
       │           Step 5: POST /{ig-user-id}/media_publish { creation_id }
       │                   → media_id
       │
       └─ Step 3 (UoW):
           ├─ post.markPublished(media_id)
           ├─ repo.save()
           └─ eventService.publishEvents(post)
```

### 7.2 Content Length Validation

Instagram imposes a **2,200 character** limit on captions. The `InstagramPublisherService` validates before creating the container:

```typescript
private validateContent(content: string): void {
  if (!content || content.trim().length === 0) {
    throw new InstagramPublishError('Instagram posts require content (caption)');
  }
  if (content.length > 2200) {
    throw new InstagramPublishError(`Instagram caption exceeds 2,200 character limit (got ${content.length})`);
  }
}

private validateMedia(mediaUrls: string[]): void {
  if (!mediaUrls || mediaUrls.length === 0) {
    throw new InstagramPublishError(
      'Instagram does not support text-only posts. At least one image or video is required.',
    );
  }
  if (mediaUrls.length > 10) {
    throw new InstagramPublishError(`Instagram carousel supports maximum 10 items (got ${mediaUrls.length})`);
  }
}
```

### 7.3 Video Polling Strategy

For video containers, Instagram's processing can take longer than images. The publisher uses a configurable polling loop:

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Poll interval | 2 seconds | Balances responsiveness vs API calls |
| Max attempts (image) | 15 (30s) | Images process near-instantly |
| Max attempts (video) | 60 (120s) | Videos may take up to 60s |
| Max attempts (carousel) | Per-item + parent, max 120s each | Each child needs processing |

### 7.4 Stories Publishing (Future)

Stories use the same container model with `media_type=STORIES`:

```typescript
async publishStory(params: { pageToken: string; igUserId: string; mediaUrl: string; mediaType: 'IMAGE' | 'VIDEO' }): Promise<{ platformPostId: string }> {
  // Step 1: Create STORIES container
  // POST /{ig-user-id}/media { media_type=STORIES, image_url|video_url }
  // (captions are ignored for Stories)
  
  // Step 2: Poll container status
  // Step 3: Publish
  // POST /{ig-user-id}/media_publish { creation_id }
}
```

**Note**: Stories publishing may require a separate endpoint or flag since `ScheduledPostRoot` currently publishes to the feed. Stories are ephemeral (24h) and may have a different lifecycle. Deferred to a future phase.

### 7.5 Handling Media Uploads

Instagram requires media at **publicly accessible HTTPS URLs**. The existing upload flow (Cloudinary) already provides public URLs. The publisher just needs to pass these URLs to the Instagram API:

```typescript
// In ScheduledPostPublishHandler — step 2 already does this:
const mediaUrls = await this.uploadService.getPublicUrls(post.mediaFileIds);
// mediaUrls = ['https://res.cloudinary.com/.../image.jpg', ...]

// Pass directly to Instagram publisher:
const result = await publisher.publishPost({
  pageToken: token,
  pageId: igUserId,
  content: post.content,
  mediaUrls,  // Already public HTTPS URLs from Cloudinary
});
```

---

## 8. Rate Limiting & Error Handling

### 8.1 Rate Limit Architecture

Instagram Graph API enforces **dynamic rate limits** based on:
- Call execution times
- Payload weights
- User engagement metrics

Limits are reported in the `X-Business-Use-Case-Usage` response header:

```json
{
  "X-Business-Use-Case-Usage": {
    "17841400000000000": [
      {
        "type": "content_publishing",
        "call_count": 32,
        "total_cputime": 10,
        "total_time": 15,
        "estimated_time_to_regain_limit": 0
      }
    ]
  }
}
```

**Monitoring strategy**:

```typescript
// In InstagramGraphApiClient — extract from response headers after every API call
private trackRateUsage(response: AxiosResponse, igUserId: string): void {
  const usage = response.headers['x-business-use-case-usage'];
  if (usage) {
    const parsed = JSON.parse(usage as string);
    const limits = parsed[igUserId];
    // Store in Redis for monitoring:
    //   SET instagram:rate:{igUserId} {JSON.stringify(limits)} EX 3600
    this.cacheService.set(`instagram:rate:${igUserId}`, JSON.stringify(limits), 3600);
  }
}
```

### 8.2 Exponential Backoff on 429

When hitting rate limits (HTTP 429), implement exponential backoff with jitter:

```
Retry 1: wait 1s + random(0, 500ms)
Retry 2: wait 2s + random(0, 500ms)
Retry 3: wait 4s + random(0, 500ms)
Retry 4: wait 8s + random(0, 500ms)
Max: 5 retries, then fail with markFailed()
```

### 8.3 Token Refresh

Instagram uses the **same Facebook User Token** (60-day lifetime). The existing `SocialPageRefreshTokenHandler` already handles Facebook tokens via `SocialPageConnectorFactory.findByCode('facebook')`. For Instagram, the same token refresh mechanism applies but routed through the Instagram connector.

**Important**: Since Instagram and Facebook both use the same Facebook User Token, connecting an Instagram account after the user has already authorized Facebook may not require a new token exchange. The existing token can be reused if it has the required Instagram scopes. The connector should handle this gracefully:

```typescript
// In InstagramConnectorService
async exchangeForLongLivedToken(token: string): Promise<string> {
  // If token already has instagram_basic + instagram_content_publish scopes,
  // we can reuse the existing Facebook User Token without re-auth
  // Otherwise, new OAuth flow required
  const scopes = await this.validateTokenScopes(token);
  if (scopes.includes('instagram_basic') && scopes.includes('instagram_content_publish')) {
    return token; // Already valid
  }
  // Proceed with standard exchange
  return this.apiClient.exchangeForLongLivedToken({ accessToken: token, clientSecret: this.config.clientSecret })
    .then(r => r.access_token);
}
```

### 8.4 Error Code Reference

| HTTP Status | Error | Handling |
|-------------|-------|----------|
| `400` | Invalid parameter (media too large, wrong format, caption too long) | Throw `InstagramPublishError`, handler catches → `markFailed(reason)` |
| `401` | Token expired/invalid | Mark SocialPage as inactive → emit notification |
| `403` | Insufficient permissions (missing scope) | Mark page as requiring re-auth → emit notification |
| `404` | Media URL not accessible by Meta crawler | Throw with message: "Media URL must be publicly accessible. Check CDN permissions." |
| `429` | Rate limit exceeded | Exponential backoff with jitter (max 5 retries) |
| `500` | Server error (transient) | Retry with backoff (max 3) |

### 8.5 Media Hosting Requirements

Meta's crawlers will **fetch the media URL** during container processing. The CDN must:
- Be publicly accessible (no auth walls)
- Respond quickly (slow responses cause failures)
- Not return 403 errors to Meta's crawler IPs
- Support parallel requests (multiple child containers in carousel)

**Risk**: If Cloudinary or your CDN returns a slow response or 403, the container status will quickly fail with "invalid media format."

---

## 9. Sandbox & App Review

Instagram API requires Meta App Review before production use. While in development mode:

| Restriction | Detail |
|-------------|--------|
| **Authorized users** | Only Facebook accounts registered as **Administrators, Developers, or Testers** in the Meta App Dashboard can authorize |
| **Rate limits** | Lower in development mode |
| **Published posts** | Only visible to test users |

**Recommendation**: Use a test Facebook account with a test Instagram Business/Creator account for development and testing.

---

## 10. Environment Variables

Add to `.env.example`:

```bash
# Instagram API (Meta — uses same Facebook App)
INSTAGRAM_CALLBACK_URL=https://api.yourdomain.com/client/v1/social-pages/instagram/callback
```

Instagram reuses `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` from the existing Facebook configuration.

---

## 11. File Map (Summary of New/Modified Files)

### New Files

| File | Layer | Description |
|------|-------|-------------|
| `src/infrastructure/social-network/instagram/instagram.module.ts` | Infrastructure | NestJS module |
| `src/infrastructure/social-network/instagram/instagram-graph-api.client.ts` | Infrastructure | HTTP client for `graph.facebook.com/v21.0` (IG endpoints) |
| `src/infrastructure/social-network/instagram/instagram-api.types.ts` | Infrastructure | TypeScript types (containers, OAuth, carousel, insights) |
| `src/infrastructure/social-network/instagram/instagram-publisher.service.ts` | Infrastructure | `ISocialPublisher` impl — 3-step container model |
| `src/infrastructure/social-network/instagram/instagram-social-page-connector.service.ts` | Infrastructure | `ISocialPageConnector` impl — discovers IG Business Account from Facebook Pages |
| `src/infrastructure/social-network/instagram/instagram-oauth-config.service.ts` | Infrastructure | OAuth config: builds Facebook dialog URL with IG scopes |
| `src/presentation/controllers/http/client/instagram-oauth.controller.ts` | Presentation | OAuth endpoints (`/instagram/oauth`, `/instagram/callback`) |

### Modified Files

| File | Change |
|------|--------|
| `src/core/enums/social-platform-code.enum.ts` | Verify `INSTAGRAM = 'instagram'` exists |
| `src/infrastructure/social-network/common/social-network.module.ts` | Register Instagram module + services in SOCIAL_PAGE_CONNECTORS and SOCIAL_PUBLISHERS |

### New Tests

| File | Description |
|------|-------------|
| `tests/infrastructure/instagram/instagram-publisher.service.spec.ts` | Container creation, polling logic, media validation |
| `tests/infrastructure/instagram/instagram-social-page-connector.service.spec.ts` | Account discovery, OAuth exchange |
| `tests/infrastructure/instagram/instagram-graph-api.client.spec.ts` | URL construction, response parsing |

---

## 12. Implementation Phases

### Phase 1 — Core & Infrastructure Foundation

- [ ] Verify `INSTAGRAM = 'instagram'` in `ESocialPlatformCode` enum
- [ ] Create `instagram-api.types.ts` — all Instagram Graph API TypeScript types
- [ ] Create `instagram-graph-api.client.ts` — HTTP client for `graph.facebook.com/v21.0` IG endpoints
- [ ] Create `instagram-oauth-config.service.ts` — OAuth config (Facebook dialog with IG scopes)
- [ ] Create `instagram-social-page-connector.service.ts` — implements `ISocialPageConnector`
  - [ ] Account discovery using `/me/accounts?fields=instagram_business_account{...}`
  - [ ] OAuth code exchange (reuses Facebook token endpoints)
- [ ] Create `instagram-publisher.service.ts` — implements `ISocialPublisher`
  - [ ] IMAGE container flow (create → poll → publish)
  - [ ] VIDEO/REELS container flow (create → poll → publish)
  - [ ] CAROUSEL container flow (children → poll → parent → poll → publish)
  - [ ] Content validation (no text-only, max 2,200 chars, media count 1-10)
- [ ] Create `instagram.module.ts` — NestJS module
- [ ] Register Instagram services in `SocialNetworkModule` (connectors + publishers)

### Phase 2 — OAuth Flow

- [ ] Create `instagram-oauth.controller.ts` — OAuth endpoints
- [ ] Test full OAuth flow: init → Facebook login → callback → discover IG account → connect

### Phase 3 — Publishing & Scheduling

- [ ] Verify `ScheduledPostCreateHandler` works with `platformCode: 'instagram'`
- [ ] Verify `PostPublishJob` picks up Instagram posts via `findDueForPublishing()`
- [ ] Verify `ScheduledPostPublishHandler` resolves Instagram publisher via `SocialPublisherDiscovery.findByCode('instagram')`
- [ ] End-to-end test: create scheduled post → cron picks up → publish via Instagram Graph API

### Phase 4 — Token Refresh & Maintenance

- [ ] Verify token refresh works with Instagram connector
- [ ] Verify daily token refresh cron covers Instagram tokens
- [ ] Implement rate limit monitoring (X-Business-Use-Case-Usage → Redis)

### Phase 5 — Polish & Error Handling

- [ ] Exponential backoff on 429 rate limits
- [ ] CDN availability check for media URLs
- [ ] Test all error scenarios: invalid token, rate limit, content too long, media inacessible, video timeout
- [ ] Graceful handling of no Instagram account found (Facebook user has no linked IG)

### Future Phases (Out of Scope Now)

- [ ] Stories publishing (`media_type=STORIES`)
- [ ] Comment management (via Facebook Page commenting API)
- [ ] Insights/analytics (`/media/{id}/insights`)
- [ ] Hashtag search and mention tracking
- [ ] Instagram Shopping tags

---

## 13. Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Facebook Page dependency** | User can't connect IG without linked FB Page | Clear error message explaining requirement; guide user to link IG → FB Page first |
| **No text-only posts** | Post creation abort | Validate at DTO level + publisher level; frontend should enforce minimum 1 media file |
| **Media CDN accessibility** | Container processing fails | Document CDN requirements; add health check for media URL accessibility |
| **Video processing timeout** | Published failure | Set reasonable poll timeout (120s); failed video posts can be rescheduled |
| **Token scope mismatch** | API returns 403 (insufficient permissions) | Validate token scopes at connect time; prompt re-auth if missing IG scopes |
| **Sandbox restrictions** | Only test users can connect in dev | Document test user setup; plan for Meta App Review before production launch |
| **Rate limit (dynamic)** | Publishing blocked unpredictably | Monitor via X-Business-Use-Case-Usage header; proactive alerting when approaching limits |
| **Carousel aspect ratio** | Inconsistent slides get cropped | Document constraint; validate at container creation that first item's ratio is used |

---

## 14. Testing Strategy

### Unit Tests

| Test Suite | What to Test |
|------------|-------------|
| `InstagramPublisherService` | Container creation params for IMAGE, VIDEO, CAROUSEL; polling loop logic; content validation (max 2,200 chars); media validation (min 1, max 10); no-text-only rejection |
| `InstagramConnectorService` | OAuth code exchange; long-lived token exchange; account discovery with mock Facebook Pages response (with and without `instagram_business_account`); graceful handling when no IG account found |
| `InstagramGraphApiClient` | URL construction; response parsing for all container types; error response handling; rate limit header extraction |

### Integration Tests

| Test | Description |
|------|-------------|
| OAuth controller | Mock Facebook OAuth endpoints, verify callback → connector → connect flow |
| Publishing pipeline | Mock Instagram Graph API responses, verify `ScheduledPostRoot` status transitions (DRAFT → SCHEDULED → PUBLISHING → PUBLISHED) |
| Carousel flow | Verify child containers created, polled, parent created, published in correct order |
| Failure scenarios | Mock API errors: 400 (invalid params), 401 (token expired), 403 (insufficient permissions), 429 (rate limit), container FAILED status, container EXPIRED, timeout |

### E2E Tests

| Scenario | Description |
|----------|-------------|
| Full scheduled post lifecycle | Create → schedule → publish (with mocked IG API) |
| Token refresh cycle | Connect → refresh → verify token updated |
| Multi-page connect | Connect multiple Instagram accounts (if user has multiple IG Business Accounts linked to different FB Pages) |

---

## 15. Key Conventions Reference

| Rule | Application |
|------|-------------|
| File naming: kebab-case + suffix | `instagram-graph-api.client.ts`, `instagram-publisher.service.ts` |
| Class naming: PascalCase + Domain | `InstagramPublisherService`, `InstagramConnectorService` |
| DI token: SCREAMING_SNAKE_CASE | `SOCIAL_PAGE_CONNECTORS` (reused) |
| No `any` | All IG API responses typed via `instagram-api.types.ts` |
| Enum members: SCREAMING_SNAKE_CASE | `ESocialPlatformCode.INSTAGRAM = 'instagram'` |
| DB fields: snake_case | Reused existing schemas |
| Transactions: all writes in `uow.execute()` | Publishing handler uses multi-step UoW (pre-existing pattern) |
| Events: via outbox | Existing `PostScheduledEvent`, `PostPublishedEvent`, `PostFailedEvent` reused |
| Platform files under `social-network/` | `src/infrastructure/social-network/instagram/` |
