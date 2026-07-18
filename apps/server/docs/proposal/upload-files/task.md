# Task List — UploadedFile Domain Refactor

> **Reference**: `docs/proposal/upload-files/plan.md`  
> **Goal**: Atomic upload-and-link, no orphaned assets, clean architecture.

---

## Phase 1 — Core: Enum + Aggregate Setter

> **Scope**: Pure domain layer, no framework deps. Safe to do first.

- [x] Create `src/core/enums/upload-target-field.enum.ts`
  - Members: `AVATAR`, `LOGO_URL_ID`, `ICON`, `RAW`
  - Follow pattern: `SCREAMING_SNAKE_CASE` member, `snake_case`/`camelCase` value
- [x] Export `EUploadTargetField` from `src/core/enums/index.ts`
- [x] Add `UserRoot.setAvatar(fileId: string): void` method to `src/core/aggregate-roots/user.aggregate.ts`
  - Sets `this.props.avatar = fileId` and bumps `updatedAt`

---

## Phase 2 — Core: Harden `UploadResult.publicId`

> **Scope**: Storage interface + Cloudinary adapter. Isolated change.

- [x] Change `publicId?: string` → `publicId: string` in `UploadResult` interface
  - File: `src/core/interfaces/storage/storage-service.interface.ts`
- [x] Update Cloudinary adapter to throw `DomainException` if `public_id` is absent in response
  - File: find Cloudinary implementation under `src/infrastructure/cloudinary/`
- [x] Fix both create handlers' `publicId: uploadResult.publicId || ''` fallback (remove the `|| ''`)
  - Files: `uploaded-file-create.handler.ts`, `uploaded-file-bulk-create.handler.ts`

---

## Phase 3 — Infrastructure: Extract Image Compression

> **Scope**: Move `sharp` out of Application layer into Infrastructure.

- [x] Create `IImageProcessorService` interface
  - File: `src/application/interfaces/image-processor.interface.ts`
  - Token: `IMAGE_PROCESSOR_SERVICE = Symbol('IImageProcessorService')`
  - Method: `compress(buffer: Buffer, mimetype: string): Promise<{ buffer: Buffer; size: number }>`
- [x] Export token + interface from `src/application/interfaces/index.ts`
- [x] Create `SharpImageProcessorService` implementation
  - File: `src/infrastructure/image-processor/sharp-image-processor.service.ts`
  - Move all `sharp` logic from `UploadService.processAndValidateFile()` here
- [x] Refactor `UploadService` to inject `IImageProcessorService` via DI token
  - Remove direct `import sharp` from `upload.service.ts`
  - `processAndValidateFile()` delegates to `this.imageProcessor.compress()`

---

## Phase 4 — Application: Create `FileLinkerService`

> **Scope**: New service that synchronously links an uploaded file to its target aggregate.  
> Replaces the 5 scattered `link-*.handler.ts` event handlers.

- [x] Create `src/application/services/file-linker.service.ts`
  - Inject: `USER_REPOSITORY`, `ENTERPRISE_REPOSITORY`, `PLATFORM_REPOSITORY`, `CAMPAIGN_REPOSITORY`
  - Public method: `link(root: UploadedFileRoot): Promise<void>`
  - Route by `root.targetType` using a `switch`
- [x] Implement `private linkUser(root)`:
  - Guard: `root.targetField !== EUploadTargetField.AVATAR` → return
  - `userRepo.findById → user.setAvatar(root.id!) → userRepo.save(user)`
- [x] Implement `private linkEnterprise(root)`:
  - Guard: `root.targetField !== EUploadTargetField.LOGO_URL_ID` → return
  - `enterpriseRepo.findById → enterprise.update({ logoUrlId: root.id! }) → repo.save`
- [x] Implement `private linkPlatform(root)`:
  - Guard: `root.targetField !== EUploadTargetField.ICON` → return
  - `platformRepo.findById → platform.updateIcon(root.id!) → repo.save`
- [x] Implement `private linkCampaign(root)`:
  - Guard: `root.targetField !== EUploadTargetField.RAW` → return
  - Append `{ fileId: root.id!, rawContent: '' }` to `campaign.rawContents`
  - `campaignRepo.findById → campaign.update({ rawContents }) → repo.save`
- [x] Add `// TODO: CAMPAIGN_PARTICIPANT linking — deferred (see plan Q1)` for that case

---

## Phase 5 — Application: Refactor Single Create Handler

> **Scope**: The main handler gets UoW, compensating delete, and linker wiring.

- [x] Inject `UNIT_OF_WORK`, `EVENT_SERVICE`, and `FileLinkerService` into `UploadedFileCreateCommandHandler`
  - Remove `EventBus` injection (no longer needed)
- [x] Add `buildFilename()` utility to `src/shared/utils/string.util.ts`
  - Uses `path.parse(originalname).name` + `uuidv4()` suffix
