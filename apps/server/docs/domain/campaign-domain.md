# Campaign & Campaign Participant Domain

> **Last Updated**: 2026-07-17
> **Related Docs**: [`docs/domain/campaign-proposal-and-review.md`](./campaign-proposal-and-review.md), [`docs/domain/kpi-tracking.md`](./kpi-tracking.md)

---

## 1. Domain Overview

The **Campaign** domain is the core orchestration layer connecting **Enterprises** (brands/advertisers) with **KOLs/KOCs** (content creators). It manages the full lifecycle of a marketing collaboration — from drafting campaign briefs, recruiting KOLs, tracking deliverables, to measuring performance.

### Bounded Context

```
┌─────────────────────────────────────────────────────────┐
│                   Campaign Context                       │
│                                                          │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │Enterprise│───▶│   Campaign   │───▶│    KOL/KOC    │  │
│  │ (Owner)  │    │   (Root)     │    │ (Participant) │  │
│  └──────────┘    │              │    └───────────────┘  │
│                  │  ┌──────────┐│                        │
│  ┌──────────┐    │  │Schedule  ││    ┌───────────────┐  │
│  │Collabo-  │───▶│  │(Timeline)││───▶│ ScheduledPost │  │
│  │rators    │    │  └──────────┘│    │ (External)    │  │
│  └──────────┘    └──────────────┘    └───────────────┘  │
│                                                          │
│  ┌──────────────┐      ┌──────────────────┐             │
│  │  KPI Log     │◀─────│  KOL/Enterprise  │             │
│  │ (Tracking)   │      │  Outputs          │             │
│  └──────────────┘      └──────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

### Key Concepts

| Concept | Description |
|---------|-------------|
| **CampaignRoot** | Aggregate root — owns participants, schedule, collaborators |
| **CampaignParticipantEntity** | A KOL's participation record (status, joined date) |
| **CampaignKOLOutputEntity** | A KOL's deliverable (video, post, blog) |
| **CampaignEnterpriseOutputEntity** | Enterprise's own deliverable within a campaign |
| **CampaignSchedule** | Timeline structure with days referencing `ScheduledPost` IDs |
| **Extras** | Flexible `JsonObject` field on campaign & platform targets for FE customization |

---

## 2. Core Layer

### 2.1 Aggregate Root: `CampaignRoot`

**File**: `src/core/aggregate-roots/campaign.aggregate.ts`

#### Properties (`CampaignProps`)

| Property | Type | Description |
|----------|------|-------------|
| `ownerId` | `string` | User ID of the campaign owner |
| `enterpriseId` | `string` | Enterprise ID this campaign belongs to |
| `budget` | `number` | Allocated campaign budget |
| `financialTarget` | `JsonObject` | Target metrics (conversions, CTR, etc.) |
| `description` | `string` | Campaign brief / description |
| `platformTarget` | `PlatformTargetItem[]` | Target platform criteria |
| `extras` | `JsonObject` (optional) | Flexible config for FE customization |
| `status` | `ECampaignStatus` | Current lifecycle status |
| `collaboratorIds` | `string[]` | User IDs of collaborators |
| `rawContents` | `RawContentItem[]` | Uploaded brief documents |
| `schedule` | `CampaignSchedule` (optional) | Timeline linking to `ScheduledPost` IDs |
| `participants` | `CampaignParticipantEntity[]` | KOL participants |
| `deleteAt` | `Nullable<Date>` | Soft-delete timestamp |
| `deleteBy` | `Nullable<string>` | Soft-delete actor |
| `createdAt` / `updatedAt` | `Date` | Timestamps |

#### Factory Methods

```typescript
static create(props: CampaignCreateProps): CampaignRoot
```
- Creates a new campaign in `DRAFT` status
- Initializes empty `participants`, `collaboratorIds`
- Sets timestamps to `now()`

```typescript
static instantiate(id: string, props: CampaignProps): CampaignRoot
```
- Reconstitutes from persistence (no invariant checks)

#### Domain Methods

| Method | Description | Raises Event |
|--------|-------------|-------------|
| `update(props)` | Updates draft properties | — |
| `updateStatus(status)` | Transitions campaign status | — |
| `softDelete(deletedBy)` | Soft-deletes (guards: no active participants) | — |
| `restore()` | Recovers soft-deleted campaign | — |
| `inviteCollaborator(userId, requestedBy)` | Adds collaborator (owner-only) | — |
| `revokeCollaborator(userId, requestedBy)` | Removes collaborator (owner-only) | — |
| `updateSchedule(schedule)` | Replaces schedule timeline | — |
| `addParticipant(kolProfileId)` | Registers a new KOL participant | `CampaignParticipantCreatedEvent` |
| `joinParticipant(kolProfileId)` | Approves KOL → JOINED | — |
| `rejectParticipant(kolProfileId)` | Rejects KOL | — |
| `completeParticipant(kolProfileId)` | Marks KOL as COMPLETED | — |
| `removeParticipant(participantId)` | Hard-removes REJECTED participant | — |
| `restoreParticipant(participantId)` | Recovers soft-deleted participant | — |
| `softDeleteParticipant(participantId, deletedBy)` | Soft-deletes participant | — |

### 2.2 Entity: `CampaignParticipantEntity`

**File**: `src/core/entities/campaign-participant.entity.ts`

**Parent Aggregate**: `CampaignRoot`

| Property | Type | Description |
|----------|------|-------------|
| `kolProfileId` | `string` | Linked KOL profile ID |
| `status` | `EParticipantStatus` | Current status |
| `joinedAt` | `Nullable<Date>` | When KOL joined |
| `deleteAt` / `deleteBy` | `Nullable<Date>` / `Nullable<string>` | Soft-delete metadata |
| `createdAt` / `updatedAt` | `Date` | Timestamps |

**Domain Methods**: `join()`, `reject()`, `complete()`, `updateStatus()`, `softDelete()`, `restore()`

### 2.3 Entity: `CampaignKOLOutputEntity`

**File**: `src/core/entities/campaign-kol-output.entity.ts`

**Parent Aggregate**: `CampaignRoot` (via `ScheduleDay.posts` referencing `ScheduledPost`)

| Property | Type | Description |
|----------|------|-------------|
| `campaignParticipantId` | `string` | Owning participant |
| `platformId` | `string` | Target platform |
| `uniqueId` | `Nullable<string>` | Platform analytics ID |
| `outputType` | `EOutputType` | `video`, `short_video`, `post`, `blog` |
| `title` | `string` | Deliverable title |
| `isScheduleForPost` | `boolean` | Whether auto-scheduled |
| `scheduledAt` | `Nullable<Date>` | Scheduled publish time |
| `fileId` | `Nullable<string>` | Uploaded file ID |
| `status` | `EOutputStatus` | `draft`, `scheduled`, `published`, `failed` |
| `url` | `Nullable<string>` | Published URL |
| `postedAt` | `Nullable<Date>` | Publish timestamp |
| `isTrackingActive` | `boolean` | KPI tracking enabled |

**Domain Methods**: `setFileId()`, `publish(url)`, `updateTrackingStatus()`, `update(props)`

### 2.4 Entity: `CampaignEnterpriseOutputEntity`

**File**: `src/core/entities/campaign-enterprise-output.entity.ts`

**Parent Aggregate**: `CampaignRoot`

Same structure as `CampaignKOLOutputEntity` but without `campaignParticipantId` (enterprise-owned). Methods: `setFileId()`, `publish(url)`, `updateTrackingStatus()`, `update(props)`.

### 2.5 Supporting Interfaces

| Interface | File | Description |
|-----------|------|-------------|
| `PlatformTargetItem` | `campaign.aggregate.ts` | Platform + follower range + extras |
| `RawContentItem` | `campaign.aggregate.ts` | Uploaded brief doc reference |
| `ScheduleDay` | `campaign.aggregate.ts` | A day in the schedule timeline |
| `CampaignSchedule` | `campaign.aggregate.ts` | Timeline array |

### 2.6 Enums

#### `ECampaignStatus` (`src/core/enums/campaign-status.enum.ts`)

| Member | Value | Description |
|--------|-------|-------------|
| `DRAFT` | `'draft'` | Initial state, editable |
| `FINDING_KOL` | `'finding_kol'` | Recruiting KOLs |
| `IN_PROGRESS` | `'in_progress'` | Campaign execution |
| `COMPLETED` | `'completed'` | Successfully finished |
| `CANCELLED` | `'cancelled'` | Aborted before/in recruitment |

#### `EParticipantStatus` (`src/core/enums/campaign-participant.enums.ts`)

| Member | Value | Description |
|--------|-------|-------------|
| `PENDING_APPROVAL` | `'pending_approval'` | KOL applied / was invited |
| `JOINED` | `'joined'` | Approved and participating |
| `COMPLETED` | `'completed'` | Finished deliverables |
| `REJECTED` | `'rejected'` | Denied or removed |

#### `EOutputStatus` (`src/core/enums/campaign-participant.enums.ts`)

`DRAFT` → `SCHEDULED` → `PUBLISHED` | `FAILED`

#### `EOutputType` (`src/core/enums/campaign-participant.enums.ts`)

`VIDEO`, `SHORT_VIDEO`, `POST`, `BLOG`

### 2.7 Domain Events

| Event | File | Trigger | Payload |
|-------|------|---------|---------|
| `CampaignParticipantCreatedEvent` | `src/core/events/campaign-participant-created.domain-event.ts` | `CampaignRoot.addParticipant()` | `campaignParticipantId`, `campaignId`, `kolProfileId`, `kolEmail?`, `campaignName?` |

### 2.8 Domain Exceptions

| Exception | File | Trigger |
|-----------|------|---------|
| `CampaignNotFoundException` | `src/core/exceptions/campaign.exception.ts` | Campaign not found by ID |
| `CampaignForbiddenException` | `src/core/exceptions/campaign.exception.ts` | User lacks permission |
| `InvalidOperationException` | `src/core/exceptions/general.exception.ts` | Invalid state transitions, duplicates, etc. |
| `CampaignParticipantNotFoundException` | `src/core/exceptions/general.exception.ts` | Participant not found |

---

## 3. State Machines

### 3.1 Campaign Status

```
                    ┌──────────────────────────────────────────────┐
                    │                                              │
                    ▼                                              │
              ┌──────────┐    activate()    ┌──────────────┐      │
              │  DRAFT   │──────────────────▶│ FINDING_KOL  │      │
              └────┬─────┘                  └──────┬────────┘      │
                   │                               │               │
           cancel()│                      start()  │               │
                   ▼                               ▼               │
              ┌──────────┐                ┌──────────────┐         │
              │CANCELLED │                │ IN_PROGRESS  │         │
              └──────────┘                └──────┬────────┘         │
                                                 │                  │
                                        complete()│                 │
                                                 ▼                  │
                                            ┌──────────┐            │
                                            │COMPLETED │            │
                                            └──────────┘            │
                                                                     │
              (DRAFT or FINDING_KOL → CANCELLED) ────────────────────┘
