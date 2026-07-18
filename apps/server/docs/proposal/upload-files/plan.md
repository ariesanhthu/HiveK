# Upload File Domain — Refactoring Plan

**Status**: Proposed  
**Author**: Engineering  
**Created**: 2026-07-18

---

## 1. Background & Motivation

The current upload workflow suffers from several consistency and code-quality issues:

| # | Problem | Severity |
|---|---------|----------|
| P1 | File record saved + Cloudinary upload succeed, but target link fails → orphaned asset | 🔴 Critical |
| P2 | Domain event published via `EventBus` directly from handler (bypasses aggregate + outbox) | 🔴 Critical |
| P3 | `link-user-avatar` uses `props as any` to mutate `UserRoot` — breaks encapsulation | 🔴 Critical |
| P4 | No `IUnitOfWork` — file save and target link are separate, unatomic DB writes | 🔴 Critical |
| P5 | `link-campaign-participant-output-file` handler is dead code (entire body commented out) | 🔴 Critical |
| P6 | `targetField` is a free-form string — no enum, no compile-time contract between upload and link | 🟡 Moderate |
| P7 | Single and bulk create handlers are near-identical copy-paste | 🟡 Moderate |
| P8 | `publicId || ''` — empty string silently skips Cloudinary deletion | 🟡 Moderate |
| P9 | Filename: `split('.')[0]` + `Date.now()` — fragile and not collision-safe | 🟡 Moderate |
| P10 | `sharp` (image compression) lives in Application layer instead of Infrastructure | 🟢 Minor |
| P11 | Delete endpoints commented out in admin controller with no explanation | 🟢 Minor |
| P12 | File count limit validation duplicated across both controllers | 🟢 Minor |

---

## 2. Design Decision: Synchronous Linking vs Outbox

### Why NOT the Outbox pattern for linking

The Outbox pattern exists for **cross-service, cross-process** delivery guarantees (e.g., publish to RabbitMQ for other microservices). Using it for same-process, same-database linking would:

- Introduce up to **10-second visible latency** (cron poll interval) for a user-facing upload action
- Still not solve the orphan problem — Cloudinary is already written before the outbox entry is created
- Over-engineer a within-service concern

### Chosen Design: UoW Transaction + Compensating Delete

```
Upload Phase (before TX):
  1. processAndValidateFile()          ← in-memory, no side effects
  2. storageService.upload()           ← external write (Cloudinary)

Atomic DB Phase (inside UoW):
  3. UploadedFileRoot.create()
  4. uploadedFileRepo.save(root)       ← Write 1
  5. FileLinkerService.link(root)      ← Write 2 (target aggregate update)
     — same MongoDB session via ALS

Compensation (only if DB Phase throws):
  6. storageService.delete(publicId)   ← roll back Cloudinary

Post-success (after TX commit):
  7. eventService.publishEvents(root)  ← domain event → Outbox → RabbitMQ
                                           (audit, analytics, notifications — async OK)
```

**Consistency guarantees:**

| Scenario | Outcome |
|----------|---------|
| Cloudinary fails | Nothing saved — clean |
| Cloudinary OK, DB tx fails | Compensating `storageService.delete()` runs — no orphan |
| DB tx OK (file + link), event publish fails | Outbox cron retries — eventual delivery |
| All OK | File saved, target linked, event delivered |

---

## 3. Target Architecture

### 3.1 New: `EUploadTargetField` Enum

Replace free-form strings with a typed enum as the single source of truth.

**File**: `src/core/enums/upload-target-field.enum.ts`

```typescript
export enum EUploadTargetField {
  // User
  AVATAR = 'avatar',
  // Enterprise
  LOGO_URL_ID = 'logoUrlId',
  // Platform
  ICON = 'icon',
  // Campaign
  RAW = 'raw',
}
```

The `targetField` field in `UploadedFileCreateInputDto` must be `z.nativeEnum(EUploadTargetField)`.

---

### 3.2 New: `FileLinkerService`

Centralizes all linking logic. Replaces the 5 scattered event handlers.

**File**: `src/application/services/file-linker.service.ts`

