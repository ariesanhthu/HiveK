# Enterprise Domain

> **Last Updated**: 2026-07-17
> **Related Docs**: [auth domain](../auth/domain.md), [campaign domain](../campaign/domain.md)

---

## 1. Domain Overview

The **Enterprise** domain manages business entities (brands, agencies, advertisers) on the HiveK platform. It handles enterprise profile management, team membership (members & sub-owners), invitations, and knowledge base for brand guidelines.

### Bounded Context

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Enterprise Context                            │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │                    EnterpriseRoot                          │      │
│  │  userId | companyName | contactEmail | taxId | isVerified  │      │
│  │  members[] | knowledgeBase | logoUrlId                     │      │
│  └──────────────────────────┬───────────────────────────────┘      │
│                             │                                       │
│              ┌──────────────┼──────────────┐                        │
│              │              │              │                        │
│     ┌────────▼─────┐  ┌────▼────────┐ ┌───▼──────────────┐         │
│     │     Owner    │  │  Sub-Owner  │ │      User        │         │
│     │ (Enterprise  │  │ (Enterprise │ │ (Enterprise      │         │
│     │  User Root)  │  │  Member)    │ │  Member)         │         │
│     └──────────────┘  └─────────────┘ └──────────────────┘         │
│                                                                     │
│  ┌──────────────────────────────────────────┐                       │
│  │        EnterpriseInvitationRoot           │                       │
│  │  enterpriseId | email | mode | inviterId  │                       │
│  │  status | expiresAt                       │                       │
│  │  (PENDING → ACCEPTED | EXPIRED | REVOKED) │                       │
│  └──────────────────────────────────────────┘                       │
│                                                                     │
│  ┌──────────────────────────────────────┐                           │
│  │       EnterpriseKnowledgeBase        │                           │
│  │  rawText | externalLinks[]           │                           │
│  └──────────────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Concepts

| Concept | Description |
|---------|-------------|
| **EnterpriseRoot** | Aggregate root for business entity profile & team management |
| **EnterpriseInvitationRoot** | Invitation aggregate for inviting users into an enterprise team |
| **EnterpriseKnowledgeBase** | Brand guidelines, raw text, and external links for campaign reference |
| **Owner** | The user who created the enterprise (`userId`); has full control |
| **Member** | Users added to the enterprise team (`members[]`) |
| **Sub-Owner** | Member with elevated privileges (`EEnterpriseMemberMode.SUB_OWNER`) |
| **EEnterpriseMemberMode** | `sub_owner` or `user` — member role within the enterprise |
| **EEnterpriseInvitationStatus** | `pending` → `accepted` / `expired` / `revoked` |

### Relations to Other Domains

- **Auth/User**: `EnterpriseUserRoot.enterpriseIds[]` links users back to their enterprises
- **Campaign**: Campaigns belong to an enterprise via `campaign.enterpriseId`
- **Subscription**: Enterprises have subscription plans with feature permissions & quota
- **UploadedFile**: Enterprise logos link to the uploaded files domain

---

## 2. Core Layer

### 2.1 Aggregate Root: `EnterpriseRoot`

**File**: `src/core/aggregate-roots/enterprise.aggregate.ts`

#### Properties (`EnterpriseProps`)

| Property | Type | Description |
|----------|------|-------------|
| `userId` | `string` | Owner user ID (the user who created the enterprise) |
| `companyName` | `string` | Registered company name |
| `description` | `string` (optional) | Company description |
| `contactEmail` | `string` | Public contact email |
| `contactPhone` | `PhoneNumberVO` (optional) | International format phone |
| `website` | `string` (optional) | Company website URL |
| `taxId` | `string` (optional) | Business tax / registration ID |
| `logoUrlId` | `string` (optional) | Uploaded file ID for logo |
| `isVerified` | `boolean` | Admin verification status |
| `members` | `EnterpriseMember[]` | Team members with roles |
| `knowledgeBase` | `EnterpriseKnowledgeBase` (optional) | Brand guidelines & references |
| `deleteAt` / `deleteBy` | `Nullable<Date>` / `Nullable<string>` | Soft-delete metadata |
| `createdAt` / `updatedAt` | `Date` | Timestamps |

#### Supporting Interfaces

```typescript
interface EnterpriseMember {
  userId: string;
  mode: EEnterpriseMemberMode;  // 'sub_owner' | 'user'
}

interface EnterpriseKnowledgeBase {
  rawText?: string;
  externalLinks: string[];
  updatedAt: Date;
}
```

#### Factory Methods

| Method | Description |
|--------|-------------|
| `create(props)` | Creates new enterprise with empty members, timestamps |
| `instantiate(id, props)` | Reconstitutes from persistence |

#### Domain Methods