```

#### Transition Table

| From | To | Method | Conditions |
|------|----|--------|------------|
| `DRAFT` | `FINDING_KOL` | `updateStatus()` | None |
| `DRAFT` | `CANCELLED` | `updateStatus()` | None |
| `FINDING_KOL` | `IN_PROGRESS` | `updateStatus()` | None |
| `FINDING_KOL` | `CANCELLED` | `updateStatus()` | None |
| `IN_PROGRESS` | `COMPLETED` | `updateStatus()` | None |

#### Guard Constraints (Soft Delete)

- `softDelete()` only allowed if no participants have `JOINED` or `COMPLETED` status
- `hardDelete()` only allowed in `DRAFT` or `CANCELLED` status

### 3.2 Participant Status

```
               ┌──────────────────┐
               │ PENDING_APPROVAL │
               └───┬──────────┬───┘
                   │          │
           join()  │          │  reject()
                   ▼          ▼
              ┌────────┐ ┌──────────┐
              │ JOINED │ │ REJECTED │
              └────┬───┘ └──────────┘
                   │
          complete()│
                   ▼
              ┌───────────┐
              │ COMPLETED │
              └───────────┘
```

#### Transition Table

| From | To | Method | Conditions |
|------|----|--------|------------|
| `PENDING_APPROVAL` | `JOINED` | `join()` | Called by enterprise/KOL |
| `PENDING_APPROVAL` | `REJECTED` | `reject()` | Called by enterprise |
| `JOINED` | `COMPLETED` | `complete()` | All deliverables done |
| `JOINED` | `REJECTED` | `reject()` | Called by enterprise |
| `REJECTED` | removed | `removeParticipant()` | Hard delete from list |

---

## 4. Application Layer

### 4.1 Command Flow Architecture

```
Client Request (REST / GraphQL)
         │
         ▼