- [x] Add `resolveFormat(storageFormat, mimetype)` pure function (same file or `upload.service.ts`)
- [x] Rewrite `execute()` in three phases:
  1. **Pre-TX**: `imageProcessor.compress()` → `storageService.upload()`
  2. **UoW TX**: `UploadedFileRoot.create()` → `repo.save()` → `linker.link()`  
     Wrap in `try/catch`; on catch: `storageService.delete(publicId)` then rethrow
  3. **Post-commit**: `eventService.publishEvents(root)`
- [x] Remove `UploadedFileCreatedEvent` import from this handler

---

## Phase 6 — Application: Domain Event on Aggregate

> **Scope**: Wire domain event properly through aggregate → eventService pipeline.

- [x] Create `src/core/events/uploaded-file-created.domain-event.ts`
  - Extends `BaseDomainEvent`
  - Carries `targetType`, `targetId`, `targetField`
- [x] In `UploadedFileRoot.create()`, call `this.addDomainEvent(new UploadedFileCreatedEvent(...))`
- [ ] Delete old application-layer event file:
  - `src/application/events/uploaded-file-created/uploaded-file-created.event.ts`
- [ ] Update any remaining imports that referenced the old event class

---

## Phase 7 — Application: Refactor Bulk Create Handler

> **Scope**: Remove copy-paste; delegate to single command.

- [x] Inject `CommandBus` into `UploadedFileBulkCreateCommandHandler`
- [x] Rewrite `execute()` to `Promise.all(files.map(f => commandBus.execute(new UploadedFileCreateCommand(f, input))))`
- [x] Remove all duplicated logic (process, upload, create, save, event) from bulk handler

---

## Phase 8 — Application: Update DTO Validation

> **Scope**: Enforce `EUploadTargetField` at the API boundary.

- [x] Update `UploadedFileCreateInputDto` schema
  - File: `src/application/commands/uploaded-file-create/uploaded-file-create.dto.ts`
  - Change `targetField: z.string()` → `targetField: z.nativeEnum(EUploadTargetField)`
- [x] Verify Swagger still renders the enum values correctly in both controllers

---

## Phase 9 — Cleanup: Delete Old Event Handlers

> **Scope**: Remove all 5 replaced link-event handler files.

- [x] Delete `src/application/events/uploaded-file-created/link-user-avatar.handler.ts`
- [x] Delete `src/application/events/uploaded-file-created/link-enterprise-logo.handler.ts`
- [x] Delete `src/application/events/uploaded-file-created/link-platform-icon.handler.ts`
- [x] Delete `src/application/events/uploaded-file-created/link-campaign-raw.handler.ts`
- [x] Delete `src/application/events/uploaded-file-created/link-campaign-participant-output-file.handler.ts`
- [x] Remove all deleted handlers from their export indices (`src/application/events/index.ts`)

---

## Phase 10 — Infrastructure: Module Wiring

> **Scope**: Register all new providers; remove deleted ones.

- [x] Update `UploadedFileModule`:
  - Add `FileLinkerService` to `providers`
  - Add `{ provide: IMAGE_PROCESSOR_SERVICE, useClass: SharpImageProcessorService }` to `providers`
  - Remove deleted event handler references from `EVENT_HANDLERS` (currently empty but verify)
  - Add repository imports needed by `FileLinkerService`:  
    (`USER_REPOSITORY`, `ENTERPRISE_REPOSITORY`, `PLATFORM_REPOSITORY`, `CAMPAIGN_REPOSITORY`)
    — these are likely available via `InfrastructureModule` re-exports; confirm
- [x] Add comment block in `UploadedFileModule` listing which module owns each repository  
  (for cross-reference clarity per audit note P10)

---

## Phase 11 — Presentation: Controller Cleanup

> **Scope**: Thin controllers, remove duplication and dead code.

- [x] Move file count limit (`files.length > 10`) out of both controllers:
  - Option: add check inside `UploadedFileBulkCreateCommandHandler` as a domain guard
  - Remove the duplicate guard blocks from `UploadedFileClientController` and `UploadedFileAdminController`
- [x] Admin controller — decide on commented-out delete endpoints:
  - If deleting is intentionally disabled: remove the commented block entirely and add a `// NOTE:` explaining why
  - If it should be enabled: uncomment and wire `UploadedFileDeleteCommand` / `UploadedFileSoftDeleteCommand`
- [x] Confirm `TargetType` enum values in Swagger `@ApiBody` descriptions still match after `EUploadTargetField` is added

---

## Phase 12 — Verification

- [/] Run `tsc --noEmit` — zero type errors (especially around `publicId` required, `setAvatar`, `EUploadTargetField`)
- [/] Test single upload: upload a file with `targetType=USER`, `targetField=avatar` → confirm `UserRoot.avatar` is updated in the same DB call
- [/] Test Cloudinary failure path: mock `storageService.upload` to throw → confirm no `UploadedFile` record is saved
- [/] Test DB failure path: mock `repo.save` to throw after Cloudinary succeeds → confirm `storageService.delete` is called (compensate)
- [/] Test bulk upload: upload 3 files → confirm 3 independent records created, 3 links applied
- [/] Test invalid `targetField` value in DTO → confirm Zod returns 400 with validation error
