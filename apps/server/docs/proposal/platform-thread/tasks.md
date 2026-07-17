# Meta Threads Integration — Tasks

> **Generated from**: [`docs/proposal/platform-thread/plan.md`](./plan.md)
> **Status**: ✅ Implemented (Phases 1–13 complete, Phase 14 pending)

---

## Phase 1 — Enum & Type Definitions

**Goal**: Add the `THREADS` platform code to the existing enum and define all TypeScript types for the Threads API.

| Task | File | Description | Status |
|------|------|-------------|--------|
| 1.1 | `src/core/enums/social-platform-code.enum.ts` | Add `THREADS = 'threads'` member | ✅ |
| 1.2 | `src/infrastructure/threads/threads-api.types.ts` | Define all Threads API types (auth, container, publish, analytics) | ✅ |

**Checklist**:
- [x] 1.1 Add `THREADS = 'threads'` to `ESocialPlatformCode`
- [x] 1.2 Create `ThreadsPermissionScope` type
- [x] 1.3 Create `ThreadsMediaType` type
- [x] 1.4 Create `ShortLivedTokenRequest` / `ShortLivedTokenResponse` interfaces
- [x] 1.5 Create `LongLivedTokenRequest` / `LongLivedTokenResponse` interfaces
- [x] 1.6 Create `TokenRefreshRequest` / `TokenRefreshResponse` interfaces
- [x] 1.7 Create `UserProfileResponse` interface
- [x] 1.8 Create container request interfaces: `BaseContainerRequest`, `ImageContainerRequest`, `VideoContainerRequest`, `CarouselChildContainerRequest`, `CarouselParentContainerRequest`
- [x] 1.9 Create `ContainerCreationResponse` / `ContainerStatusResponse` interfaces
- [x] 1.10 Create `PublishRequest` / `PublishResponse` interfaces
- [x] 1.11 Create `PostDeletionResponse` / `PostAnalyticsResponse` interfaces

---

## Phase 2 — Graph API Client

**Goal**: Build the HTTP client that communicates with `graph.threads.net/v1.0`.

| Task | File | Description | Status |
|------|------|-------------|--------|
| 2.1 | `src/infrastructure/threads/threads-graph-api.client.ts` | Create HTTP client for all Threads API endpoints | ✅ |

**Checklist**:
- [x] 2.1 Create `ThreadsGraphApiClient` class with `@Injectable()` decorator
- [x] 2.2 Inject `HttpService` (from `@nestjs/axios`)
- [x] 2.3 Implement `exchangeCodeForToken()` — POST `/oauth/access_token`
- [x] 2.4 Implement `exchangeForLongLivedToken()` — GET `/access_token?grant_type=th_exchange_token`
- [x] 2.5 Implement `refreshToken()` — GET `/refresh_access_token?grant_type=th_refresh_token`
- [x] 2.6 Implement `getUserProfile()` — GET `/v1.0/{user-id}?fields=id,username,name`
- [x] 2.7 Implement `createMediaContainer()` — POST `/v1.0/{user-id}/threads`
- [x] 2.8 Implement `getContainerStatus()` — GET `/v1.0/{container-id}?fields=status_code`
- [x] 2.9 Implement `publishContainer()` — POST `/v1.0/{user-id}/threads_publish?creation_id={id}`
- [x] 2.10 Implement `deletePost()` — DELETE `/v1.0/{post-id}`
- [x] 2.11 Add proper error handling (HTTP status → typed error)

---

## Phase 3 — OAuth Config Service

**Goal**: Provide Threads-specific OAuth configuration and URL building.

| Task | File | Description | Status |
|------|------|-------------|--------|
| 3.1 | `src/infrastructure/threads/threads-oauth-config.service.ts` | Create OAuth configuration service | ✅ |

**Checklist**:
- [x] 3.1 Create `ThreadsOAuthConfigService` with `@Injectable()`
- [x] 3.2 Inject config service, read `THREADS_APP_ID`, `THREADS_APP_SECRET`, `THREADS_CALLBACK_URL`
- [x] 3.3 Implement `buildAuthUrl(state)` — builds `https://threads.net/oauth/authorize?...` URL
- [x] 3.4 Expose `clientId`, `clientSecret`, `redirectUri`, `scopes` getters