Controller.method()
  ├─ Zod DTO validation (nestjs-zod)
  └─ CommandBus.execute(new XxxCommand(dto))
         │
         ▼
CommandHandler.execute(command)
  ├─ this.uow.execute(async () => {
  │     const campaign = await this.repo.findById(id);
  │     campaign.someDomainMethod(params);
  │     await this.repo.save(campaign);
  │     await this.eventService.publishEvents(campaign);
  │   });
  └─ (within UoW, Outbox rows inserted atomically)
         │
         ▼
EventService.publishEvents()
  ├─ Maps DomainEvent → IntegrationEvent (via OutboxModel)
  └─ OutboxProcessor → RabbitMQ → downstream handlers
```

### 4.2 Campaign Commands

| Command | Handler | DTO | Description | UoW | Events |
|---------|---------|-----|-------------|-----|--------|
| `CampaignCreateCommand` | `CampaignCreateCommandHandler` | `CampaignCreateInputDto` | Creates campaign in DRAFT | ✗ | — |
| `CampaignUpdateCommand` | `CampaignUpdateCommandHandler` | `CampaignUpdateInputDto` | Updates draft campaign | ✗ | — |
| `CampaignUpdateStatusCommand` | `CampaignUpdateStatusCommandHandler` | `CampaignUpdateStatusInputDto` | Transitions status | ✗ | — |
| `CampaignSoftDeleteCommand` | `CampaignSoftDeleteCommandHandler` | `SoftDeleteInputDto` | Soft-deletes (DRAFT/CANCELLED only) | ✗ | — |
| `CampaignRestoreCommand` | `CampaignRestoreCommandHandler` | — | Recovers soft-deleted | ✗ | — |
| `CampaignHardDeleteCommand` | `CampaignHardDeleteCommandHandler` | — | Permanently deletes | ✗ | — |
| `CampaignInviteCollaboratorCommand` | `CampaignInviteCollaboratorCommandHandler` | `CampaignInviteCollaboratorInputDto` | Invites collaborators + sends email | ✅ | — |
| `CampaignRevokeCollaboratorCommand` | `CampaignRevokeCollaboratorCommandHandler` | `CampaignRevokeCollaboratorInputDto` | Revokes collaborators + sends email | ✅ | — |

### 4.3 Campaign Participant Commands

| Command | Handler | DTO | Description | UoW | Events |
|---------|---------|-----|-------------|-----|--------|
| `CampaignParticipantCreateCommand` | `CampaignParticipantCreateCommandHandler` | `CampaignParticipantCreateInputDto` | Registers KOL participant | ✅ | ✅ |
| `CampaignParticipantUpdateCommand` | `CampaignParticipantUpdateCommandHandler` | `CampaignParticipantUpdateInputDto` | Updates status | ✗ | — |
| `CampaignParticipantUpdateStatusCommand` | `CampaignParticipantUpdateStatusCommandHandler` | `CampaignParticipantUpdateStatusInputDto` | KOL self-join/reject | ✗ | — |
| `CampaignParticipantSoftDeleteCommand` | `CampaignParticipantSoftDeleteCommandHandler` | `SoftDeleteInputDto` | Soft-deletes participant | ✗ | — |
| `CampaignParticipantRestoreCommand` | `CampaignParticipantRestoreCommandHandler` | — | Restores participant | ✗ | — |
| `CampaignParticipantHardDeleteCommand` | `CampaignParticipantHardDeleteCommandHandler` | — | Permanently removes (REJECTED only) | ✗ | — |

### 4.4 Campaign Queries

| Query | Handler | DTO | Description |
|-------|---------|-----|-------------|
| `CampaignGetListQuery` | `CampaignGetListHandler` | `CampaignFilterDto` | Cursor-paginated list with optional projectable fields |
| `CampaignGetByIdQuery` | `CampaignGetByIdHandler` | — | Fetch single campaign with projectable fields |

### 4.5 Participant Queries

| Query | Handler | DTO | Description |
|-------|---------|-----|-------------|
| `CampaignParticipantGetListQuery` | `CampaignParticipantGetListQueryHandler` | `CampaignParticipantFilterDto` | Cursor-paginated list (aggregation pipeline) |
| `CampaignParticipantGetByIdQuery` | `CampaignParticipantGetByIdQueryHandler` | — | Single participant with KOL profile & outputs |

### 4.6 Event Handlers

| Handler | Event | Description |
|---------|-------|-------------|
| `LinkCampaignRawHandler` | `UploadedFileCreatedEvent` | Links uploaded file to campaign rawContents |
| `LinkCampaignParticipantOutputFileHandler` | `UploadedFileCreatedEvent` | (Disabled — schedule posts are now ScheduledPost IDs) |
| `NotifyKolCampaignInvitationHandler` | *Integration Event* | Sends KOL campaign invitation notification via Notification domain |

### 4.7 Mappers

| Mapper | Source → Target | Notes |
|--------|----------------|-------|
| `CampaignMapper.toDto(root)` | `CampaignRoot` → `CampaignDto` | Maps full aggregate to DTO |
| `CampaignMapper.toListDto(roots)` | `CampaignRoot[]` → `CampaignDto[]` | Batch mapping |
| `CampaignParticipantMapper.toDto(root)` | `CampaignParticipantEntity` → `CampaignParticipantDto` | Participant without campaign context |
| `CampaignParticipantMapper.toListDto(roots)` | `CampaignParticipantEntity[]` → `CampaignParticipantDto[]` | Batch mapping |

### 4.8 Read Service Interfaces

| Token | Interface | Methods |
|-------|-----------|---------|
| `CAMPAIGN_READ_SERVICE` | `ICampaignReadService` | `findAll(filters, projection)`, `findById(id, projection)` |
| `CAMPAIGN_PARTICIPANT_READ_SERVICE` | `ICampaignParticipantReadService` | `findAll(filters, projection)`, `findById(id, projection)` |

---

## 5. Infrastructure Layer

### 5.1 Mongoose Schema: `CampaignModel`

**File**: `src/infrastructure/mongo/schemas/campaign.schema.ts`

**Collection**: `campaigns`

| Document Field | Mongoose Type | Domain Property |
|---------------|--------------|-----------------|
| `_id` | `ObjectId` | id |
| `owner_id` | `ObjectId` (ref: User) | ownerId |
| `enterprise_id` | `ObjectId` (ref: Enterprise) | enterpriseId |
| `budget` | `Number` | budget |
| `financial_target` | `Map` | financialTarget |
| `description` | `String` | description |
| `platform_target` | `[PlatformTargetItemModel]` | platformTarget |
| `extras` | `Map` (optional) | extras |
| `status` | `String` (enum) | status |
| `collaborator_ids` | `[String]` | collaboratorIds |
| `raw_contents` | `[RawContentItemModel]` | rawContents |
| `participants` | `[CampaignParticipantSubSchema]` | participants |
| `schedule` | `CampaignScheduleSchema` (optional) | schedule |
| `delete_at` | `Date` | deleteAt |
| `delete_by` | `String` | deleteBy |
| `created_at` / `updated_at` | `Date` | createdAt / updatedAt |

#### Sub-Schemas

**`CampaignParticipantSubModel`**: `kol_profile_id`, `status`, `joined_at`, `delete_at`, `delete_by`, timestamps

**`PlatformTargetItemModel`**: `platformId`, `minFollowers`, `maxFollowers`, `note`, `extras`

**`RawContentItemModel`**: `fileId`, `rawContent`

**`ScheduleDayModel`**: `date`, `label`, `posts` (ObjectId[] → ScheduledPost references)

**`CampaignScheduleModel`**: `timeline` (ScheduleDayModel[]), timestamps

### 5.2 Repository: `MongoCampaignRepository`

**File**: `src/infrastructure/mongo/repositories/campaign.repository.ts`

**Implements**: `ICampaignRepository`

| Method | Description |
|--------|-------------|
| `findById(id)` | Fetches single campaign by ID (with UoW session) |
| `findByEnterpriseId(enterpriseId)` | All campaigns for an enterprise |
| `findByParticipantId(participantId)` | Campaign containing a specific participant |
| `findByOutputId(outputId)` | Campaign containing a specific output |
| `findByCampaignAndKol(campaignId, kolProfileId)` | Campaign + KOL combo |
| `hasActiveCampaigns(enterpriseId)` | Check if enterprise has active campaigns |
| `save(campaign)` | Upsert: create or update by ID |
| `saveMany(campaigns)` | Batch save |
| `delete(id)` | Hard-delete by ID |

**Mapping**:
- `mapToDomain(doc)` → `CampaignRoot.instantiate()` — transforms Mongoose document to domain object
- `mapToPersistence(campaign)` → `CampaignModel` — transforms domain object to persistence format

### 5.3 Read Service: `MongoCampaignReadService`

**File**: `src/infrastructure/mongo/read-services/campaign.read-service.ts`

**Implements**: `ICampaignReadService`

- `findAll(filters, projection?)` — Cursor-paginated with optional field projection & populate
- `findById(id, projection?)` — Single campaign with optional projection

**Supported projectable fields**: `ownerId`, `enterpriseId`, `budget`, `financialTarget`, `description`, `platformTarget`, `status`, `collaboratorIds`, `rawContents`, `schedule`, `participants`

**Populate relationships**: `owner` (User), `enterprise` (Enterprise), `collaborators` (User[])

### 5.4 Read Service: `MongoCampaignParticipantReadService`

**File**: `src/infrastructure/mongo/read-services/campaign-participant.read-service.ts`

**Implements**: `ICampaignParticipantReadService`

Uses MongoDB **aggregation pipeline** to:
1. Match campaign(s) by filter
2. Unwind `participants` array
3. Lookup `kol_profiles` for KOL details
4. Reduce schedule timeline to extract KOL outputs
5. Lookup `platforms` and `uploaded_files` for output metadata

### 5.5 Module Wiring

#### `CampaignModule` (`src/infrastructure/modules/campaign.module.ts`)

```typescript
@Module({
  imports: [CqrsModule, UserModule],
  controllers: [CampaignAdminController, CampaignClientController],
  providers: [
    // Command Handlers (8)
    CampaignCreateCommandHandler,
    CampaignUpdateCommandHandler,
    CampaignHardDeleteCommandHandler,
    CampaignSoftDeleteCommandHandler,
    CampaignRestoreCommandHandler,
    CampaignUpdateStatusCommandHandler,
    CampaignInviteCollaboratorCommandHandler,
    CampaignRevokeCollaboratorCommandHandler,
    // Query Handlers (2)
    CampaignGetListHandler,
    CampaignGetByIdHandler,
    // Event Handlers (1)
    LinkCampaignRawHandler,
    // Resolver
    CampaignResolver,
  ],
})
export class CampaignModule {}
```

#### `CampaignParticipantModule` (`src/infrastructure/modules/campaign-participant.module.ts`)

```typescript
@Module({
  imports: [CqrsModule, CampaignModule],
  providers: [
    // Command Handlers (6)
    CampaignParticipantCreateCommandHandler,
    CampaignParticipantSoftDeleteCommandHandler,
    CampaignParticipantHardDeleteCommandHandler,
    CampaignParticipantRestoreCommandHandler,
    CampaignParticipantUpdateCommandHandler,
    CampaignParticipantUpdateStatusCommandHandler,
    // Query Handlers (2)
    CampaignParticipantGetByIdQueryHandler,
    CampaignParticipantGetListQueryHandler,
    // Event Handlers (1)
    LinkCampaignParticipantOutputFileHandler,
    // Resolver
    CampaignParticipantResolver,
  ],
})
export class CampaignParticipantModule {}
```

### 5.6 GraphQL Types

| Type | File | Fields |
|------|------|--------|
| `CampaignType` | `src/infrastructure/graphql/types/campaign.type.ts` | All campaign fields |
| `CampaignParticipantType` | `src/infrastructure/graphql/types/campaign-participant.type.ts` | All participant fields |

### 5.7 Email Templates

| Template | File | Used By |
|----------|------|---------|
| `campaign-collaborator-invite.hbs` | `src/infrastructure/mailer/templates/` | `CampaignInviteCollaboratorCommandHandler` |
| `campaign-collaborator-revoke.hbs` | `src/infrastructure/mailer/templates/` | `CampaignRevokeCollaboratorCommandHandler` |

---

## 6. Presentation Layer

### 6.1 REST Endpoints

#### Client Controller (`CampaignClientController`)
**Path**: `/v1/client/campaigns`
**Guard Stack**: 🔒 `JwtAuthGuard` → `UserVerifiedGuard`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| `GET` | `/` | Authenticated | List campaigns (cursor paginated) |
| `GET` | `/:id` | Authenticated | Get campaign by ID |
| `POST` | `/` | Enterprise | Create new campaign |
| `PATCH` | `/:id` | Enterprise | Update draft campaign |
| `PATCH` | `/:id/status` | Enterprise | Update campaign status |
| `PATCH` | `/:id/soft-delete` | Enterprise | Soft-delete campaign |
| `PATCH` | `/:id/restore` | Enterprise | Restore soft-deleted |
| `POST` | `/:id/collaborators/invite` | Enterprise | Invite collaborators |
| `DELETE` | `/:id/collaborators/revoke` | Enterprise | Revoke collaborators |
| `POST` | `/:campaignId/participants` | Enterprise | Create participant |
| `PATCH` | `/:campaignId/participants/:participantId` | Enterprise | Update participant |
| `PATCH` | `/:campaignId/participants/:participantId/soft-delete` | Enterprise | Soft-delete participant |
| `DELETE` | `/:campaignId/participants/:participantId` | Enterprise | Hard-delete participant |
| `PATCH` | `/:campaignId/participants/:participantId/restore` | Enterprise | Restore participant |
| `PATCH` | `/:campaignId/participants/:participantId/status` | KOL | KOL self-join/reject |

#### Admin Controller (`CampaignAdminController`)
**Path**: `/v1/admin/campaigns`
**Guard Stack**: 🔒 `JwtAuthGuard` → `RolesGuard(ADMIN)`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | List all campaigns |
| `GET` | `/:id` | Get campaign by ID |
| `POST` | `/` | Create campaign |
| `PATCH` | `/:id` | Update campaign |
| `PATCH` | `/:id/soft-delete` | Soft-delete |
| `PATCH` | `/:id/restore` | Restore |
| `PATCH` | `/:id/status` | Update status |
| `POST` | `/:id/collaborators` | Invite collaborators |
| `DELETE` | `/:id/collaborators` | Revoke collaborators |
| `POST` | `/:campaignId/participants` | Create participant |
| `PATCH` | `/:campaignId/participants/:participantId` | Update participant |
| `PATCH` | `/:campaignId/participants/:participantId/soft-delete` | Soft-delete participant |
| `DELETE` | `/:campaignId/participants/:participantId` | Hard-delete participant |
| `PATCH` | `/:campaignId/participants/:participantId/restore` | Restore participant |

### 6.2 GraphQL Resolvers

| Resolver | Query | Description |
|----------|-------|-------------|
| `CampaignResolver` | `campaign(id)` | Single campaign with projection |
| `CampaignResolver` | `campaigns(filters)` | Paginated campaign list |
| `CampaignParticipantResolver` | `campaignParticipant(id)` | Single participant with KOL & outputs |
| `CampaignParticipantResolver` | `campaignParticipants(filters)` | Paginated participant list |

**Guard Stack**: 🔒 `JwtAuthGuard` → `RolesGuard`

---

## 7. Workflow Flows

### 7.1 Create Campaign → Invite Collaborators → Start Campaign

```
┌──────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐    ┌──────────┐
│  Client  │    │Controller│    │  Handler  │    │  Domain  │    │Database  │
└────┬─────┘    └────┬─────┘    └─────┬─────┘    └────┬─────┘    └────┬─────┘
     │ POST /v1/client/campaigns        │               │               │               │
     │─────▶           │               │               │               │
     │                 │ Validate DTO  │               │               │
     │                 │─────▶         │               │               │
     │                 │               │               │               │
     │                 │CommandBus     │               │               │
     │                 │─────▶─────────▶               │               │
     │                 │               │ CampaignRoot  │               │
     │                 │               │ ──.create()──▶│               │
     │                 │               │               │               │
     │                 │               │ repo.save()   │               │
     │                 │               │───────────────│──────────────▶│
     │                 │               │               │               │
     │   CampaignDto   │               │               │               │
     │◀────────────────│◀──────────────│◀──────────────│◀──────────────│
     │                 │               │               │               │
     │ PATCH /campaigns/:id/status     │               │               │
     │ { status: "finding_kol" }       │               │               │
     │─────▶           │               │               │               │
     │                 │ Validate DTO  │               │               │
     │                 │ CommandBus    │               │               │
     │                 │─────▶─────────▶               │               │
     │                 │               │ repo.findById │               │
     │                 │               │───────────────│──────────────▶│
     │                 │               │◀──────────────│◀──────────────│
     │                 │               │               │               │
     │                 │               │ campaign      │               │
     │                 │               │ .updateStatus │               │
     │                 │               │ ('finding_kol')               │
     │                 │               │               │               │
     │                 │               │ repo.save()   │               │
     │                 │               │───────────────│──────────────▶│
     │   204 No        │               │               │               │
     │◀────────────────│◀──────────────│◀──────────────│◀──────────────│
