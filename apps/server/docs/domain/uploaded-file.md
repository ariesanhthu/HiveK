# UploadedFile Domain

This document describes the business rules, state machines, domain aggregates, database models, CQRS commands/queries, and end-to-end workflows for the **UploadedFile** domain within the HiveK server.

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

The UploadedFile domain manages system asset uploads. It encapsulates the storage representations, handling file details like size, format, public ID from external storages (e.g., Cloudinary), and establishes polymorphic relations linking assets to their respective targets across the system (e.g., users, enterprises, campaigns, scheduled posts).

### Bounded Context

Cross-cutting generic sub-domain: Assets Storage & Linking

### Key Concepts

| Concept | Type | Description |
|---------|------|-------------|
| UploadedFile | Aggregate Root | Represents an asset uploaded to the storage service and links it to a specific target domain entity. |
| EUploadTargetField | Enum | Defines the specific field on the target entity the file applies to (e.g., avatar, logoUrlId, icon, raw, mediaFileIds). |
| ETargetType | Enum | The type of target entity receiving the file (user, enterprise, platform, campaign, etc.). |

### Relations to Other Domains

| Domain | Relationship |
|--------|-------------|
| User | Linked when uploading an `avatar`. |
| Enterprise | Linked when uploading a `logoUrlId`. |
| Platform | Linked when uploading an `icon`. |
| Campaign | Linked when uploading a `raw` content file. |
| ScheduledPost | Linked when uploading `mediaFileIds`. |

---

## 2. Core Layer (Domain Model)

### 2.1 Aggregate Roots

#### UploadedFileRoot

**File**: `src/core/aggregate-roots/uploaded-file.aggregate.ts`

**Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `url` | `string` | The accessible URL of the file. |
| `publicId` | `string` | Identifier in the external storage service (e.g., Cloudinary). |
| `size` | `number` | File size in bytes. |
| `format` | `string` | File format/extension. |
| `title` | `Nullable<string>` | Optional display title for the file. |
| `targetType` | `ETargetType` | The type of entity the file is linked to. |
| `targetId` | `string` | The ID of the target entity. |
| `targetField` | `string` | The field name on the target entity. |
| `deleteAt` | `Nullable<Date>` | Timestamp of soft deletion. |
| `deleteBy` | `Nullable<string>` | ID of the user who deleted the file. |
| `createdAt` | `Date` | Timestamp of creation. |
| `updatedAt` | `Date` | Timestamp of last update. |

**Factory Methods**:

| Method | Description |
|--------|-------------|
| `static create(props)` | Creates a new instance with full invariant validation. Raises `UploadedFileCreatedEvent`. |
| `static instantiate(id, props)` | Reconstitutes an existing instance from persistence (no validation). |

**Domain Methods**:

| Method | Description | Raises Event |
|--------|-------------|-------------|
| `softDelete(deletedBy)` | Sets `deleteAt` and `deleteBy` fields. | None |
| `restore()` | Unsets `deleteAt` and `deleteBy` fields. | None |

**Getters**:

*(Standard getters exist for all properties)*

---

### 2.2 Entities

*(No entities)*

---

### 2.3 Value Objects

*(No value objects)*

---

### 2.4 Enums

#### `EUploadTargetField`

**File**: `src/core/enums/upload-target-field.enum.ts`

| Member | Value | Description |
|--------|-------|-------------|
| `AVATAR` | `'avatar'` | Avatar for User |
| `LOGO_URL_ID` | `'logoUrlId'` | Logo for Enterprise |
| `ICON` | `'icon'` | Icon for Platform |
| `RAW` | `'raw'` | Raw content for Campaign |
| `MEDIA_FILE_IDS` | `'mediaFileIds'` | Media files for ScheduledPost |

---

### 2.5 Domain Events

| Event | Raised By | Payload | Consumer |
|-------|-----------|---------|----------|
| `UploadedFileCreatedEvent` | `UploadedFileRoot.create()` | `fileId`, `targetType`, `targetId`, `targetField` | Domain Event integration layer. |