```typescript
@Injectable()
export class FileLinkerService {
  constructor(
    @Inject(USER_REPOSITORY)       private readonly userRepo: IUserRepository,
    @Inject(ENTERPRISE_REPOSITORY) private readonly enterpriseRepo: IEnterpriseRepository,
    @Inject(PLATFORM_REPOSITORY)   private readonly platformRepo: IPlatformRepository,
    @Inject(CAMPAIGN_REPOSITORY)   private readonly campaignRepo: ICampaignRepository,
  ) {}

  async link(root: UploadedFileRoot): Promise<void> {
    switch (root.targetType) {
      case TargetType.USER:        return this.linkUser(root);
      case TargetType.ENTERPRISE:  return this.linkEnterprise(root);
      case TargetType.PLATFORM:    return this.linkPlatform(root);
      case TargetType.CAMPAIGN:    return this.linkCampaign(root);
      default: return; // no linking for this target type
    }
  }
}
```

Each private method:
- Fetches the aggregate from its own repository (session auto-propagated via ALS)
- Calls the **proper aggregate method** (no `props as any`)
- Saves back

---

### 3.3 Aggregate Setter: `UserRoot.setAvatar()`

`UserRoot` currently has no `setAvatar()` method — the existing link handler bypassed this with `props as any`.

**File**: `src/core/aggregate-roots/user.aggregate.ts`

```typescript
public setAvatar(fileId: string): void {
  this.props.avatar = fileId;
  this.props.updatedAt = new Date();
}
```

The `EnterpriseRoot.update({ logoUrlId })` and `PlatformRoot.updateIcon()` methods already exist and are used correctly.

---

### 3.4 Updated `UploadedFileCreateCommandHandler`

```typescript
async execute(command: UploadedFileCreateCommand): Promise<UploadedFileDto> {
  const { file, input } = command;

  // ── Phase 1: Pre-transaction ──────────────────────────────────────────────
  const { buffer, size } = await this.uploadService.processAndValidateFile(
    file.buffer, file.mimetype, file.originalname,
  );

  const uploadResult = await this.storageService.upload(buffer, {
    folder: input.targetType.toLowerCase(),
    filename: buildFilename(file.originalname),   // ← see §3.6
  });

  // ── Phase 2: Atomic DB transaction ────────────────────────────────────────
  let root: UploadedFileRoot;
  try {
    root = await this.uow.execute(async () => {
      const fileRoot = UploadedFileRoot.create({
        url:       uploadResult.url,
        publicId:  uploadResult.publicId,          // ← required, throws if absent (§3.5)
        size:      uploadResult.size ?? size,
        format:    resolveFormat(uploadResult.format, file.mimetype),
        title:     input.title,
        targetType: input.targetType,
        targetId:   input.targetId,
        targetField: input.targetField,
      });

      await this.repository.save(fileRoot);
      await this.linker.link(fileRoot);             // ← synchronous, same session
      return fileRoot;
    });
  } catch (err) {
    // ── Compensate: remove Cloudinary asset to prevent orphan ────────────────
    await this.storageService.delete(uploadResult.publicId, {
      resourceType: this.uploadService.getResourceType(file.mimetype),
    });
    throw err;
  }

  // ── Phase 3: Post-commit side effects ─────────────────────────────────────
  await this.eventService.publishEvents(root);     // → Outbox → RMQ (async OK)

  return UploadedFileMapper.toDto(root);
}
```

---

### 3.5 `UploadResult.publicId` Made Required

**File**: `src/core/interfaces/storage/storage-service.interface.ts`

```typescript
// Before
export interface UploadResult {
  url: string;
  format: string;
  size: number;
  publicId?: string;    // optional — caused silent skip on delete
}

// After
export interface UploadResult {
  url: string;
  format: string;
  size: number;
  publicId: string;     // required — Cloudinary always returns this
}
```

The Cloudinary adapter (`CloudinaryStorageService`) must throw if `public_id` is absent in the response.

---

### 3.6 `buildFilename()` Utility — Collision-Safe

**File**: `src/shared/utils/string.util.ts` (add alongside `toCamelCase`)

```typescript
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Builds a storage-safe filename: <name-without-extension>-<uuid>
 * Handles multi-dot filenames correctly (e.g. "my.photo.jpg" → "my.photo-<uuid>")
 */
export function buildFilename(originalname: string): string {
  const name = path.parse(originalname).name;
  return `${name}-${uuidv4()}`;
}
```

---

### 3.7 `resolveFormat()` — Move Derivation Out of Handler

Inline utility (can live in `upload.service.ts` or a shared util):

```typescript
export function resolveFormat(storageFormat: string | undefined, mimetype: string): string {
  if (storageFormat) return storageFormat;
  const sub = mimetype.split('/')[1];
  return sub ?? 'bin';
}
```

---