```

**Steps**:

1. **Enterprise creates campaign** — `POST /v1/client/campaigns` with `ownerId`, `enterpriseId`, `budget`, `description`, `platformTarget`, etc.
2. **Zod validation** — `CampaignCreateInputDto` validates: budget ≥ 0, description 1-2000 chars, etc.
3. **Command dispatch** — `CommandBus.execute(new CampaignCreateCommand(dto))`
4. **Handler creates domain aggregate** — `CampaignRoot.create(dto)` → sets status to `DRAFT`, empty participants/collaborators
5. **Persistence** — `MongoCampaignRepository.save(campaign)` → `mapToPersistence()` → Mongoose insert
6. **Response** — Returns `CampaignDto` with new ID
7. **Enterprise invites collaborators** — `POST /v1/client/campaigns/:id/collaborators/invite` with `memberIds`
8. **Invite handler** — Runs within UoW: validates users exist, calls `campaign.inviteCollaborator()`, saves, and sends emails
9. **Enterprise activates campaign** — `PATCH /v1/client/campaigns/:id/status` with `{ status: "finding_kol" }`
10. **Status handler** — Fetches campaign, calls `campaign.updateStatus(ECampaignStatus.FINDING_KOL)`, saves

### 7.2 KOL Joins a Campaign (Participant Lifecycle)

```
┌──────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐    ┌──────────┐
│  Client  │    │Controller│    │  Handler  │    │  Domain  │    │Database  │
└────┬─────┘    └────┬─────┘    └─────┬─────┘    └────┬─────┘    └────┬─────┘
     │ POST /campaigns/:id/  │               │               │               │
     │ participants          │               │               │               │
     │─────▶                 │               │               │               │
     │                       │ Validate DTO  │               │               │
     │                       │ CommandBus    │               │               │
     │                       │─────▶─────────▶               │               │
     │                       │               │ uow.execute()│               │
     │                       │               │─────▶        │               │
     │                       │               │               │               │
     │                       │               │ repo.findById │               │
     │                       │               │───────────────│──────────────▶│
     │                       │               │◀──────────────│◀──────────────│
     │                       │               │               │               │
     │                       │               │ kolProfile    │               │
     │                       │               │ repo.findById │               │
     │                       │               │───────────────│──────────────▶│
     │                       │               │◀──────────────│◀──────────────│
     │                       │               │               │               │
     │                       │               │ campaign      │               │
     │                       │               │ .addParticipant()            │
     │                       │               │ ──▶ CampaignParticipant-     │
     │                       │               │     CreatedEvent             │
     │                       │               │               │               │
     │                       │               │ repo.save()   │               │
     │                       │               │───────────────│──────────────▶│
     │                       │               │               │               │
     │                       │               │ eventSvc      │               │
     │                       │               │ .publishEvents│─────▶ Outbox  │
     │                       │               │───────────────│──────────────▶│
     │                       │               │               │               │
     │   participantId       │               │               │               │
     │◀──────────────────────│◀──────────────│◀──────────────│◀──────────────│
     │                       │               │               │               │
     │ PATCH .../participants/:pid/status   │               │               │
     │ { status: "joined" }  │               │               │               │
     │─────▶                 │               │               │               │
     │                       │ Validate KOL  │               │               │
     │                       │ (JWT token)   │               │               │
     │                       │ CommandBus    │               │               │
     │                       │─────▶─────────▶               │               │
     │                       │               │ campaign      │               │
     │                       │               │ .joinParticipant()           │
     │                       │               │               │               │
     │                       │               │ repo.save()   │               │
     │                       │               │───────────────│──────────────▶│
     │   204 No Content      │               │               │               │
     │◀──────────────────────│◀──────────────│◀──────────────│◀──────────────│
