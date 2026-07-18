# Implementation Plan: Subscription Domain Presentation Layer

## Overview
This plan outlines the implementation of the presentation layer (REST API endpoints) for the Subscription and QuotaUsage domains. Currently, these domains have no dedicated REST controllers - they are updated programmatically via events and cron jobs.

## Current State Analysis

### Existing Components (Core/Application/Infrastructure)
- **Aggregate Roots**: `SubscriptionRoot`, `QuotaUsageRoot`, `EnterpriseQuotaAllocationRoot`, `SubscriptionHistoryEntity`
- **Value Objects**: `PlanItemVO`, `AddonItemVO`, `SubscriptionChangeDetailsVO`, `RenewableUsageVO`, `EnterpriseQuotaAllocationVO`
- **Commands**: `SubscriptionUpdateCommand` (triggered by payment completion)
- **Events**: `SubscriptionUpdatedEvent`, `QuotaConsumedEvent`, `QuotaUsageResetEvent`
- **Repositories**: MongoDB implementations with caching
- **Cron Services**: `SubscriptionCronService` for quota reset and subscription expiry
- **DTOs**: `SubscriptionResponseDto`, `SubscriptionHistoryResponseDto`
- **Mappers**: `SubscriptionMapper` (entity ↔ DTO)
- **Module**: `BillingModule` wires all handlers and repositories

### Missing Components (Presentation Layer)
1. **Read Service Interfaces** - For query operations
2. **Read Service Implementations** - MongoDB read services
3. **Queries & Handlers** - CQRS query pattern
4. **REST Controller** - HTTP endpoints
5. **Module Registration** - Wire everything together

## Implementation Plan

### Phase 1: Read Service Interfaces & Implementations

#### 1.1 Subscription Read Service
- **Interface**: `ISubscriptionReadService` extending `IBaseReadService<SubscriptionResponseDto, SubscriptionFilterDto>`
  - `findById(id: string): Promise<Nullable<SubscriptionResponseDto>>`
  - `findByUserId(userId: string): Promise<Nullable<SubscriptionResponseDto>>`
  - `findAll(filters: SubscriptionFilterDto): Promise<PaginatedResponseDto<SubscriptionResponseDto>>`
- **Implementation**: `MongoSubscriptionReadService`
  - Uses `SubscriptionModel` from MongoDB
  - Implements caching with `CacheKeyUtil`
  - Maps documents to `SubscriptionResponseDto` using `SubscriptionMapper`

#### 1.2 Subscription History Read Service
- **Interface**: `ISubscriptionHistoryReadService` extending `IBaseReadService<SubscriptionHistoryResponseDto, SubscriptionHistoryFilterDto>`
  - `findBySubscriptionId(subscriptionId: string): Promise<PaginatedResponseDto<SubscriptionHistoryResponseDto>>`
  - `findByUserId(userId: string): Promise<PaginatedResponseDto<SubscriptionHistoryResponseDto>>`
- **Implementation**: `MongoSubscriptionHistoryReadService`

#### 1.3 QuotaUsage Read Service
- **Interface**: `IQuotaUsageReadService` extending `IBaseReadService<QuotaUsageResponseDto, QuotaUsageFilterDto>`
  - `findByEnterpriseId(enterpriseId: string): Promise<Nullable<QuotaUsageResponseDto>>`
- **Implementation**: `MongoQuotaUsageReadService`
  - Maps `QuotaUsageRoot` to DTO with usage details

#### 1.4 EnterpriseQuotaAllocation Read Service
- **Interface**: `IEnterpriseQuotaAllocationReadService` extending `IBaseReadService<EnterpriseQuotaAllocationResponseDto, ...>`
  - `findByOwnerId(ownerId: string): Promise<Nullable<EnterpriseQuotaAllocationResponseDto>>`
- **Implementation**: `MongoEnterpriseQuotaAllocationReadService`

### Phase 2: Queries & Handlers (CQRS)

#### 2.1 Subscription Queries
- `SubscriptionGetByIdQuery` / `SubscriptionGetByIdHandler` - Get subscription by ID
- `SubscriptionGetByUserIdQuery` / `SubscriptionGetByUserIdHandler` - Get subscription by owner user ID
- `SubscriptionGetListQuery` / `SubscriptionGetListHandler` - Paginated list with filters

#### 2.2 Subscription History Queries
- `SubscriptionHistoryGetListQuery` / `SubscriptionHistoryGetListHandler` - Get history by subscription ID or user ID

#### 2.3 QuotaUsage Queries
- `QuotaUsageGetByEnterpriseIdQuery` / `QuotaUsageGetByEnterpriseIdHandler` - Get quota usage for an enterprise

#### 2.4 EnterpriseQuotaAllocation Queries
- `EnterpriseQuotaAllocationGetByOwnerIdQuery` / `EnterpriseQuotaAllocationGetByOwnerIdHandler` - Get allocation for an owner