---

### 2.6 Domain Exceptions

| Exception | Thrown When |
|-----------|-------------|
| `UploadedFileNotFoundException` | A file with the specified identifier cannot be found in the repository. |

---

## 3. State Machines & Status Transitions

*(No internal status transitions inside UploadedFileRoot, besides soft deletion)*

## 4. Application Layer

### 4.1 Commands (Write Side)

| Command | Handler | DTO | Description |
|---------|---------|-----|-------------|
| `UploadedFileCreateCommand` | `UploadedFileCreateCommandHandler` | `UploadedFileCreateDto` | Creates a new uploaded file, uploads it to the storage service, and links it to the target entity (all within an atomic flow with compensating deletes on failure). |
| `UploadedFileBulkCreateCommand` | `UploadedFileBulkCreateCommandHandler` | `UploadedFileCreateDto[]` | Delegates bulk upload requests (max 10) to multiple `UploadedFileCreateCommand`s. |
| `UploadedFileSoftDeleteCommand` | `UploadedFileSoftDeleteCommandHandler` | (None) | Soft deletes an uploaded file. |
| `UploadedFileRestoreCommand` | `UploadedFileRestoreCommandHandler` | (None) | Restores a soft-deleted uploaded file. |
| `UploadedFileDeleteCommand` | `UploadedFileDeleteCommandHandler` | (None) | Hard deletes a file, including purging from the external storage service. |

**Command Flow Architecture (Create/Link)**:
```
External Request
  │
  ▼
Controller.method()
  │ Validate DTO (Zod schema)
  ▼
CommandBus.execute(new UploadedFileCreateCommand(dto))
  │
  ▼
UploadedFileCreateCommandHandler.execute()
  │
  ├─ Phase 1: UploadService.processAndValidateFile() + StorageService.upload() (External to DB Tx)
  │
  ├─ Phase 2: this.uow.execute(async () => {
  │     const root = UploadedFileRoot.create(dto);       ← Domain logic
  │     await this.repository.save(root);                ← Persist (UoW)
  │     await this.linker.link(root);                    ← Sync Target Entity linking (UoW)
  │     return root;
  │   });
  │     * On Catch: `StorageService.delete()` runs as a compensating action.
  │
  ▼
EventService.publishEvents()
  ├─ DomainEventMapper.mapToIntegrationEvents(root)
  │     → Integration Events
  └─ OutboxModel.insertMany(integrationEvents)
       │ (same UoW session — atomic)
       ▼
OutboxProcessor (cron every 10s + push)
  └─ RabbitMQ → downstream consumers
```

### 4.2 Queries (Read Side)

| Query | Handler | DTO | Description |
|-------|---------|-----|-------------|
| `UploadedFileGetByIdQuery` | `UploadedFileGetByIdHandler` | `UploadedFileDto` | Retrieves a specific uploaded file by ID. |
| `UploadedFileGetListQuery` | `UploadedFileGetListHandler` | `PaginatedResponseDto` | Retrieves a paginated list of uploaded files (mostly for Admin). |

**Query Flow Architecture**:
```
GET /api/v1/...
  │
  ▼
Controller.method()
  │
  ▼
QueryBus.execute(new UploadedFileGetListQuery(filters))
  │
  ▼
UploadedFileGetListHandler
  │
  └─ IUploadedFileReadService.findAll(filters)
       │
       └─ Mongoose Model.find(filters)
            │
            └─ Returns PaginatedResponseDto<UploadedFileDto>
```

### 4.3 Application Services

| Service | Method | Purpose |
|---------|--------|---------|
| `FileLinkerService` | `link(root)` | Performs synchronous linking of the uploaded asset to the respective target aggregate based on `TargetType`. Must be executed inside a UoW transaction. |
| `UploadService` | `processAndValidateFile(...)` | Centralized upload compression (via sharp) and validation pipeline. |

### 4.4 Mappers

