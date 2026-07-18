# Social Network Infrastructure — Refactor Plan

> **Status**: ✅ All phases complete.
> **Date**: 2026-07-18
> **Goal**: Consolidate `facebook/`, `threads/`, and `posting/` into a unified `social-network/` directory with a clean platform-per-subdirectory structure.

---

## 1. Rationale

Currently, three scattered directories in `src/infrastructure/` all belong to the same **social network domain**:

```
src/infrastructure/
├── facebook/       ← Platform impl: connector, publisher, graph client, token, comment replier
├── threads/        ← Platform impl: connector, publisher, graph client, oauth config
├── posting/        ← Orchestration: connector-factory, publisher-discovery, replier-discovery, cron job
└── modules/
    └── posting.module.ts  ← Wires facebook + threads + posting + controllers + handlers
```

Each platform implements the same strategy interfaces (`ISocialPageConnector`, `ISocialPublisher`, `ICommentReplier`). The `posting/` directory contains platform-agnostic orchestration that resolves strategies. Grouping them under a single `social-network/` root makes the boundary explicit and simplifies adding future platforms (Instagram, TikTok, etc.).

---

## 2. Target Structure

```
src/infrastructure/social-network/
├── facebook/                           # ← existing facebook/ (no internal changes)
│   ├── interfaces/
│   │   └── facebook-api.interface.ts
│   ├── facebook-graph-api.client.ts
│   ├── facebook-publisher.service.ts
│   ├── facebook-social-page-connector.service.ts
│   ├── facebook-token.service.ts
│   ├── facebook-comment-replier.service.ts
│   └── facebook.module.ts
├── threads/                            # ← existing threads/ (no internal changes)
│   ├── threads-api.types.ts
│   ├── threads-graph-api.client.ts
│   ├── threads-publisher.service.ts
│   ├── threads-social-page-connector.service.ts
│   ├── threads-oauth-config.service.ts
│   └── threads.module.ts
├── common/                             # ← replaces posting/ — platform-agnostic orchestration
│   ├── factories/
│   │   ├── social-page-connector-factory.service.ts
│   │   ├── social-publisher-discovery.service.ts
│   │   └── comment-replier-discovery.service.ts
│   ├── jobs/
│   │   └── post-publish.job.ts
│   └── social-network.module.ts        # ← replaces modules/posting.module.ts
└── instagram/                          # future
└── tiktok/                             # future
```

---

## 3. File Movement Summary

| # | Source | Destination | Type |
|---|--------|-------------|------|
| 1 | `src/infrastructure/facebook/` | `social-network/facebook/` | Directory move |
| 2 | `src/infrastructure/threads/` | `social-network/threads/` | Directory move |
| 3 | `src/infrastructure/posting/social-page-connector-factory.service.ts` | `social-network/common/factories/` | File move |
| 4 | `src/infrastructure/posting/social-publisher-discovery.service.ts` | `social-network/common/factories/` | File move |
| 5 | `src/infrastructure/posting/comment-replier-discovery.service.ts` | `social-network/common/factories/` | File move |
| 6 | `src/infrastructure/posting/jobs/post-publish.job.ts` | `social-network/common/jobs/` | File move |
| 7 | `src/infrastructure/posting/` | *(delete after all files moved)* | Delete |
| 8 | `src/infrastructure/modules/posting.module.ts` | `social-network/common/social-network.module.ts` | **Rewrite** + import fixes |
| 9 | `src/infrastructure/modules/posting.module.ts` | *(delete)* | Delete |

---

## 4. Import Paths to Update

### 4.1 Module registration

| File | Old Import | New Import |
|------|-----------|------------|
| `src/infrastructure/modules/app.module.ts` | `@/infrastructure/modules/posting.module` → `PostingModule` | `@/infrastructure/social-network/common/social-network.module` → `SocialNetworkModule` |

### 4.2 External imports (files outside `social-network/`)

| File | Old Import | New Import |
|------|-----------|------------|
| `src/presentation/controllers/http/client/threads-oauth.controller.ts` | `@/infrastructure/threads/threads-oauth-config.service` | `@/infrastructure/social-network/threads/threads-oauth-config.service` |
| `tests/infrastructure/threads/threads-publisher.service.spec.ts` | `@/infrastructure/threads/threads-publisher.service` | `@/infrastructure/social-network/threads/threads-publisher.service` |
| `tests/infrastructure/threads/threads-publisher.service.spec.ts` | `@/infrastructure/threads/threads-graph-api.client` | `@/infrastructure/social-network/threads/threads-graph-api.client` |
| `tests/infrastructure/threads/threads-graph-api.client.spec.ts` | `@/infrastructure/threads/threads-graph-api.client` | `@/infrastructure/social-network/threads/threads-graph-api.client` |
| `tests/infrastructure/threads/threads-social-page-connector.service.spec.ts` | `@/infrastructure/threads/threads-social-page-connector.service` | `@/infrastructure/social-network/threads/threads-social-page-connector.service` |
| `tests/infrastructure/threads/threads-social-page-connector.service.spec.ts` | `@/infrastructure/threads/threads-graph-api.client` | `@/infrastructure/social-network/threads/threads-graph-api.client` |
| `tests/infrastructure/threads/threads-oauth-config.service.spec.ts` | `@/infrastructure/threads/threads-oauth-config.service` | `@/infrastructure/social-network/threads/threads-oauth-config.service` |

