# Spec — Workspace-Scoped Session & Entitlement/Quota Enforcement

> Builds on Enterprise model) and `subscription-and-quota-usage.md` (grant/quota mechanics). Covers: how a session resolves to an entitlement context, and where permission/quota checks are enforced across the system.

## 1. Problem

Two open questions from the Owner/Enterprise refactor:
1. **Entitlement resolution for collaborators** — `computedPermissions` live on `SubscriptionRoot`, keyed by `ownerId`. An Owner's JWT can carry `ownerId` directly; a collaborator only has membership in an `Enterprise`, which must be resolved to its `ownerId`. A collaborator can also belong to multiple enterprises (possibly under different owners), each with a different role.
2. **Quota enforcement placement** — need a mechanism that's hard to forget (not dependent on every command handler remembering to call `quotaUsage.tryConsume()`), without leaking domain logic into the infrastructure layer.

## 2. Decision — Workspace-scoped sessions

Unify Owner and Collaborator into **one** login/session flow: after authentication, the caller must select a **workspace** (= one `Enterprise`) before receiving an access token capable of calling business endpoints. Owner and Collaborator differ only in *which enterprises they're allowed to select* and *what role that selection grants* — the guard logic downstream is identical for both.

```
1. POST /auth/login (credentials)
     → returns a scope-less token + { accessibleEnterprises: [{enterpriseId, role}, ...] }
       (Owner: all enterprises under their OwnerRoot, role = implicit full-access)
       (Collaborator: enterprises from CollaboratorMembership records)

2. POST /workspace/select { enterpriseId }
     → validate caller has access to this enterpriseId (owner or membership)
     → resolve Enterprise.ownerId (one DB read, only on switch)
     → issue AccessToken  { userId, enterpriseId, ownerId, role, exp: short }
     → issue RefreshToken { userId, enterpriseId, ownerId, role, familyId, exp: long }

3. All subsequent requests use the AccessToken as-is — no per-request DB lookup for ownerId/role

4. Switching workspace = repeat step 2 with a different enterpriseId
     → old AccessToken is left to expire naturally (short TTL, no blocklist needed)
```

### 2.1 New entity: `CollaboratorMembershipVO` / entity

| Property | Type | Notes |
|---|---|---|
| `userId` | `string` | |
| `enterpriseId` | `string` | |
| `role` | `string` | e.g. `admin`, `editor`, `viewer` (existing system roles) |

Owner access is derived (all enterprises where `Enterprise.ownerId == user's OwnerRoot.id`), not stored as membership rows.

### 2.2 Token shape

| Field | AccessToken | RefreshToken |
|---|---|---|
| `userId` | ✓ | ✓ |
| `enterpriseId` | ✓ (workspace scope) | ✓ |
| `ownerId` | ✓ (resolved at select-time) | ✓ |
| `role` | ✓ | ✓ |
| `familyId` | — | ✓ (rotation family, existing mechanism) |
| `exp` | short | long |

**Rule**: refresh only re-issues an AccessToken with the **same** `enterpriseId`/`ownerId`/`role` as the RefreshToken. Changing workspace always requires a new `/workspace/select` call (new RefreshToken), never a side effect of `/auth/refresh`.

### 2.3 Revocation policy

Access tokens are short-lived by design → workspace switch relies on natural expiry, no blocklist/redis needed at this stage. Revisit only if access TTL increases significantly later.

## 3. Entitlement (subscription permission) enforcement

**Layer**: Presentation guard, reading directly from the AccessToken — no request-time DB call.

```
@RequiresEntitlement('feature.ai_video')
guard: subscriptionCache.getByOwnerId(token.ownerId).computedPermissions.includes('feature.ai_video')
```

- `ownerId` comes straight from the token (§2.2) — guard does not branch on owner-vs-collaborator.
- `computedPermissions` should be read from a cache keyed by `ownerId` (e.g. Redis), invalidated on `SubscriptionUpdatedEvent`, to avoid a DB hit on every guarded request.
- System-role checks (`admin`/`editor`/`viewer`, existing guard) stay a **separate** decorator/guard from entitlement checks — do not merge the two into one condition.

## 4. Quota enforcement placement

**Layer**: Application — CommandBus middleware, not Infrastructure, not Presentation-only.