---

## Phase 4 — Threads Connector (ISocialPageConnector)

**Goal**: Implement the platform connector strategy for Threads OAuth flows.

| Task | File | Description | Status |
|------|------|-------------|--------|
| 4.1 | `src/infrastructure/threads/threads-social-page-connector.service.ts` | Create Threads connector service | ✅ |

**Checklist**:
- [x] 4.1 Create `ThreadsSocialPageConnectorService` implementing `ISocialPageConnector`
- [x] 4.2 Implement `getPlatformCode()` → `ESocialPlatformCode.THREADS`
- [x] 4.3 Implement `exchangeCodeForToken()` — delegates to `ThreadsGraphApiClient`
- [x] 4.4 Implement `exchangeForLongLivedToken()` — delegates to `ThreadsGraphApiClient`
- [x] 4.5 Implement `getUserAccounts()` — fetches user profile, returns single-entry array
- [x] 4.6 Implement `getPageDetails()` — fetches user profile, returns mapped `ISocialPageDetails`
- [x] 4.7 Handle token refresh via `th_refresh_token` grant type

---

## Phase 5 — Threads Publisher (ISocialPublisher)

**Goal**: Implement the two-step container publishing model for TEXT, IMAGE, and VIDEO posts.

| Task | File | Description | Status |
|------|------|-------------|--------|
| 5.1 | `src/infrastructure/threads/threads-publisher.service.ts` | Create Threads publisher service | ✅ |

**Checklist**:
- [x] 5.1 Create `ThreadsPublisherService` implementing `ISocialPublisher`
- [x] 5.2 Implement media type detection (no media → TEXT, 1 image → IMAGE, 1 video → VIDEO)
- [x] 5.3 Implement content length validation (max 500 graphemes)
- [x] 5.4 Implement TEXT container creation + publish flow
- [x] 5.5 Implement IMAGE container creation + publish flow
- [x] 5.6 Implement VIDEO container creation flow
- [x] 5.7 Implement `waitForContainerReady()` — status polling loop (2s intervals, 60s timeout)
- [x] 5.8 Implement VIDEO final publish after status `FINISHED`
- [x] 5.9 Handle `FAILED` / `EXPIRED` container statuses
- [x] 5.10 Return `{ platformPostId }` matching `ISocialPublisher` contract
- [x] 5.11 Throw meaningful errors for API failures

---

## Phase 6 — Threads NestJS Module

**Goal**: Wire all Threads services into a NestJS module.

| Task | File | Description | Status |
|------|------|-------------|--------|
| 6.1 | `src/infrastructure/threads/threads.module.ts` | Create Threads module | ✅ |

**Checklist**:
- [x] 6.1 Create `ThreadsModule` with `@Module()` decorator
- [x] 6.2 Import `HttpModule.register({ baseURL: 'https://graph.threads.net/v1.0' })`
- [x] 6.3 Register `ThreadsGraphApiClient` as provider
- [x] 6.4 Register `ThreadsOAuthConfigService` as provider
- [x] 6.5 Register `ThreadsSocialPageConnectorService` as provider
- [x] 6.6 Register `ThreadsPublisherService` as provider
- [x] 6.7 Export all providers for use in `PostingModule`

---

## Phase 7 — Register in PostingModule

**Goal**: Register Threads services in the existing `SOCIAL_PAGE_CONNECTORS` and `SOCIAL_PUBLISHERS` provider maps.

| Task | File | Description | Status |
|------|------|-------------|--------|
| 7.1 | `src/infrastructure/modules/posting.module.ts` | Add Threads to connector and publisher registries | ✅ |

**Checklist**:
- [x] 7.1 Import `ThreadsModule`
- [x] 7.2 Add `ThreadsModule` to `PostingModule.imports`
- [x] 7.3 Import `ThreadsSocialPageConnectorService`
- [x] 7.4 Import `ThreadsPublisherService`
- [x] 7.5 Add `threads: ThreadsSocialPageConnectorService` to `SOCIAL_PAGE_CONNECTORS` useFactory
- [x] 7.6 Add `threads: ThreadsPublisherService` to `SOCIAL_PUBLISHERS` useFactory
- [x] 7.7 Update inject arrays for both factory providers