| Mapper | Source → Target | Location |
|--------|----------------|----------|
| `UploadedFileMapper` | `UploadedFileRoot` ↔ `UploadedFileModel` | `src/application/mappers/uploaded-file.mapper.ts` |
| `UploadedFileMapper` | `UploadedFileRoot` → `UploadedFileDto` | `src/application/mappers/uploaded-file.mapper.ts` |

## 5. Infrastructure Layer

### 5.1 Data Model (Mongoose Schemas)

#### `uploaded_files` Collection

**Schema File**: `src/infrastructure/mongo/schemas/uploaded-file.schema.ts`

| Field | Type | Description |
|-------|------|-------------|
| `url` | `String` | URL of the file. |
| `public_id` | `String` | Identifier in the external storage service. |
| `size` | `Number` | Size of the file in bytes. |
| `format` | `String` | Format/extension of the file. |
| `title` | `String` | Optional display title for the file. |
| `target_type` | `String` | ETargetType corresponding to the linked entity type. |
| `target_id` | `String` | ID of the linked entity. |
| `target_field` | `String` | Field on the linked entity where the file should be attached. |
| `delete_at` | `Date` | Soft-delete timestamp. |
| `delete_by` | `String` | ID of the user who deleted the file. |
| `created_at` | `Date` | Creation timestamp. |
| `updated_at` | `Date` | Update timestamp. |

**Indexes**:
*(Assuming default indexing by the ID, plus standard timestamps)*

### 5.2 Repository Implementations

| Implementation | File | Implements |
|----------------|------|------------|
| `MongoUploadedFileRepository` | `src/infrastructure/mongo/repositories/uploaded-file.repository.ts` | `IUploadedFileRepository` |

**Methods**:
- `findById(id)` — Retrieves an uploaded file by its ID, mapped to `UploadedFileRoot`.
- `findByTarget(targetId, targetType)` — Retrieves uploaded files tied to a specific target aggregate.
- `save(aggregate)` — Saves or updates an uploaded file via the active UoW session (`ALS`).
- `saveMany(aggregates)` — Bulk save method.
- `delete(id)` — Hard deletion of the file record.

**Mapping**:
- Domain → Persistence: `MongoUploadedFileRepository.mapToPersistence(aggregate)`
- Persistence → Domain: `MongoUploadedFileRepository.mapToDomain(document)`

### 5.3 Read Service Implementations

| Implementation | File | Implements |
|----------------|------|------------|
| `MongoUploadedFileReadService` | `src/infrastructure/mongo/read-services/uploaded-file.read-service.ts` | `IUploadedFileReadService` |

**Methods**:
- `findById(id)` — Returns `UploadedFileDto` or null, ignoring soft-deleted files.
- `findAll(filters)` — Returns `PaginatedResponseDto<UploadedFileDto>` filtered by size, format, and target, with cursor pagination.

### 5.4 Module Wiring

**File**: `src/infrastructure/modules/uploaded-file.module.ts`

```typescript
@Module({
  imports: [CqrsModule, InfrastructureModule],
  controllers: [
    UploadedFileAdminController,
    UploadedFileClientController,
  ],
  providers: [
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
    UploadService,
    FileLinkerService,
    {
      provide: IMAGE_PROCESSOR_SERVICE,
      useClass: SharpImageProcessorService,
    },
  ],
  exports: [UploadService, FileLinkerService],
})
export class UploadedFileModule {}
```
*(Note: Repository tokens are provided globally via `MongoModule`)*

## 6. Presentation Layer

### 6.1 REST Endpoints

#### Admin Upload API — `/hivek/admin/v1/upload`