| Method | Description | Raises Event |
|--------|-------------|-------------|
| `update(props)` | Updates profile fields | — |
| `softDelete(deletedBy)` | Soft-deletes enterprise | — |
| `restore()` | Recovers soft-deleted enterprise | — |
| `addMember(userId, mode)` | Adds team member (skips if duplicate) | — |
| `removeMember(userId)` | Removes team member | — |
| `changeMemberMode(userId, mode)` | Changes member's role | — |
| `isOwner(userId)` | Checks if user is the owner | — |
| `isSubOwner(userId)` | Checks if user is a sub-owner | — |
| `isMember(userId)` | Checks if user is owner or member | — |
| `markForHardDelete()` | Raises `EntityHardDeletedEvent` | ✅ |

### 2.2 Aggregate Root: `EnterpriseInvitationRoot`

**File**: `src/core/aggregate-roots/enterprise-invitation.aggregate.ts`

#### Properties (`EnterpriseInvitationProps`)

| Property | Type | Description |
|----------|------|-------------|
| `enterpriseId` | `string` | Target enterprise |
| `email` | `string` | Invited user's email |
| `mode` | `EEnterpriseMemberMode` | Intended member role |
| `inviterId` | `string` | User who sent the invitation |
| `status` | `EEnterpriseInvitationStatus` | `pending`, `accepted`, `expired`, `revoked` |
| `expiresAt` | `Date` | Expiration timestamp |
| `createdAt` / `updatedAt` | `Date` | Timestamps |

#### Factory Methods

| Method | Description |
|--------|-------------|
| `create(props, id?)` | Creates invitation in `PENDING` status with timestamps |
| `instantiate(id, props)` | Reconstitutes from persistence |

#### Domain Methods

| Method | Description | Raises Event |
|--------|-------------|-------------|
| `isExpired()` | Checks if `now > expiresAt` | — |
| `accept()` | Transitions to `ACCEPTED`; throws if expired | — |
| `revoke()` | Transitions to `REVOKED` | — |

### 2.3 Enums

#### `EEnterpriseInvitationStatus` (`src/core/enums/enterprise-invitation-status.enum.ts`)

| Member | Value | Description |
|--------|-------|-------------|
| `PENDING` | `'pending'` | Awaiting user action |
| `ACCEPTED` | `'accepted'` | User accepted the invitation |
| `EXPIRED` | `'expired'` | Invitation timed out |
| `REVOKED` | `'revoked'` | Inviter cancelled the invitation |

#### `EEnterpriseMemberMode` (`src/core/enums/enterprise-member-mode.enum.ts`)

| Member | Value | Description |
|--------|-------|-------------|
| `SUB_OWNER` | `'sub_owner'` | Elevated privileges (manage team, campaigns) |
| `USER` | `'user'` | Standard team member |

### 2.4 Domain Events

| Event | File | Trigger | Payload |
|-------|------|---------|---------|
| `UserAddedToEnterpriseEvent` | `src/core/events/user-added-to-enterprise.domain-event.ts` | `EnterpriseUserRoot.addEnterprise()` | `userId`, `userEmail`, `enterpriseId`, `enterpriseName?` |
| `UserRevokedFromEnterpriseEvent` | `src/core/events/user-revoked-from-enterprise.domain-event.ts` | `EnterpriseUserRoot.revokeEnterprise()` | `userId`, `userEmail`, `enterpriseId`, `enterpriseName?` |
| `EntityHardDeletedEvent` | `src/core/events/entity-hard-deleted.domain-event.ts` | `EnterpriseRoot.markForHardDelete()` | `entityId`, `targetType: ENTERPRISE` |

### 2.5 Domain Exceptions

| Exception | File | Trigger |
|-----------|------|---------|
| `EnterpriseNotFoundException` | `src/core/exceptions/enterprise.exception.ts` | Enterprise not found by ID |
| `EnterpriseConflictException` | `src/core/exceptions/enterprise.exception.ts` | Duplicate or conflict |
| `EnterpriseForbiddenException` | `src/core/exceptions/enterprise.exception.ts` | User not owner of enterprise |
| `InvalidOperationException` | `src/core/exceptions/general.exception.ts` | Invalid invitation status transitions |

---

## 3. State Machines

### 3.1 Enterprise Invitation Status

```
                    ┌───────────┐
                    │  PENDING  │
                    └───┬───┬───┘
                        │   │
              ┌─────────┘   └─────────┐
              │                       │
     accept() │              revoke() │
              ▼                       ▼
        ┌──────────┐           ┌──────────┐
        │ ACCEPTED │           │ REVOKED  │
        └──────────┘           └──────────┘

        (Automatic)
     PENDING ──────────► EXPIRED  (if isExpired() called)
```