---

## Phase 8 — Domain Events

**Goal**: Create audit events for the Threads OAuth flow.

| Task | File | Description | Status |
|------|------|-------------|--------|
| 8.1 | `src/core/events/threads-oauth-initiated.domain-event.ts` | Create OAuth initiated event | ✅ |
| 8.2 | `src/core/events/threads-connected.domain-event.ts` | Create connected event | ✅ |

**Checklist**:
- [x] 8.1 Create `ThreadsOAuthInitiatedEvent` extending `BaseDomainEvent`
- [x] 8.2 Create `ThreadsConnectedEvent` extending `BaseDomainEvent`
- [ ] 8.3 Register events in `event.mapper.ts` if integration events are needed (deferred — outbox events optional)

---

## Phase 9 — OAuth Controller

**Goal**: Provide REST endpoints for the Threads OAuth flow.

| Task | File | Description | Status |
|------|------|-------------|--------|
| 9.1 | `src/presentation/controllers/http/client/threads-oauth.controller.ts` | Create Threads OAuth controller | ✅ |

**Checklist**:
- [x] 9.1 Create `ThreadsOAuthController` with `@Controller()` decorator
- [x] 9.2 Implement `GET /client/v1/social-pages/threads/oauth`
  - [x] Guard: `JwtAuthGuard + Roles(Enterprise) + UserVerified`
  - [x] Sign JWT state (sub, email, role) with 10-min expiry
  - [x] Build OAuth URL via `ThreadsOAuthConfigService.buildAuthUrl(state)`
  - [x] Return `{ url }`
  - [x] Emit `ThreadsOAuthInitiatedEvent`
- [x] 9.3 Implement `GET /client/v1/social-pages/threads/callback`
  - [x] Guard: `@WebHook() + StateAuthGuard`
  - [x] Extract `code` from query params
  - [x] Resolve `enterpriseId` from JWT state via `@CurrentUser`
  - [x] Call connector: exchange code → short token → long token
  - [x] Call connector: `getUserAccounts()` → get user profile
  - [x] Execute `SocialPageConnectCommand` with `platformCode: 'threads'`
  - [x] Emit `ThreadsConnectedEvent`
  - [x] Redirect to FE with `?success=true` or `?success=false&error=...`
- [x] 9.4 Register controller in `PostingModule`

---

## Phase 10 — Token Refresh Verification

**Goal**: Confirm existing token refresh infrastructure works with Threads tokens.

| Task | Description | Status |
|------|-------------|--------|
| 10.1 | Verify `SocialPageRefreshTokenHandler` uses `findByCode('threads')` correctly | ✅ |
| 10.2 | Verify daily cron covers Threads tokens | ✅ |

**Checklist**:
- [x] 10.1 Trace `SocialPageRefreshTokenHandler.execute()` — confirm it calls `connectorFactory.findByCode(socialPage.platformCode)`
- [x] 10.2 Verify `exchangeForLongLivedToken()` on Threads connector uses `th_refresh_token` grant type
- [x] 10.3 Verify existing cron job queries all tokens expiring within 7 days (platform-agnostic)
- [ ] 10.4 Test token refresh with a real Threads token (production validation)

---

## Phase 11 — Publishing & Scheduling Verification

**Goal**: Verify that the existing publish/schedule pipeline works with `platformCode: 'threads'`.

| Task | Description | Status |
|------|-------------|--------|
| 11.1 | Verify `ScheduledPostCreateHandler` accepts `platformCode: 'threads'` | ✅ |
| 11.2 | Verify `PostPublishJob` picks up Threads posts | ✅ |
| 11.3 | Verify `ScheduledPostPublishHandler` resolves Threads publisher | ✅ |