### Phase 3: DTOs & Filters

#### 3.1 New DTOs Needed
- `QuotaUsageResponseDto` - Enterprise quota usage with per-key details
- `EnterpriseQuotaAllocationResponseDto` - Owner's quota allocation across enterprises
- `SubscriptionFilterDto` - Filters for subscription list (status, userId, etc.)
- `SubscriptionHistoryFilterDto` - Filters for history list
- `QuotaUsageFilterDto` - Filters for quota usage

#### 3.2 Extend Existing DTOs
- Add `price`, `priceAfterDiscount` to `PlanItemDTO` and `AddonItemDTO` in `subscription.dto.ts`

### Phase 4: REST Controller

#### 4.1 SubscriptionClientController
**Base Path**: `/v1/client/subscriptions`

| Method | Endpoint | Description | Guards |
|--------|----------|-------------|--------|
| GET | `/me` | Get current user's subscription | JwtAuthGuard, UserVerifiedGuard |
| GET | `/:id` | Get subscription by ID | JwtAuthGuard, UserVerifiedGuard |
| GET | `/:id/history` | Get subscription history | JwtAuthGuard, UserVerifiedGuard |
| GET | `/` | List subscriptions (admin) | JwtAuthGuard, RolesGuard(ADMIN) |

#### 4.2 QuotaUsageClientController
**Base Path**: `/v1/client/quota-usage`

| Method | Endpoint | Description | Guards |
|--------|----------|-------------|--------|
| GET | `/me` | Get current user's enterprise quota usage | JwtAuthGuard, UserVerifiedGuard |
| GET | `/enterprise/:enterpriseId` | Get quota usage for specific enterprise | JwtAuthGuard, UserVerifiedGuard |

#### 4.3 EnterpriseQuotaAllocationClientController (Optional - Admin/Agency)
**Base Path**: `/v1/client/quota-allocations`

| Method | Endpoint | Description | Guards |
|--------|----------|-------------|--------|
| GET | `/me` | Get current owner's quota allocations | JwtAuthGuard, UserVerifiedGuard, RolesGuard(ENTERPRISE) |

### Phase 5: Module Registration

#### 5.1 Update BillingModule
- Add read service providers
- Add query handlers
- Export read service tokens

#### 5.2 Create SubscriptionPresentationModule (or add to existing)
- Register controllers
- Import BillingModule for dependencies

## File Structure to Create

```
src/
├── application/
│   ├── interfaces/
│   │   └── read-service/
│   │       ├── subscription.read-service.interface.ts
│   │       ├── subscription-history.read-service.interface.ts
│   │       ├── quota-usage.read-service.interface.ts
│   │       └── enterprise-quota-allocation.read-service.interface.ts
│   ├── queries/
│   │   ├── subscription-get-by-id/
│   │   ├── subscription-get-by-user-id/
│   │   ├── subscription-get-list/
│   │   ├── subscription-history-get-list/
│   │   ├── quota-usage-get-by-enterprise-id/
│   │   └── enterprise-quota-allocation-get-by-owner-id/
│   └── dtos/
│       ├── quota-usage.dto.ts (new)
│       └── enterprise-quota-allocation.dto.ts (new)
├── infrastructure/
│   └── mongo/
│       └── read-services/
│           ├── subscription.read-service.ts
│           ├── subscription-history.read-service.ts
│           ├── quota-usage.read-service.ts
│           └── enterprise-quota-allocation.read-service.ts
└── presentation/
    └── controllers/
        └── http/
            └── client/
                ├── subscription.controller.ts
                ├── quota-usage.controller.ts
                └── enterprise-quota-allocation.controller.ts
```

## Key Design Decisions

1. **Read Services bypass aggregates** - Direct MongoDB queries for performance
2. **Caching** - All read services use Redis cache with appropriate TTL
3. **Authorization** - Users can only access their own subscription/quota data
4. **Admin access** - Separate admin endpoints for listing all subscriptions
5. **DTO mapping** - Use existing `SubscriptionMapper` and create new mappers for QuotaUsage/Allocation

## Dependencies

- Existing: `BillingModule`, `MongoModule`, `CqrsModule`, `CacheService`
- New: Read service interfaces, query handlers, controllers

## Estimated Files to Create/Modify

| Category | Count |
|----------|-------|
| Read Service Interfaces | 4 |
| Read Service Implementations | 4 |
| Queries & Handlers | 7 (query + handler each) |
| DTOs | 3 new + 1 extend |
| Controllers | 3 |
| Module Updates | 1-2 |
| **Total** | **~20-25 files** |

## Next Steps

1. Review and approve this plan
2. Switch to Code mode to implement
3. Start with Phase 1 (Read Service Interfaces)
4. Proceed through phases sequentially