#### Transition Table

| From | To | Method | Conditions |
|------|----|--------|------------|
| `PENDING` | `ACCEPTED` | `accept()` | Not expired |
| `PENDING` | `EXPIRED` | `accept()` (auto) | `isExpired()` returns true |
| `PENDING` | `REVOKED` | `revoke()` | Inviter action |

#### Guard Constraints

- `accept()` requires `status === PENDING` — throws `InvalidOperationException` otherwise
- `revoke()` requires `status === PENDING` — otherwise throws `InvalidOperationException`
- If invitation is expired, `accept()` transitions to `EXPIRED` and throws

### 3.2 Enterprise Lifecycle

```
                   ┌────────────┐
                   │   ACTIVE   │
                   └─────┬──────┘
                         │
                softDelete()    restore()
                         ▼             ▲
                   ┌──────────────┐    │
                   │ SOFT_DELETED │────┘
                   │ (deleteAt    │
                   │  set)        │
                   └──────────────┘

Hard delete allowed only when:
- Enterprise has no active campaigns
- Status is not COMPLETED/CANCELLED

---

## 4. Application Layer

### 4.1 Command Flow Architecture

```
Client Request (REST)
         │
         ▼
Controller.method()
  ├─ Zod DTO validation (nestjs-zod)
  └─ CommandBus.execute(new EnterpriseXxxCommand(dto))
         │
         ▼
CommandHandler.execute(command)
  ├─ this.uow.execute(async () => {
  │     const ent = await this.repo.findById(id);
  │     ent.someDomainMethod(params);
  │     await this.repo.save(ent);
  │     await this.eventService.publishEvents(ent);
  │   });
  └─ (within UoW, Outbox rows inserted atomically)
         │
         ▼
EventService.publishEvents()
  ├─ Maps DomainEvent → IntegrationEvent (via OutboxModel)
  └─ OutboxProcessor → RabbitMQ → downstream handlers
