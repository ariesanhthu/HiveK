# Package Domain

This document describes the business rules, state machines, domain aggregates, database models, CQRS commands/queries, and end-to-end workflows for the **Package** domain within the HiveK server.

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

Define and manage subscription **Packages** (plans & addons) that Enterprises can purchase. A Package bundles a set of features and grants (quotas, permissions) and exposes one or more **variants** (pricing tiers with different durations, prices, and extra grants). This domain is the source of truth for what capabilities an Enterprise is entitled to.

### Bounded Context

The Package domain is self-contained and does **not** integrate directly with other workflow domains. It is consumed by the **Subscription** domain (which tracks which packages an Enterprise has purchased) and referenced by **Bill** for line-item pricing. Package definitions are managed by Admin (public packages) or by individual Enterprises (private/custom packages).

### Key Concepts

| Concept | Type | Description |
|---------|------|-------------|
| `PackageRoot` | Aggregate Root | A versioned package definition — plan or addon — with metadata, features, base grants, and variants |
| `PackageVariantEntity` | Entity | A pricing tier within a package (duration, price, discount, tax, extra grants) |
| `GrantVO` | Value Object | A named entitlement: either a quota (renewable/hard) or a permission string |
| `EPackageType` | Enum | Distinguishes `plan` (main subscription) vs `addon` (supplementary) |
| `EPackageScope` | Enum | Visibility: `public` (visible to all) vs `private` (custom to an enterprise) |
| `EVersionStatus` | Enum | Lifecycle status: `draft` → `active` → `archived` |

### Relations to Other Domains

| Domain | Relationship |
|--------|-------------|
| **Subscription** | Subscription's `planItem` references a `packageId` + `packageVariantId`; addon items do the same |
| **Bill** | Bill line items reference `packageId` and `packageVariantId` for pricing |
| **QuotaUsage** | Quota keys come from `GrantVO` values defined on packages |

---

## 2. Core Layer (Domain Model)

### 2.1 Aggregate Roots

#### PackageRoot

**File**: `src/core/aggregate-roots/package.aggregate.ts`

**Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `code` | `string` | Unique package code (e.g. `basic_monthly`) |
| `name` | `string` | Display name |
| `description` | `string` | Long description |
| `type` | `EPackageType` | `plan` or `addon` |
| `scope` | `EPackageScope` | `public` or `private` |
| `enterpriseId` | `string \| null` | Owner enterprise (null for public packages) |
| `status` | `EVersionStatus` | `draft` → `active` → `archived` |
| `features` | `string[]` | Feature permission keys (e.g. `campaign_export`, `advanced_analytics`) |
| `baseGrants` | `GrantVO[]` | Grants that apply to *all* variants |
| `variants` | `PackageVariantEntity[]` | Pricing tiers |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last update timestamp |
| `activatedAt` | `Date \| undefined` | When the package was first activated |

**Factory Methods**:

| Method | Description |
|--------|-------------|
| `static create(props)` | Creates a new instance in `DRAFT` status with optional variants |
| `static instantiate(id, props)` | Reconstitutes an existing instance from persistence (no validation) |

**Domain Methods**:

| Method | Description | Raises Event |
|--------|-------------|-------------|
| `activate()` | Transitions status to `ACTIVE`, sets `activatedAt` | — |
| `archive()` | Transitions status to `ARCHIVED` | — |
| `updateGeneralInfo(props)` | Updates name, description, type, scope, features, baseGrants | — |
| `removeVariant(variantId)` | Removes a variant from the variants list | — |

**Getters**:

| Getter | Returns | Description |
|--------|---------|-------------|
| `get code()` | `string` | Unique package code |
| `get name()` | `string` | Display name |
| `get description()` | `string` | Long description |
| `get type()` | `EPackageType` | Plan or addon |
| `get scope()` | `EPackageScope` | Public or private |
| `get enterpriseId()` | `Nullable<string>` | Owner enterprise or null |
| `get status()` | `EVersionStatus` | Current lifecycle status |
| `get features()` | `string[]` | Feature permission keys |
| `get baseGrants()` | `GrantVO[]` | Base grants |
| `get variants()` | `PackageVariantEntity[]` | Pricing tiers |
| `get createdAt()` | `Date` | Creation timestamp |
| `get updatedAt()` | `Date` | Last update timestamp |
| `get activatedAt()` | `Optional<Date>` | Activation timestamp |

