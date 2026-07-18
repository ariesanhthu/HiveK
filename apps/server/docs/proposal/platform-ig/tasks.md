# Instagram Integration — Tasks

> **Plan**: [`docs/proposal/platform-ig/plan.md`](./plan.md)
> **Domain**: [`docs/domain/social-page-domain.md`](../../domain/social-page-domain.md)
> **Integration guide**: [`docs/tech/social-network/SUMMARY.md`](../../tech/social-network/SUMMARY.md)

---

## Phase 1 — Foundation Setup (Types + Client)

**Goal**: Create the Instagram infrastructure directory, TypeScript types, and HTTP client — no business logic yet.

### Tasks

- [x] **1.1** Create `src/infrastructure/social-network/instagram/` directory structure
- [x] **1.2** Create `instagram-api.types.ts` — all TypeScript types:
  - `InstagramMediaType`, `ContainerStatusCode`
  - OAuth types: `ShortLivedTokenResponse`, `LongLivedTokenResponse`
  - Account discovery: `InstagramBusinessAccount`, `LinkedFacebookPage`, `FacebookAccountsResponse`
  - Container types: `ImageContainerRequest`, `VideoContainerRequest`, `CarouselChildRequest`, `CarouselParentRequest`, `BaseContainerRequest`
  - Response types: `ContainerCreationResponse`, `ContainerStatusResponse`, `PublishRequest`, `PublishResponse`
  - Rate limit: `BusinessUsage` type + `BusinessUsageHeader`
  - Insights: `MediaInsightValue`, `MediaInsightsResponse`
- [x] **1.3** Create `instagram-graph-api.client.ts` — HTTP client methods:
  - OAuth: `exchangeCodeForToken()`, `exchangeForLongLivedToken()`, `refreshToken()`
  - Account: `discoverInstagramAccounts()`, `getBusinessAccountDetails()`
  - Publishing: `createMediaContainer()` (generic), `getContainerStatus()`, `publishContainer()`
  - Rate limit: `getRateLimitUsage()` header extraction
- [ ] ~~**1.4** Write unit tests for `instagram-graph-api.client.ts` (mocked HTTP)~~ _(deferred)_
- [x] **1.5** `npx tsc --noEmit` — verified ✅

---

## Phase 2 — OAuth Config + Connector

**Goal**: Implement the OAuth configuration service and the `ISocialPageConnector` strategy, enabling Instagram account connection.

### Tasks

- [x] **2.1** Create `instagram-oauth-config.service.ts`: uses `FACEBOOK_APP_ID/SECRET`, `buildAuthUrl()` → Facebook dialog with IG scopes
- [x] **2.2** Create `instagram-social-page-connector.service.ts` implements `ISocialPageConnector`: FB OAuth exchange, IG account discovery via `/me/accounts?fields=instagram_business_account`, page details fetch
  - Edge case: empty array returned when user has no linked IG accounts ✅
- [ ] ~~**2.3** Write unit tests for connector (mock Graph API client)~~ _(deferred)_
- [x] **2.4** `npx tsc --noEmit` — verified ✅

---

## Phase 3 — Publisher (Single Media)

**Goal**: Implement Instagram publishing for single images and videos — the core 3-step container flow.

### Tasks

- [x] **3.1** Create `instagram-publisher.service.ts` implements `ISocialPublisher`:
  - **Validation**:
    - [x] Reject if `mediaUrls` is empty (no text-only posts)
    - [x] Validate content length ≤ 2,200 chars
    - [x] Validate media count ≤ 10
  - **IMAGE flow** (single image): create container → poll (max 15 attempts) → publish ✅
  - **VIDEO/REELS flow** (single video): create container → poll (max 60 attempts) → publish ✅
  - **Error handling**: FAILED/EXPIRED/timeout all throw descriptive errors ✅
- [ ] ~~**3.2** Write unit tests for publisher~~ _(deferred)_
- [x] **3.3** `npx tsc --noEmit` — verified ✅

---

## Phase 4 — Publisher (Carousel)

**Goal**: Extend the publisher with carousel support (2-10 mixed media items).

### Tasks

- [x] **4.1** Carousel flow added to `instagram-publisher.service.ts`: child containers → poll all → parent container → poll parent → publish ✅
- [x] **4.2** Mixed media handled: image children poll at 2s/15 attempts, video children at 2s/60 attempts ✅
- [ ] ~~**4.3** Write unit tests for carousel flow~~ _(deferred)_
- [x] **4.4** `npx tsc --noEmit` — verified ✅