| Method | Path | Guards | Controller | Description |
|--------|------|--------|------------|-------------|
| `GET` | `/` | 🔒 `JwtAuth`, `Roles(ADMIN)` | `UploadedFileAdminController.findAll()` | Get a paginated list of all uploaded files. |
| `GET` | `/:id` | 🔒 `JwtAuth`, `Roles(ADMIN)` | `UploadedFileAdminController.findById()` | Get an uploaded file by ID. |
| `POST` | `/` | 🔒 `JwtAuth`, `Roles(ADMIN)` | `UploadedFileAdminController.create()` | Upload and link a single file (Max 25MB). |
| `POST` | `/bulk` | 🔒 `JwtAuth`, `Roles(ADMIN)` | `UploadedFileAdminController.createBulk()` | Bulk upload up to 10 files (Max 25MB each). |
| `PATCH` | `/:id/soft-delete` | 🔒 `JwtAuth`, `Roles(ADMIN)` | `UploadedFileAdminController.delete()` | Soft delete an uploaded file. |
| `PATCH` | `/:id/restore` | 🔒 `JwtAuth`, `Roles(ADMIN)` | `UploadedFileAdminController.restore()` | Restore a soft-deleted file. |
| `DELETE` | `/:id` | 🔒 `JwtAuth`, `Roles(ADMIN)` | `UploadedFileAdminController.hardDelete()` | Hard delete a file. |

#### Client Upload API — `/hivek/client/v1/upload`

| Method | Path | Guards | Controller | Description |
|--------|------|--------|------------|-------------|
| `GET` | `/:id` | 🔒 `JwtAuth` | `UploadedFileClientController.findById()` | Get an uploaded file by ID. |
| `POST` | `/` | 🔒 `JwtAuth` | `UploadedFileClientController.create()` | Upload and link a single file (Max 25MB). |
| `POST` | `/bulk` | 🔒 `JwtAuth` | `UploadedFileClientController.createBulk()` | Bulk upload up to 10 files (Max 25MB each). |

### 6.2 GraphQL (if applicable)

*(No GraphQL resolvers for UploadedFile currently)*

### 6.3 Guard Stack

The following guard hierarchy applies to all protected routes:

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

### 7.1 Single File Upload & Linking

#### Diagram

```text
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ POST /api/v1/upload (multipart/form-data)
       ▼
┌──────────────────────────────┐
│ Presentation Layer           │
│  ┌─────────────────────────┐ │
│  │ Controller.create()     │ │
│  │ ├── FileUploadPipe      │ │
│  │ ├── DTO Zod validation  │ │
│  │ └── CommandBus.execute()│ │
│  └──────────┬──────────────┘ │
└─────────────┼────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ Application Layer                       │
│  ┌────────────────────────────────────┐ │
│  │ UploadedFileCreateCommandHandler   │ │
│  │                                    │ │
│  │ 1. UploadService (Sharp + compress)│ │
│  │ 2. StorageService (Cloudinary)     │ │
│  │ 3. uow.execute(async →)            │ │
│  │    a. AggregateRoot.create()       │ │
│  │    b. repository.save()            │ │
│  │    c. linker.link(root)            │ │
│  │ 4. eventService.publishEvents()    │ │
│  └──────────┬─────────────────────────┘ │
└─────────────┼───────────────────────────┘
              │
              ▼
┌──────────────────────────────┐
│ Infrastructure Layer         │
│  ┌─────────────────────────┐ │
│  │ MongoRepository.save()  │ │
│  │   └─ Session save()     │ │
│  │                         │ │
│  │ EventService            │ │
│  │   ├─ Map events         │ │
│  │   └─ Outbox.insert()    │ │
│  └─────────────────────────┘ │
└─────────────┬────────────────┘
              │
              ▼
┌──────────────────────────────┐
│ OutboxProcessor (async)      │
│  └─ RabbitMQ → handlers      │
└──────────────────────────────┘

←── Response: UploadedFileDto ── Client
```

#### Step-by-Step