```

**Steps**:

1. **Enterprise registers KOL** — `POST /v1/client/campaigns/:id/participants` with `kolProfileId`
2. **Handler validates** — Campaign must be `FINDING_KOL` or `IN_PROGRESS`; KOL profile must exist and be linked to a user; KOL not already a participant
3. **Domain logic** — `campaign.addParticipant(kolProfileId)` creates `CampaignParticipantEntity` in `PENDING_APPROVAL` status and raises `CampaignParticipantCreatedEvent`
4. **UoW commit** — Saves campaign (with embedded participant) + outbox rows atomically
5. **KOL self-approves** — `PATCH .../participants/:pid/status` with `{ status: "joined" }` (KOL endpoint, guarded by JWT)
6. **KOL handler** — Verifies KOL profile ownership via `kolProfileRepository.findByUserId()`, calls `campaign.joinParticipant()`
7. **Enterprise completes or rejects** — Via `CampaignParticipantUpdateCommand` or `CampaignParticipantUpdateStatusCommand`

### 7.3 Schedule Management Flow

```
Enterprise               Command                CampaignRoot               ScheduledPost (External)
   │                        │                       │                           │
   │ PATCH /v1/client/campaigns/:id      │                       │                           │
   │ { schedule: {...} }                   │                       │                           │
   │─────▶                  │                       │                           │
   │                        │ CampaignUpdateCommand │                           │
   │                        │─────▶                 │                           │
   │                        │                       │                           │
   │                        │                       │ campaign.updateSchedule()│
   │                        │                       │─────▶                     │
   │                        │                       │                           │
   │                        │                       │ Posts reference Scheduled │
   │                        │                       │ Post IDs (not inlined)    │
   │                        │                       │                           │
   │                        │ repo.save()           │                           │
   │                        │─────▶─────────────────▶──────────────▶           │
