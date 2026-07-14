# Package Domain Refactor Plan

> **Status**: Decisions finalized. Ready for implementation.
> **Review**: All issues from `review-package.md` resolved — see inline notes.
> **Update**: `creditFallback` moved to system-level config (hybrid model) — see §5.3.

---

## 1. Problem Statement — Why the Current Model Falls Short

| Issue | Impact |
|---|---|
| `PackageRoot` conflates plans and add-ons into one aggregate differentiated only by an enum | Business rules diverge — plans have billing cycles, add-ons do not |
| `QuotaVO` is a free-form map `{ [key: string]: number }` | No way to distinguish *hard limits* vs *monthly allowances* vs *credit-backed usage* — all three have different runtime enforcement |
| `SubscriptionItemVO` carries no consumed-vs-granted tracking | Credit top-ups cannot be attached to the enterprise |
| `BillItemVO` has no concept of credit purchases | A `CREDIT_TOP_UP` line type cannot be expressed |
| All grants live on `PackageVariantEntity`, nothing on `PackageRoot` | Every variant of the same plan must redundantly repeat all permissions and hard quotas — brittle and error-prone |
| `PackageFeatureVO { code, permissions[] }` conflates marketing copy with runtime enforcement | Display data and grant enforcement should not live in the same type |
| Credit overage rate (credits-per-unit) embedded in `GrantVO` on every package | Rate is a platform pricing decision, not a per-package capability — a single rate change requires updating all packages; also creates a stacking conflict when plan and add-on both define different rates |

---

## 2. The Three Behavioral Classes of Resource

Every resource falls into exactly one class. The class determines **how the runtime checks and enforces the limit**.

| Class | `EGrantType` | Example keys | Resets? | On exhaustion |
|---|---|---|---|---|
| **Hard Quota** | `QUOTA_HARD` | `max_campaigns`, `max_social_pages`, `max_members` | Never | Block with `QuotaExceededException` |
| **Renewable Quota** | `QUOTA_RENEWABLE` | `ai_gen_video`, `ai_gen_image`, `ai_gen_post` | Yes — billing-anchor cycle | Look up credit rate from system config (with optional per-grant override); deduct from wallet or block |
| **Credit Balance** | `CREDIT_TOP_UP` | `ai_credits` | Never (accumulates indefinitely) | Block with `InsufficientCreditException` |

> **Billing-anchor reset**: Cycle resets are anchored to the subscription's activation/renewal date — not the calendar. A plan activated on the 15th resets renewable quotas on the 15th of every month.

---

## 3. Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Package Catalogue                             │
│  (defined by Admin, versioned, immutable post-activation)              │
│                                                                        │
│  PackageRoot  (PLAN | ADDON)                                         │
│  ├── features: string[]          ← marketing copy only, UI display     │
│  ├── baseGrants: GrantVO[]       ← capabilities shared by ALL variants │
│  └── variants: PackageVariantEntity[]                                  │
│      ├── durationMonths: number | null   (null = perpetual)            │
│      ├── price / priceAfterDiscount / tax / currency                   │
│      └── extraGrants: GrantVO[]  ← variant-specific bonuses            │
│                                                                        │
│  Effective grants on purchase = baseGrants stacked with extraGrants    │
└────────────────────────────────────────────────────────────────────────┘
          purchased by enterprise
                  ↓
┌────────────────────────────────────────────────────────────────────────┐
│                      Enterprise Entitlement                            │
│                                                                        │
│  SubscriptionRoot  (1 per enterprise)                                │
│  ├── planItem: PlanItemVO | null                                       │
│  ├── addonItems: AddonItemVO[]                                         │
│  ├── computedGrants: GrantVO[]   ← merged snapshot, recomputed        │
│  └── computedPermissions: string[]                                     │
│                                                                        │
│  CreditWalletRoot  (1 per enterprise)                                │
│  └── balances: CreditBalanceVO[]   ← by creditType key                │
│                                                                        │
│  QuotaUsageRoot  (1 per enterprise)                                  │
│  └── usages: RenewableUsageVO[]    ← current-cycle consumption        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Two-Level Grant Model: `baseGrants` + `extraGrants`

### 4.1 The Split

