# Facebook Infrastructure Refactor Plan

## Overview

Align the `src/infrastructure/social-network/facebook/` directory structure and `SocialPageController` with the pattern established by Threads and Instagram.

**Motivation**: The Facebook integration was built before the Instagram/Threads pattern was established. It has:
- An unnecessary `FacebookTokenService` indirection layer (not present in IG/Threads)
- No dedicated `OAuthConfigService` (OAuth URL building is inline in `SocialPageController`)
- Types in `interfaces/` subdirectory with `I*` naming (inconsistent with `*-api.types.ts` pattern)
- OAuth endpoints mixed into the generic `SocialPageController` (IG/Threads have dedicated OAuth controllers)

**Reference patterns**:
- Threads: `src/infrastructure/social-network/threads/`
- Instagram: `src/infrastructure/social-network/instagram/`

---

## Phase 1: Infrastructure — Types & Config Service

**Target**: `src/infrastructure/social-network/facebook/`

### 1.1 Rename types file

| Before | After |
|--------|-------|
| `interfaces/facebook-api.interface.ts` | `facebook-api.types.ts` |

- Move file from `interfaces/` to `facebook/`
- Rename to `facebook-api.types.ts`
- Drop `I` prefix from type names (keep them but create aliases for backward compat during transition)

**Files to create**: `facebook-api.types.ts`
**Files to delete**: `interfaces/facebook-api.interface.ts`, `interfaces/` dir
**Files to modify**: All importers of `./interfaces/facebook-api.interface`

### 1.2 Create `FacebookOAuthConfigService`

**New file**: `facebook-oauth-config.service.ts`

```typescript
@Injectable()
export class FacebookOAuthConfigService {
  // exposes:
  get clientId(): string     // FACEBOOK_APP_ID
  get clientSecret(): string // FACEBOOK_APP_SECRET
  get redirectUri(): string  // FACEBOOK_CALLBACK_URL
  get scopes(): string[]     // public_profile, pages_show_list, pages_manage_posts, etc.
  buildAuthUrl(state: string): string  // https://www.facebook.com/v25.0/dialog/oauth?...
}
```

- Extracts the OAuth URL-building logic from `SocialPageController.getFacebookOauthUrl()` (lines 81–100)
- Follows the same pattern as `ThreadsOAuthConfigService` and `InstagramOAuthConfigService`

### 1.3 Remove `FacebookTokenService` & refactor connector

**Delete**: `facebook-token.service.ts`

`FacebookTokenService` is a thin wrapper that delegates 4 methods to `FacebookGraphApiClient`. In Threads/Instragram, the connector calls the API client directly.

**Refactor**: `facebook-social-page-connector.service.ts`

| Before | After |
|--------|-------|
| `constructor(private readonly tokenService: FacebookTokenService)` | `constructor(private readonly apiClient: FacebookGraphApiClient)` |

Replace each `this.tokenService.xxx(...)` call with `this.apiClient.xxx(...)`:
- `this.tokenService.exchangeCodeForUserToken(code, redirectUri)` → `this.apiClient.exchangeCodeForUserToken(code, redirectUri)`
- `this.tokenService.exchangeUserTokenForLongLivedToken(token)` → `this.apiClient.exchangeUserTokenForLongLivedToken(token)`
- `this.tokenService.getUserAccounts(token)` → `this.apiClient.getUserAccounts(token)`
- `this.tokenService.getPageDetails(pageToken, pageId)` → `this.apiClient.getPageDetails(pageToken, pageId)`

**No logic changes** — just removing the indirection layer.

### 1.4 Update `FacebookModule`

| Before | After |
|--------|-------|
| Providers: `FacebookTokenService` | Remove `FacebookTokenService` |
| Providers: — | Add `FacebookOAuthConfigService` |
| Exports: `FacebookTokenService` | Remove export |
| Exports: — | Add `FacebookOAuthConfigService` |

---

## Phase 2: Presentation — Extract `FacebookOAuthController`

**New file**: `src/presentation/controllers/http/client/facebook-oauth.controller.ts`

Extract the 2 Facebook OAuth endpoints from `SocialPageController` into a dedicated controller:

### Endpoints to extract

| Method | Path | Current handler | Moved to |
|--------|------|----------------|----------|
| `GET` | `facebook/oauth` | `SocialPageController.getFacebookOauthUrl()` | `FacebookOAuthController.getOauthUrl()` |
| `GET` | `facebook/callback` | `SocialPageController.facebookCallback()` | `FacebookOAuthController.callback()` |

### `FacebookOAuthController` template