### 3.8 Bulk Create Handler — Delegate to Single Create

Instead of duplicating logic, bulk create dispatches individual `UploadedFileCreateCommand`s via `CommandBus`:

```typescript
async execute(command: UploadedFileBulkCreateCommand): Promise<UploadedFileDto[]> {
  return Promise.all(
    command.files.map((file) =>
      this.commandBus.execute(
        new UploadedFileCreateCommand(file, command.input),
      ),
    ),
  );
}
```

This keeps logic in one place and lets each file be independently compensated if Cloudinary fails.

---

### 3.9 Remove Dead-Code Handler

**Delete** `src/application/events/uploaded-file-created/link-campaign-participant-output-file.handler.ts`

The `TargetType.CAMPAIGN_PARTICIPANT` upload linking was disabled when the output model moved to `ScheduledPost`. Either:
- **Option A**: Remove entirely (no `CAMPAIGN_PARTICIPANT` upload is currently needed)
- **Option B**: Implement correct linking via `ScheduledPost` in a future story

For now, choose **Option A**. Log a `TODO` comment in `FileLinkerService.link()` for the `CAMPAIGN_PARTICIPANT` case.

---

### 3.10 `IImageProcessorService` — Move `sharp` to Infrastructure

**Interface** (Application layer): `src/application/interfaces/image-processor.interface.ts`

```typescript
export const IMAGE_PROCESSOR_SERVICE = Symbol('IImageProcessorService');

export interface IImageProcessorService {
  compress(buffer: Buffer, mimetype: string): Promise<{ buffer: Buffer; size: number }>;
}
```

**Implementation** (Infrastructure layer): `src/infrastructure/image-processor/sharp-image-processor.service.ts`

`UploadService` in Application layer becomes thin — it calls `IImageProcessorService` through DI.

---

## 4. Files Changed

### Core Layer

| Action | File | Change |
|--------|------|--------|
| **MODIFY** | `src/core/enums/upload-target-field.enum.ts` | **NEW** — typed enum for target fields |
| **MODIFY** | `src/core/enums/index.ts` | Export `EUploadTargetField` |
| **MODIFY** | `src/core/aggregate-roots/user.aggregate.ts` | Add `setAvatar(fileId: string): void` |
| **MODIFY** | `src/core/interfaces/storage/storage-service.interface.ts` | `publicId` from optional → required |

### Application Layer

| Action | File | Change |
|--------|------|--------|
| **MODIFY** | `src/application/commands/uploaded-file-create/uploaded-file-create.dto.ts` | `targetField: z.nativeEnum(EUploadTargetField)` |
| **MODIFY** | `src/application/commands/uploaded-file-create/uploaded-file-create.handler.ts` | UoW + compensate + linker + eventService |
| **MODIFY** | `src/application/commands/uploaded-file-create/uploaded-file-bulk-create.handler.ts` | Delegate to single command via CommandBus |
| **NEW** | `src/application/services/file-linker.service.ts` | Centralized sync linking by targetType |
| **MODIFY** | `src/application/services/upload.service.ts` | Inject `IImageProcessorService` instead of direct `sharp` |
| **NEW** | `src/application/interfaces/image-processor.interface.ts` | `IImageProcessorService` port |
| **DELETE** | `src/application/events/uploaded-file-created/link-user-avatar.handler.ts` | Replaced by FileLinkerService |
| **DELETE** | `src/application/events/uploaded-file-created/link-enterprise-logo.handler.ts` | Replaced by FileLinkerService |
| **DELETE** | `src/application/events/uploaded-file-created/link-platform-icon.handler.ts` | Replaced by FileLinkerService |
| **DELETE** | `src/application/events/uploaded-file-created/link-campaign-raw.handler.ts` | Replaced by FileLinkerService |
| **DELETE** | `src/application/events/uploaded-file-created/link-campaign-participant-output-file.handler.ts` | Dead code — removed |

### Infrastructure Layer

| Action | File | Change |
|--------|------|--------|
| **NEW** | `src/infrastructure/image-processor/sharp-image-processor.service.ts` | `IImageProcessorService` impl using `sharp` |
| **MODIFY** | `src/infrastructure/modules/uploaded-file.module.ts` | Wire `FileLinkerService`, `IImageProcessorService`, remove deleted event handlers |
| **MODIFY** | `src/infrastructure/cloudinary/cloudinary-storage.service.ts` | Throw if `public_id` absent in Cloudinary response |
| **MODIFY** | `src/shared/utils/string.util.ts` | Add `buildFilename()` utility |

