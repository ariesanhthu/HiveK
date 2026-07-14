# Payment Workflow — Review & Refactor Plan

> **Status**: ✅ All phases complete.
> **Date**: 2026-07-14
> **Last updated**: Phase B/C — Proration implementation

---

## 1. End-to-End Payment Flow (Updated)

```
┌──────────────┐
│ User selects  │
│ packages      │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ BillCalculateHandler                         │
│ • Validates packages exist                   │
│ • Validates max 1 PLAN                       │
│ • Returns pricing preview (no persistence)   │
└──────────────────────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ BillCreateHandler                            │
│ • Validates packages exist, max 1 PLAN       │
│ • Calls BillService.determinePurchaseTypes() │
│ • Creates BillEntity (PENDING)               │
│ • Publishes BillCreatedEvent                 │
└──────────────────────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ PaymentEntity.create() → processTransaction   │
│ • Authorization → PaymentAttemptEntity        │
│ • On success → PaymentAuthorizedEvent         │
│ • On capture success → PaymentCompletedEvent  │
│ • coordinateCaptureSuccess() → bill.markAsPaid│
└──────┬─────────────────────────┬──────────────┘
       │                         │
       ▼                         ▼
┌──────────────┐      ┌──────────────────────────┐
│ EventMapper  │      │ PaymentCompletedEvent     │
│ → Capture    │      │ → (direct handler)        │
│ PaymentReqst │      │ → SubscriptionUpdateCmd   │
│ (→ RMQ)      │      └──────────┬───────────────┘
└──────┬───────┘                 │
       │                         ▼
       ▼              ┌──────────────────────────────┐
┌──────────────┐      │ SubscriptionUpdateHandler    │
│ RMQ (sent)   │      │ • attachPlan / attachAddon   │
│              │      │ • wallet.topUp (credits)     │
└──────────────┘      │ • removeAddon (if specified) │
                      │ • recomputeGrants()           │
                      │ • ProrationService (NEW)      │
                      │   → REFUND bill + wallet top  │
                      └──────────┬───────────────────┘
                                 │
                                 ▼
                 ┌──────────────────────────────────┐
                 │ SubscriptionUpdatedEvent          │
                 ├── SubscriptionUpdatedEventHandler │
                 │     → QuotaUsageRoot.recompute()  │
                 └── EventMapper → RequestAuth...    │
                 │     (→ RMQ: auth.updated)         │
                 └──────────────────────────────────┘
```

---

## 2. ✅ Completed Fixes

### ✅ Phase 1 — Critical Fixes

| # | Task | Status | Files Changed |
|---|---|---|---|
| 1a | Add `enterpriseId` to `PaymentCompletedPayload` | ✅ Done | `core/events/payment-completed.domain-event.ts` |
| 1c | Create direct domain event handler for `PaymentCompletedEvent` | ✅ Done (Option A chosen) | `application/events/payment-completed/payment-completed.handler.ts` |
| — | Register handler + events export | ✅ Done | `billing.module.ts`, `events/index.ts` |

**Decision:** Used direct `@EventsHandler(PaymentCompletedEvent)` over RMQ path. The RMQ mapping (`EventMapper → UpdateSubscriptionEvent`) had no transport metadata so it was dead code. The direct handler defers execution with `setImmediate` to avoid nested UoW conflicts.

### ✅ Phase 2 — Medium Fixes

| # | Task | Status | Files Changed |
|---|---|---|---|
| 3 | Add `lineType`, `creditType`, `creditAmount` to mapper + DTO + read service | ✅ Done | `bill.mapper.ts`, `bill.dto.ts`, `bill.read-service.ts` |
| 4 | Use `setMonth()` for addon expiry (consistent with plan) | ✅ Done | `subscription-update.handler.ts` |
| 7 | `Record<string, any>` → `Record<string, number>` | ✅ Done | `request-auth-update-subscription.event.ts` |

### ✅ Phase 3 — Optimization

| # | Task | Status | Files Changed |
|---|---|---|---|
| 6 | Reuse `packageMap` instead of reloading in step 6 | ✅ Done | `subscription-update.handler.ts` |

### ✅ Issue 8 — Downgrade / Proration (Full)

| Sub-phase | Task | Status | Files Changed |
|---|---|---|---|
| **A1** | Add `price` + `priceAfterDiscount` to `PlanItemVO` / `AddonItemVO` | ✅ Done | `plan-item.vo.ts`, `addon-item.vo.ts` |
| **A2** | Wire up `removedAddonIds` in handler | ✅ Done | `subscription-update.dto.ts`, `subscription-update.handler.ts` |
| **A3** | Add `DOWNGRADE` / `UPGRADE` to `EPurchaseType` | ✅ Done | `purchase-type.enum.ts` |
| **A4** | Update schema + repository mappings | ✅ Done | `subscription.schema.ts`, `mongo-subscription.repository.ts` |
| **B** | Create `ProrationService` with daily-rate formula | ✅ Done | `proration.service.ts` |
| **C** | Integrate proration into handler (REFUND bill + wallet top-up) | ✅ Done | `subscription-update.handler.ts` |