---

### 2.2 Entities

#### PackageVariantEntity

**File**: `src/core/entities/package-variant.entity.ts`

**Parent Aggregate**: `PackageRoot`

**Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `title` | `string` | Variant display title |
| `durationMonths` | `number \| null` | Billing cycle in months (null = one-time) |
| `price` | `number` | Base price |
| `priceAfterDiscount` | `number` | Price after any discount |
| `tax` | `number` | Tax amount |
| `currency` | `ECurrency` | Currency code (VND, USD) |
| `extraGrants` | `GrantVO[]` | Extra grants exclusive to this variant |

**Domain Methods**:

| Method | Description |
|--------|-------------|
| `update(props)` | Updates any subset of variant fields |

---

### 2.3 Value Objects

#### GrantVO

**File**: `src/core/value-objects/grant.vo.ts`

**Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `type` | `EGrantType` | `quota_hard`, `quota_renewable`, `credit_top_up`, `permission` |
| `key` | `string` | Grant identifier (e.g. `campaign_count`, `storage_mb`) |
| `value` | `number` | Numeric entitlement (e.g. 10 campaigns, 1024 MB) |
| `resetCycle` | `'monthly' \| 'weekly' \| 'daily' \| undefined` | Reset cadence for renewable quotas |
| `creditFallback` | `{ creditType: string; creditsPerUnit: number } \| null \| undefined` | Fallback billing when quota exhausted |

**Invariants**:
- `key` must be non-empty string
- `value` must be >= 0
- If `type` is `quota_renewable`, `resetCycle` must be defined
- `creditFallback` is optional and nullable

---

### 2.4 Enums

#### `EPackageType`

**File**: `src/core/enums/package-type.enum.ts`

| Member | Value | Description |
|--------|-------|-------------|
| `PLAN` | `'plan'` | Main subscription plan (one per enterprise) |
| `ADDON` | `'addon'` | Supplementary addon (multiple allowed) |

#### `EPackageScope`

**File**: `src/core/enums/package-scope.enum.ts`

| Member | Value | Description |
|--------|-------|-------------|
| `PUBLIC` | `'public'` | Visible to all enterprises |
| `PRIVATE` | `'private'` | Custom package for a specific enterprise |

#### `EVersionStatus`

**File**: `src/core/enums/version-status.enum.ts`

| Member | Value | Description |
|--------|-------|-------------|
| `DRAFT` | `'draft'` | Being edited, not yet available for purchase |
| `ACTIVE` | `'active'` | Published and purchasable |
| `ARCHIVED` | `'archived'` | No longer available; existing subscriptions unaffected |

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

The Package aggregate itself does **not** raise domain events during its lifecycle (create, update, publish, archive, delete). Events are raised downstream by **Subscription** when a package is purchased or changed.

---

### 2.6 Domain Exceptions

| Exception | Thrown When |
|-----------|-------------|
| `PackageNotFoundException` | Package lookup by identifier fails |
| `PackageCodeAlreadyExistsException` | Creating/updating with a code that already exists |
| `PackageDeactivationNotAllowedException` | Attempting to deactivate a package that is in use by active subscriptions |
| `PackageHasActiveVersionException` | Publishing a new version when an active version already exists |
| `PackageInUseException` | Modifying or deleting a package that is referenced by active subscriptions |
| `PackageNoVariantsException` | Publishing a package with zero variants |
| `DuplicateVariantException` | Adding a variant that duplicates an existing variant |
| `InvalidFeaturePermissionException` | Assigning an invalid feature permission key |

---

## 3. State Machines & Status Transitions

### 3.1 Package Version Status (`EVersionStatus`)