```

### 4.2 Enterprise Profile Commands

| Command | Handler | DTO | Description | UoW | Events |
|---------|---------|-----|-------------|-----|--------|
| `EnterpriseCreateCommand` | `EnterpriseCreateCommandHandler` | `EnterpriseCreateInputDto` | Creates enterprise; links user via `addEnterprise()` | ✅ | — |
| `EnterpriseUpdateCommand` | `EnterpriseUpdateCommandHandler` | `EnterpriseUpdateInputDto` | Updates profile fields + knowledge base | ✗ | — |
| `EnterpriseVerifyCommand` | `EnterpriseVerifyCommandHandler` | `EnterpriseVerifyInputDto` | Admin-only: marks enterprise as verified | ✗ | — |
| `EnterpriseSoftDeleteCommand` | `EnterpriseSoftDeleteCommandHandler` | `SoftDeleteInputDto` | Soft-deletes (guards: no active campaigns) | ✅ | — |
| `EnterpriseHardDeleteCommand` | `EnterpriseHardDeleteCommandHandler` | — | Permanently deletes + campaigns; raises `EntityHardDeletedEvent` | ✅ | ✅ |
| `EnterpriseRestoreCommand` | `EnterpriseRestoreCommandHandler` | — | Recovers soft-deleted enterprise | ✗ | — |

### 4.3 Enterprise Team & Invitation Commands

| Command | Handler | DTO | Description | UoW | Events |
|---------|---------|-----|-------------|-----|--------|
| `EnterpriseInviteMemberCommand` | `EnterpriseInviteMemberCommandHandler` | `EnterpriseInviteMemberInputDto` | Creates PENDING invitation; checks member existence | ✅ | — |
| `EnterpriseRevokeMemberCommand` | `EnterpriseRevokeMemberCommandHandler` | `EnterpriseRevokeMemberInputDto` | Removes member from enterprise + unlinks user | ✅ | — |
| `EnterpriseAcceptInvitationCommand` | `EnterpriseAcceptInvitationCommandHandler` | — | Accepts invitation → adds member + links user | ✅ | — |
| `EnterpriseRevokeInvitationCommand` | `EnterpriseRevokeInvitationCommandHandler` | — | Revokes PENDING invitation | ✅ | — |
| `EnterpriseChangeMemberModeCommand` | `EnterpriseChangeMemberModeCommandHandler` | `EnterpriseChangeMemberModeInputDto` | Owner-only: promote/demote member mode | ✅ | — |

### 4.4 Enterprise Queries

| Query | Handler | DTO | Description |
|-------|---------|-----|-------------|
| `EnterpriseGetListQuery` | `EnterpriseGetListHandler` | `EnterpriseFilterDto` | Cursor-paginated list |
| `EnterpriseGetByIdQuery` | `EnterpriseGetByIdHandler` | — | Single enterprise by ID |
| `EnterpriseGetMyListQuery` | `EnterpriseGetMyListHandler` | — | Enterprises where current user is member/owner |
| `EnterpriseGetMyInvitationsQuery` | `EnterpriseGetMyInvitationsHandler` | — | Pending invitations for current user |
| `EnterpriseGetInvitationsQuery` | `EnterpriseGetInvitationsHandler` | — | All invitations for an enterprise (owner/subs) |

### 4.5 Event Handlers

| Handler | Event | Description |
|---------|-------|-------------|
| `LinkEnterpriseLogoHandler` | `UploadedFileCreatedEvent` | Links uploaded file as enterprise logo (`logoUrlId`) |

### 4.6 Integration Events (Notification Events)

| Event | File | Trigger |
|-------|------|---------|
| `NotifyEnterpriseInvitationEvent` | `src/application/events/notify-enterprise-invitation-email.event.ts` | After invitation creation (RMQ consumer) |
| `NotifyEnterpriseRevocationEvent` | `src/application/events/notify-enterprise-revocation-email.event.ts` | After member revocation (RMQ consumer) |

### 4.7 Mappers

| Mapper | Source → Target | Notes |
|--------|----------------|-------|
| `EnterpriseMapper.toDto(root)` | `EnterpriseRoot` → `EnterpriseDto` | Maps all fields + nested members & knowledgeBase |
| `EnterpriseMapper.toListDto(roots)` | `EnterpriseRoot[]` → `EnterpriseDto[]` | Batch mapping |
| `EnterpriseInvitationMapper.toDto(root)` | `EnterpriseInvitationRoot` → `EnterpriseInvitationDto` | Maps invitation with status & dates |
| `EnterpriseInvitationMapper.toListDto(roots)` | `EnterpriseInvitationRoot[]` → `EnterpriseInvitationDto[]` | Batch mapping |

### 4.8 Read Service Interfaces

| Token | Interface | Methods |
|-------|-----------|---------|
| `ENTERPRISE_READ_SERVICE` | `IEnterpriseReadService` | `findAll(filters)`, `findById(id)`, `findByUserId(userId)`, `findMyList(userId)` |
| `ENTERPRISE_INVITATION_READ_SERVICE` | `IEnterpriseInvitationReadService` | `findById(id)`, `findByEnterpriseId(entId)`, `findMyInvitations(email)` |

### 4.9 DI Tokens

| Token | Interface |
|-------|-----------|
| `ENTERPRISE_REPOSITORY` | `IEnterpriseRepository` |
| `ENTERPRISE_INVITATION_REPOSITORY` | `IEnterpriseInvitationRepository` |
| `ENTERPRISE_READ_SERVICE` | `IEnterpriseReadService` |
| `ENTERPRISE_INVITATION_READ_SERVICE` | `IEnterpriseInvitationReadService` |

---

## 5. Infrastructure Layer

### 5.1 Mongoose Schemas

#### `EnterpriseModel` — collection: `enterprises`

**File**: `src/infrastructure/mongo/schemas/enterprise.schema.ts`

| Field | Type | Domain Property |
|-------|------|-----------------|
| `user_id` | `ObjectId` (ref: User, unique) | userId |
| `company_name` | `String` (1-200 chars) | companyName |
| `description` | `String` (max 2000) | description |
| `contact_email` | `String` (lowercase, email regex) | contactEmail |
| `contact_phone` | `String` (phone regex) | contactPhone.value |
| `website` | `String` (nullable) | website |
| `tax_id` | `String` (nullable) | taxId |
| `logo_url_id` | `ObjectId` (ref: UploadedFile, nullable) | logoUrlId |
| `is_verified` | `Boolean` (default: false) | isVerified |
| `members` | `[{ user_id, mode }]` | members[] |
| `knowledge_base` | `{ raw_text, external_links, updated_at }` (nullable) | knowledgeBase |
| `delete_at` / `delete_by` | `Date` / `String` (nullable) | deleteAt / deleteBy |

#### `EnterpriseInvitationModel` — collection: `enterprise_invitations`

**File**: `src/infrastructure/mongo/schemas/enterprise-invitation.schema.ts`

| Field | Type | Domain Property |
|-------|------|-----------------|
| `enterprise_id` | `ObjectId` (ref: Enterprise) | enterpriseId |
| `email` | `String` (lowercase, trimmed) | email |
| `mode` | `String` (enum: `EEnterpriseMemberMode`) | mode |
| `inviter_id` | `ObjectId` (ref: User) | inviterId |
| `status` | `String` (enum: `EEnterpriseInvitationStatus`, default: pending) | status |
| `expires_at` | `Date` | expiresAt |

### 5.2 Repositories

#### `MongoEnterpriseRepository`

**File**: `src/infrastructure/mongo/repositories/enterprise.repository.ts`
**Implements**: `IEnterpriseRepository`

| Method | Description |
|--------|-------------|
| `findById(id)` | Fetches enterprise by ID (with UoW session) |
| `findByUserId(userId)` | Fetches enterprise by owner user ID |
| `save(enterprise)` | Upsert: create or update by ID; invalidates cache |
| `saveMany(enterprises)` | Batch save |
| `delete(id)` | Hard-delete; invalidates cache |

**Cache**: Enterprise repository uses `CacheKeyUtil` for caching (invalidates on save/delete).

#### `MongoEnterpriseInvitationRepository`

**File**: `src/infrastructure/mongo/repositories/enterprise-invitation.repository.ts`
**Implements**: `IEnterpriseInvitationRepository`

| Method | Description |
|--------|-------------|
| `findById(id)` | Fetches invitation by ID |
| `findByEmailAndEnterpriseId(email, enterpriseId)` | Find invitation by email + enterprise |
| `findPendingByEmailAndEnterpriseId(email, enterpriseId)` | Find active pending invitation |
| `findByEnterpriseId(enterpriseId)` | All invitations for an enterprise |
| `save(invitation)` | Create or update invitation |
| `delete(id)` | Hard-delete |

### 5.3 Read Services

#### `MongoEnterpriseReadService`

**File**: `src/infrastructure/mongo/read-services/enterprise.read-service.ts`
**Implements**: `IEnterpriseReadService`

- `findById(id)` — Single enterprise with `user_id` + `logo_url_id` populated; cached
- `findByUserId(userId)` — Enterprise by owner; cached
- `findByUserIdOrMember(userId, filters)` — My enterprises (owned or member); cursor-paginated
- `findAll(filters)` — Cursor-paginated list with filters; cached

**Supported filters**: `companyName`, `contactEmail`, `taxId`, `isVerified`

#### `MongoEnterpriseInvitationReadService`

**File**: `src/infrastructure/mongo/read-services/enterprise-invitation.read-service.ts`
**Implements**: `IEnterpriseInvitationReadService`

- `findById(id)` — Single invitation
- `findAll(filters)` — Cursor-paginated with `isExpired` filter

### 5.4 Module Wiring

```typescript
@Module({
  imports: [CqrsModule, UploadedFileModule, UserModule],
  controllers: [EnterpriseAdminController, EnterpriseClientController],
  providers: [
    // 10 Command Handlers
    EnterpriseCreateCommandHandler,
    EnterpriseUpdateCommandHandler,
    EnterpriseSoftDeleteCommandHandler,
    EnterpriseHardDeleteCommandHandler,
    EnterpriseRestoreCommandHandler,
    EnterpriseInviteMemberCommandHandler,
    EnterpriseAcceptInvitationCommandHandler,
    EnterpriseRevokeMemberCommandHandler,
    EnterpriseRevokeInvitationCommandHandler,
    EnterpriseChangeMemberModeCommandHandler,
    // 5 Query Handlers
    EnterpriseGetByIdHandler,
    EnterpriseGetListHandler,
    EnterpriseGetInvitationsQueryHandler,
    EnterpriseGetMyListHandler,
    EnterpriseGetMyInvitationsQueryHandler,
    // 1 Event Handler
    LinkEnterpriseLogoHandler,
    // RMQ Controller
    EnterpriseUserRmqController,
  ],
  exports: [],
})
export class EnterpriseModule {}
```

### 5.5 GraphQL Type

**File**: `src/infrastructure/graphql/types/enterprise.type.ts`

---

## 6. Presentation Layer

### 6.1 REST Endpoints

#### Enterprise Client Controller (`EnterpriseClientController`)
**Path**: `/v1/client/enterprises`
**Guard Stack**: 🔒 `JwtAuthGuard` → `RolesGuard(Enterprise)` → `UserVerifiedGuard`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/` | 🔒 Enterprise | Create new enterprise profile |
| `PATCH` | `/:id` | 🔒 Owner/Sub | Update enterprise profile |
| `GET` | `me` | 🔒 Enterprise | My enterprises (owned or member) |
| `GET` | `invitations/me` | 🔒 Enterprise | My pending invitations |
| `GET` | `/:id` | 🔒 Enterprise | Get enterprise by ID |
| `POST` | `/:id/invitations` | 🔒 Owner/Sub | Invite a user to enterprise |
| `POST` | `/:id/invitations/:invId/accept` | 🔒 Enterprise | Accept an invitation |
| `DELETE` | `/:id/invitations/:invId` | 🔒 Owner/Sub | Revoke a pending invitation |
| `DELETE` | `/:id/members` | 🔒 Owner/Sub | Revoke a member (post-acceptance) |
| `PATCH` | `/:id/members/mode` | 🔒 Owner | Change member role (promote/demote) |