### 4.3 Internal module imports (`social-network.module.ts` vs old `posting.module.ts`)

The new `social-network/common/social-network.module.ts` must update relative paths:

| Old (from `modules/posting.module.ts`) | New (from `social-network/common/`) |
|----------------------------------------|-------------------------------------|
| `../facebook/facebook.module` | `../facebook/facebook.module` *(stays same)* |
| `../threads/threads.module` | `../threads/threads.module` *(stays same)* |
| `../facebook/facebook-publisher.service` | `../facebook/facebook-publisher.service` *(stays same)* |
| `../facebook/facebook-social-page-connector.service` | `../facebook/facebook-social-page-connector.service` *(stays same)* |
| `../facebook/facebook-comment-replier.service` | `../facebook/facebook-comment-replier.service` *(stays same)* |
| `../threads/threads-publisher.service` | `../threads/threads-publisher.service` *(stays same)* |
| `../threads/threads-social-page-connector.service` | `../threads/threads-social-page-connector.service` *(stays same)* |
| `../posting/social-publisher-discovery.service` | `./factories/social-publisher-discovery.service` |
| `../posting/comment-replier-discovery.service` | `./factories/comment-replier-discovery.service` |
| `../posting/social-page-connector-factory.service` | `./factories/social-page-connector-factory.service` |
| `../posting/jobs/post-publish.job` | `./jobs/post-publish.job` |
| `../../presentation/controllers/...` | `../../../presentation/controllers/...` *(add one more ../)* |

---

## 5. What Does NOT Change

| Item | Reason |
|------|--------|
| **Internal files** in `facebook/` and `threads/` | All use local `./` imports and `@/` alias paths for cross-layer; no relative paths to outside directories |
| **Mongoose schemas** (`social-page.schema.ts`, `scheduled-post.schema.ts`) | Persistence concern — stays in `infrastructure/mongo/` |
| **Mongo repositories** | Same — stays in `infrastructure/mongo/` |
| **REST controllers** | Presentational layer — stays in `presentation/controllers/` |
| **Core interfaces** (`ISocialPageConnector`, etc.) | Domain definition — stays in `core/` |
| **Application handlers/commands/queries** | Application layer — stays in `application/` |
| **OAuth passport strategies** (`auth/strategies/facebook.strategy.ts`) | KOL onboarding flow (different concern from Enterprise social pages) — stays in `auth/` |

---

## 6. Task Checklist

### Phase A — Create Directory Structure

- [x] Create `src/infrastructure/social-network/facebook/`
- [x] Create `src/infrastructure/social-network/threads/`
- [x] Create `src/infrastructure/social-network/common/factories/`
- [x] Create `src/infrastructure/social-network/common/jobs/`

### Phase B — Move Platform Directories

- [x] Move `src/infrastructure/facebook/` → `social-network/facebook/`
- [x] Move `src/infrastructure/threads/` → `social-network/threads/`
- [x] Verify internal imports still work (all `./` and `@/` aliases)

### Phase C — Move Orchestration Files

- [x] Move `social-page-connector-factory.service.ts` → `social-network/common/factories/`
- [x] Move `social-publisher-discovery.service.ts` → `social-network/common/factories/`
- [x] Move `comment-replier-discovery.service.ts` → `social-network/common/factories/`
- [x] Move `post-publish.job.ts` → `social-network/common/jobs/`
- [x] Delete `src/infrastructure/posting/` (verify empty first)

### Phase D — Create SocialNetworkModule

- [x] Create `social-network/common/social-network.module.ts` (adapted from `modules/posting.module.ts`)
  - Update all relative import paths (see §4.3)
  - Rename class `PostingModule` → `SocialNetworkModule`
- [x] Delete `src/infrastructure/modules/posting.module.ts`

### Phase E — Update External References

- [x] Update `modules/app.module.ts`: `PostingModule` → `SocialNetworkModule`, update import path
- [x] Update `threads-oauth.controller.ts`: `@/infrastructure/threads/...` → `@/infrastructure/social-network/threads/...`
- [x] Update 4 test files: `@/infrastructure/threads/...` → `@/infrastructure/social-network/threads/...`

### Phase F — Verify & Validate

- [x] TypeScript typecheck — **passed** (no errors from changed files)
- [x] Verify no remaining references to old paths — **passed** (zero matches)
- [x] Code review — **passed** (changes structurally sound)

---

## 7. Migration Impact Summary

| File | Change |
|------|--------|
| `infrastructure/facebook/*` (7 files) | Moved to `social-network/facebook/` |
| `infrastructure/threads/*` (6 files) | Moved to `social-network/threads/` |
| `infrastructure/posting/*` (4 files) | Moved to `social-network/common/factories/` or `common/jobs/` |
| `infrastructure/modules/posting.module.ts` | Replaced by `social-network/common/social-network.module.ts` |
| `infrastructure/modules/app.module.ts` | Updated import to `SocialNetworkModule` |
| `presentation/controllers/http/client/threads-oauth.controller.ts` | Updated alias path |
| `tests/infrastructure/threads/*.spec.ts` (4 files) | Updated alias paths |
| **Total files moved** | **13 files** (platforms) + **4 files** (orchestration) |
| **Total files updated** | **1 module** + **1 controller** + **4 tests** |