### Presentation Layer

| Action | File | Change |
|--------|------|--------|
| **MODIFY** | `src/presentation/controllers/http/client/uploaded-file.controller.ts` | Remove inline file count guard (move to pipe or command) |
| **MODIFY** | `src/presentation/controllers/http/admin/uploaded-file.controller.ts` | Same; uncomment or remove dead delete endpoints |

---

## 5. Data Flow (After Refactor)

```
POST /v1/client/upload
        │
        ▼
UploadedFileClientController
        │  FileUploadValidationPipe (raw file validate)
        ▼
UploadedFileCreateCommand { file, input: { targetType, targetId, targetField: EUploadTargetField } }
        │
        ▼
UploadedFileCreateCommandHandler
        │
        ├─ [Pre-TX] IImageProcessorService.compress()      ← Infrastructure (sharp)
        ├─ [Pre-TX] IStorageService.upload()               ← Cloudinary
        │
        ├─ [UoW TX] ─────────────────────────────────────────────────────────┐
        │    UploadedFileRoot.create()                                        │
        │    IUploadedFileRepository.save(root)                               │
        │    FileLinkerService.link(root)                                     │
        │      └─ switch(targetType)                                          │
        │           USER       → userRepo.findById → user.setAvatar(id)      │
        │           ENTERPRISE → enterpriseRepo.findById → enterprise.update  │
        │           PLATFORM   → platformRepo.findById → platform.updateIcon  │
        │           CAMPAIGN   → campaignRepo.findById → campaign.update      │
        │    [all in same MongoDB session via AsyncLocalStorage]              │
        └─────────────────────────────────────────────────────────────────────┘
        │  ← on tx failure: storageService.delete(publicId) compensates
        │
        ├─ [Post-TX] EventService.publishEvents(root)      ← Outbox → RMQ
        │
        ▼
UploadedFileDto (immediate, consistent response)
```

---

## 6. Domain Event (Post-Refactor Role)

`UploadedFileCreatedEvent` (to be registered on `UploadedFileRoot.create()`) is **not** used for linking. Its purpose after this refactor is:

- Audit trail
- Analytics pipeline (async metrics ingestion)
- Potential future notification hooks

```typescript
// In UploadedFileRoot.create():
const root = new UploadedFileRoot({ ... });
root.addDomainEvent(new UploadedFileCreatedEvent(root.targetType, root.targetId, root.targetField));
return root;
```

The event is published via `eventService.publishEvents(root)` **after** the UoW commit — going through Outbox → RabbitMQ like all other domain events.

---

## 7. Open Questions

| # | Question | Decision Needed |
|---|----------|-----------------|
| Q1 | `TargetType.CAMPAIGN_PARTICIPANT` — should uploading files to a campaign participant still work? If yes, what does `FileLinkerService` do for it? | Product |
| Q2 | Should the admin delete endpoints be re-enabled? They are commented out currently. | Product |
| Q3 | Bulk upload: should a partial failure (2 of 5 files fail Cloudinary) abort all 5, or return partial results? Current proposal: each file is independent (fail individually, not abort all). | Engineering |
| Q4 | `EUploadTargetField.RAW` for Campaign — what is the correct field name on `CampaignRoot` to update? Currently `rawContents`. Should the campaign raw handler be moved to `FileLinkerService` directly? | Engineering |

---

## 8. Implementation Order

1. **Core**: Add `EUploadTargetField` enum + export + `UserRoot.setAvatar()`
2. **Core**: Make `UploadResult.publicId` required; update Cloudinary adapter to throw if absent
3. **Application**: Create `IImageProcessorService` interface
4. **Infrastructure**: Create `SharpImageProcessorService`
5. **Application**: Create `FileLinkerService` (all private linking methods)
6. **Application**: Refactor `UploadedFileCreateCommandHandler` (UoW + compensate + linker + events)
7. **Application**: Refactor `UploadedFileBulkCreateCommandHandler` (delegate to single)
8. **Application**: Update `UploadedFileCreateInputDto` (`targetField` → `z.nativeEnum`)
9. **Application**: Update `UploadService` to inject `IImageProcessorService`
10. **Application**: Delete 5 old event handler files
11. **Infrastructure**: Wire new providers in `UploadedFileModule`
12. **Shared**: Add `buildFilename()` to `string.util.ts`
13. **Presentation**: Clean up controllers (remove duplicate guard, fix commented endpoints)