Rationale:
- Quota consumption must happen inside the same UoW as the business operation (existing invariant in `subscription-and-quota-usage.md` §9) — UoW is an application-layer concept; infra must not need to know quota keys/amounts (that's domain knowledge, and pushing it to infra leaks domain logic downward).
- A presentation-only guard would miss commands triggered by non-HTTP entry points (events, cron). CommandBus middleware covers every command regardless of entry point.

```ts
@ConsumesQuota({ key: 'campaign_count', amount: () => 1 })
class CreateCampaignCommand { ... }
```

- Middleware reads this metadata before invoking the handler; the actual `quotaUsage.tryConsume()` call still happens inside `uow.execute()` in the handler (no change to existing handler code).
- Resolution chain for **which** `QuotaUsageRoot` to check: `command.enterpriseId` (from the AccessToken passed down, not looked up again) → `QuotaUsageRoot` (1:1 per enterprise, unchanged from the base domain doc).

| Concern | Presentation Guard | CommandBus Middleware (chosen) | Infra auto-check |
|---|---|---|---|
| Covers non-HTTP entry points | ❌ | ✅ | ✅ |
| Same transaction as business op | ❌ | ✅ | ✅ but wrong layer |
| Respects dependency direction | ✓ | ✓ | ❌ (domain knowledge in infra) |

### 4.1 Implementation: `CommandBus` override via DI substitution

`@nestjs/cqrs`'s `CommandBus` has no built-in middleware/interceptor pipeline (confirmed gap — see [nestjs/cqrs#1668](https://github.com/nestjs/cqrs/issues/1668)), and NestJS's own `NestMiddleware` is HTTP-only, so it cannot wrap command dispatch either. The chosen approach: subclass `CommandBus`, override `execute()`, and register it via the `CommandBus` DI token so every existing `commandBus.execute(...)` call site is covered transparently — no call-site changes needed anywhere in the codebase.

```ts
@Injectable()
class GuardedCommandBus extends CommandBus {
  constructor(
    moduleRef: ModuleRef,
    private reflector: Reflector,
    private entitlementSvc: EntitlementService,
    private quotaSvc: QuotaEnforcementService,
  ) {
    super(moduleRef);
  }

  async execute<T, R>(command: T): Promise<R> {
    const permission = this.reflector.get(REQUIRES_PERMISSION, command.constructor);
    if (permission) await this.entitlementSvc.assert(permission, currentContext());

    const quotaMeta = this.reflector.get(CONSUMES_QUOTA, command.constructor);
    if (quotaMeta) await this.quotaSvc.assertHasRoom(quotaMeta, currentContext());
    // actual quotaUsage.tryConsume() still happens inside the handler's uow.execute() — unchanged

    return super.execute(command);
  }
}
```

```ts
// module providers
{ provide: CommandBus, useClass: GuardedCommandBus }
```

- `@RequiresPermission(...)` / `@ConsumesQuota(...)` are set via `Reflect.defineMetadata` (or NestJS's `SetMetadata`) directly on the Command class, read back with `Reflector.get(KEY, command.constructor)` — same pattern NestJS uses for Guards/Interceptors, just invoked manually since there's no `ExecutionContext` at this layer.
- `currentContext()` resolves `{ ownerId, enterpriseId, role }` from AsyncLocalStorage/CLS populated at request start from the AccessToken (§2.2) — not re-derived from a DB lookup.
- **Guardrail against bypass**: add an ESLint rule forbidding `import { CommandBus } from '@nestjs/cqrs'` outside the file defining `GuardedCommandBus` itself, so no handler or controller can accidentally inject the raw, unguarded `CommandBus`.
- Rejected alternative: a facade/dispatcher service (`AppCommandDispatcher.dispatch()`) wrapping `commandBus.execute()`. Simpler to reason about, but only protects call sites that opt in to using it — the DI-substitution approach protects every call site by construction, which better satisfies the original goal ("hard to forget").

## 5. Open decisions

1. **Entitlement cache invalidation** — confirm `SubscriptionUpdatedEvent` is sufficient to bust the `computedPermissions` cache per `ownerId`, including the allocation fan-out case (§5 of the Owner refactor spec, one event → N enterprises).
2. **`/workspace/select` for Owner with a single enterprise** — still require the explicit select call (for consistency/audit trail), or auto-select at login when `accessibleEnterprises.length === 1`? Recommended: still require it, to keep exactly one code path.
3. **Enterprise transfer mid-session** (open decision #4 in the Owner refactor spec) — if an enterprise moves to a different owner while a collaborator's RefreshToken is still valid, that token now points to a stale `ownerId`. Given the short-TTL/no-blocklist decision (§2.3), confirm this staleness window (bounded by AccessToken TTL) is acceptable, or whether enterprise transfer should force-expire related RefreshTokens as a special case.