```
            ┌──────────┐
            │  DRAFT   │
            └────┬─────┘
                 │ publish()
                 ▼
          ┌─────────────┐
          │   ACTIVE    │
          └──────┬──────┘
                 │ archive()
                 ▼
          ┌─────────────┐
          │  ARCHIVED   │
          └─────────────┘
```

**Transition Table**:

| From | To | Method | Conditions |
|------|----|--------|------------|
| `DRAFT` | `ACTIVE` | `activate()` | Package must have at least one variant |
| `ARCHIVED` | `ACTIVE` | `activate()` (via re-publish) | Same constraints as publish |
| `DRAFT` | `(deleted)` | `delete()` | Only allowed in DRAFT |
| `ACTIVE` | `ARCHIVED` | `archive()` | Must not be in use by active subscriptions |

**Constraints**:
- Only `DRAFT` or `ARCHIVED` packages can be deleted
- Publishing a new `DRAFT` as `ACTIVE` automatically archives the previously active version (if any) — ensuring only one `ACTIVE` version per `code` exists
- Deleting is allowed only when no active subscription references the package

---

## 4. Application Layer

### 4.1 Commands (Write Side)

| Command | Handler | DTO | Description |
|---------|---------|-----|-------------|
| `PackageCreateCommand` | `PackageCreateCommandHandler` | `PackageCreateInputDto` | Creates a new package in `DRAFT` status with code, name, description, type, scope |
| `PackageUpdateCommand` | `PackageUpdateHandler` | `PackageUpdateInputDto` | Updates package metadata, features, base grants, and manages variants (add/update/delete). Only allowed in `DRAFT`. |
| `PackagePublishCommand` | `PackagePublishHandler` | `PackagePublishInputDto` | Publishes a `DRAFT` or `ARCHIVED` package to `ACTIVE`. Automatically archives any existing `ACTIVE` version with the same code. |
| `PackageArchiveCommand` | `PackageArchiveHandler` | `PackageArchiveInputDto` | Archives an `ACTIVE` package to `ARCHIVED`. |
| `PackageDeleteCommand` | `PackageDeleteHandler` | `PackageDeleteInputDto` | Deletes a `DRAFT` package outright, or an `ARCHIVED` package if no active subscription references it. |

**Command Flow Architecture**:
```
External Request
  │
  ▼
Controller / GraphQL Resolver
  │ Validate DTO (Zod schema)
  ▼
CommandBus.execute(new Package{Xxx}Command(dto))
  │
  ▼
Package{Xxx}Handler.execute()
  │
  ├─ this.uow.execute(async () => {
  │     const pkg = await this.packageRepository.findById(input.id);
  │     if (!pkg) throw new PackageNotFoundException(...);
  │     // Domain logic: pkg.activate(), pkg.archive(), etc.
  │     await this.packageRepository.save(pkg);
  │     return PackageMapper.toDto(pkg);
  │   });
  │
  ▼
Response: PackageResponseDto (or void for delete/archive)
```

**Note**: Package commands do **not** publish domain events or use the outbox/event pipeline, as the Package aggregate itself is a configuration entity — downstream effects (e.g. subscription recomputation) are handled by the **Subscription** domain when it consumes the package.

### 4.2 Queries (Read Side)

| Query | Handler | DTO | Description |
|-------|---------|-----|-------------|
| `PackageGetListQuery` | `PackageGetListHandler` | `PackageFilterDto` | Lists packages with filters (code, status, type, scope, enterpriseId) and cursor-based pagination |
| `PackageGetByIdQuery` | `PackageGetByIdHandler` | `PackageGetByIdInputDto` | Gets a single package by ID |
| `PackageGetByCodeQuery` | `PackageGetByCodeHandler` | `PackageGetByCodeInputDto` | Gets a package by its unique code |