#### Enterprise Admin Controller (`EnterpriseAdminController`)
**Path**: `/v1/admin/enterprises`
**Guard Stack**: 🔒 `JwtAuthGuard` → `RolesGuard(ADMIN)`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/` | Create enterprise profile |
| `PATCH` | `/:id` | Update enterprise profile |
| `GET` | `/` | List all enterprises |
| `GET` | `/:id` | Get enterprise by ID |
| `PATCH` | `/:id/soft-delete` | Soft-delete enterprise |
| `PATCH` | `/:id/restore` | Restore soft-deleted |

#### RMQ Controller (`EnterpriseUserRmqController`)
**File**: `src/presentation/controllers/rmq/enterprise-user.rmq.controller.ts`

| Queue | Pattern | Handler |
|-------|---------|---------|
| `enterprise_user_queue` | `enterprise.user.added` | `handleUserAdded()` — Sends notification |
| `enterprise_user_queue` | `enterprise.user.revoked` | `handleUserRevoked()` — Sends notification |

### 6.2 Guard Stack Reference

- `JwtAuthGuard` — Parses JWT from `Authorization: Bearer` header
- `RolesGuard(ERoleType.ENTERPRISE)` — Restricts to enterprise users
- `RolesGuard(ERoleType.ADMIN)` — Restricts to admin users
- `UserVerifiedGuard` — Blocks unverified emails

**Authorization hierarchy within enterprise**:
- **Owner** (`isOwner`): Full access — create, update, invite/revoke members, change member modes, soft/hard delete
- **Sub-Owner** (`isSubOwner`): Can update profile, invite/revoke members (but not owner or other sub-owners)
- **User** (`isMember`): Read-only access

---

## 7. Workflow Flows

### 7.1 Create Enterprise

```
Client              EnterpriseClientController        EnterpriseCreateHandler          UserRepo    EnterpriseRepo
  │                         │                              │                           │               │
  │ POST /v1/client/        │                              │                           │               │
  │ enterprises             │                              │                           │               │
  │ { companyName,          │                              │                           │               │
  │   contactEmail, ... }   │                              │                           │               │
  │─────▶                   │                              │                           │               │
  │                         │ CommandBus                   │                           │               │
  │                         │─────▶────────────────────────▶                           │               │
  │                         │                              │                           │               │
  │                         │                              │ uow.execute()              │               │
  │                         │                              │─────▶                     │               │
  │                         │                              │                           │               │
  │                         │                              │ findById(userId)           │               │
  │                         │                              │───────────────────────────▶│               │
  │                         │                              │◀───────────────────────────│               │
  │                         │                              │                           │               │
  │                         │                              │ ★ Check EnterpriseUserRoot │               │
  │                         │                              │ ★ Check no existing ent    │               │
  │                         │                              │                           │               │
  │                         │                              │ EnterpriseRoot.create()    │               │
  │                         │                              │ repo.save(enterprise)      │               │
  │                         │                              │────────────────────────────│──────────────▶│
  │                         │                              │                           │               │
  │                         │                              │ user.addEnterprise(id)     │               │
  │                         │                              │ repo.save(user)            │               │
  │                         │                              │───────────────────────────▶│               │
  │                         │                              │                           │               │
  │  EnterpriseDto          │                              │                           │               │
  │◀────────────────────────│◀─────────────────────────────│◀──────────────────────────│◀──────────────│