| Level | Field | What lives here |
|---|---|---|
| `PackageRoot` | `baseGrants: GrantVO[]` | Capabilities that define the plan — `PERMISSION`, `QUOTA_HARD`, `QUOTA_RENEWABLE`. Same across all variants of the same package |
| `PackageVariantEntity` | `extraGrants: GrantVO[]` | Purchase-incentive bonuses that differ per variant — typically `CREDIT_TOP_UP` (annual gives more starter credits than monthly) |

### 4.2 Stacking Rule: Always Additive

**`extraGrants` stacks with `baseGrants` by summing values for the same key.** There is no override — the merge is purely additive.

This table covers **base+extra stacking within a single package only**. Cross-item rules (plan vs. add-on precedence) live in §7.1 `recomputeGrants()`.

| Grant type | Stacking rule (base + extra, within one package) |
|---|---|
| `QUOTA_HARD` | **Sum** values for same key. Example: base `max_campaigns: 50` + extra `max_campaigns: 2` → **52** |
| `QUOTA_RENEWABLE` | **Sum** `value` for same key. The credit overage rate is **not** part of the grant value — it is resolved at runtime from `ResourceCreditRateConfig` (see §5.3). Optional `creditFallback` on the grant is a plan-level price override only |
| `CREDIT_TOP_UP` | **Sum** values — total credits deposited on activation. Not included in `computedGrants` (one-time wallet events, not live state) |
| `PERMISSION` | **Union** of all keys — presence in any source = unlocked |

> The same additive rule applies at all stacking levels: `base+extra` (within a package) and `plan+addon` (across the subscription). See §7.1 for cross-item merge details.

### 4.3 Concrete Example — "Business Plan" with 3 Variants

**`PackageRoot.baseGrants`** (defined once, shared by Monthly, Quarterly, Annual):
```typescript
baseGrants: [
  // Hard quotas — plan capability, same regardless of billing cycle
  { type: 'quota_hard',      key: 'max_campaigns',   value: 50 },
  { type: 'quota_hard',      key: 'max_social_pages', value: 10 },
  { type: 'quota_hard',      key: 'max_members',      value: 5  },

  // Renewable quotas — monthly allowance, same regardless of billing cycle
  // No creditFallback here — overage rates come from ResourceCreditRateConfig (see §5.3)
  { type: 'quota_renewable', key: 'ai_gen_video', value: 10,  resetCycle: 'monthly' },
  { type: 'quota_renewable', key: 'ai_gen_image', value: 50,  resetCycle: 'monthly' },
  { type: 'quota_renewable', key: 'ai_gen_post',  value: 100, resetCycle: 'monthly' },

  // Permissions
  { type: 'permission', key: 'feature:api_access',         value: 1 },
  { type: 'permission', key: 'feature:advanced_analytics', value: 1 },
]
```

**`PackageVariantEntity.extraGrants`** (varies per billing duration — only the bonus credits differ):
```typescript
// Variant: Monthly
extraGrants: [{ type: 'credit_top_up', key: 'ai_credits', value: 50 }]

// Variant: Quarterly
extraGrants: [{ type: 'credit_top_up', key: 'ai_credits', value: 100 }]

// Variant: Annual
extraGrants: [{ type: 'credit_top_up', key: 'ai_credits', value: 200 }]
```

**Effective grants when enterprise buys Annual variant** (base + extra, stacked):
```typescript
// QUOTA_HARD, QUOTA_RENEWABLE, PERMISSION → from baseGrants (unchanged)
// CREDIT_TOP_UP → base has none; extra adds 200 → wallet gets +200 on activation
```

### 4.4 Add-on Examples

| Add-on | `baseGrants` | `extraGrants` per variant |
|---|---|---|
| "AI Credits Pack" | `CREDIT_TOP_UP ai_credits: 500` (base, all variants share) | _(or split: base=0, extra=500/1000/2000 per variant)_ |
| "AI Video Boost" | `QUOTA_RENEWABLE ai_gen_video: 20/month` | _(none, or bonus credits on larger pack)_ |
| "Extra Seats" | `QUOTA_HARD max_members: 5` | _(none)_ |