**Query Flow Architecture**:
```
GET /api/v1/... / GraphQL
  │
  ▼
Controller / Resolver
  │
  ▼
QueryBus.execute(new PackageGetXxxQuery(input))
  │
  ▼
PackageGetXxxHandler
  │
  └─ MongoPackageReadService.findAll(filters) / .findById(id) / .findByCode(code)
       │
       └─ PackageModel.find(query).sort(...).limit(limit).lean()
            │
            └─ Returns PaginatedResponseDto<PackageResponseDto> || PackageResponseDto
```

### 4.3 Mappers

| Mapper | Source → Target | Location |
|--------|----------------|----------|
| `PackageMapper` | `PackageRoot` ↔ `PackageResponseDto` | `src/application/mappers/package.mapper.ts` |

**Mapper methods**:
- `toDto(entity)` — Converts `PackageRoot` aggregate to `PackageResponseDto` (includes nested `PackageVariantDto` mapping)
- `toVariantDto(entity)` — Converts `PackageVariantEntity` to `PackageVariantDto`
- `toDtoList(entities)` — Maps an array of aggregates to DTOs

---

## 5. Infrastructure Layer

### 5.1 Data Model (Mongoose Schemas)

#### `packages` Collection

**Schema File**: `src/infrastructure/mongo/schemas/package.schema.ts`

| Field | Type | Description |
|-------|------|-------------|
| `code` | `String` | Unique package code (unique index) |
| `name` | `String` | Display name |
| `description` | `String` | Long description |
| `type` | `String (EPackageType)` | `plan` or `addon` (indexed) |
| `scope` | `String (EPackageScope)` | `public` or `private` (indexed) |
| `enterprise_id` | `String \| null` | Owner enterprise (indexed; null = public) |
| `status` | `String (EVersionStatus)` | `draft`, `active`, or `archived` (indexed) |
| `features` | `String[]` | Feature permission keys |
| `base_grants` | `GrantSchema[]` | Base grants (see sub-schema below) |
| `variants` | `PackageVariantSchema[]` | Pricing tiers (see sub-schema below) |
| `activated_at` | `Date \| null` | When the package was activated |
| `created_at` | `Date` | Created timestamp (auto by Mongoose) |
| `updated_at` | `Date` | Updated timestamp (auto by Mongoose) |

**Sub-schema: GrantSchema**

| Field | Type | Description |
|-------|------|-------------|
| `type` | `EGrantType` | Grant type |
| `key` | `String` | Grant identifier |
| `value` | `Number` | Numeric entitlement |
| `reset_cycle` | `String \| null` | Reset cadence (`monthly`, `weekly`, `daily`) |
| `credit_fallback` | `Object \| null` | Fallback: `{ credit_type, credits_per_unit }` |

**Sub-schema: PackageVariantSchema**

| Field | Type | Description |
|-------|------|-------------|
| `title` | `String` | Variant title |
| `duration_months` | `Number \| null` | Duration in months |
| `price` | `Number` | Base price |
| `price_after_discount` | `Number` | Discounted price |
| `tax` | `Number` | Tax amount |
| `currency` | `String (ECurrency)` | Currency code |
| `extra_grants` | `GrantSchema[]` | Extra grants for this variant |

**Indexes**:
- `{ code: 1 }` — Unique index
- `{ type: 1 }` — Filter by package type
- `{ scope: 1 }` — Filter by scope
- `{ enterprise_id: 1 }` — Filter by enterprise
- `{ status: 1 }` — Filter by lifecycle status

### 5.2 Repository Implementations

| Implementation | File | Implements |
|----------------|------|------------|
| `MongoPackageRepository` | `src/infrastructure/mongo/repositories/mongo-package.repository.ts` | `IPackageRepository` |

**Methods**:
- `findById(id)` — Find by MongoDB ID; returns `PackageRoot` or null
- `findByCode(code)` — Find all versions sharing the same code
- `findByType(type)` — Filter by `EPackageType`
- `findPublicPackages()` — Filter by `scope: 'public'`
- `findByEnterpriseId(enterpriseId)` — Filter by owner enterprise
- `save(pkg)` — Upserts; creates new doc if no ID, updates if ID exists
- `saveMany(packages)` — Batch save
- `delete(id)` — Deletes by ID; also invalidates cache
- `deleteByCode(code)` — Deletes all versions with the given code