```

**Steps**:

1. **Enterprise user submits form** — `POST /v1/client/enterprises` with `companyName`, `contactEmail`, etc.
2. **Guard**: 🔒 `JwtAuthGuard` → `RolesGuard(ENTERPRISE)` → `UserVerifiedGuard`
3. **Handler executes within UoW** — `EnterpriseCreateCommandHandler.execute()`
4. **User validation** — Checks user exists and is `EnterpriseUserRoot`
5. **Duplicate check** — `findByUserId()` — throws `EnterpriseConflictException` if exists
6. **Aggregate creation** — `EnterpriseRoot.create()` with `isVerified: false`, empty members
7. **Persistence** — `EnterpriseRepository.save()` → Mongoose insert
8. **User link** — `user.addEnterprise(enterprise.id)` links enterprise ID to user's `enterpriseIds[]`
9. **Response** — Returns `EnterpriseDto`

### 7.2 Invite Member → Accept Invitation

```
Client              EnterpriseClientController        Enterprise Invite/Accept Handlers      EnterpriseRepo
  │                         │                              │                                   │
  │ POST :id/invitations    │                              │                                   │
  │ { email, mode }         │                              │                                   │
  │─────▶                   │                              │                                   │
  │                         │ InviteMemberHandler          │                                   │
  │                         │─────▶                        │                                   │
  │                         │                              │ ★ isOwner / isSubOwner check      │
  │                         │                              │ ★ findByEmail(existing user)      │
  │                         │                              │ ★ EnterpriseUserRoot check         │
  │                         │                              │ ★ isMember check                   │
  │                         │                              │ ★ findPendingInvitation check      │
  │                         │                              │                                   │
  │                         │                              │ EnterpriseInvitationRoot.create()  │
  │                         │                              │   (status: PENDING, expires: 7d)  │
  │                         │                              │ repo.save(invitation)              │
  │                         │                              │───────────────────────────────────▶│
  │                         │                              │                                   │
  │  EnterpriseInvitationDto│                              │                                   │
  │◀────────────────────────│◀─────────────────────────────│◀──────────────────────────────────│
  │                         │                              │                                   │
  │ (User accepts via       │                              │                                   │
  │  POST .../invId/accept) │                              │                                   │
  │─────▶                   │                              │                                   │
  │                         │ AcceptInvitationHandler      │                                   │
  │                         │─────▶                        │                                   │
  │                         │                              │ ★ Check invitation exists         │
  │                         │                              │ ★ Check email matches             │
  │                         │                              │ ★ Check EnterpriseUserRoot        │
  │                         │                              │                                   │
  │                         │                              │ invitation.accept()                │
  │                         │                              │   → ACCEPTED                      │
  │                         │                              │ enterprise.addMember(userId,mode) │
  │                         │                              │ user.addEnterprise(entId)          │
  │                         │                              │                                   │
  │                         │                              │ repo.save(all three aggregates)    │
  │  { success: true }      │                              │                                   │
  │◀────────────────────────│◀─────────────────────────────│◀──────────────────────────────────│