> **Credit pack billing (Review Issue #1 — resolved):** "AI Credits Pack" is a real `PackageRoot` (type `ADDON`) with a `packageId` and `packageVariantId`. Its purchase always produces `BillItemVO.lineType = ADDON_PURCHASE` — not `CREDIT_TOP_UP`. The `CREDIT_TOP_UP` line type is reserved for **non-catalogue wallet recharge flows** (e.g., admin manual top-up, future in-app direct purchase). The `PaymentCompletedEvent` handler for an `ADDON_PURCHASE` line reads the package's effective grants and deposits any `CREDIT_TOP_UP` grants into the wallet — this is how credits get added, not via a special bill line type.

---

## 5. `GrantVO` — Full Specification

### 5.1 Enum: `EGrantType`

```typescript
// core/enums/grant-type.enum.ts
export enum EGrantType {
  QUOTA_HARD      = 'quota_hard',      // permanent ceiling, never resets
  QUOTA_RENEWABLE = 'quota_renewable', // per-cycle allowance, billing-anchor reset
  CREDIT_TOP_UP   = 'credit_top_up',   // one-time wallet deposit on activation
  PERMISSION      = 'permission',      // feature flag unlock
}
```

### 5.2 `GrantVO` Interface

```typescript
// core/value-objects/grant.vo.ts
interface GrantVOProps {
  type: EGrantType;

  // Resource key — snake_case, globally unique per resource type.
  // QUOTA_HARD:      'max_campaigns', 'max_social_pages', 'max_members'
  // QUOTA_RENEWABLE: 'ai_gen_video', 'ai_gen_image', 'ai_gen_post'
  // CREDIT_TOP_UP:   'ai_credits'
  // PERMISSION:      'feature:api_access', 'feature:advanced_analytics'
  key: string;

  // Granted amount:
  //   QUOTA_HARD      → limit ceiling (e.g., 50)
  //   QUOTA_RENEWABLE → allowance per cycle (e.g., 10 per month)
  //   CREDIT_TOP_UP   → credits deposited on activation (e.g., 200)
  //   PERMISSION      → always 1 (boolean unlock)
  value: number;

  // ── QUOTA_RENEWABLE only ────────────────────────────────────────────
  resetCycle?: 'monthly' | 'weekly' | 'daily';

  // Optional plan-level price override for credit overage rate.
  // If absent, the system resolves the rate from ResourceCreditRateConfig (see §5.3).
  // Use only for special pricing tiers (e.g., VIP plan with cheaper overage).
  // Setting creditFallback: null explicitly DISABLES credit fallback for this grant
  // (quota exhaustion blocks immediately, even if a system default rate exists).
  creditFallback?: {
    creditType: string;       // e.g., 'ai_credits'
    creditsPerUnit: number;   // credits per 1 unit — overrides system default
  } | null;
  // ────────────────────────────────────────────────────────────────────
}
```

### 5.3 `ResourceCreditRateConfig` — System-Level Overage Rates

The platform maintains a **single source of truth** for credit overage rates per renewable resource key. This is an internal system config — not a domain entity, not stored per-package.

```typescript
// infrastructure/config/resource-credit-rate.config.ts
interface ResourceCreditRate {
  creditType: string;       // which credit pool to draw from
  creditsPerUnit: number;   // cost per 1 unit of this resource
}

// Defined once, used by the application service at consumption time
const RESOURCE_CREDIT_RATES: Record<string, ResourceCreditRate> = {
  'ai_gen_video': { creditType: 'ai_credits', creditsPerUnit: 50 },
  'ai_gen_image': { creditType: 'ai_credits', creditsPerUnit: 10 },
  'ai_gen_post':  { creditType: 'ai_credits', creditsPerUnit: 5  },
  // Add new resource types here as features grow
};
```

**Rate resolution at consumption time** (3-step priority chain):
```
1. grant.creditFallback !== undefined
   → use grant.creditFallback (plan-level override)
       if null  → block immediately (fallback explicitly disabled for this plan)
       if object → use that rate

2. RESOURCE_CREDIT_RATES[key] exists
   → use system default rate

3. Neither exists
   → no credit fallback available → throw QuotaExceededException
```

**Why this is better than embedding rates in `GrantVO`:**
- Rate change (e.g., AI video repricing) → update one config constant, propagates everywhere
- No stacking conflict — 99% of grants have no `creditFallback`, system default always applies
- Admin creating a package does not need to know credit economics
- VIP/enterprise plans can still opt into cheaper overage via `creditFallback` override

---

## 6. `PackageRoot` — Full Specification

### 6.1 The `features` Field

`features: string[]` is a **plain array of marketing strings** for UI display only. It is not enforced at runtime. It contains capabilities that cannot be derived from grants — e.g., "Priority customer support", "Dedicated account manager", "White-label exports".

The UI derives displayable quota information **directly from `baseGrants`**:
- `QUOTA_RENEWABLE` grants → show as "10 AI videos / month", "50 AI images / month"
- `CREDIT_TOP_UP` in `extraGrants` → show as "200 starter AI credits" per variant
- `QUOTA_HARD` grants → show as "Up to 50 campaigns", "Up to 10 social pages"
- `PERMISSION` grants → shown as unlocked features (map `key` → human label via frontend config)

**`PackageFeatureVO` is removed entirely.** It was a leaky abstraction mixing display and enforcement.

### 6.2 Updated `PackageRoot` Interface

```typescript
interface PackageProps {
  code: string;
  name: string;
  description: string;
  type: EPackageType;              // PLAN | ADDON
  scope: EPackageScope;            // PUBLIC | PRIVATE
  enterpriseId: Nullable<string>;  // null = platform-wide
  status: EVersionStatus;

  // Marketing copy — UI display only, not enforced at runtime
  features: string[];              // e.g., ["Priority support", "Custom branding"]

  // Capabilities shared by ALL variants of this package
  baseGrants: GrantVO[];

  variants: PackageVariantEntity[];
  createdAt: Date;
  updatedAt: Date;
  activatedAt: Optional<Date>;
}
// Removed: baseQuotas: QuotaVO, features: PackageFeatureVO[]
```

### 6.3 Updated `PackageVariantEntity` Interface

```typescript
interface PackageVariantProps {
  title: string;
  durationMonths: number | null;   // null = perpetual (add-ons without expiry)
  price: number;
  priceAfterDiscount: number;
  tax: number;
  currency: ECurrency;

  // Bonuses specific to this variant — stacked additively on top of baseGrants
  extraGrants: GrantVO[];          // typically only CREDIT_TOP_UP; always additive
}
// Removed: extraQuotas: QuotaVO
```

---

## 7. Enterprise Entitlement Aggregates

### 7.1 `SubscriptionRoot` (modified)

```typescript
interface SubscriptionProps {
  enterpriseId: string;
  status: ESubscriptionStatus;

  planItem: PlanItemVO | null;     // at most one active plan
  addonItems: AddonItemVO[];

  // Computed snapshot — rebuilt after every subscription change via recomputeGrants()
  // Excludes CREDIT_TOP_UP (those are one-time wallet events, not live state)
  computedGrants: GrantVO[];
  computedPermissions: string[];   // union of all PERMISSION grant keys

  version: number;
  nextExpiryCheckAt: Date;         // earliest expiry across planItem + addonItems
  createdAt: Date;
  updatedAt: Date;
}
```

**`PlanItemVO`**:
```typescript
interface PlanItemVOProps {
  packageId: string;
  packageVariantId: string;
  startDate: Date;       // billing anchor — renewable quotas reset relative to this date
  expiresAt: Date;
  billId: string;
  autoRenew: boolean;
}
```

**`AddonItemVO`**:
```typescript
interface AddonItemVOProps {
  packageId: string;
  packageVariantId: string;
  purchasedAt: Date;
  expiresAt: Date | null;  // null = perpetual
  billId: string;
}
```

**`recomputeGrants()` — internal merge logic (cross-item rules)**:
```
1. Collect effective grants per active item:
     effectiveGrants(item) = package.baseGrants stacked additively with variant.extraGrants
     (same key: sum values; PERMISSION: union; see §4.2 for within-package rules)

2. Stack all items together (plan effective grants + all addon effective grants):
     QUOTA_HARD:      sum values per key across all items
     QUOTA_RENEWABLE: sum values per key;
                      creditFallback → taken from the PLAN's grant for that key.
                      If no plan or plan has no creditFallback for that key,
                      take from the first add-on that defines one.
     CREDIT_TOP_UP:   excluded — one-time wallet events, not live computed state
     PERMISSION:      union of all keys across all items

3. Write result to computedGrants and computedPermissions
4. Emit SubscriptionUpdatedEvent
```

### 7.2 `CreditWalletRoot` (NEW)

One per enterprise. Credits **never expire**.

```typescript
interface CreditWalletProps {
  enterpriseId: string;
  balances: CreditBalanceVO[];   // one per creditType key
  createdAt: Date;
  updatedAt: Date;
}

interface CreditBalanceVOProps {
  creditType: string;   // e.g., 'ai_credits'
  total: number;        // lifetime grants — only grows
  used: number;         // lifetime deductions — only grows
  // available = total - used  (computed, never stored)
}
```

| Method | Invariant |
|---|---|
| `topUp(creditType, amount, reason)` | `amount > 0`. Creates balance entry if absent. Emits `CreditToppedUpEvent` |
| `deduct(creditType, amount, reason)` | Throws `InsufficientCreditException` if `available < amount`. Emits `CreditDeductedEvent` |
| `getAvailable(creditType)` | Returns `total - used`, or 0 if creditType not found |

### 7.3 `QuotaUsageRoot` (NEW)

One per enterprise. Tracks current-cycle consumption for every `QUOTA_RENEWABLE` key.

```typescript
// core/aggregate-roots/quota-usage.aggregate.ts
interface QuotaUsageProps {
  enterpriseId: string;
  cycleAnchorDate: Date;   // billing anchor — see anchor resolution below
  usages: RenewableUsageVO[];
  updatedAt: Date;
}

interface RenewableUsageVOProps {
  key: string;          // matches GrantVO.key, e.g., 'ai_gen_video'
  allocated: number;    // sum of all QUOTA_RENEWABLE grants for this key (from computedGrants)
  used: number;         // consumed in the current cycle
  cycleStartAt: Date;   // billing anchor for this cycle
  cycleEndsAt: Date;    // cycleStartAt + resetCycle duration
}
```

| Method | Description |
|---|---|
| `recompute(grants, subscription)` | Triggered by `SubscriptionUpdatedEvent`. Resolves `cycleAnchorDate`. Rebuilds `allocated` from `QUOTA_RENEWABLE` grants. Adds new keys, removes stale ones. Preserves `used` for existing keys (even if `used > allocated` — hard-lock by design). Recalculates `cycleEndsAt` |
| `tryConsume(key, amount)` | If `used + amount ≤ allocated`: increment `used`, return `{ ok: true }`. Otherwise return `{ ok: false, overflow: number }`. **Does not return credit rate** — caller resolves rate from `computedGrants` + `ResourceCreditRateConfig` |
| `resetExpiredCycles(now)` | Cron-driven. For each usage where `cycleEndsAt ≤ now`: reset `used = 0`, advance cycle window. Hard-lock cleared. Emits `QuotaUsageResetEvent` |

---

## 8. `BillEntity` — Updated `BillItemVO`

```typescript
// core/enums/bill-line-type.enum.ts
export enum EBillLineType {
  PLAN_PURCHASE   = 'plan_purchase',
  ADDON_PURCHASE  = 'addon_purchase',
  CREDIT_TOP_UP   = 'credit_top_up',
}

// core/value-objects/bill-item.vo.ts
interface BillItemVOProps {
  lineType: EBillLineType;
  packageId: string | null;          // null for standalone credit purchases
  packageVariantId: string | null;
  creditType: string | null;         // set only for CREDIT_TOP_UP lines
  creditAmount: number | null;       // set only for CREDIT_TOP_UP lines
  price: number;
  taxPercent: number;
  purchaseType: EPurchaseType;       // NEW | RENEWAL | CANCELLED
}
```

---

## 9. Full Workflow Specifications

### 9.1 Plan Purchase & Activation

```
1. Enterprise selects plan + variant
2. BillEntity.create({ items: [{ lineType: PLAN_PURCHASE, packageId, packageVariantId }] })
3. Payment succeeds → PaymentCompletedEvent
4. Handler:
   a. Resolve effectiveGrants = package.baseGrants stacked with variant.extraGrants
   b. SubscriptionRoot.attachPlan(PlanItemVO { startDate = now })
   c. SubscriptionRoot.recomputeGrants()
      → emits SubscriptionUpdatedEvent
   d. For each CREDIT_TOP_UP in effectiveGrants:
      → CreditWalletRoot.topUp(creditType, value, reason='plan_activation')
      → emits CreditToppedUpEvent
5. SubscriptionUpdatedEvent handler:
   → QuotaUsageRoot.recompute(computedGrants, anchorDate = planItem.startDate)
```

### 9.2 Add-on Purchase & Activation

```
1. Enterprise selects add-on + variant
2. BillEntity with ADDON_PURCHASE line
3. Payment succeeds → PaymentCompletedEvent
4. Handler:
   a. Resolve effectiveGrants = package.baseGrants stacked with variant.extraGrants
   b. SubscriptionRoot.attachAddon(AddonItemVO)
   c. SubscriptionRoot.recomputeGrants()
      → emits SubscriptionUpdatedEvent
   d. For each CREDIT_TOP_UP in effectiveGrants:
      → CreditWalletRoot.topUp(creditType, value, reason='addon_purchase')
5. SubscriptionUpdatedEvent handler:
   → QuotaUsageRoot.recompute(computedGrants, anchorDate = planItem.startDate)
   → allocated increases for stacked keys; used is preserved
```

### 9.3 Credit Pack Purchase (catalogue addon)

> **Resolved from Review Issue #1:** Credit packs are real catalogue `PackageRoot` objects (type ADDON). Their purchase uses `ADDON_PURCHASE` line type — not `CREDIT_TOP_UP`. Credits are deposited via the standard addon activation flow (§9.2), which reads `CREDIT_TOP_UP` grants and calls `CreditWalletRoot.topUp()`.

```
1. Enterprise selects "AI Credits Pack" variant (e.g., 500 credits)
2. BillEntity with lineType = ADDON_PURCHASE, packageId set, packageVariantId set
3. Payment succeeds → PaymentCompletedEvent
4. Handler (same as §9.2 Add-on flow):
   a. SubscriptionRoot.attachAddon(AddonItemVO)
   b. SubscriptionRoot.recomputeGrants() → emits SubscriptionUpdatedEvent
   c. Resolve effectiveGrants = package.baseGrants stacked with variant.extraGrants
   d. For each CREDIT_TOP_UP in effectiveGrants:
      → CreditWalletRoot.topUp('ai_credits', 500, reason='addon_purchase')
   ← No QuotaUsageRoot mutation (credit packs have no QUOTA_RENEWABLE grants)
```

### 9.4 Non-Catalogue Wallet Top-Up (admin / direct recharge)

> This is the **only** use case for `BillItemVO.lineType = CREDIT_TOP_UP`. Used for admin manual grants or future direct in-app purchase flows that bypass the package catalogue.

```
1. Admin or direct-recharge flow → BillEntity with lineType = CREDIT_TOP_UP,
   packageId = null, creditType = 'ai_credits', creditAmount = N
2. Payment/approval completes
3. Handler:
   → CreditWalletRoot.topUp('ai_credits', N, reason='admin_grant' | 'direct_recharge')
   ← No SubscriptionRoot mutation
   ← No QuotaUsageRoot mutation
```

### 9.5 Feature Usage — Renewable Quota with Credit Fallback

```
"Enterprise X generates 1 AI video"

1. Load QuotaUsageRoot
2. QuotaUsageRoot.tryConsume('ai_gen_video', 1)

   Case A — quota available (used=8, allocated=30):
   → { ok: true } → used=9 → proceed ✓

   Case B — quota exhausted (used=30, allocated=30):
   → { ok: false, overflow: 1 }

   3. Resolve credit rate (3-step priority chain):
      a. Look up computedGrant for key 'ai_gen_video'
      b. rate = grant.creditFallback          // plan-level override (if set)
            ?? RESOURCE_CREDIT_RATES['ai_gen_video']  // system default
            ?? null                                   // no fallback defined

      If grant.creditFallback === null (explicitly disabled):
      → throw QuotaExceededException  (no credit fallback for this plan)

      If rate is null (key not in system config, no override):
      → throw QuotaExceededException

      If rate found: cost = overflow(1) × creditsPerUnit(50) = 50 credits
      → CreditWalletRoot.deduct(rate.creditType, cost, reason='ai_gen_video_overflow')
          → available < 50? throw InsufficientCreditException
          → ok? emits CreditDeductedEvent → proceed ✓

   Case D — post-downgrade hard-lock (used=8, allocated=5 after add-on removed):
   → { ok: false, overflow: 4 } immediately (used already > allocated)
   → same rate-resolution path as Case B
   → hard-locked on credit wallet until next resetExpiredCycles() resets used=0
```

### 9.6 Billing-Anchor Reset (Cron — daily)

```
Find all QuotaUsageRoot where any usage.cycleEndsAt ≤ now
→ QuotaUsageRoot.resetExpiredCycles(now):
   For each expired usage:
     used = 0            ← hard-lock lifted; post-downgrade state also cleared here
     cycleStartAt = old cycleEndsAt
     cycleEndsAt  = cycleStartAt + resetCycle duration
→ emits QuotaUsageResetEvent
```

### 9.7 Plan Expiry / Renewal (Cron — daily)

```
If autoRenew = true:
  → Re-trigger Plan Purchase flow (new bill → payment → reattach plan)
  → newAnchorDate = new planItem.startDate
  → QuotaUsageRoot.recompute(grants, subscription)
     → cycleAnchorDate updated to newAnchorDate; used resets to 0 (new billing cycle)

If autoRenew = false:
  → SubscriptionRoot.expirePlan() → recomputeGrants()
  → QuotaUsageRoot.recompute(remainingAddonGrants, subscription)
     → cycleAnchorDate falls back to earliest addonItem.purchasedAt
     → allocated drops to add-on-only level; used preserved (may trigger hard-lock)
  → CreditWalletRoot: credits NOT revoked
```

---

## 10. Domain Events

| Event | Emitted by | Trigger |
|---|---|---|
| `SubscriptionUpdatedEvent` | `SubscriptionRoot` | Any plan/add-on attach or detach |
| `CreditToppedUpEvent` | `CreditWalletRoot` | `topUp()` succeeds |
| `CreditDeductedEvent` | `CreditWalletRoot` | `deduct()` succeeds |
| `QuotaConsumedEvent` | `QuotaUsageRoot` | `tryConsume()` returns ok |
| `QuotaUsageResetEvent` | `QuotaUsageRoot` | `resetExpiredCycles()` resets ≥1 key |

---

## 11. Migration Impact Summary

| File | Change | Notes |
|---|---|---|
| `core/enums/grant-type.enum.ts` | **New** | `EGrantType` — 4 values |
| `core/enums/bill-line-type.enum.ts` | **New** | `EBillLineType` — 3 values |
| `core/enums/credit-transaction-type.enum.ts` | **New** | `top_up`, `deduction` |
| `core/value-objects/quota.vo.ts` | **Remove** | Replaced by `GrantVO` |
| `core/value-objects/package-feature.vo.ts` | **Remove** | Replaced by `features: string[]` on `PackageRoot` |
| `core/value-objects/grant.vo.ts` | **New** | `creditFallback` is optional plan-level override; system rates are in infra config |
| `core/value-objects/plan-item.vo.ts` | **New** | Typed replacement for `SubscriptionItemVO` |
| `core/value-objects/addon-item.vo.ts` | **New** | Typed replacement for `SubscriptionItemVO` |
| `core/value-objects/credit-balance.vo.ts` | **New** | |
| `core/value-objects/renewable-usage.vo.ts` | **New** | |
| `core/value-objects/subscription-item.vo.ts` | **Remove** | Replaced by `PlanItemVO` + `AddonItemVO` |
| `core/value-objects/bill-item.vo.ts` | **Modify** | Add `lineType`, `creditType`, `creditAmount` |
| `core/value-objects/subscription-change-details.vo.ts` | **Modify** | Replace quota diff → grant diff + credit snapshot |
| `core/entities/package-variant.entity.ts` | **Modify** | `extraQuotas` → `extraGrants: GrantVO[]`; `durationMonths` nullable |
| `core/aggregate-roots/package.aggregate.ts` | **Modify** | Remove `baseQuotas`; add `baseGrants: GrantVO[]`; `features: string[]` |
| `core/aggregate-roots/subscription.aggregate.ts` | **Modify** | Split items; add `recomputeGrants()` with base+extra+addon stacking |
| `core/aggregate-roots/credit-wallet.aggregate.ts` | **New** | `CreditWalletRoot` |
| `core/aggregate-roots/quota-usage.aggregate.ts` | **New** | `QuotaUsageRoot`; `tryConsume` returns `{ ok, overflow }` only |
| `core/events/credit-topped-up.domain-event.ts` | **New** | |
| `core/events/credit-deducted.domain-event.ts` | **New** | |
| `core/events/quota-consumed.domain-event.ts` | **New** | |
| `core/events/quota-usage-reset.domain-event.ts` | **New** | |
| `core/exceptions/credit.exception.ts` | **New** | `InsufficientCreditException` |
| `core/exceptions/quota.exception.ts` | **New** | `QuotaExceededException` |
| `core/interfaces/repositories/credit-wallet.repository.ts` | **New** | `ICreditWalletRepository` |
| `core/interfaces/repositories/quota-usage.repository.ts` | **New** | `IQuotaUsageRepository` |
| `infrastructure/config/resource-credit-rate.config.ts` | **New** | `RESOURCE_CREDIT_RATES` — system default overage rates per resource key |