**Mapping**:
- Domain → Persistence: Uses a `mapToPersistence()` method (internal)
- Persistence → Domain: Uses a `mapToDomain()` method (internal)

**Integrates with Redis cache**: Invalidates cache on save/delete by key patterns (`package:*`).

### 5.3 Read Service Implementations

| Implementation | File | Implements |
|----------------|------|------------|
| `MongoPackageReadService` | `src/infrastructure/mongo/read-services/package.read-service.ts` | `IPackageReadService` |

**Methods**:
- `findAll(filters)` — Cursor-based pagination with filters (code, status, type, scope, enterpriseId); returns `PaginatedResponseDto<PackageResponseDto>`
- `findById(id)` — Returns `PackageResponseDto` or null
- `findByCode(code)` — Returns active packages by code
- `findByType(type)` — Returns active packages by type
- `findPublicPackages()` — Returns active public packages
- `findByEnterpriseId(enterpriseId)` — Returns active packages for an enterprise

### 5.4 Module Wiring

Package command handlers (update, publish, archive, delete) are registered in the **BillingModule**, not in a standalone PackageModule.

**File**: `src/infrastructure/modules/billing.module.ts`

```typescript
@Module({
  imports: [CqrsModule, MongoModule, PaymentProvidersModule],
  providers: [
    // Package Handlers
    PackageUpdateHandler,
    PackagePublishHandler,
    PackageArchiveHandler,
    PackageDeleteHandler,
    // Bill, Payment, Subscription handlers...
  ],
  exports: [PaymentService],
})
export class BillingModule {}
```

> ⚠️ **Note**: `PackageCreateCommandHandler`, `PackageCreate`, and query handlers (`PackageGetListHandler`, `PackageGetByIdHandler`, `PackageGetByCodeHandler`) are registered elsewhere — likely in `BillingModule` or a parent module. The query handlers use `PACKAGE_READ_SERVICE` (wired to `MongoPackageReadService`).

---

## 6. Presentation Layer

### 6.1 REST Endpoints

The Package domain currently has **no dedicated REST controller**. Package operations are invoked through:

- **Admin UI / Internal Admin controllers** — likely via generic admin CRUD endpoints or the Billing module's GraphQL resolvers
- **Programmatic calls** — Commands are dispatched via `CommandBus` and queries via `QueryBus` from other controllers/services

> ⚠️ **Gap**: No dedicated `PackageController` exists in `src/presentation/controllers/`. This means:
> - Package CRUD operations must be triggered programmatically or via a shared admin controller
> - There is no public REST API for listing/reading packages

### 6.2 Guard Stack

The following guard hierarchy applies to all protected routes (when eventually exposed):

| Layer | Guard | Bypass |
|-------|-------|--------|
| 1 (global) | `ApiKeyGuard` | `@Public()`, `@WebHook()`, Swagger |
| 2 | `JwtAuthGuard` | `@Public()`, `@WebHook()` |
| 3 | `RolesGuard` | `@Public()`, `@WebHook()` |
| 4 | `UserVerifiedGuard` | `@Public()`, `@WebHook()` |

- `@Public()` — Bypasses all guards entirely
- `@WebHook()` — Bypasses JWT and API key guards for server-to-server webhooks

---

## 7. Workflow Flows

### 7.1 Create Package

#### Diagram

```
┌─────────────┐
│  Admin/App  │
└──────┬──────┘
       │ PackageCreateCommand({ code, name, type, scope })
       ▼
┌──────────────────────────────┐
│ Application Layer            │
│  ┌─────────────────────────┐ │
│  │ PackageCreateHandler    │ │
│  │  .execute()             │ │
│  │                         │ │
│  │ 1. uow.execute(async)  │ │
│  │ 2. check code unique   │ │
│  │ 3. PackageRoot.create() │ │
│  │ 4. repo.save(pkg)      │ │
│  │ 5. return DTO           │ │
│  └─────────────────────────┘ │
└─────────────┬────────────────┘
              │
              ▼
┌──────────────────────────────┐
│ Infrastructure Layer         │
│  ┌─────────────────────────┐ │
│  │ MongoPackageRepository  │ │
│  │  .save(pkg)             │ │
│  │   └─ Model.create()     │ │
│  │  Cache invalidate       │ │
│  └─────────────────────────┘ │
└─────────────┬────────────────┘
              │
              ▼
        Package in DRAFT
```