---

## Phase 5 — Instagram Module + Wiring

**Goal**: Create the NestJS module and register everything in `SocialNetworkModule`.

### Tasks

- [x] **5.1** Create `instagram.module.ts`: imports HttpModule, provides/exports all Instagram services ✅
- [x] **5.2** Modified `social-network.module.ts`:
  - Imported `InstagramModule` in `imports` ✅
  - `InstagramSocialPageConnectorService` registered in `SOCIAL_PAGE_CONNECTORS` factory ✅
  - `InstagramPublisherService` registered in `SOCIAL_PUBLISHERS` factory ✅
- [x] **5.3** `ESocialPlatformCode.INSTAGRAM = 'instagram'` already exists in enum ✅
- [x] **5.4** `npx tsc --noEmit` — verified ✅

---

## Phase 6 — OAuth Controller

**Goal**: Create the REST endpoints for Instagram OAuth connection flow.

### Tasks

- [x] **6.1** Create `instagram-oauth.controller.ts`: `/instagram/oauth` (JWT state + FB dialog URL) + `/instagram/callback` (code exchange → discover accounts → bulk connect → redirect) ✅
- [x] **6.2** Registered `InstagramOAuthController` in `SocialNetworkModule` controllers + `presentation/controllers/index.ts` export ✅
- [ ] ~~**6.3** Write integration tests~~ _(deferred)_
- [x] **6.4** `npx tsc --noEmit` — verified ✅

---

## Phase 7 — End-to-End Publish Flow

**Goal**: Verify the complete publish pipeline works end-to-end for Instagram posts.

### Tasks

- [ ] **7.1** Verify `ScheduledPostCreateHandler` handles `platformCode: 'instagram'` _(pending manual verification — handler is platform-agnostic)_
- [ ] **7.2** Verify `PostPublishJob` picks up Instagram SCHEDULED posts _(pending manual verification)_
- [ ] **7.3** Verify `ScheduledPostPublishHandler` resolves `InstagramPublisherService` _(pending manual verification — discovery is dynamic by code)_
- [ ] ~~**7.4** Write E2E tests~~ _(deferred)_
- [x] **7.5** `npx tsc --noEmit` — verified ✅

---

## Phase 8 — Token Refresh & Rate Limiting

**Goal**: Handle token lifecycle and rate limit protection for Instagram accounts.

### Tasks

- [x] **8.1** Token refresh works via `connectorFactory.findByCode('instagram')` → `InstagramSocialPageConnectorService.exchangeForLongLivedToken()` with `fb_exchange_token` grant ✅
- [x] **8.2** Rate limit monitoring: `executeWithRetry` automatically extracts `X-Business-Use-Case-Usage` header and stores in Redis (`instagram:rate:{igUserId}`, 1h TTL). Public `getRateLimitUsage()` utility method available ✅
- [x] **8.3** Exponential backoff on 429: `executeWithRetry` wrapper (max 5 retries, base 1s, factor 2x, max 16s, +jitter) applied to ALL API methods ✅
- [ ] ~~**8.4** Write tests~~ _(deferred)_
- [x] **8.5** `npx tsc --noEmit` — verified ✅

---

## Summary

| Phase | Files Created | Files Modified | Est. Effort |
|-------|--------------|----------------|-------------|
| **1** Foundation | `instagram-api.types.ts`, `instagram-graph-api.client.ts` | — | ✅ Done |
| **2** OAuth + Connector | `instagram-oauth-config.service.ts`, `instagram-social-page-connector.service.ts` | — | ✅ Done |
| **3** Publisher (Single) | `instagram-publisher.service.ts` | — | ✅ Done |
| **4** Publisher (Carousel) | — | `instagram-publisher.service.ts` | ✅ Done |
| **5** Module + Wiring | `instagram.module.ts` | `social-network.module.ts`, `presentation/controllers/index.ts` | ✅ Done |
| **6** OAuth Controller | `instagram-oauth.controller.ts` | `social-network.module.ts` | ✅ Done |
| **7** E2E Publish Flow | — | — | 🔜 Pending manual verify (you handle) |
| **8** Token + Rate Limit | — | `instagram-graph-api.client.ts` | ✅ Done |
| **Total** | **7 new files** | **3 modified files** | **🔥 7/8 phases complete** |

**Phases can be implemented independently** — no blocking dependencies between 3↔4, and 8 is non-critical for MVP.