**Checklist**:
- [x] 11.1 Confirm `ScheduledPostCreateHandler` does not validate against a fixed platform list
- [x] 11.2 Confirm `findDueForPublishing()` query is platform-agnostic (only checks status + scheduledAt)
- [x] 11.3 Confirm `ScheduledPostPublishHandler` uses `SocialPublisherDiscovery.findByCode(post.platformCode)`
- [x] 11.4 Confirm `SocialPublisherDiscovery.findByCode('threads')` resolves `ThreadsPublisherService`
- [ ] 11.5 End-to-end: create scheduled post with `platformCode: 'threads'` → cron picks up → publishes via Threads API (integration test needed)

---

## Phase 12 — Rate Limiting & Error Handling

**Goal**: Implement rate limit tracking and robust error handling for Threads API.

| Task | File | Description | Status |
|------|------|-------------|--------|
| 12.1 | `src/infrastructure/threads/threads-publisher.service.ts` | Add rate limit tracking | ✅ |
| 12.2 | `src/infrastructure/threads/threads-publisher.service.ts` | Add retry logic | ✅ |

**Checklist**:
- [x] 12.1 Add Redis rate-limit tracking after successful publish (`threads_rate:{userId}` sorted set, 24h TTL)
- [x] 12.2 Validate rate limit before creating container (throw if >= 250 posts in 24h)
- [x] 12.3 Add exponential backoff on HTTP 429 responses (max 3 retries)
- [x] 12.4 Handle HTTP 401 → mark social page as disconnected, fail pending posts
- [x] 12.5 Handle content > 500 chars → throw clear validation error
- [x] 12.6 Handle video timeout → throw descriptive timeout error

---

## Phase 13 — Environment Configuration

**Goal**: Add Threads API configuration to environment.

| Task | File | Description | Status |
|------|------|-------------|--------|
| 13.1 | `.env.example` | Add Threads env vars | ✅ |
| 13.2 | Config schema (if applicable) | Register Threads config keys | ✅ |

**Checklist**:
- [x] 13.1 Add `THREADS_APP_ID`, `THREADS_APP_SECRET`, `THREADS_CALLBACK_URL` to `.env.example`
- [x] 13.2 Add config validation for Threads env vars if using a config schema (ConfigService reads from .env at runtime)

---

## Phase 14 — Testing

**Goal**: Ensure reliability through unit, integration, and E2E tests.

| Task | Description | Status |
|------|-------------|--------|
| 14.1 | Unit tests | ⏳ Pending |
| 14.2 | Integration tests | ⏳ Pending |

**Checklist**:
- [ ] 14.1 Unit test `ThreadsGraphApiClient` — URL construction, response parsing (mocked HTTP)
- [ ] 14.2 Unit test `ThreadsPublisherService` — container creation params, polling logic, content validation
- [ ] 14.3 Unit test `ThreadsSocialPageConnectorService` — OAuth exchange, profile fetch, token refresh
- [ ] 14.4 Unit test `ThreadsOAuthConfigService` — URL building, config getters
- [ ] 14.5 Integration test OAuth controller — mock API responses, verify `SocialPageConnectCommand` execution
- [ ] 14.6 Integration test publishing — mock API responses, verify `ScheduledPostRoot` status transitions
- [ ] 14.7 E2E test full lifecycle — create scheduled post → mock publish → verify status

---

## Summary

| Phase | Tasks | Focus | Dependencies |
|-------|-------|-------|-------------|
| 1 | 2 files | Enum + TypeScript types | None |
| 2 | 1 file | HTTP client | Phase 1 |
| 3 | 1 file | OAuth config | None |
| 4 | 1 file | Connector strategy | Phase 2, 3 |
| 5 | 1 file | Publisher strategy | Phase 2 |
| 6 | 1 file | NestJS module | Phase 2, 3, 4, 5 |
| 7 | 1 file | PostingModule registration | Phase 6 |
| 8 | 2 files | Domain events | None |
| 9 | 1 file | OAuth controller | Phase 4, 6, 7, 8 |
| 10 | — | Token refresh verification | Phase 7 |
| 11 | — | Publish pipeline verification | Phase 7 |
| 12 | 1 file | Rate limiting + error handling | Phase 5, 7 |
| 13 | 1 file | Environment variables | None |
| 14 | — | Tests | Phase 1–13 |

**Total**: 10 new files implemented, 2 modified files, 2 event files

**Phases 10 and 11 are verification-only** (no new code, but critical validation steps).