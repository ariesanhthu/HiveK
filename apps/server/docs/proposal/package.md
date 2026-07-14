# Proposal: Package & Subscription System Progress

This document tracks the refactoring progress and outlines the remaining phases for implementing the Package, Bill, Payment, and Subscription systems. Note that the **wallet and credit balance layers have been completely removed** from all domains, schemas, and endpoints.

---

## 1. Summary of Completed Phases

### Phase 1: Domain & Infrastructure (Mongoose Repositories) - COMPLETED
* **Lowercase Enums**: Configured all enums (e.g., `EPackageType`, `EBillStatus`, `EPaymentStatus`) to use lowercase/snake_case string values under `src/core/enums/`.
* **Pure Domain Models**: Implemented `PackageRoot`, `BillEntity`, `PaymentEntity`, and `SubscriptionRoot` without wallet/credit fields.
* **Mongoose Schemas**: Created schemas with credit fields excluded (`credit_amount_applied`, `credit_amount_refund`, etc.).
* **Mongoose Repositories**: Implemented core repositories (`MongoPackageRepository`, `MongoBillRepository`, `MongoPaymentRepository`, `MongoSubscriptionRepository`) using NestJS `MongoUnitOfWork` (AsyncLocalStorage context).

### Phase 2: Application Layer (Package, Bill, Payment Provider) - COMPLETED
* **DTO & Mapper Layer**: Defined schemas and domain-to-DTO mappers (`PackageMapper`, `BillMapper`, `PaymentProviderMapper`, `PaymentMapper`, `SubscriptionMapper`).
* **Mongoose Read Services**: Created and registered read services directly mapping schema documents to response DTOs, including pagination and filters.
* **CQRS Commands & Queries**:
  * **Package**: Create, Update, Publish, Archive, Delete, Get-by-id, Get-by-code, Get-list.
  * **Bill**: Calculate (ephemeral), Create, Cancel, Get-by-id, Get-list.
  * **Payment Provider**: Create, Update, Delete, Restore, Get-by-id, Get-list.
* **Direct Repository Pattern**: Handlers perform repository lookups directly instead of going through intermediate lookup service wrappers.
* **Domain Events**: Created `BillCreatedEvent` and `BillCancelledEvent` conforming to target `DomainEvent` specs.
* **Build Integrity**: Clean build (`npm run build` succeeds with zero errors).

---

## 2. Next Steps

### Phase 3: Infrastructure of Payment Provider (Remaining)
* **Goal**: Implement MoMo, Stripe, and VNPay adapters, webhooks, signature verification, and event integration.
* **Key Tasks**:
  1. Port the payment strategy interfaces and concrete payment provider clients (e.g., MoMo strategy, Stripe strategy).
  2. Implement a unified Webhook router endpoint to verify digital signatures from payment gateways and map payload properties to payment commands.
  3. Handle callback updates and dispatch integration events to notify the system of transaction success or failure.

### Phase 4: Application Layer of Payment & Subscription (Remaining) - COMPLETED
* **Goal**: Implement core payment execution flows and subscription updates.
* **Key Tasks**:
  1. **Core Payment Commands** (Implemented):
     * `payment-create`: Initiates a payment process and returns the payment URL.
     * `payment-retry`: Triggers a new attempt on an existing pending/failed payment.
     * `payment-handle-webhook`: Handles webhook verification and state updates from payment gateways.
     * `payment-capture`: Finalizes and captures authorized payments.
     * `payment-cancel`: Cancels pending payment attempts.
     * `payment-void-authorization`: Releases funds/holds for authorized but uncaptured payments.
  2. **Core Subscription Commands** (Implemented):
     * `subscription-update`: Updates packages, computed permissions, and quotas, and logs history details.
  3. **Domain Event to Outbox Integration** (Implemented):
     * Mapped `PaymentAuthorizedEvent` to `CapturePaymentRequestEvent`.
     * Mapped `PaymentCompletedEvent` to `UpdateSubscriptionEvent`.
     * Mapped `SubscriptionUpdatedEvent` to `RequestAuthUpdateSubscriptionEvent`.
  3. **Future Lifecycle Tasks (Postponed/Documented)**:
     * Expiry checker cron scheduling, automated renewals, and complex refunds are documented for future implementation phases.