### ✅ Cleanup & Dead Code

| # | Task | Status | Files Changed |
|---|---|---|---|
| — | Removed RMQ dead mapping (`PaymentCompletedEvent → UpdateSubscriptionEvent`) | ✅ Done | `event.mapper.ts` |
| — | Fixed bill code uniqueness (random suffix) | ✅ Done | `subscription-update.handler.ts` |
| — | Added `price` defaults to migration service | ✅ Done | `package-migration.service.ts` |
| — | Fixed `bill.dto.ts` Zod enum (add new purchase types) | ✅ Done | `bill.dto.ts` |

---

## 3. Proration Design

### Formula

```
dailyRateOld = oldPrice / totalCycleDays
dailyRateNew = newPrice / totalCycleDays
refund = remainingDays × (dailyRateOld - dailyRateNew)

Where:
  totalCycleDays = oldPlan.expiresAt - oldPlan.startDate
  remainingDays  = oldPlan.expiresAt - changeDate
```

Returns 0 for upgrades (new >= old), expired cycles, zero-length cycles.

### Flow in `SubscriptionUpdateHandler`

```
1. Snapshot oldPlanItem (before attachPlan)
2. Process bill items (attachPlan / attachAddon)
3. If planChanged (packageId OR variantId differs):
   a. ProrationService.calculatePlanChangeRefund(...)
   b. If refundAmount > 0:
      - Create REFUND bill (EBillType.REFUND, negative price)
      - BillItemVO { lineType: CREDIT_TOP_UP, purchaseType: DOWNGRADE }
      - wallet.topUp('proration_credit', refundAmount, reason)
4. Continue with recomputeGrants, save, history, events
```

### Key Files

| File | Role |
|---|---|
| `src/application/services/proration.service.ts` | Pure calculation logic |
| `src/application/commands/subscription-update/subscription-update.handler.ts` | Integration into subscription flow |

---

## 4. Pre-Existing (Already Working)

| Component | Status |
|---|---|
| `PaymentCaptureHandler` — calls `coordinateCaptureSuccess` | ✅ Already working |
| `PaymentService.initiateRetry()` / `processTransaction()` | ✅ Already working |
| `SubscriptionCronService` — cycle reset + expiry check | ✅ Already working |
| `EventMapper → RequestAuthUpdateSubscriptionEvent` (RMQ: `payment.subscription.auth.updated`) | ✅ Working (has transport metadata) |

---

## 5. Migration Impact Summary

| File | Change | Phase |
|---|---|---|
| `core/events/payment-completed.domain-event.ts` | Added `enterpriseId` to payload | 1 |
| `application/events/payment-completed/payment-completed.handler.ts` | **New** — direct domain event handler | 1 |
| `application/services/proration.service.ts` | **New** — proration calculation service | B/C |
| `application/mappers/event.mapper.ts` | Removed dead `UpdateSubscriptionEvent` mapping | Cleanup |
| `application/mappers/bill.mapper.ts` | Added `lineType`, `creditType`, `creditAmount` | 2 |
| `application/dtos/bill.dto.ts` | Added DTO fields, fixed Zod enum | 2 |
| `infrastructure/mongo/read-services/bill.read-service.ts` | Added read mapping for new fields | 2 |
| `core/value-objects/plan-item.vo.ts` | Added `price`, `priceAfterDiscount` | A |
| `core/value-objects/addon-item.vo.ts` | Added `price`, `priceAfterDiscount` | A |
| `core/enums/purchase-type.enum.ts` | Added `DOWNGRADE`, `UPGRADE` | A |
| `infrastructure/mongo/schemas/subscription.schema.ts` | Added price fields to schemas | A |
| `infrastructure/mongo/repositories/mongo-subscription.repository.ts` | Updated domain↔persistence mapping | A |
| `application/commands/subscription-update/subscription-update.dto.ts` | Added optional `removedAddonIds` | A |
| `application/commands/subscription-update/subscription-update.handler.ts` | Proration integration, addon expiry fix, packageMap reuse | 2, 3, B/C, A |
| `infrastructure/modules/billing.module.ts` | Registered `ProrationService`, `PaymentCompletedEventHandler` | 1, B/C |
| `application/services/index.ts` | Added `proration.service` export | B/C |
| `application/mappers/event.mapper.ts` | Removed unused `PaymentCompletedEvent` import | Cleanup |
| `infrastructure/mongo/seeding/package-migration.service.ts` | Added price defaults for migrated data | A |