Follows the same pattern as `InstagramOAuthController` and `ThreadsOAuthController`:
- Injects: `CommandBus`, `ENTERPRISE_REPOSITORY`, `ConfigService`, `AUTH_JWT_SERVICE`, `SOCIAL_PAGE_CONNECTOR_FACTORY`, and `FacebookOAuthConfigService`
- Guards: OAuth URL endpoint uses `JwtAuthGuard + RolesGuard + UserVerifiedGuard`; callback uses `StateAuthGuard`
- OAuth URL: uses `this.facebookOAuthConfig.buildAuthUrl(state)`
- Callback: exchanges code → exchanges for long-lived token → resolves enterprise → dispatches `SocialPageBulkConnectCommand`

### What stays in `SocialPageController`

| Method | Path | Reason to keep |
|--------|------|----------------|
| `GET /` | List all social pages | Generic, all platforms |
| `DELETE /:id` | Disconnect a social page | Generic, all platforms |
| `POST /facebook/connect` | Connect a specific FB page | Specific to Facebook but tied to `SocialPageConnectCommand` |
| `POST /facebook/refresh-token` | Refresh Facebook page token | Specific to Facebook but tied to `SocialPageRefreshTokenCommand` |

These 4 endpoints dispatch platform-agnostic commands through `CommandBus`. Keeping them in `SocialPageController` avoids creating 4 more controllers for cross-platform actions.

---

## Phase 3: Wiring

### 3.1 `src/infrastructure/social-network/common/social-network.module.ts`

| Change | Details |
|--------|---------|
| **Controllers** | Add `FacebookOAuthController` |
| **Providers** | Register `FacebookOAuthConfigService` from FacebookModule (already exported after Phase 1) |

### 3.2 `src/presentation/controllers/index.ts`

Add export for `FacebookOAuthController`.

---

## Phase 4: Cleanup

- `npx tsc --noEmit` — full typecheck
- Remove leftover import references to `FacebookTokenService` across the codebase
- Ensure `FacebookGraphApiClient` is exported from `FacebookModule` (it already is)
- Verify `FacebookPublisherService` and `FacebookCommentReplierService` still work with the refactored connector (they don't depend on it, so no change needed)

---

## Summary of Changes

### Files created (3)
| File | Purpose |
|------|---------|
| `facebook-api.types.ts` | Replaces `interfaces/facebook-api.interface.ts` with flat naming |
| `facebook-oauth-config.service.ts` | OAuth config: builds Facebook dialog URL with scopes |
| `facebook-oauth.controller.ts` | Dedicated Facebook OAuth endpoints (oauth + callback) |

### Files modified (4)
| File | Change |
|------|--------|
| `src/infrastructure/social-network/facebook/facebook.module.ts` | Add OAuthConfigService, remove TokenService |
| `src/infrastructure/social-network/facebook/facebook-social-page-connector.service.ts` | Inject `FacebookGraphApiClient` directly instead of `FacebookTokenService` |
| `src/infrastructure/social-network/common/social-network.module.ts` | Register new controller + provider |
| `src/presentation/controllers/index.ts` | Export new controller |

### Files deleted (2)
| File | Reason |
|------|--------|
| `interfaces/facebook-api.interface.ts` | Replaced by `facebook-api.types.ts` |
| `facebook-token.service.ts` | Eliminated indirection layer |

### Files unchanged (3)
| File | Reason |
|------|--------|
| `facebook-graph-api.client.ts` | Already matches IG/Threads pattern (HttpService + ConfigService + handleError) |
| `facebook-publisher.service.ts` | Already implements `ISocialPublisher` correctly |
| `facebook-comment-replier.service.ts` | Already implements `ICommentReplier` correctly (unique to Facebook) |

### Files with minor import updates (several)
| File | Change |
|------|--------|
| `facebook-graph-api.client.ts` | Update import from `./interfaces/facebook-api.interface` → `./facebook-api.types` |
| `facebook-token.service.ts` | Update import path (will be deleted anyway) |

---

## Estimated Effort

| Phase | Effort | Risk |
|-------|--------|------|
| 1.1 — Types rename | Very low | Low (mechanical find-and-replace) |
| 1.2 — OAuth config | Low | Medium (extract logic correctly) |
| 1.3 — Token service removal | Low | Low (mechanical refactor) |
| 1.4 — Module update | Low | Low |
| 2 — OAuth controller | Medium | Medium (copy IG/Threads pattern, adjust for FB-specific logic + Instagram bulk connect) |
| 3 — Wiring | Low | Low |
| 4 — Typecheck + cleanup | Low | Low |

**Total**: ~2–3 hours of implementation work.

---

## Dependencies & Ordering

```
Phase 1.1 (types rename)
  │
  ▼
Phase 1.2 (OAuth config) ───── Phase 1.4 (module) ──── Phase 3 (wiring)
  │                                                    │
  ▼                                                    ▼
Phase 2 (OAuth controller) ──────────────────── npx tsc --noEmit
  │
  ▼
Phase 1.3 (token service removal)
```

Phase 1.3 can be done at any point after Phase 1.1 (since it changes the connector's dependency).