1. **Client sends request** — `POST /api/v1/upload` with `multipart/form-data` containing the file buffer and target binding metadata.
2. **Controller validation** — `FileUploadValidationPipe` checks the size and mime-type. Zod schema validates the input DTO fields.
3. **Command dispatched** — `CommandBus.execute(new UploadedFileCreateCommand(...))`.
4. **Handler (Phase 1: Pre-Transaction)** — `UploadService` validates size constraints dynamically and optimizes images via `sharp`. The optimized buffer is sent to `StorageService.upload()` (Cloudinary). This is kept OUTSIDE the UoW transaction as it's an external network call.
5. **Handler (Phase 2: DB Transaction)** — Opens MongoDB transaction `uow.execute()`. `UploadedFileRoot.create()` validates invariants. `repository.save()` persists the upload. `FileLinkerService.link()` synchronizes the target aggregate (e.g. updating a User's avatar string). Both saves are atomic.
6. **Compensation Trigger** — If the database transaction fails (e.g. invalid target), the `catch` block triggers `StorageService.delete(publicId)` to prevent orphaned assets on Cloudinary, then re-throws the error.
7. **Handler (Phase 3: Event Emission)** — `eventService.publishEvents()` translates domain events to integration events and appends them to the Outbox table.
8. **Response returned** — Returns the mapped `UploadedFileDto` back to the client.

---

## 8. File Map

| Layer | File | Responsibility |
|-------|------|---------------|
| **Core** | `src/core/aggregate-roots/uploaded-file.aggregate.ts` | The `UploadedFileRoot` aggregate. |
| **Core** | `src/core/enums/upload-target-field.enum.ts` | Enum for linking fields (avatar, logoUrlId, icon, raw, mediaFileIds). |
| **Core** | `src/core/events/uploaded-file-created.domain-event.ts` | Domain event raised upon successful file creation. |
| **Core** | `src/core/exceptions/uploaded-file.exception.ts` | Custom not found exception. |
| **Core** | `src/core/interfaces/repositories/uploaded-file.repository.ts` | Repository interface `IUploadedFileRepository`. |
| **Application** | `src/application/commands/uploaded-file-create/` | Create command handler & DTO. |
| **Application** | `src/application/commands/uploaded-file-bulk-create/` | Bulk create command handler. |
| **Application** | `src/application/commands/uploaded-file-[soft-delete,delete,restore]/` | Lifecycle command handlers. |
| **Application** | `src/application/queries/uploaded-file-[get-by-id,get-list]/` | Query handlers. |
| **Application** | `src/application/dtos/uploaded-file.dto.ts` | Domain mapping DTO representation. |
| **Application** | `src/application/mappers/uploaded-file.mapper.ts` | Maps Domain ↔ DTO ↔ Persistence. |
| **Application** | `src/application/services/file-linker.service.ts` | Aggregates synchronous UoW saves to remote targets. |
| **Application** | `src/application/services/upload.service.ts` | Handles file processing and validation logic. |
| **Infrastructure** | `src/infrastructure/mongo/schemas/uploaded-file.schema.ts` | Mongoose schema definition. |
| **Infrastructure** | `src/infrastructure/mongo/repositories/uploaded-file.repository.ts` | Implements `IUploadedFileRepository`. |
| **Infrastructure** | `src/infrastructure/mongo/read-services/uploaded-file.read-service.ts` | Implements `IUploadedFileReadService`. |
| **Infrastructure** | `src/infrastructure/modules/uploaded-file.module.ts` | NestJS module wiring. |
| **Presentation** | `src/presentation/controllers/http/admin/uploaded-file.controller.ts` | Admin REST API endpoints. |
| **Presentation** | `src/presentation/controllers/http/client/uploaded-file.controller.ts` | Client REST API endpoints. |
| **Presentation** | `src/presentation/middleware/pipes/file-upload-validation.pipe.ts` | Intercepts HTTP multipart files. |

---

## 9. Key Invariants

- **Storage Consistency**: External file uploads must never orphan. If DB state fails to save after an upload, the external asset must be rolled back (compensating delete).
- **Target Integrity**: An uploaded file must be linked directly to its target (`TargetType`, `targetId`, `targetField`) immediately, inside the same database transaction. Eventual consistency is not used for asset linking to prevent racing frontend clients.
- **Bulk Constraints**: The bulk upload route strictly caps at 10 files to avoid exhausting server memory and external rate-limits.