#### Step-by-Step

1. **Admin creates package** — calls `PackageCreateCommand` with code, name, description, type, scope
2. **Handler executes** within UoW:
   - Checks for existing package with the same `code`; throws `PackageCodeAlreadyExistsException` if found
   - Creates `PackageRoot` in `DRAFT` status with empty features, base grants, and variants
   - Saves via repository
3. **Response** — Returns `PackageResponseDto` with the new package ID

### 7.2 Publish Package (DRAFT → ACTIVE)

#### Diagram

```
DRAFT ──────────────► ACTIVE ───────► ARCHIVED
  │  publish()            archive()
  │
  └──► Check variants (>0)
  └──► Archive existing ACTIVE version (if same code)
```

#### Step-by-Step

1. **Admin publishes** — calls `PackagePublishCommand` with the package ID
2. **Validation**:
   - Package must be in `DRAFT` or `ARCHIVED` status
   - Package must have at least one variant
3. **Archive previous version** — If another version with the same `code` is `ACTIVE`, it is archived automatically
4. **Activate** — `package.activate()` sets status to `ACTIVE` and records `activatedAt`
5. **Response** — Returns updated `PackageResponseDto`

### 7.3 Update Package (DRAFT only)

#### Step-by-Step

1. **Admin updates** — calls `PackageUpdateCommand` with package ID and update payload
2. **Validation** — Only `DRAFT` packages can be updated
3. **Updates applied**:
   - General info: name, description, type, scope, features, base grants
   - Variants: deleted variants removed, existing variants updated (title, pricing, grants), new variants added
   - Validates unique variant titles
4. **Response** — Returns updated `PackageResponseDto`

### 7.4 Archive Package (ACTIVE → ARCHIVED)

#### Step-by-Step

1. **Admin archives** — calls `PackageArchiveCommand` with package ID
2. **Validation** — Package must be in `ACTIVE` status
3. **Archive** — `package.archive()` sets status to `ARCHIVED`
4. **Response** — Void (no return data)

### 7.5 Delete Package

#### Step-by-Step

1. **Admin deletes** — calls `PackageDeleteCommand` with package ID
2. **Validation**:
   - Package must be in `DRAFT` or `ARCHIVED` status
   - If `ARCHIVED`, checks that no active subscription references this package (`subscriptionRepository.existsByPackageId()`)
   - Throws `PackageInUseException` if referenced
3. **Delete** — `packageRepository.delete(id)` removes the document from MongoDB
4. **Response** — Void

---

## 8. File Map

