# Subscription & QuotaUsage Domain

This document describes the business rules, state machines, domain aggregates, database models, CQRS commands/queries, and end-to-end workflows for the **Subscription** and **QuotaUsage** domains within the HiveK server.

> **Architecture Pattern**: Clean Architecture + DDD + CQRS + Event Sourcing (light)

---

## Table of Contents

1. [Domain Overview](#1-domain-overview)
2. [Core Layer (Domain Model)](#2-core-layer-domain-model)
3. [State Machines & Status Transitions](#3-state-machines--status-transitions)
4. [Application Layer](#4-application-layer)
5. [Infrastructure Layer](#5-infrastructure-layer)
6. [Presentation Layer](#6-presentation-layer)
7. [Workflow Flows](#7-workflow-flows)
8. [File Map](#8-file-map)
9. [Key Invariants](#9-key-invariants)

---

## 1. Domain Overview

### Purpose

**Subscription** tracks which packages (plans and addons) a **User/Owner** has purchased, computes the aggregated grants and permissions from all active packages, and records a history of every change. **QuotaUsage** tracks real-time consumption of renewable quotas (e.g. campaigns created this month) against the allocated limits from the subscription's computed grants.

Together they form the **entitlement engine**: Subscription defines *what an owner is entitled to*, and QuotaUsage tracks *how much has been used* across the owner's enterprises.

### Bounded Context

These two domains are tightly coupled:
- **Subscription** is the source of truth for an owner's active plan, addons, computed grants, and permissions
- **QuotaUsage** is derived from Subscription — it reads the renewable grants from the subscription and tracks consumption per quota key per enterprise

They are consumed by other domains (Campaign, SocialPage, etc.) to check whether an enterprise can perform an action (e.g. create a campaign, schedule a post). They are updated when a payment is completed (via `PaymentCompletedEventHandler` → `SubscriptionUpdateCommand`).

### Key Concepts

| Concept | Type | Description |
|---------|------|-------------|
| `SubscriptionRoot` | Aggregate Root | Owner's active subscription — plan, addons, computed grants/permissions, versioned |
| `SubscriptionHistoryEntity` | Entity | Immutable audit log of every subscription change |
| `QuotaUsageRoot` | Aggregate Root | Per-enterprise tracking of renewable quota consumption |
| `EnterpriseQuotaAllocationRoot` | Aggregate Root | Owner-level split of divisible grants across enterprises + unallocated pool |
| `PlanItemVO` | Value Object | The active plan (package variant, dates, pricing, auto-renew) |
| `AddonItemVO` | Value Object | A purchased addon (package variant, dates, pricing) |
| `SubscriptionChangeDetailsVO` | Value Object | Snapshot of what changed (old/new plan, addons, grants, permissions) |
| `RenewableUsageVO` | Value Object | A single quota key's allocation, consumption, and cycle dates |
| `EnterpriseQuotaAllocationVO` | Value Object | One row: owner/enterprise/key/kind/allocated/isPool |
| `ESubscriptionStatus` | Enum | `active`, `expired`, `cancelled` |
| `EGrantType` | Enum | `quota_hard`, `quota_renewable`, `credit_top_up`, `permission` |

### Relations to Other Domains

| Domain | Relationship |
|--------|-------------|
| **Package** | Subscription references `packageId` + `packageVariantId` for plan and addons; reads grants from Package definitions |
| **Bill** | Subscription is updated when a Bill is paid (via `PaymentCompletedEventHandler`) |
| **Enterprise** | `EnterpriseRoot.userId` identifies the owner; `QuotaUsageRoot` remains 1:1 with `Enterprise` |
| **QuotaUsage** | Subscription's computed renewable grants define the allocation limits for QuotaUsage, filtered through `EnterpriseQuotaAllocationRoot` |
| **Campaign** | Campaign creation checks QuotaUsage to enforce campaign count limits |
| **SocialPage** | Social page scheduling checks QuotaUsage for post scheduling limits |

---

## 2. Core Layer (Domain Model)

### 2.1 Aggregate Roots

#### SubscriptionRoot

**File**: `src/core/aggregate-roots/subscription.aggregate.ts`

**Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `userId` | `string` | The owner user this subscription belongs to (1:1) |
| `status` | `ESubscriptionStatus` | `active`, `expired`, or `cancelled` |
| `planItem` | `PlanItemVO \| null` | The active plan (null if expired or not yet subscribed) |
| `addonItems` | `AddonItemVO[]` | Purchased addons |
| `computedGrants` | `GrantVO[]` | Aggregated grants from plan + all addons (merged by key) |
| `computedPermissions` | `string[]` | Aggregated permission keys from plan + all addons |
| `version` | `number` | Optimistic concurrency version (incremented on each update) |
| `nextExpiryCheckAt` | `Date` | Earliest expiry date among plan and addons (for cron) |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last update timestamp |

**Factory Methods**:

| Method | Description |
|--------|-------------|
| `static create(props)` | Creates a new subscription with version = 1 |
| `static instantiate(id, props)` | Reconstitutes from persistence |

**Domain Methods**:

| Method | Description | Raises Event |
|--------|-------------|-------------|
| `attachPlan(item)` | Sets or replaces the plan item | — |
| `expirePlan()` | Clears the plan item (sets to null) | — |
| `attachAddon(item)` | Adds an addon if not already present (dedup by `packageVariantId`). Returns `true` if added. | — |
| `removeAddon(packageVariantId)` | Removes an addon by variant ID. Returns `true` if removed. | — |
| `updateComputedFields(grants, permissions)` | Sets computed grants and permissions | — |
| `clear()` | Clears plan, addons, computed grants, and permissions | — |
| `recomputeGrants(planGrants, addonsGrants)` | Merges plan + addon grants by key (sums quota values, unions permissions). Plan `creditFallback` takes precedence over addon fallback. | — |
| `recordSubscriptionUpdated(historyId, details)` | Registers a `SubscriptionUpdatedEvent` with change details | `SubscriptionUpdatedEvent` |

**Getters**:

| Getter | Returns | Description |
|--------|---------|-------------|
| `get userId()` | `string` | Owner user ID |
| `get status()` | `ESubscriptionStatus` | Current status |
| `get planItem()` | `PlanItemVO \| null` | Active plan or null |
| `get addonItems()` | `AddonItemVO[]` | Active addons |
| `get computedGrants()` | `GrantVO[]` | Merged grants |
| `get computedPermissions()` | `string[]` | Merged permissions |
| `get version()` | `number` | Optimistic lock version |
| `get nextExpiryCheckAt()` | `Date` | Next expiry check timestamp |
| `get createdAt()` | `Date` | Creation timestamp |
| `get updatedAt()` | `Date` | Last update timestamp |

---

#### QuotaUsageRoot

**File**: `src/core/aggregate-roots/quota-usage.aggregate.ts`

**Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `enterpriseId` | `string` | The enterprise this quota usage belongs to (1:1) |
| `cycleAnchorDate` | `Date` | Reference date for calculating billing cycles |
| `usages` | `RenewableUsageVO[]` | Per-key quota consumption records |
| `updatedAt` | `Date` | Last update timestamp |

**Factory Methods**:

| Method | Description |
|--------|-------------|
| `static create(enterpriseId, cycleAnchorDate)` | Creates a new quota usage tracker with empty usages |
| `static instantiate(id, props)` | Reconstitutes from persistence |

**Domain Methods**:

| Method | Description | Raises Event |
|--------|-------------|-------------|
| `tryConsume(key, amount)` | Attempts to consume `amount` from the quota identified by `key`. Returns `{ ok, overflow }`. If within allocation, records consumption and raises `QuotaConsumedEvent`. | `QuotaConsumedEvent` |
| `recompute(renewableGrants, newAnchorDate?)` | Rebuilds the usages list from the given renewable grants. Preserves existing `used` values for matching keys. Updates cycle dates based on anchor. | — |
| `resetExpiredCycles(now)` | Finds usages whose `cycleEndsAt` ≤ `now`, resets `used` to 0, advances to next cycle. Returns list of reset keys. Raises `QuotaUsageResetEvent` if any were reset. | `QuotaUsageResetEvent` |

**Getters**:

| Getter | Returns | Description |
|--------|---------|-------------|
| `get enterpriseId()` | `string` | Enterprise ID |
| `get cycleAnchorDate()` | `Date` | Cycle anchor date |
| `get usages()` | `RenewableUsageVO[]` | Per-key usage records |

---

#### EnterpriseQuotaAllocationRoot

**File**: `src/core/aggregate-roots/enterprise-quota-allocation.aggregate.ts`

**Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `ownerId` | `string` | The owner user ID (1:1 with user) |
| `allocations` | `EnterpriseQuotaAllocationVO[]` | Per-enterprise quota allocations + pool rows |
| `updatedAt` | `Date` | Last update timestamp |

**Factory Methods**:

| Method | Description |
|--------|-------------|
| `static create(ownerId)` | Creates a new allocation root with empty allocations |
| `static instantiate(id, props)` | Reconstitutes from persistence |

**Domain Methods**:

| Method | Description |
|--------|-------------|
| `allocate(enterpriseId, key, amount, kind)` | Moves `amount` from pool to enterprise for key+kind |
| `deallocate(enterpriseId, key, amount, kind)` | Moves `amount` from enterprise back to pool |
| `setAllocationForEnterprise(enterpriseId, key, kind, amount)` | Sets exact allocation for an enterprise |
| `rebalanceFromSubscription(computedGrants, enterpriseIds)` | Rebuilds allocations from subscription grants; preserves existing enterprise allocations if possible, remainder goes to pool |
| `getAllocationForEnterprise(enterpriseId, key, kind)` | Returns allocation amount for enterprise |
| `getPoolBalance(key, kind)` | Returns unallocated pool balance |
| `getAllocationsByEnterprise(enterpriseId)` | Returns all allocation rows for an enterprise |

**Invariant**: For a given `ownerId + key + kind`, `Σ enterprise.allocated + pool.allocated === total from subscription.computedGrants`.

---

### 2.2 Entities

#### SubscriptionHistoryEntity

**File**: `src/core/aggregate-roots/subscription-history.aggregate.ts`

**Parent Aggregate**: `SubscriptionRoot`

**Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `subscriptionId` | `string` | Parent subscription ID |
| `userId` | `string` | Owner user ID |
| `billId` | `string \| undefined` | Associated bill (if change was bill-driven) |
| `actorId` | `string \| undefined` | User who triggered the change |
| `details` | `SubscriptionChangeDetailsVO` | Snapshot of what changed |
| `createdAt` | `Date` | Creation timestamp |

---

### 2.3 Value Objects

#### PlanItemVO

**File**: `src/core/value-objects/plan-item.vo.ts`

**Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `packageId` | `string` | Package ID |
| `packageVariantId` | `string` | Package variant ID |
| `startDate` | `Date` | When the plan started |
| `expiresAt` | `Date` | When the plan expires |
| `billId` | `string` | Bill that purchased this plan |
| `autoRenew` | `boolean` | Whether auto-renewal is enabled |
| `price` | `number` | Base price at purchase time |
| `priceAfterDiscount` | `number` | Discounted price at purchase time |

**Methods**:
- `isExpired()` — Returns `true` if current date > `expiresAt`

#### AddonItemVO

**File**: `src/core/value-objects/addon-item.vo.ts`

**Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `packageId` | `string` | Package ID |
| `packageVariantId` | `string` | Package variant ID |
| `purchasedAt` | `Date` | When the addon was purchased |
| `expiresAt` | `Date \| null` | When the addon expires (null = never) |
| `billId` | `string` | Bill that purchased this addon |
| `price` | `number` | Base price at purchase time |
| `priceAfterDiscount` | `number` | Discounted price at purchase time |

**Methods**:
- `isExpired()` — Returns `false` if `expiresAt` is null, otherwise checks current date

#### SubscriptionChangeDetailsVO

**File**: `src/core/value-objects/subscription-change-details.vo.ts`

**Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `oldPlanId` | `string \| null` | Previous plan's package ID |
| `newPlanId` | `string \| null` | New plan's package ID |
| `addedAddonIds` | `string[]` | Addon variant IDs that were added |
| `removedAddonIds` | `string[]` | Addon variant IDs that were removed |
| `oldGrants` | `GrantVO[]` | Grants before the change |
| `newGrants` | `GrantVO[]` | Grants after the change |
| `oldPermissions` | `string[]` | Permissions before the change |
| `newPermissions` | `string[]` | Permissions after the change |

**Methods**:
- `getAddedPermissions()` — Returns permissions in `newPermissions` not in `oldPermissions`
- `getRemovedPermissions()` — Returns permissions in `oldPermissions` not in `newPermissions`

#### RenewableUsageVO

**File**: `src/core/value-objects/renewable-usage.vo.ts`

**Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `key` | `string` | Quota key (e.g. `campaign_count`) |
| `allocated` | `number` | Total allocation for this cycle |
| `used` | `number` | Amount consumed so far |
| `cycleStartAt` | `Date` | Cycle start date |
| `cycleEndsAt` | `Date` | Cycle end date |

**Invariants**:
- `used` must be ≥ 0 and ≤ `allocated`
- `cycleEndsAt` must be after `cycleStartAt`

#### EnterpriseQuotaAllocationVO

**File**: `src/core/value-objects/enterprise-quota-allocation.vo.ts`

**Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `ownerId` | `string` | Owner user ID |
| `enterpriseId` | `string` | Enterprise ID (empty if pool row) |
| `key` | `string` | Grant key |
| `allocated` | `number` | Allocated amount |
| `kind` | `EGrantType` | Grant kind |
| `isPool` | `boolean` | `true` for unallocated pool rows |

---

### 2.4 Enums

#### `ESubscriptionStatus`

**File**: `src/core/enums/subscription-status.enum.ts`

| Member | Value | Description |
|--------|-------|-------------|
| `ACTIVE` | `'active'` | Subscription is active and valid |
| `EXPIRED` | `'expired'` | Plan has expired |
| `CANCELLED` | `'cancelled'` | Subscription was cancelled |

#### `EGrantType`

**File**: `src/core/enums/grant-type.enum.ts`

| Member | Value | Description |
|--------|-------|-------------|
| `QUOTA_HARD` | `'quota_hard'` | Hard limit that never resets |
| `QUOTA_RENEWABLE` | `'quota_renewable'` | Quota that resets on a cycle |
| `CREDIT_TOP_UP` | `'credit_top_up'` | Adds credit to the enterprise wallet |
| `PERMISSION` | `'permission'` | Feature toggle |

---

### 2.5 Domain Events

| Event | Raised By | Payload | Consumer |
|-------|-----------|---------|----------|
| `SubscriptionUpdatedEvent` | `SubscriptionRoot.recordSubscriptionUpdated()` | `userId`, `subscriptionHistoryId`, `details` (old/new plan, addons, grants, permissions) | `SubscriptionUpdatedEventHandler` |
| `QuotaConsumedEvent` | `QuotaUsageRoot.tryConsume()` | `enterpriseId`, `key`, `consumedAmount` | (Future: audit/logging) |
| `QuotaUsageResetEvent` | `QuotaUsageRoot.resetExpiredCycles()` | `enterpriseId`, `resetKeys[]` | (Future: notification) |

---

### 2.6 Domain Exceptions

| Exception | Thrown When |
|-----------|-------------|
| `QuotaExceededException` | `QuotaUsageRoot.tryConsume()` returns `overflow > 0` — enterprise has exceeded the renewable quota limit for a key |

---

## 3. State Machines & Status Transitions

### 3.1 Subscription Status (`ESubscriptionStatus`)

```
┌──────────┐
│  ACTIVE  │
└────┬─────┘
     │ (plan expires / cron)
     ▼
┌──────────┐
│ EXPIRED  │
└──────────┘

ACTIVE ──(cancellation)──► CANCELLED
```

**Transition Table**:

| From | To | Method | Conditions |
|------|----|--------|------------|
| `ACTIVE` | `EXPIRED` | `expirePlan()` (via cron) | Plan's `expiresAt` has passed |
| `ACTIVE` | `CANCELLED` | (manual cancellation) | — |

**Constraints**:
- Status transitions are managed externally (by `SubscriptionCronService` for expiry, by admin action for cancellation)
- The aggregate itself does not enforce status transitions — it provides `expirePlan()` and `clear()` methods

### 3.2 Quota Usage Cycle

```
┌─────────────────────────────────────────────────────┐
│  Cycle Start (cycleStartAt)                         │
│    ↓                                                │
│  tryConsume(key, amount) → used += amount           │
│    ↓                                                │
│  resetExpiredCycles(now) → used = 0, advance cycle  │
│    ↓                                                │
│  recompute(grants) → rebuild usages from grants     │
└─────────────────────────────────────────────────────┘
```

**Cycle Types**:
- `monthly` — Cycle advances by 1 month
- `weekly` — Cycle advances by 7 days
- `daily` — Cycle advances by 1 day

---

## 4. Application Layer

### 4.1 Commands (Write Side)

| Command | Handler | DTO | Description |
|---------|---------|-----|-------------|
| `SubscriptionUpdateCommand` | `SubscriptionUpdateHandler` | `SubscriptionUpdateInputDto` | Creates or updates an owner's subscription: sets/removes plan, adds/removes addons, recomputes grants/permissions, records history, handles proration refund |

**Command Flow Architecture**:
```
PaymentCompletedEvent / External Trigger
  │
  ▼
PaymentCompletedEventHandler
  │
  ▼
CommandBus.execute(new SubscriptionUpdateCommand(dto))
  │
  ▼
SubscriptionUpdateHandler.execute()
  │
  ├─ this.uow.execute(async () => {
  │     // 1. Fetch or create SubscriptionRoot
  │     // 2. Attach plan / add / remove addons
  │     // 3. Load Package entities → extract grants
  │     // 4. recomputeGrants(planGrants, addonsGrants)
  │     // 5. Handle proration if plan changed mid-cycle
  │     // 6. Update computed fields
  │     // 7. Save (with optimistic concurrency via updateWithVersion)
  │     // 8. Create SubscriptionHistoryEntity with change details
  │     // 9. recordSubscriptionUpdated() → raises SubscriptionUpdatedEvent
  │   });
  │
  ▼
SubscriptionUpdatedEvent
  │
  ├─ EventService.publishEvents() → outbox → RabbitMQ
  │
  ▼
SubscriptionUpdatedEventHandler (consumes the event)
  └─ Recomputes EnterpriseQuotaAllocationRoot
  └─ Fans out QuotaUsage recompute per enterprise
```

### 4.2 Event Handlers

| Event | Handler | Action |
|-------|---------|--------|
| `SubscriptionUpdatedEvent` | `SubscriptionUpdatedEventHandler` | Recomputes `EnterpriseQuotaAllocationRoot` for the owner, then fans out to recompute `QuotaUsageRoot` for each enterprise under the owner |

### 4.3 Queries (Read Side)

The domain implements dedicated Read Services and CQRS queries for reading data:

| Query | Handler | DTO | Description |
|-------|---------|-----|-------------|
| `SubscriptionGetByIdQuery` | `SubscriptionGetByIdHandler` | `SubscriptionResponseDto` | Fetches a subscription by its ID |
| `SubscriptionGetByUserIdQuery` | `SubscriptionGetByUserIdHandler` | `SubscriptionResponseDto` | Fetches a subscription by the owner user ID |
| `SubscriptionGetListQuery` | `SubscriptionGetListHandler` | `PaginatedResponseDto<SubscriptionResponseDto>` | Lists subscriptions with pagination |
| `SubscriptionHistoryGetListQuery` | `SubscriptionHistoryGetListHandler` | `PaginatedResponseDto<SubscriptionHistoryResponseDto>` | Lists history log for subscriptions |
| `QuotaUsageGetByEnterpriseIdQuery` | `QuotaUsageGetByEnterpriseIdHandler` | `QuotaUsageResponseDto` | Fetches quota usages for an enterprise |
| `EnterpriseQuotaAllocationGetByOwnerIdQuery` | `EnterpriseQuotaAllocationGetByOwnerIdHandler` | `EnterpriseQuotaAllocationResponseDto` | Fetches quota allocations by owner |

**Query Flow Architecture**:
```
GET /api/v1/...
  │
  ▼
Controller.method()
  │
  ▼
QueryBus.execute(new {Feature}Query(filters))
  │
  ▼
{Feature}QueryHandler.execute()
  └─ ReadService.findById/findAll(filters) → DTO/PaginatedResponse
```

### 4.4 Mappers

| Mapper | Source → Target | Location |
|--------|----------------|----------|
| `SubscriptionMapper` | `SubscriptionRoot` ↔ `SubscriptionResponseDto` | `src/application/mappers/subscription.mapper.ts` |
| `SubscriptionMapper` | `SubscriptionHistoryEntity` ↔ `SubscriptionHistoryResponseDto` | `src/application/mappers/subscription.mapper.ts` |

---

## 5. Infrastructure Layer

### 5.1 Data Model (Mongoose Schemas)

#### `subscriptions` Collection

**Schema File**: `src/infrastructure/mongo/schemas/subscription.schema.ts`

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | `String` | Unique owner user ID (unique index) |
| `status` | `String (ESubscriptionStatus)` | `active`, `expired`, `cancelled` |
| `plan_item` | `PlanItemSchema \| null` | Active plan details |
| `addon_items` | `AddonItemSchema[]` | Active addon details |
| `computed_grants` | `GrantSchema[]` | Aggregated grants (plan + addons) |
| `computed_permissions` | `String[]` | Aggregated permission keys |
| `version` | `Number` | Optimistic concurrency version |
| `next_expiry_check_at` | `Date` | Earliest expiry among plan/addons (indexed) |
| `created_at` | `Date` | Created timestamp |
| `updated_at` | `Date` | Updated timestamp |

**Sub-schema: PlanItemSchema**

| Field | Type | Description |
|-------|------|-------------|
| `package_id` | `String` | Package ID |
| `package_variant_id` | `String` | Variant ID |
| `start_date` | `Date` | Plan start |
| `expires_at` | `Date` | Plan expiry |
| `bill_id` | `String` | Purchasing bill |
| `auto_renew` | `Boolean` | Auto-renew flag |
| `price` | `Number` | Price at purchase |
| `price_after_discount` | `Number` | Discounted price |

**Sub-schema: AddonItemSchema**

| Field | Type | Description |
|-------|------|-------------|
| `package_id` | `String` | Package ID |
| `package_variant_id` | `String` | Variant ID |
| `purchased_at` | `Date` | Purchase date |
| `expires_at` | `Date \| null` | Expiry date |
| `bill_id` | `String` | Purchasing bill |
| `price` | `Number` | Price at purchase |
| `price_after_discount` | `Number` | Discounted price |

**Indexes**:
- `{ user_id: 1 }` — Unique index for 1:1 owner lookup
- `{ next_expiry_check_at: 1 }` — Cron query for expired subscriptions
- `{ 'plan_item.package_id': 1, 'addon_items.package_id': 1 }` — Used by `existsByPackageId()`

#### `subscription_history` Collection

**Schema File**: `src/infrastructure/mongo/schemas/subscription-history.schema.ts`

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | `String` | Owner user ID (indexed) |
| `subscription_id` | `String` | Parent subscription ID (indexed) |
| `bill_id` | `String \| null` | Associated bill |
| `actor_id` | `String \| null` | Triggering user |
| `details` | `Object` | SubscriptionChangeDetailsVO serialized |
| `created_at` | `Date` | Created timestamp |

#### `quota_usages` Collection

**Schema File**: `src/infrastructure/mongo/schemas/quota-usage.schema.ts`

| Field | Type | Description |
|-------|------|-------------|
| `enterprise_id` | `String` | Unique enterprise ID (unique index) |
| `cycle_anchor_date` | `Date` | Reference date for cycle calculation |
| `usages` | `RenewableUsageSchema[]` | Per-key quota tracking |
| `updated_at` | `Date` | Last update timestamp |

**Sub-schema: RenewableUsageSchema**

| Field | Type | Description |
|-------|------|-------------|
| `key` | `String` | Quota key |
| `allocated` | `Number` | Cycle allocation |
| `used` | `Number` | Amount consumed |
| `cycle_start_at` | `Date` | Cycle start |
| `cycle_ends_at` | `Date` | Cycle end |

**Indexes**:
- `{ enterprise_id: 1 }` — Unique index for 1:1 enterprise lookup
- `{ 'usages.cycle_ends_at': 1 }` — Cron query for expired cycles

#### `enterprise_quota_allocations` Collection

**Schema File**: `src/infrastructure/mongo/schemas/enterprise-quota-allocation.schema.ts`

| Field | Type | Description |
|-------|------|-------------|
| `owner_id` | `String` | Owner user ID (unique index) |
| `allocations` | `AllocationRowSchema[]` | Allocation rows (enterprise + pool) |
| `updated_at` | `Date` | Last update timestamp |

**Sub-schema: AllocationRowSchema**

| Field | Type | Description |
|-------|------|-------------|
| `enterprise_id` | `String` | Enterprise ID (empty for pool) |
| `key` | `String` | Grant key |
| `allocated` | `Number` | Allocated amount |
| `kind` | `EGrantType` | Grant kind |
| `is_pool` | `Boolean` | Pool flag |

**Indexes**:
- `{ owner_id: 1 }` — Unique index for 1:1 owner lookup

### 5.2 Repository & Read Service Implementations

#### Repositories (Write Side)

| Implementation | File | Implements |
|----------------|------|------------|
| `MongoSubscriptionRepository` | `src/infrastructure/mongo/repositories/mongo-subscription.repository.ts` | `ISubscriptionRepository` |
| `MongoSubscriptionHistoryRepository` | `src/infrastructure/mongo/repositories/mongo-subscription-history.repository.ts` | `ISubscriptionHistoryRepository` |
| `MongoQuotaUsageRepository` | `src/infrastructure/mongo/repositories/mongo-quota-usage.repository.ts` | `IQuotaUsageRepository` |
| `MongoEnterpriseQuotaAllocationRepository` | `src/infrastructure/mongo/repositories/mongo-enterprise-quota-allocation.repository.ts` | `IEnterpriseQuotaAllocationRepository` |

**MongoSubscriptionRepository Methods**:
- `findByUserId(userId)` — 1:1 lookup by owner user ID
- `findById(id)` — By MongoDB ID
- `save(subscription)` — Upsert; creates new or updates existing
- `saveMany(subscriptions)` — Batch save
- `delete(id)` — Delete by ID
- `existsByPackageId(packageId)` — Check if any subscription references a package (plan or addon)
- `findExpiredSubscriptions(now)` — Find subscriptions where `plan_item.expires_at` ≤ now
- `updateWithVersion(id, expectedVersion, subscription)` — Optimistic concurrency update (fails if version mismatch)

**MongoSubscriptionHistoryRepository Methods**:
- `findBySubscriptionId(subscriptionId)` — All history records for a subscription
- `findByUserId(userId)` — All history records for an owner
- `save(entity)` — Persist history entry

**MongoQuotaUsageRepository Methods**:
- `findByEnterpriseId(enterpriseId)` — 1:1 lookup
- `save(quotaUsage)` — Upsert
- `saveMany(quotaUsages)` — Batch save
- `findExpiredUsages(now)` — Find usages where any `cycle_ends_at` ≤ now

**MongoEnterpriseQuotaAllocationRepository Methods**:
- `findByOwnerId(ownerId)` — 1:1 lookup by owner user ID
- `save(root)` — Upsert
- `saveMany(roots)` — Batch save
- `delete(id)` — Delete by ID

All repositories integrate with Redis cache under their respective domain key patterns.

#### Read Services (Read Side)

Direct database queries bypassing aggregates for optimized performance:

| Implementation | File | Implements |
|----------------|------|------------|
| `MongoSubscriptionReadService` | `src/infrastructure/mongo/read-services/subscription.read-service.ts` | `ISubscriptionReadService` |
| `MongoSubscriptionHistoryReadService` | `src/infrastructure/mongo/read-services/subscription-history.read-service.ts` | `ISubscriptionHistoryRepository` |
| `MongoQuotaUsageReadService` | `src/infrastructure/mongo/read-services/quota-usage.read-service.ts` | `IQuotaUsageReadService` |
| `MongoEnterpriseQuotaAllocationReadService` | `src/infrastructure/mongo/read-services/enterprise-quota-allocation.read-service.ts` | `IEnterpriseQuotaAllocationReadService` |

**Read Service Methods**:
- `findById(id)` — Lookup DTO by ID.
- `findAll(filters)` — Lookup list of DTOs with pagination (using cursor pagination and `SortOrder` sorting logic).

### 5.3 Module Wiring

#### SubscriptionModule

All subscription and quota write handlers, services, and REST controllers are wired in `SubscriptionModule`:

**File**: `src/infrastructure/modules/subscription.module.ts`

```typescript
@Module({
  imports: [CqrsModule, MongoModule],
  controllers: [
    SubscriptionAdminController,
    SubscriptionClientController,
    QuotaAdminController,
    QuotaClientController,
  ],
  providers: [
    ProrationService,
    SubscriptionCronService,
    SubscriptionUpdateHandler,
    SubscriptionUpdatedEventHandler,
    PaymentCompletedEventHandler,
    SubscriptionGetByIdHandler,
    SubscriptionGetByUserIdHandler,
    SubscriptionGetListHandler,
    SubscriptionHistoryGetListHandler,
    QuotaUsageGetByEnterpriseIdHandler,
    EnterpriseQuotaAllocationGetByOwnerIdHandler,
    {
      provide: ENTERPRISE_QUOTA_ALLOCATION_REPOSITORY,
      useClass: MongoEnterpriseQuotaAllocationRepository,
    },
  ],
})
export class SubscriptionModule {}
```

#### MongoModule

Repositories and Read Services are registered and exported from `MongoModule` for use across modules:

**File**: `src/infrastructure/mongo/mongo.module.ts`

- **Providers/Exports**:
  - `SUBSCRIPTION_REPOSITORY` ↔ `MongoSubscriptionRepository`
  - `SUBSCRIPTION_HISTORY_REPOSITORY` ↔ `MongoSubscriptionHistoryRepository`
  - `QUOTA_USAGE_REPOSITORY` ↔ `MongoQuotaUsageRepository`
  - `ENTERPRISE_QUOTA_ALLOCATION_REPOSITORY` ↔ `MongoEnterpriseQuotaAllocationRepository`
  - `SUBSCRIPTION_READ_SERVICE` ↔ `MongoSubscriptionReadService`
  - `SUBSCRIPTION_HISTORY_READ_SERVICE` ↔ `MongoSubscriptionHistoryReadService`
  - `QUOTA_USAGE_READ_SERVICE` ↔ `MongoQuotaUsageReadService`
  - `ENTERPRISE_QUOTA_ALLOCATION_READ_SERVICE` ↔ `MongoEnterpriseQuotaAllocationReadService`

### 5.4 Cron Services

**File**: `src/infrastructure/modules/subscription-cron.service.ts`

The `SubscriptionCronService` runs periodic maintenance tasks:

1. **Quota cycle reset** (every few minutes):
   - Finds all `QuotaUsageRoot` with expired cycles (`cycle_ends_at` ≤ now)
   - Calls `resetExpiredCycles(now)` → resets `used` to 0, advances cycle dates
   - Saves updated records

2. **Subscription expiry** (every few minutes):
   - Finds all `SubscriptionRoot` where `plan_item.expires_at` ≤ now
   - Calls `expirePlan()` → removes plan, clears computed fields
   - Saves with optimistic concurrency (`updateWithVersion`)
   - Creates a `SubscriptionHistoryEntity` recording the expiry
   - Calls `recordSubscriptionUpdated()` → publishes `SubscriptionUpdatedEvent`

---

## 6. Presentation Layer

### 6.1 REST Endpoints

The Subscription & Quotas domains expose both Client and Admin endpoints:

| Method | Path | Guards | Controller | Description |
|--------|------|--------|------------|-------------|
| `GET` | `/client/v1/subscriptions/me` | 🔒 JwtAuth + Roles(Enterprise) | `SubscriptionClientController` | Get current user's subscription |
| `GET` | `/client/v1/subscriptions/history/me` | 🔒 JwtAuth + Roles(Enterprise) | `SubscriptionClientController` | Get current user's subscription history |
| `GET` | `/client/v1/quotas/usage/me` | 🔒 JwtAuth + Roles(Enterprise) | `QuotaClientController` | Get current enterprise's quota usage |
| `GET` | `/client/v1/quotas/allocations/me` | 🔒 JwtAuth + Roles(Enterprise) | `QuotaClientController` | Get current enterprise's quota allocations |
| `GET` | `/admin/v1/subscriptions` | 🔒 JwtAuth + Roles(Admin) | `SubscriptionAdminController` | Get all subscriptions (paginated) |
| `GET` | `/admin/v1/subscriptions/:id` | 🔒 JwtAuth + Roles(Admin) | `SubscriptionAdminController` | Get subscription by ID |
| `GET` | `/admin/v1/subscriptions/:id/history` | 🔒 JwtAuth + Roles(Admin) | `SubscriptionAdminController` | Get history of a subscription |
| `GET` | `/admin/v1/quotas/usage/:enterpriseId` | 🔒 JwtAuth + Roles(Admin) | `QuotaAdminController` | Get quota usage of an enterprise |
| `GET` | `/admin/v1/quotas/allocations/:ownerId` | 🔒 JwtAuth + Roles(Admin) | `QuotaAdminController` | Get quota allocations of an owner |

### 6.2 Guard Stack

The following guard hierarchy applies to all protected routes (when eventually exposed):

| Layer | Guard | Bypass |
|-------|-------|--------|
| 1 (global) | `ApiKeyGuard` | `@Public()`, `@WebHook()`, Swagger |
| 2 | `JwtAuthGuard` | `@Public()`, `@WebHook()` |
| 3 | `RolesGuard` | `@Public()`, `@WebHook()` |
| 4 | `UserVerifiedGuard` | `@Public()`, `@WebHook()` |

---

## 7. Workflow Flows

### 7.1 Subscription Updated (After Payment)

#### Diagram

```
Payment Completed
  │
  ▼
PaymentCompletedEventHandler
  │
  ├─ CommandBus.execute(SubscriptionUpdateCommand)
  │
  ▼
SubscriptionUpdateHandler.execute()
  │
  ├─ 1. Find or create SubscriptionRoot for userId
  ├─ 2. attachPlan(new PlanItemVO(...))
  ├─ 3. Add new addons / remove removed addons
  ├─ 4. Load Package entities → extract grants for each variant
  ├─ 5. recomputeGrants(planGrants, addonsGrants)
  │      └─ Merges plan + addon grants by key
  ├─ 6. Compute proration refund if plan changed mid-cycle
  ├─ 7. updateComputedFields(grants, permissions)
  ├─ 8. Save subscription (with optimistic locking)
  ├─ 9. Create SubscriptionHistoryEntity (audit log)
  └─ 10. recordSubscriptionUpdated() → raises SubscriptionUpdatedEvent
       │
       ▼
EventService.publishEvents()
  └─ Outbox → RabbitMQ
       │
       ▼
SubscriptionUpdatedEventHandler
  └─ Recompute EnterpriseQuotaAllocationRoot
       ├─ Load subscription by userId
       ├─ Load all enterprises where enterprise.userId === subscription.userId
       ├─ Load allocation root for owner
       ├─ Call allocationRoot.rebalanceFromSubscription(computedGrants, enterpriseIds)
       └─ Save allocation root
            │
            ▼ For each enterprise
            ├─ Get allocations for enterprise (filtered from allocation root)
            ├─ Map grants to per-enterprise allocated values
            ├─ Load/create QuotaUsageRoot for enterprise
            └─ quotaUsage.recompute(renewableGrantsForEnterprise, anchorDate)
  ```

#### Step-by-Step

1. **Payment completed** — `PaymentCompletedEventHandler` fires after a bill is paid
2. **Subscription update command** dispatched — `SubscriptionUpdateCommand` with user ID, bill items (plan/addon), and metadata
3. **Handler executes** within UoW:
   - Fetches or creates `SubscriptionRoot` for the user
   - Attaches the plan (or replaces existing)
   - Adds new addons (dedup by `packageVariantId`); removes removed addons
   - Loads all `PackageRoot` entities involved → extracts `baseGrants + variant.extraGrants`
   - Calls `recomputeGrants()` — merges plan + addon grants by key (sums quotas, unions permissions)
   - Handles proration refund if plan changed mid-cycle (creates a refund bill)
   - Saves subscription with optimistic concurrency (`updateWithVersion`)
   - Creates `SubscriptionHistoryEntity` with full change details
   - Records `SubscriptionUpdatedEvent` on the aggregate
4. **Event published** — `EventService` extracts events, maps to integration events, inserts into outbox
5. **Outbox processor** delivers to RabbitMQ
6. **SubscriptionUpdatedEventHandler** consumes the event:
   - Fetches the updated subscription by `userId`
   - Loads all enterprises where `enterprise.userId === subscription.userId`
   - Loads or creates `EnterpriseQuotaAllocationRoot` for the owner
   - Calls `allocationRoot.rebalanceFromSubscription(subscription.computedGrants, enterpriseIds)` to redistribute allocations
   - Saves the allocation root
   - For each enterprise:
     - Gets that enterprise's allocations from the allocation root
     - Maps subscription computed grants to per-enterprise allocated values
     - Loads or creates `QuotaUsageRoot` for the enterprise
     - Calls `quotaUsage.recompute(renewableGrantsForEnterprise, anchorDate)` to rebuild quota allocations

### 7.2 Quota Consumption (e.g. Create Campaign)

#### Diagram

```
Campaign Create Command
  │
  ├─ 1. Check quota: quotaUsage.tryConsume('campaign_count', 1)
  │     ├─ If ok → proceed with campaign creation
  │     └─ If overflow → throw QuotaExceededException
  │
  ├─ 2. Create campaign (within same UoW)
  │
  └─ 3. Save quotaUsage (consumed updated)
```

#### Step-by-Step

1. **Domain command** (e.g. campaign creation) checks quota before proceeding
2. **Quota check** — `quotaUsage.tryConsume(key, amount)`:
   - If `ok: true` → usage is recorded, `QuotaConsumedEvent` raised
   - If `ok: false, overflow > 0` → throws `QuotaExceededException`
3. **Business operation proceeds** within the same UoW transaction
4. **Quota usage saved** — `quotaUsageRepository.save(quotaUsage)` persists the updated consumption

### 7.3 Periodic Maintenance (Cron)

#### Step-by-Step

1. **Cron triggers** — runs every few minutes
2. **Quota reset**:
   - Finds all `QuotaUsageRoot` with `cycle_ends_at` ≤ now
   - Calls `resetExpiredCycles(now)` → resets `used` to 0, advances cycle
   - Saves updated records
   - Raises `QuotaUsageResetEvent` for each affected enterprise
3. **Subscription expiry**:
   - Finds all `SubscriptionRoot` where `plan_item.expires_at` ≤ now
   - Calls `expirePlan()` → removes plan, clears computed fields
   - Saves with optimistic concurrency
   - Creates `SubscriptionHistoryEntity` recording the expiry
   - Records `SubscriptionUpdatedEvent` → triggers quota re-computation

---

## 8. File Map

### Subscription

| Layer | File | Responsibility |
|-------|------|---------------|
| **Core** | `src/core/aggregate-roots/subscription.aggregate.ts` | SubscriptionRoot — owner subscription, plan/addon management, grant computation |
| **Core** | `src/core/aggregate-roots/subscription-history.aggregate.ts` | SubscriptionHistoryEntity — immutable audit log |
| **Core** | `src/core/value-objects/plan-item.vo.ts` | PlanItemVO — active plan details |
| **Core** | `src/core/value-objects/addon-item.vo.ts` | AddonItemVO — purchased addon details |
| **Core** | `src/core/value-objects/subscription-change-details.vo.ts` | SubscriptionChangeDetailsVO — change snapshot |
| **Core** | `src/core/enums/subscription-status.enum.ts` | ESubscriptionStatus |
| **Core** | `src/core/events/subscription-updated.domain-event.ts` | SubscriptionUpdatedEvent |
| **Core** | `src/core/interfaces/repositories/subscription.repository.ts` | ISubscriptionRepository + SUBSCRIPTION_REPOSITORY token |
| **Core** | `src/core/interfaces/repositories/subscription-history.repository.ts` | ISubscriptionHistoryRepository + SUBSCRIPTION_HISTORY_REPOSITORY token |

### QuotaUsage

| Layer | File | Responsibility |
|-------|------|---------------|
| **Core** | `src/core/aggregate-roots/quota-usage.aggregate.ts` | QuotaUsageRoot — per-enterprise quota tracking |
| **Core** | `src/core/value-objects/renewable-usage.vo.ts` | RenewableUsageVO — per-key allocation and consumption |
| **Core** | `src/core/events/quota-consumed.domain-event.ts` | QuotaConsumedEvent |
| **Core** | `src/core/events/quota-usage-reset.domain-event.ts` | QuotaUsageResetEvent |
| **Core** | `src/core/exceptions/quota.exception.ts` | QuotaExceededException |
| **Core** | `src/core/interfaces/repositories/quota-usage.repository.ts` | IQuotaUsageRepository + QUOTA_USAGE_REPOSITORY token |

### EnterpriseQuotaAllocation

| Layer | File | Responsibility |
|-------|------|---------------|
| **Core** | `src/core/aggregate-roots/enterprise-quota-allocation.aggregate.ts` | EnterpriseQuotaAllocationRoot — owner-level quota split across enterprises |
| **Core** | `src/core/value-objects/enterprise-quota-allocation.vo.ts` | EnterpriseQuotaAllocationVO — one allocation row |
| **Core** | `src/core/interfaces/repositories/enterprise-quota-allocation.repository.ts` | IEnterpriseQuotaAllocationRepository + ENTERPRISE_QUOTA_ALLOCATION_REPOSITORY token |

### Application

| Layer | File | Responsibility |
|-------|------|---------------|
| **Application** | `src/application/commands/subscription-update/` | SubscriptionUpdate command, DTO, and handler |
| **Application** | `src/application/queries/subscription-get-by-id/` | SubscriptionGetById query and handler |
| **Application** | `src/application/queries/subscription-get-by-user-id/` | SubscriptionGetByUserId query and handler |
| **Application** | `src/application/queries/subscription-get-list/` | SubscriptionGetList query and handler |
| **Application** | `src/application/queries/subscription-history-get-list/` | SubscriptionHistoryGetList query and handler |
| **Application** | `src/application/queries/quota-usage-get-by-enterprise-id/` | QuotaUsageGetByEnterpriseId query and handler |
| **Application** | `src/application/queries/enterprise-quota-allocation-get-by-owner-id/` | EnterpriseQuotaAllocationGetByOwnerId query and handler |
| **Application** | `src/application/interfaces/read-service/subscription.read-service.interface.ts` | ISubscriptionReadService interface |
| **Application** | `src/application/interfaces/read-service/subscription-history.read-service.interface.ts` | ISubscriptionHistoryReadService interface |
| **Application** | `src/application/interfaces/read-service/quota-usage.read-service.interface.ts` | IQuotaUsageReadService interface |
| **Application** | `src/application/interfaces/read-service/enterprise-quota-allocation.read-service.interface.ts` | IEnterpriseQuotaAllocationReadService interface |
| **Application** | `src/application/events/subscription-updated/` | SubscriptionUpdatedEventHandler — recomputes QuotaUsage + allocations |
| **Application** | `src/application/events/request-auth-update-subscription.event.ts` | RequestAuthUpdateSubscriptionEvent — integration event for auth sync |
| **Application** | `src/application/dtos/subscription.dto.ts` | Subscription DTOs and Zod schemas |
| **Application** | `src/application/dtos/subscription-history.dto.ts` | SubscriptionHistory DTO |
| **Application** | `src/application/dtos/quota-usage.dto.ts` | QuotaUsage DTO |
| **Application** | `src/application/dtos/enterprise-quota-allocation.dto.ts` | EnterpriseQuotaAllocation DTO |
| **Application** | `src/application/mappers/subscription.mapper.ts` | SubscriptionMapper — entity ↔ DTO |

### Infrastructure

| Layer | File | Responsibility |
|-------|------|---------------|
| **Infrastructure** | `src/infrastructure/mongo/schemas/subscription.schema.ts` | Mongoose SubscriptionModel schema |
| **Infrastructure** | `src/infrastructure/mongo/schemas/subscription-history.schema.ts` | Mongoose SubscriptionHistoryModel schema |
| **Infrastructure** | `src/infrastructure/mongo/schemas/quota-usage.schema.ts` | Mongoose QuotaUsageModel schema |
| **Infrastructure** | `src/infrastructure/mongo/schemas/enterprise-quota-allocation.schema.ts` | Mongoose EnterpriseQuotaAllocationModel schema |
| **Infrastructure** | `src/infrastructure/mongo/repositories/mongo-subscription.repository.ts` | MongoSubscriptionRepository with cache + optimistic locking |
| **Infrastructure** | `src/infrastructure/mongo/repositories/mongo-subscription-history.repository.ts` | MongoSubscriptionHistoryRepository |
| **Infrastructure** | `src/infrastructure/mongo/repositories/mongo-quota-usage.repository.ts` | MongoQuotaUsageRepository with cache |
| **Infrastructure** | `src/infrastructure/mongo/repositories/mongo-enterprise-quota-allocation.repository.ts` | MongoEnterpriseQuotaAllocationRepository with cache |
| **Infrastructure** | `src/infrastructure/mongo/read-services/subscription.read-service.ts` | MongoSubscriptionReadService |
| **Infrastructure** | `src/infrastructure/mongo/read-services/subscription-history.read-service.ts` | MongoSubscriptionHistoryReadService |
| **Infrastructure** | `src/infrastructure/mongo/read-services/quota-usage.read-service.ts` | MongoQuotaUsageReadService |
| **Infrastructure** | `src/infrastructure/mongo/read-services/enterprise-quota-allocation.read-service.ts` | MongoEnterpriseQuotaAllocationReadService |
| **Infrastructure** | `src/infrastructure/modules/subscription-cron.service.ts` | SubscriptionCronService — periodic quota reset + expiry |
| **Infrastructure** | `src/infrastructure/modules/subscription.module.ts` | SubscriptionModule wiring for subscription/quota handlers and controllers |

### Presentation

| Layer | File | Responsibility |
|-------|------|---------------|
| **Presentation** | `src/presentation/controllers/http/client/subscription.controller.ts` | SubscriptionClientController — client REST endpoints |
| **Presentation** | `src/presentation/controllers/http/admin/subscription.controller.ts` | SubscriptionAdminController — admin REST endpoints |
| **Presentation** | `src/presentation/controllers/http/client/quota.controller.ts` | QuotaClientController — client REST endpoints |
| **Presentation** | `src/presentation/controllers/http/admin/quota.controller.ts` | QuotaAdminController — admin REST endpoints |

---

## 9. Key Invariants

### Subscription

- **One subscription per owner**: Each owner user has exactly one `SubscriptionRoot` (1:1). The `user_id` field is unique.
- **Plan exclusivity**: An owner can have at most one active plan at a time. Changing plans replaces the existing plan item.
- **Addon deduplication**: The same addon variant cannot be added twice (`attachAddon()` returns `false` if `packageVariantId` already exists).
- **Grant merging**: `recomputeGrants()` sums quota values (hard + renewable) from plan and all addons by key. Permissions are unioned (deduplicated). Plan `creditFallback` takes precedence over addon fallback.
- **Optimistic concurrency**: `updateWithVersion()` uses a `version` field to prevent lost updates. The update fails if the stored version doesn't match the expected version.
- **Immutable history**: Every subscription change creates a `SubscriptionHistoryEntity` with a full snapshot of before/after state. History records are never modified.
- **Automatic expiry**: The `SubscriptionCronService` detects expired plans and clears them. Expired subscriptions lose all computed grants/permissions.
- **Versioned grants**: Computed grants are snapshotted at the time of the subscription change. Changing the underlying package's grants does not retroactively modify computed grants.

### EnterpriseQuotaAllocation

- **Pool-backed allocations**: All divisible grant allocations (`quota_renewable`, `quota_hard`, `credit_top_up`) are backed by an unallocated pool. Allocating to an enterprise reduces the pool; deallocating returns to the pool.
- **Rebalance preserves allocations**: When `rebalanceFromSubscription()` runs, existing enterprise allocations are preserved if they fit within the new total. Excess goes to the pool. If new total is smaller, allocations scale proportionally.
- **Invariant**: For a given `ownerId + key + kind`, `Σ enterprise.allocated + pool.allocated === total from subscription.computedGrants`.

### QuotaUsage

- **Quota enforcement**: `tryConsume()` validates that `used + amount ≤ allocated` before allowing consumption. Overflow returns a non-zero `overflow` value.
- **Cycle-based reset**: Renewable quotas reset according to their configured `resetCycle` (monthly, weekly, daily). The `SubscriptionCronService` automatically detects and applies resets.
- **Anchor-driven cycles**: All cycles are calculated from a single `cycleAnchorDate` per enterprise. The `calculateCycleDates()` method walks forward from the anchor until the next `cycleEndsAt` > now.
- **Recomputation preserves usage**: When `recompute()` is called (e.g. after plan change), existing `used` values are preserved for matching quota keys. Only the `allocated` and cycle dates are updated.
- **1:1 per enterprise**: Like subscription, there is exactly one `QuotaUsageRoot` per enterprise.

### Cross-Domain

- **Subscription drives quota allocation**: QuotaUsage's allocation limits are always derived from the subscription's computed renewable grants, filtered through `EnterpriseQuotaAllocationRoot`. Manual changes to quota allocations should never bypass `recompute()`.
- **Eventual consistency**: QuotaUsage is eventually consistent with Subscription. After a subscription update, the `SubscriptionUpdatedEventHandler` asynchronously recomputes quota usage. There is a brief window where quota allocations may reflect the old subscription state.
- **Transactional consumption**: Quota consumption should always happen within the same UoW transaction as the business operation (e.g. campaign creation). This ensures atomicity — if the operation fails, the quota consumption is rolled back.
- **Owner is UserRoot**: `SubscriptionRoot` binds to `UserRoot` via `userId`. `EnterpriseRoot.userId` identifies the owner. There is no standalone `OwnerRoot` aggregate.