```

**Steps**:

1. **Owner/Sub-Owner invites** — `POST /v1/client/enterprises/:id/invitations` with `email` and `mode`
2. **Authorization** — `isOwner()` or `isSubOwner()` must be true
3. **Validation chain** —
   - Target email must belong to an existing user
   - Target user must be `EnterpriseUserRoot`
   - Target user must not already be a member or owner
   - No pending invitation already exists
4. **Invitation created** — `EnterpriseInvitationRoot.create()` with 7-day expiry, status `PENDING`
5. **User accepts** — `POST /v1/client/enterprises/:id/invitations/:invId/accept`
6. **Acceptance validation** — Check invitation exists, email matches, user is `EnterpriseUserRoot`
7. **State transition** — `invitation.accept()` → `ACCEPTED`; expires if past deadline
8. **Aggregate updates** — Enterprise adds member; user links enterprise ID
9. **Persistence** — All 3 aggregates saved within UoW

---

## 8. File Map

### Core (Domain) Layer

| File | Type | Role |
|------|------|------|
| `src/core/aggregate-roots/enterprise.aggregate.ts` | Aggregate Root | Enterprise profile & team management |
| `src/core/aggregate-roots/enterprise-invitation.aggregate.ts` | Aggregate Root | Invitation lifecycle |
| `src/core/aggregate-roots/enterprise-user.aggregate.ts` | Aggregate Root | Enterprise user (links to enterprises) |
| `src/core/enums/enterprise-invitation-status.enum.ts` | Enum | PENDING, ACCEPTED, EXPIRED, REVOKED |
| `src/core/enums/enterprise-member-mode.enum.ts` | Enum | SUB_OWNER, USER |
| `src/core/events/user-added-to-enterprise.domain-event.ts` | Domain Event | Raised on enterprise link |
| `src/core/events/user-revoked-from-enterprise.domain-event.ts` | Domain Event | Raised on enterprise unlink |
| `src/core/exceptions/enterprise.exception.ts` | Exception | Not found, conflict, forbidden |
| `src/core/interfaces/repositories/enterprise.repository.ts` | Port | Enterprise repository interface |
| `src/core/interfaces/repositories/enterprise-invitation.repository.ts` | Port | Invitation repository interface |

### Application Layer

| File | Type | Role |
|------|------|------|
| `src/application/commands/enterprise-create/` | Command | Create enterprise |
| `src/application/commands/enterprise-update/` | Command | Update profile |
| `src/application/commands/enterprise-verify/` | Command | Admin verification |
| `src/application/commands/enterprise-soft-delete/` | Command | Soft delete |
| `src/application/commands/enterprise-hard-delete/` | Command | Hard delete |
| `src/application/commands/enterprise-restore/` | Command | Restore |
| `src/application/commands/enterprise-invite-member/` | Command | Invite member |
| `src/application/commands/enterprise-revoke-member/` | Command | Revoke member |
| `src/application/commands/enterprise-accept-invitation/` | Command | Accept invitation |
| `src/application/commands/enterprise-revoke-invitation/` | Command | Revoke invitation |
| `src/application/commands/enterprise-change-member-mode/` | Command | Change member mode |
| `src/application/queries/enterprise-get-list/` | Query | List enterprises |
| `src/application/queries/enterprise-get-by-id/` | Query | Get by ID |
| `src/application/queries/enterprise-get-my-list/` | Query | My enterprises |
| `src/application/queries/enterprise-get-my-invitations/` | Query | My invitations |
| `src/application/queries/enterprise-get-invitations/` | Query | Enterprise invitations |
| `src/application/mappers/enterprise.mapper.ts` | Mapper | Aggregate → DTO |
| `src/application/mappers/enterprise-invitation.mapper.ts` | Mapper | Aggregate → DTO |
| `src/application/dtos/enterprise.dto.ts` | DTO | Enterprise data structure |
| `src/application/dtos/enterprise-invitation.dto.ts` | DTO | Invitation data structure |
| `src/application/events/uploaded-file-created/link-enterprise-logo.handler.ts` | Event Handler | Link logo file |
| `src/application/events/notify-enterprise-invitation-email.event.ts` | Integration Event | Invitation notification |
| `src/application/events/notify-enterprise-revocation-email.event.ts` | Integration Event | Revocation notification |

### Infrastructure Layer

| File | Type | Role |
|------|------|------|
| `src/infrastructure/mongo/schemas/enterprise.schema.ts` | Schema | Enterprise Mongoose schema |
| `src/infrastructure/mongo/schemas/enterprise-invitation.schema.ts` | Schema | Invitation Mongoose schema |
| `src/infrastructure/mongo/repositories/enterprise.repository.ts` | Repository | Enterprise persistence |
| `src/infrastructure/mongo/repositories/enterprise-invitation.repository.ts` | Repository | Invitation persistence |
| `src/infrastructure/mongo/read-services/enterprise.read-service.ts` | Read Service | Enterprise read queries |
| `src/infrastructure/mongo/read-services/enterprise-invitation.read-service.ts` | Read Service | Invitation read queries |
| `src/infrastructure/modules/enterprise.module.ts` | Module | NestJS wiring |
| `src/infrastructure/graphql/types/enterprise.type.ts` | GraphQL Type | Enterprise GraphQL schema |

### Presentation Layer

| File | Type | Role |
|------|------|------|
| `src/presentation/controllers/http/client/enterprise.controller.ts` | Controller | Enterprise client endpoints |
| `src/presentation/controllers/http/admin/enterprise.controller.ts` | Controller | Enterprise admin endpoints |
| `src/presentation/controllers/rmq/enterprise-user.rmq.controller.ts` | Controller | Enterprise RMQ notification handlers |

---

## 9. Key Invariants (Non-Negotiable Business Rules)

1. **Owner uniqueness**: Each enterprise has exactly one owner (`userId`). A user can only own one enterprise profile.
2. **Member deduplication**: `addMember()` silently skips if the user is already a member. `isMember()` checks both owner and members.
3. **Owner immutability**: Owner cannot be removed or have their mode changed. Owner cannot be added as a member via `addMember()`.
4. **Sub-owner hierarchical guard**: Sub-owners cannot revoke the owner or other sub-owners. Only the owner can promote/demote sub-owners.
5. **Invitation state machine**: `accept()` and `revoke()` both require `status === PENDING`. Expired invitations auto-transition on `accept()`.
6. **Invitation expiry**: Invitations expire after 7 days. `isExpired()` checks `now > expiresAt`.
7. **Email match on accept**: Accepting user's email must match the invitation's email exactly (case-insensitive).
8. **Enterprise user type required**: Only `EnterpriseUserRoot` users can create/link to enterprises.
9. **Active campaigns guard**: Enterprises with active campaigns cannot be soft-deleted or hard-deleted.
10. **Soft-delete non-destructive**: Standard delete path is soft-delete (sets `deleteAt`/`deleteBy`). Hard delete is a separate, guarded operation.
11. **Cache invalidation on mutation**: Enterprise repository invalidates cache on save/delete operations.

---

## Cross-Domain References

- **Auth/User**: `EnterpriseUserRoot.enterpriseIds[]` links users back to their enterprises
- **Campaign**: `campaign.enterpriseId` references the enterprise; `hasActiveCampaigns()` guards deletion
- **Role**: User roles determine enterprise access (`ERoleType.ENTERPRISE`)
- **Subscription**: Enterprise subscription plans manage feature permissions & quota
- **UploadedFile**: Enterprise logos via `link-enterprise-logo.handler.ts`