| Layer | File | Responsibility |
|-------|------|---------------|
| **Core** | `src/core/aggregate-roots/package.aggregate.ts` | PackageRoot aggregate — package lifecycle, metadata, variants management |
| **Core** | `src/core/entities/package-variant.entity.ts` | PackageVariantEntity — pricing tier within a package |
| **Core** | `src/core/value-objects/grant.vo.ts` | GrantVO — named entitlement (quota, permission, credit) |
| **Core** | `src/core/enums/package-type.enum.ts` | EPackageType — plan vs addon |
| **Core** | `src/core/enums/package-scope.enum.ts` | EPackageScope — public vs private |
| **Core** | `src/core/enums/version-status.enum.ts` | EVersionStatus — draft → active → archived |
| **Core** | `src/core/enums/grant-type.enum.ts` | EGrantType — quota types and permissions |
| **Core** | `src/core/exceptions/package.exception.ts` | Domain exceptions (PackageNotFoundException, PackageInUseException, etc.) |
| **Core** | `src/core/interfaces/repositories/package.repository.ts` | IPackageRepository contract + PACKAGE_REPOSITORY DI token |
| **Application** | `src/application/commands/package-create/` | Create command, DTO (Zod), and handler |
| **Application** | `src/application/commands/package-update/` | Update command, DTO, and handler (updates metadata + variants) |
| **Application** | `src/application/commands/package-publish/` | Publish command, DTO, and handler (DRAFT/ARCHIVED → ACTIVE) |
| **Application** | `src/application/commands/package-archive/` | Archive command, DTO, and handler (ACTIVE → ARCHIVED) |
| **Application** | `src/application/commands/package-delete/` | Delete command, DTO, and handler (DRAFT delete / ARCHIVED cleanup) |
| **Application** | `src/application/queries/package-get-list/` | List query and handler with cursor pagination |
| **Application** | `src/application/queries/package-get-by-id/` | Get-by-ID query and handler |
| **Application** | `src/application/queries/package-get-by-code/` | Get-by-code query and handler |
| **Application** | `src/application/dtos/package.dto.ts` | Shared DTO types: GrantDtoSchema, VariantSchema, PackageResponseDto, PackageVariantDto |
| **Application** | `src/application/mappers/package.mapper.ts` | PackageMapper — PackageRoot ↔ PackageResponseDto |
| **Application** | `src/application/interfaces/read-service/package.read-service.interface.ts` | IPackageReadService contract + PACKAGE_READ_SERVICE DI token |
| **Infrastructure** | `src/infrastructure/mongo/schemas/package.schema.ts` | Mongoose schema (PackageModel, GrantSchema, PackageVariantSchema) |
| **Infrastructure** | `src/infrastructure/mongo/repositories/mongo-package.repository.ts` | MongoPackageRepository — IPackageRepository implementation with cache |
| **Infrastructure** | `src/infrastructure/mongo/read-services/package.read-service.ts` | MongoPackageReadService — IPackageReadService implementation |
| **Infrastructure** | `src/infrastructure/mongo/seeding/package-migration.service.ts` | PackageMigrationService — data migration from old quota-based schema |
| **Infrastructure** | `src/infrastructure/modules/billing.module.ts` | BillingModule — registers PackageUpdate/Publish/Archive/Delete handlers |
| **Presentation** | *(none)* | ❌ No dedicated PackageController — operations are triggered programmatically |

---

## 9. Key Invariants

- **Code uniqueness**: Each package must have a unique `code`. Creating a duplicate throws `PackageCodeAlreadyExistsException`.
- **Single active version per code**: Publishing a new `ACTIVE` version automatically archives any previously `ACTIVE` version with the same `code`. Only one `ACTIVE` version per `code` exists at any time.
- **Variants required for activation**: A package must have at least one variant before it can be published (`PackageNoVariantsException`).
- **DRAFT-only modification**: Package metadata and variants can only be modified while in `DRAFT` status. Updating an `ACTIVE` or `ARCHIVED` package throws an error.
- **Version status lifecycle**: Status transitions follow the strict DAG: `DRAFT` → `ACTIVE` → `ARCHIVED`. Deletion is only allowed from `DRAFT` or `ARCHIVED` (with additional subscription reference check).
- **Reference-gated deletion**: An `ARCHIVED` package cannot be deleted if any active subscription references it (`PackageInUseException`).
- **Variant title uniqueness**: Variants within the same package must have unique titles (`DuplicateVariantException`).
- **Grants are versioned**: Grants (quotas, permissions) are defined on the package variant, not on the subscription. Changing a package's grants affects only new subscriptions; active subscriptions retain their computed grants at time of purchase.
- **Immutable after publish**: Once a package is `ACTIVE`, its variants' pricing, duration, and grants cannot be changed. Changes require creating a new version (new `DRAFT` → publish).
- **Renewable quotas must define reset cycle**: `GrantVO` with `type = quota_renewable` must specify a `resetCycle` (`monthly`, `weekly`, or `daily`).
</content>
</content>
