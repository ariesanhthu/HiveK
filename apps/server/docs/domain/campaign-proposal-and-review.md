# Campaign Proposal & Public Review Domain

This document describes the two new domains added to the HiveK server: **Campaign Proposal** (public-facing landing page) and **Public Review** (moderated consumer reviews). Both were implemented following the existing Clean Architecture + DDD + CQRS patterns.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Campaign Proposal Domain](#2-campaign-proposal-domain)
3. [Public Review Domain](#3-public-review-domain)
4. [File Map](#4-file-map)
5. [API Endpoints](#5-api-endpoints)
6. [Anti-Bot Pipeline (Reviews)](#6-anti-bot-pipeline-reviews)

---

## 1. Architecture Overview

Both domains follow the same layered architecture as the rest of the codebase:

```
Core (pure domain) → Application (CQRS) → Infrastructure (MongoDB) → Presentation (REST + GraphQL)
```

### Key Patterns Used

| Pattern            | Implementation                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| **DDD**            | Aggregate roots, value objects, entities, domain events, repository interfaces                  |
| **CQRS**           | Commands (write) via aggregates & repositories; Queries (read) via read-services returning DTOs |
| **Repository**     | Interfaces in Core, implementations in Infrastructure (MongoDB)                                 |
| **DTO Validation** | Zod schemas with `nestjs-zod`                                                                   |
| **DI**             | Symbol tokens for all ports (repositories, read-services)                                       |

---

## 2. Campaign Proposal Domain

### Purpose

A public-facing, conversion-optimized landing page that bridges a KOL's content and an Enterprise's e-commerce. It acts as a secure read-only mirror of critical campaign parameters while capturing public engagement and attribution data.

### Core Concepts

| Concept                 | Type            | Description                                   |
| ----------------------- | --------------- | --------------------------------------------- |
| `CampaignProposalRoot`  | Aggregate Root  | The main aggregate holding all proposal state |
| `MediaSlideVO`          | Value Object    | Image/video slide with display order          |
| `ProductItemVO`         | Value Object    | Tracked product with per-KOL affiliate URLs   |
| `VoucherItemVO`         | Value Object    | Discount code with platform & expiration      |
| `CampaignProposalModel` | Mongoose Schema | Persisted in `campaign_proposals` collection  |

### State Machine — `EProposalStatus`

```
ACTIVE ←→ PAUSED
    ↓
 ARCHIVED (terminal)
```

### Domain Data Model

**Campaign Proposal Document (`campaign_proposals` collection):**

```json
{
  "_id": "ObjectId",
  "campaign_id": "ObjectId (ref: CampaignModel)",
  "slug": "hivek-summer-promo (unique)",
  "title": "HiveK Premium Summer Collection",
  "description": "Exclusive seasonal gear curated by top creators.",
  "media_slides": [
    { "type": "image", "file_id": "file_1", "display_order": 1 }
  ],
  "products": [
    {
      "product_id": "prod_99182",
      "name": "HiveK Summer Unboxing Kit",
      "price": 250000,
      "currency": "VND",
      "image_id": "file_2",
      "affiliate_urls": {
        "kol_profile_id_1": "https://shopee.vn/...?smtt=kol_1"
      }
    }
  ],
  "vouchers": [
    {
      "code": "HIVEK50K",
      "platform": "shopee",
      "discount_value": "50,000 VND",
      "description": "Summer discount",
      "expiration_date": "2026-07-31T23:59:59.000Z"
    }
  ],
  "status": "active",
  "metrics": { "totalViews": 1420, "totalClicks": 389 },
  "delete_at": null,
  "delete_by": null,
  "created_at": "2026-06-12T00:00:00.000Z",
  "updated_at": "2026-06-12T07:30:00.000Z"
}
```

### CQRS Commands (Writes)

| Command                 | Description                                           | Auth       |
| ----------------------- | ----------------------------------------------------- | ---------- |
| `ProposalCreate`        | Create new proposal with `active` status              | Enterprise |
| `ProposalUpdate`        | Update title, description, slides, products, vouchers | Enterprise |
| `ProposalUpdateStatus`  | Transition: active↔paused, active/paused→archived     | Enterprise |
| `ProposalUpdateMetrics` | Increment a metric counter (e.g., `totalViews`)       | Public     |
| `ProposalSoftDelete`    | Soft-delete proposal                                  | Enterprise |
| `ProposalRestore`       | Restore from soft-delete                              | Enterprise |

### CQRS Queries (Reads)

| Query               | Description                                      | Access        |
| ------------------- | ------------------------------------------------ | ------------- |
| `ProposalGetBySlug` | Lookup by public slug (URL-friendly)             | Public        |
| `ProposalGetById`   | Lookup by internal ObjectId                      | Authenticated |
| `ProposalGetList`   | Paginated list with filters (campaignId, status) | Authenticated |

---

## 3. Public Review Domain

### Purpose

A moderated consumer review system for campaign proposals, with anti-bot protection and an Enterprise moderation pipeline.

### Core Concepts

| Concept                    | Type            | Description                                     |
| -------------------------- | --------------- | ----------------------------------------------- |
| `PublicReviewRoot`         | Aggregate Root  | The main aggregate for reviews (own collection) |
| `ReviewSecurityMetadataVO` | Value Object    | IP hash, browser fingerprint, reCAPTCHA score   |
| `PublicReviewModel`        | Mongoose Schema | Persisted in `public_reviews` collection        |

### State Machine — `EReviewStatus`

```
PENDING → APPROVED  (by Enterprise)
PENDING → REJECTED  (by Enterprise)
```

Once `APPROVED` or `REJECTED`, the status is terminal — no further transitions.

### Domain Data Model

**Public Review Document (`public_reviews` collection):**

```json
{
  "_id": "ObjectId",
  "proposal_id": "ObjectId (ref: CampaignProposalModel)",
  "author_name": "Alex Nguyen",
  "rating": 5,
  "comment": "The fabric quality is outstanding!",
  "status": "pending",
  "security_metadata": {
    "ip_hash": "8f9b2361b0a8f8d...",
    "browser_fingerprint": "fp_ctx_99218a81bc",
    "recaptcha_score": 0.9
  },
  "delete_at": null,
  "delete_by": null,
  "created_at": "2026-06-12T07:45:00.000Z",
  "updated_at": "2026-06-12T07:45:00.000Z"
}
```

### CQRS Commands (Writes)

| Command            | Description                                 | Auth               |
| ------------------ | ------------------------------------------- | ------------------ |
| `ReviewCreate`     | Submit a public review (saved as `pending`) | Public + reCAPTCHA |
| `ReviewModerate`   | Approve or reject a review                  | Enterprise/Admin   |
| `ReviewSoftDelete` | Soft-delete review                          | Admin              |
| `ReviewRestore`    | Restore review                              | Admin              |

### CQRS Queries (Reads)

| Query           | Description                                      | Access                                  |
| --------------- | ------------------------------------------------ | --------------------------------------- |
| `ReviewGetById` | Lookup by ID                                     | Public (approved only via read-service) |
| `ReviewGetList` | Paginated list with filters (proposalId, status) | Public (always enforces `approved`)     |

### Anti-Bot Pipeline

Public review submission is protected by a 3-layer pipeline:

```
[Client Submit]
      │
      ▼
1. Throttler Guard ──► 3 posts / 5 minutes (composite IP + fingerprint)
      │
      ▼ Pass
2. reCAPTCHA Guard ──► Validates Google reCAPTCHA v3 token server-side
      │
      ▼ Pass
3. Handler Check  ──► Verifies recaptcha_score >= 0.5
      │
      ▼ Pass
4. Database Write  ──► status: "pending" (only visible after approval)
```

---

## 4. File Map — 69 Files Created

### Core Layer (12 files)

| File                                                              | Description                                                             |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `src/core/enums/proposal-status.enum.ts`                          | `EProposalStatus` — active, paused, archived                            |
| `src/core/enums/review-status.enum.ts`                            | `EReviewStatus` — pending, approved, rejected                           |
| `src/core/enums/product-platform.enum.ts`                         | `EProductPlatform` — shopee, lazada, tiktok_shop, custom                |
| `src/core/enums/media-slide-type.enum.ts`                         | `EMediaSlideType` — image, video                                        |
| `src/core/value-objects/media-slide.value-object.ts`              | `MediaSlideVO` — type, fileId, displayOrder                             |
| `src/core/value-objects/product-item.value-object.ts`             | `ProductItemVO` — productId, name, price, imageId, affiliateUrls        |
| `src/core/value-objects/voucher-item.value-object.ts`             | `VoucherItemVO` — code, platform, discountValue, expirationDate         |
| `src/core/value-objects/review-security-metadata.value-object.ts` | `ReviewSecurityMetadataVO` — ipHash, browserFingerprint, recaptchaScore |
| `src/core/aggregate-roots/campaign-proposal.aggregate.ts`         | `CampaignProposalRoot` — status machine, metrics counter, CRUD          |
| `src/core/aggregate-roots/public-review.aggregate.ts`             | `PublicReviewRoot` — approve/reject, soft-delete lifecycle              |
| `src/core/exceptions/proposal.exception.ts`                       | `ProposalNotFoundException`, `ProposalInvalidStatusTransitionException` |
| `src/core/exceptions/review.exception.ts`                         | `ReviewNotFoundException`, `ReviewLowRecaptchaScoreException`           |

### Core Interfaces (2 files)

| File                                                               | Description                                                                     |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `src/core/interfaces/repositories/campaign-proposal.repository.ts` | `ICampaignProposalRepository` — `findBySlug()`, `findByCampaignId()`            |
| `src/core/interfaces/repositories/public-review.repository.ts`     | `IPublicReviewRepository` — `findByProposalId()`, `findByProposalIdAndStatus()` |

### Application Layer — DTOs (4 files)

| File                                   | Description                                                |
| -------------------------------------- | ---------------------------------------------------------- |
| `src/application/dtos/proposal.dto.ts` | `ProposalDto`, `ProposalFilterDto` — Zod schemas + classes |
| `src/application/dtos/review.dto.ts`   | `ReviewDto`, `ReviewFilterDto` — Zod schemas + classes     |

### Application Layer — Mappers (2 files)

| File                                         | Description                                |
| -------------------------------------------- | ------------------------------------------ |
| `src/application/mappers/proposal.mapper.ts` | `ProposalMapper.toDto()` — aggregate → DTO |
| `src/application/mappers/review.mapper.ts`   | `ReviewMapper.toDto()` — aggregate → DTO   |

### Application Layer — Read-Service Interfaces (2 files)

| File                                                                         | Description                                       |
| ---------------------------------------------------------------------------- | ------------------------------------------------- |
| `src/application/interfaces/read-service/proposal.read-service.interface.ts` | `ICampaignProposalReadService` — `findBySlug()`   |
| `src/application/interfaces/read-service/review.read-service.interface.ts`   | `IPublicReviewReadService` — `findByProposalId()` |

### Application Layer — Commands (20 files)

| Folder                     | Files                 |
| -------------------------- | --------------------- |
| `proposal-create/`         | command, dto, handler |
| `proposal-update/`         | command, dto, handler |
| `proposal-update-status/`  | command, dto, handler |
| `proposal-update-metrics/` | command, dto, handler |
| `proposal-soft-delete/`    | command, handler      |
| `proposal-restore/`        | command, handler      |
| `review-create/`           | command, dto, handler |
| `review-moderate/`         | command, dto, handler |
| `review-soft-delete/`      | command, handler      |
| `review-restore/`          | command, handler      |

### Application Layer — Queries (10 files)

| Folder                  | Files               |
| ----------------------- | ------------------- |
| `proposal-get-by-slug/` | query, handler      |
| `proposal-get-by-id/`   | query, handler      |
| `proposal-get-list/`    | query, handler, dto |
| `review-get-by-id/`     | query, handler      |
| `review-get-list/`      | query, handler, dto |

### Infrastructure — MongoDB Schemas (2 files)

| File                                                           | Collection           |
| -------------------------------------------------------------- | -------------------- |
| `src/infrastructure/mongo/schemas/campaign-proposal.schema.ts` | `campaign_proposals` |
| `src/infrastructure/mongo/schemas/public-review.schema.ts`     | `public_reviews`     |

### Infrastructure — Repositories (2 files)

| File                                                                    | Implements                    |
| ----------------------------------------------------------------------- | ----------------------------- |
| `src/infrastructure/mongo/repositories/campaign-proposal.repository.ts` | `ICampaignProposalRepository` |
| `src/infrastructure/mongo/repositories/public-review.repository.ts`     | `IPublicReviewRepository`     |

### Infrastructure — Read-Services (2 files)

| File                                                                       | Implements                     |
| -------------------------------------------------------------------------- | ------------------------------ |
| `src/infrastructure/mongo/read-services/campaign-proposal.read-service.ts` | `ICampaignProposalReadService` |
| `src/infrastructure/mongo/read-services/public-review.read-service.ts`     | `IPublicReviewReadService`     |

### Infrastructure — NestJS Modules (2 files)

| File                                                     | Registers                                                |
| -------------------------------------------------------- | -------------------------------------------------------- |
| `src/infrastructure/modules/campaign-proposal.module.ts` | Repo, read-service, 6 command handlers, 3 query handlers |
| `src/infrastructure/modules/public-review.module.ts`     | Repo, read-service, 4 command handlers, 2 query handlers |

### Presentation — REST Controllers (4 files)

| Controller                         | Endpoint Prefix            | Auth                                            |
| ---------------------------------- | -------------------------- | ----------------------------------------------- |
| `CampaignProposalClientController` | `/api/v1/client/proposals` | Public for slug/metrics; Enterprise for CRUD    |
| `CampaignProposalAdminController`  | `/api/v1/admin/proposals`  | Admin only                                      |
| `PublicReviewClientController`     | `/api/v1/client/reviews`   | Public for submit/list; Enterprise for moderate |
| `PublicReviewAdminController`      | `/api/v1/admin/reviews`    | Admin only                                      |

### Presentation — GraphQL (2 files)

| File                                                          | Description                                                                    |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `src/infrastructure/graphql/types/proposal.type.ts`           | `CampaignProposalType`, `MediaSlideType`, `ProductItemType`, `VoucherItemType` |
| `src/infrastructure/graphql/types/review.type.ts`             | `PublicReviewType`                                                             |
| `src/presentation/controllers/resolvers/proposal.resolver.ts` | `campaignProposal(id?, slug?)`, `campaignProposals(filters?)`                  |
| `src/presentation/controllers/resolvers/review.resolver.ts`   | `review(id)`, `reviews(filters?)`                                              |

---

## 5. API Endpoints

### REST (Swagger available at `/hivek/api/{admin|client}/docs`)

#### Campaign Proposals

| Method  | Path                            | Auth       | Description      |
| ------- | ------------------------------- | ---------- | ---------------- |
| `GET`   | `.../proposals/:slug`           | Public     | Get by slug      |
| `GET`   | `.../proposals`                 | Bearer     | List proposals   |
| `GET`   | `.../proposals/internal/:id`    | Bearer     | Get by ID        |
| `POST`  | `.../proposals`                 | Enterprise | Create proposal  |
| `PATCH` | `.../proposals/:id`             | Enterprise | Update proposal  |
| `PATCH` | `.../proposals/:id/status`      | Enterprise | Update status    |
| `PATCH` | `.../proposals/:id/metrics`     | Public     | Increment metric |
| `PATCH` | `.../proposals/:id/soft-delete` | Enterprise | Soft-delete      |
| `PATCH` | `.../proposals/:id/restore`     | Enterprise | Restore          |

#### Public Reviews

| Method  | Path                          | Auth                          | Description                       |
| ------- | ----------------------------- | ----------------------------- | --------------------------------- |
| `POST`  | `.../reviews`                 | Public + reCAPTCHA + Throttle | Submit review                     |
| `GET`   | `.../reviews`                 | Public                        | List approved reviews             |
| `GET`   | `.../reviews/all`             | Enterprise                    | List all reviews (for moderation) |
| `PATCH` | `.../reviews/:id/moderate`    | Enterprise                    | Approve/reject                    |
| `PATCH` | `.../reviews/:id/soft-delete` | Admin                         | Soft-delete                       |
| `PATCH` | `.../reviews/:id/restore`     | Admin                         | Restore                           |

### GraphQL (playground at `/hivek/graphql`)

```graphql
# Queries
campaignProposal(id: ID, slug: String): CampaignProposalType
campaignProposals(filters: CampaignProposalFilterInput): CampaignProposalResponse
review(id: ID!): PublicReviewType
reviews(filters: PublicReviewFilterInput): PublicReviewResponse
```

---

## 6. Anti-Bot Pipeline (Reviews)

The public review submission uses a 3-layer defense:

### Layer 1: NestJS Throttler Guard

- **Rate**: 3 submissions per 5 minutes per IP
- **Implementation**: `@Throttle({ default: { limit: 3, ttl: 300000 } })` on the controller

### Layer 2: Google reCAPTCHA v3

- **Guard**: `RecaptchaGuard` — validates reCAPTCHA token server-side with Google's API
- **Config**: Requires `RECAPTCHA_SECRET_KEY` env var

### Layer 3: Score Threshold

- **Check**: In `ReviewCreateCommandHandler` — ensures `recaptcha_score >= 0.5`
- **Result**: Reviews with low scores are rejected before persistence

### Database Layer

- **All reviews** saved with `status: "pending"` regardless of pipeline
- **Visibility**: Only visible to public after Enterprise approves (`status: "approved"`)