```

The schedule is a lightweight timeline structure. Each `ScheduleDay.posts` is an array of `ObjectId` strings referencing documents in the `ScheduledPost` collection (separate domain). The schedule itself does not hold inline KOL outputs — they are managed through the `ScheduledPost` aggregate.

### 7.4 Query Flow (Read Path)

```
Client                     Controller                  ReadService                 MongoDB
  │                            │                           │                         │
  │ GET /v1/client/campaigns?cursor=X   │                           │                         │
  │─────▶                      │                           │                         │
  │                            │ CampaignGetListQuery      │                         │
  │                            │─────▶                     │                         │
  │                            │                           │                         │
  │                            │                           │ campaignModel.find()    │
  │                            │                           │─────▶                   │
  │                            │                           │   .populate('owner_id') │
  │                            │                           │   .populate('enterprise_id')│
  │                            │                           │◀─────                   │
  │                            │                           │                         │
  │                            │                           │ mapToDto()              │
  │                            │                           │─────▶                   │
  │                            │                           │                         │
  │ PaginatedResponseDto       │                           │                         │
  │◀───────────────────────────│◀──────────────────────────│◀────────────────────────│
```

Queries bypass the domain/repository layer entirely. They go directly through `MongoCampaignReadService` → Mongoose with populate + cursor-based pagination.

---

## 8. File Map

### Core (Domain) Layer

| File | Type | Role |
|------|------|------|
| `src/core/aggregate-roots/campaign.aggregate.ts` | Aggregate Root | Central domain logic |
| `src/core/entities/campaign-participant.entity.ts` | Entity | KOL participant |
| `src/core/entities/campaign-kol-output.entity.ts` | Entity | KOL deliverable |
| `src/core/entities/campaign-enterprise-output.entity.ts` | Entity | Enterprise deliverable |
| `src/core/enums/campaign-status.enum.ts` | Enum | Campaign lifecycle states |
| `src/core/enums/campaign-participant.enums.ts` | Enum | Participant/output/type enums |
| `src/core/events/campaign-participant-created.domain-event.ts` | Domain Event | Raised on participant creation |
| `src/core/exceptions/campaign.exception.ts` | Exception | Campaign-specific errors |
| `src/core/interfaces/repositories/campaign.repository.ts` | Port | Repository interface |

### Application Layer

| File | Type | Role |
|------|------|------|
| `src/application/commands/campaign-create/` | Command | Create campaign |
| `src/application/commands/campaign-update/` | Command | Update draft |
| `src/application/commands/campaign-update-status/` | Command | Status transition |
| `src/application/commands/campaign-soft-delete/` | Command | Soft delete |
| `src/application/commands/campaign-restore/` | Command | Restore |
| `src/application/commands/campaign-hard-delete/` | Command | Hard delete |
| `src/application/commands/campaign-invite-collaborator/` | Command | Invite collaborator |
| `src/application/commands/campaign-revoke-collaborator/` | Command | Revoke collaborator |
| `src/application/commands/campaign-participant-create/` | Command | Add participant |
| `src/application/commands/campaign-participant-update/` | Command | Update participant |
| `src/application/commands/campaign-participant-update-status/` | Command | KOL self-status |
| `src/application/commands/campaign-participant-soft-delete/` | Command | Soft-delete participant |
| `src/application/commands/campaign-participant-restore/` | Command | Restore participant |
| `src/application/commands/campaign-participant-hard-delete/` | Command | Hard-delete participant |
| `src/application/queries/campaign-get-list/` | Query | List campaigns |
| `src/application/queries/campaign-get-by-id/` | Query | Get campaign |
| `src/application/queries/campaign-participant-get-list/` | Query | List participants |
| `src/application/queries/campaign-participant-get-by-id/` | Query | Get participant |
| `src/application/mappers/campaign.mapper.ts` | Mapper | Aggregate → DTO |
| `src/application/mappers/campaign-participant.mapper.ts` | Mapper | Entity → DTO |
| `src/application/dtos/campaign.dto.ts` | DTO | Campaign data structures |
| `src/application/dtos/campaign-participant.dto.ts` | DTO | Participant data structures |
| `src/application/interfaces/read-service/campaign.read-service.interface.ts` | Port | Read service interface |
| `src/application/interfaces/read-service/campaign-participant.read-service.interface.ts` | Port | Read service interface |
| `src/application/events/uploaded-file-created/link-campaign-raw.handler.ts` | Event Handler | Link uploaded file |
| `src/application/events/uploaded-file-created/link-campaign-participant-output-file.handler.ts` | Event Handler | Link output file (disabled) |
| `src/application/events/notify-kol-campaign-invitation.event.ts` | Event | KOL invitation notification |

### Infrastructure Layer

| File | Type | Role |
|------|------|------|
| `src/infrastructure/mongo/schemas/campaign.schema.ts` | Schema | Mongoose document schema |
| `src/infrastructure/mongo/repositories/campaign.repository.ts` | Repository | MongoDB persistence |
| `src/infrastructure/mongo/read-services/campaign.read-service.ts` | Read Service | Campaign read ops |
| `src/infrastructure/mongo/read-services/campaign-participant.read-service.ts` | Read Service | Participant read ops (aggregation) |
| `src/infrastructure/modules/campaign.module.ts` | Module | NestJS module wiring |
| `src/infrastructure/modules/campaign-participant.module.ts` | Module | Participant module wiring |
| `src/infrastructure/graphql/types/campaign.type.ts` | GraphQL Type | Campaign GraphQL schema |
| `src/infrastructure/graphql/types/campaign-participant.type.ts` | GraphQL Type | Participant GraphQL schema |
| `src/infrastructure/mailer/templates/campaign-collaborator-invite.hbs` | Email Template | Collaborator invite email |
| `src/infrastructure/mailer/templates/campaign-collaborator-revoke.hbs` | Email Template | Collaborator revoke email |

### Presentation Layer

| File | Type | Role |
|------|------|------|
| `src/presentation/controllers/http/client/campaign.controller.ts` | Controller | Enterprise REST endpoints |
| `src/presentation/controllers/http/admin/campaign.controller.ts` | Controller | Admin REST endpoints |
| `src/presentation/controllers/resolvers/campaign.resolver.ts` | Resolver | Campaign GraphQL queries |
| `src/presentation/controllers/resolvers/campaign-participant.resolver.ts` | Resolver | Participant GraphQL queries |

---

## 9. Key Invariants (Non-Negotiable Business Rules)

1. **Campaign status transitions are linear**: DRAFT → FINDING_KOL → IN_PROGRESS → COMPLETED. Only DRAFT/FINDING_KOL can cancel.
2. **Only campaign owner can invite/revoke collaborators**: `inviteCollaborator()` and `revokeCollaborator()` both check `requestedBy === ownerId`.
3. **Owner cannot be a collaborator**: Explicitly blocked in `inviteCollaborator()`.
4. **No duplicate KOL participants**: `addParticipant()` checks for existing `kolProfileId`.
5. **Soft-delete guard**: Campaigns with `JOINED` or `COMPLETED` participants cannot be soft-deleted.
6. **Hard-delete only in DRAFT/CANCELLED**: `CampaignHardDeleteCommandHandler` validates `status`.
7. **Participant hard-delete only when REJECTED**: `CampaignParticipantHardDeleteCommandHandler` validates participant `status`.
8. **KOL can only self-join from PENDING_APPROVAL**: `joinParticipant()` asserts correct status.
9. **Only REJECTED participants can be removed**: `removeParticipant()` validates status.
10. **Participant creation fires domain event**: `CampaignParticipantCreatedEvent` is published atomically within the UoW transaction.

---

## Cross-Domain References

- **KPI Tracking**: Linked via `CampaignKOLOutputEntity.isTrackingActive` + `KpiLogEntity` for performance measurements
- **ScheduledPost**: `CampaignSchedule.timeline[].posts[]` contains `ScheduledPost` IDs (separate aggregate)
- **Enterprise**: Campaigns belong to an enterprise; `enterpriseId` links to `EnterpriseRoot`
- **User/Profile**: Participants link to KOL profiles; collaborators are users
- **Platform**: `platformTarget.platformId` references available platforms
- **UploadedFile**: `rawContents[].fileId` and `output.fileId` link to uploaded assets
