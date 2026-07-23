# Test Suite Reference

> **Summary:** 123 test suites · 450 tests · 123 spec files · 2 mock factory files
>
> **All tests pass:** ✅ `Test Suites: 123 passed, 123 total | Tests: 450 passed, 450 total`

---

# Mock Factories

## `__mocks__/`

- **mock-repositories.ts** — 11 factory functions (`IUserRepository`, `ICampaignRepository`, `IRoleRepository`, `IEnterpriseRepository`, `IKolProfileRepository`, `IPlatformRepository`, `INotificationRepository`, `IUserNotificationRepository`, `IUploadedFileRepository`, `IOtpRepository`, `IKpiLogRepository`)
- **mock-services.ts** — 20 factory functions (`IAuthService`, `IJwtService`, `ILoggerService`, `IMailerService`, `IMessageQueueService`, `IWebSocketService`, `IStorageService`, `IUnitOfWork`, `ICommandBus`, `IQueryBus`, `IEventBus`, `IConfigService`, + 10 `I*ReadService` factories)

---

# Core Layer (14 test suites · 81 tests)

## `core/aggregate-roots/`

| Test Suite                                 | Tests | Scope                                                                                                                                                           |
| ------------------------------------------ | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **admin.aggregate.spec.ts**                | 3     | create, instantiate, getters                                                                                                                                    |
| **campaign.aggregate.spec.ts**             | 2     | create with props, update method                                                                                                                                |
| **campaign-participant.aggregate.spec.ts** | 11    | create, status transitions, getters, softDelete, restore                                                                                                        |
| **enterprise.aggregate.spec.ts**           | 2     | create, instantiate                                                                                                                                             |
| **enterprise-user.aggregate.spec.ts**      | 3     | create, type validation, getters                                                                                                                                |
| **kol-user.aggregate.spec.ts**             | 3     | create, type validation, instantiate                                                                                                                            |
| **notification.aggregate.spec.ts**         | 8     | create (plain/with target), instantiate, equals (match/no match/null), all getters                                                                              |
| **platform.aggregate.spec.ts**             | 3     | create, instantiate, getters                                                                                                                                    |
| **role.aggregate.spec.ts**                 | 3     | create, instantiate, getters                                                                                                                                    |
| **uploaded-file.aggregate.spec.ts**        | 8     | create (with/without title), instantiate, softDelete, restore (incl. idempotent), equals                                                                        |
| **user.aggregate.spec.ts**                 | 18    | create, instantiate, setId guard, equals (ref/id/null), updateRefreshToken, updatePassword, updateGoogleId, softDelete, restore, verifyEmail (incl. idempotent) |
| **user-notification.aggregate.spec.ts**    | 6     | create, instantiate (with read state), markAsRead (incl. idempotent), softDelete, restore                                                                       |

## `core/entities/`

| Test Suite                     | Tests | Scope                                                                                   |
| ------------------------------ | ----- | --------------------------------------------------------------------------------------- |
| **kol-profile.entity.spec.ts** | 9     | create, instantiate, linkUser, addPlatform (single/dedup/multiple), softDelete, restore |

## `core/value-objects/`

| Test Suite                                 | Tests | Scope                       |
| ------------------------------------------ | ----- | --------------------------- |
| **kol-platform-info.value-object.spec.ts** | 2     | create with props, equality |

---

# Application Layer (90 test suites · ~310 tests)

## `application/commands/`

### auth

| Test Suite                               | Tests | Scope                                                                                                                             |
| ---------------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------- |
| **auth-change-password.handler.spec.ts** | 3     | success, wrong old password, user not found                                                                                       |
| **auth-google-sign-in.handler.spec.ts**  | 6     | existing user (with/without googleId), soft-deleted throws, new user creation, missing display name defaults, missing role throws |
| **auth-refresh-token.handler.spec.ts**   | 4     | valid token, invalid token, missing token, expired token                                                                          |
| **auth-reset-password.handler.spec.ts**  | 2     | success, invalid OTP                                                                                                              |
| **auth-send-otp.handler.spec.ts**        | 2     | send OTP, user not found                                                                                                          |
| **auth-sign-in.handler.spec.ts**         | 3     | valid credentials, email not found, wrong password                                                                                |
| **auth-sign-out.handler.spec.ts**        | 2     | sign out, already signed out                                                                                                      |
| **auth-sign-up.handler.spec.ts**         | 3     | new user, duplicate email, no roles configured                                                                                    |
| **auth-verify-otp.handler.spec.ts**      | 3     | valid OTP, expired OTP, wrong OTP                                                                                                 |

### campaign

| Test Suite                               | Tests | Scope                                   |
| ---------------------------------------- | ----- | --------------------------------------- |
| **campaign-create.handler.spec.ts**      | 1     | create campaign                         |
| **campaign-hard-delete.handler.spec.ts** | 2     | hard delete, not found                  |
| **campaign-restore.handler.spec.ts**     | 2     | restore, not found                      |
| **campaign-soft-delete.handler.spec.ts** | 3     | soft delete, default deletor, not found |
| **campaign-update.handler.spec.ts**      | 2     | update, not found                       |

### campaign-participant

| Test Suite                                           | Tests | Scope                                                       |
| ---------------------------------------------------- | ----- | ----------------------------------------------------------- |
| **campaign-participant-create.handler.spec.ts**      | 1     | create participant                                          |
| **campaign-participant-hard-delete.handler.spec.ts** | 3     | hard delete, not found, already hard-deleted                |
| **campaign-participant-restore.handler.spec.ts**     | 2     | restore, not found                                          |
| **campaign-participant-soft-delete.handler.spec.ts** | 3     | soft delete, not found, already soft-deleted                |
| **campaign-participant-update.handler.spec.ts**      | 4     | update status, update output, not found, invalid transition |

### enterprise

| Test Suite                                 | Tests | Scope                             |
| ------------------------------------------ | ----- | --------------------------------- |
| **enterprise-create.handler.spec.ts**      | 2     | create, duplicate                 |
| **enterprise-hard-delete.handler.spec.ts** | 2     | hard delete, not found            |
| **enterprise-restore.handler.spec.ts**     | 2     | restore, not found                |
| **enterprise-soft-delete.handler.spec.ts** | 2     | soft delete, not found            |
| **enterprise-update.handler.spec.ts**      | 3     | update, not found, partial update |

### kol-profile

| Test Suite                                              | Tests | Scope                                      |
| ------------------------------------------------------- | ----- | ------------------------------------------ |
| **kol-profile-hard-delete.handler.spec.ts**             | 2     | hard delete, not found                     |
| **kol-profile-restore.handler.spec.ts**                 | 2     | restore, not found                         |
| **kol-profile-soft-delete.handler.spec.ts**             | 2     | soft delete, not found                     |
| **kol-profile-update.handler.spec.ts**                  | 2     | update, not found                          |
| **kol-profile-verify-platform-account.handler.spec.ts** | 3     | verify, already verified, invalid platform |

### notification

| Test Suite                                      | Tests | Scope                                                                                               |
| ----------------------------------------------- | ----- | --------------------------------------------------------------------------------------------------- |
| **mark-all-notifications-read.handler.spec.ts** | 1     | mark all as read                                                                                    |
| **mark-notification-read.handler.spec.ts**      | 3     | mark read, already read, not found                                                                  |
| **notification-soft-delete.handler.spec.ts**    | 3     | soft delete, not found, already deleted                                                             |
| **send-notification.handler.spec.ts**           | 5     | direct broadcast, empty userIds throws, admin broadcast, enterprise broadcast, enterprise not found |

### platform

| Test Suite                               | Tests | Scope                            |
| ---------------------------------------- | ----- | -------------------------------- |
| **platform-create.handler.spec.ts**      | 2     | create, duplicate                |
| **platform-hard-delete.handler.spec.ts** | 2     | hard delete, not found           |
| **platform-restore.handler.spec.ts**     | 2     | restore, not found               |
| **platform-soft-delete.handler.spec.ts** | 2     | soft delete, not found           |
| **platform-update.handler.spec.ts**      | 3     | update, not found, toggle status |

### role

| Test Suite                           | Tests | Scope                                 |
| ------------------------------------ | ----- | ------------------------------------- |
| **role-create.handler.spec.ts**      | 2     | create, duplicate                     |
| **role-hard-delete.handler.spec.ts** | 2     | hard delete, not found                |
| **role-restore.handler.spec.ts**     | 2     | restore, not found                    |
| **role-soft-delete.handler.spec.ts** | 2     | soft delete, not found                |
| **role-update.handler.spec.ts**      | 3     | update, not found, permissions update |

### uploaded-file

| Test Suite                                    | Tests | Scope                                                                          |
| --------------------------------------------- | ----- | ------------------------------------------------------------------------------ |
| **uploaded-file-bulk-create.spec.ts**         | 2     | bulk create, empty list                                                        |
| **uploaded-file-create.spec.ts**              | 3     | create file, duplicate, missing target                                         |
| **uploaded-file-delete.handler.spec.ts**      | 4     | storage + DB delete, empty publicId skip, not found, storage error propagation |
| **uploaded-file-ops.spec.ts**                 | 5     | combined CRUD operations                                                       |
| **uploaded-file-restore.handler.spec.ts**     | 2     | restore, not found                                                             |
| **uploaded-file-soft-delete.handler.spec.ts** | 3     | soft delete, default deletor, not found                                        |

### user

| Test Suite                              | Tests | Scope                     |
| --------------------------------------- | ----- | ------------------------- |
| **user-create.handler.spec.ts**         | 2     | create, duplicate email   |
| **user-hard-delete.handler.spec.ts**    | 2     | hard delete, not found    |
| **user-restore.handler.spec.ts**        | 2     | restore, not found        |
| **user-soft-delete.handler.spec.ts**    | 2     | soft delete, not found    |
| **user-update-profile.handler.spec.ts** | 2     | update profile, not found |
| **user-update.handler.spec.ts**         | 2     | update user, not found    |

## `application/events/`

### notification-dispatched

| Test Suite                              | Tests | Scope                                                                                          |
| --------------------------------------- | ----- | ---------------------------------------------------------------------------------------------- |
| **email-notification.handler.spec.ts**  | 4     | send email, missing channel skip, invalid email, SMTP failure                                  |
| **in-app-notification.handler.spec.ts** | 4     | ignore non-in-app, save notification + receipts + WS push, WS error tolerance, missing channel |

### uploaded-file-created

| Test Suite                                                | Tests | Scope                                                                                   |
| --------------------------------------------------------- | ----- | --------------------------------------------------------------------------------------- |
| **link-campaign-participant-output-file.handler.spec.ts** | 5     | fileId field, file field, wrong target type, wrong field, participant not found         |
| **link-campaign-raw.handler.spec.ts**                     | 5     | append to existing, empty raw array, wrong target type, wrong field, campaign not found |
| **link-enterprise-logo.handler.spec.ts**                  | 5     | logo field, logoUrlId field, wrong target type, wrong field, enterprise not found       |
| **link-platform-icon.handler.spec.ts**                    | 5     | icon field, iconUrl field, wrong target type, wrong field, platform not found           |
| **link-user-avatar.handler.spec.ts**                      | 5     | avatar field, avatarUrl field, wrong target type, wrong field, user not found           |

## `application/mappers/`

| Test Suite                     | Tests | Scope                                        |
| ------------------------------ | ----- | -------------------------------------------- |
| **campaign.mapper.spec.ts**    | 2     | to DTO, null handling                        |
| **enterprise.mapper.spec.ts**  | 2     | to DTO, null handling                        |
| **kol-profile.mapper.spec.ts** | 2     | to DTO, platform mapping                     |
| **platform.mapper.spec.ts**    | 2     | to DTO, null handling                        |
| **role.mapper.spec.ts**        | 2     | to DTO, null handling                        |
| **user.mapper.spec.ts**        | 4     | to DTO (KOL/enterprise/admin), null handling |

## `application/queries/`

| Test Suite                                         | Tests | Scope                           |
| -------------------------------------------------- | ----- | ------------------------------- |
| **auth-get-profile.handler.spec.ts**               | 2     | get profile, not found          |
| **campaign-get-by-id.handler.spec.ts**             | 2     | found, not found                |
| **campaign-get-list.handler.spec.ts**              | 1     | list with pagination            |
| **campaign-participant-get-by-id.handler.spec.ts** | 2     | found, not found                |
| **campaign-participant-get-list.handler.spec.ts**  | 1     | list with filters               |
| **enterprise-get-by-id.handler.spec.ts**           | 2     | found, not found                |
| **enterprise-get-list.handler.spec.ts**            | 1     | list                            |
| **kol-profile-get-by-id.handler.spec.ts**          | 2     | found, not found                |
| **kol-profile-get-handles-dev.handler.spec.ts**    | 1     | list handles                    |
| **kol-profile-get-list.handler.spec.ts**           | 1     | list                            |
| **kpi-log-get-list.handler.spec.ts**               | 1     | list                            |
| **notification-get-list.handler.spec.ts**          | 1     | list                            |
| **platform-get-by-id.handler.spec.ts**             | 2     | found, not found                |
| **platform-get-list.handler.spec.ts**              | 1     | list                            |
| **role-get-by-id.handler.spec.ts**                 | 2     | found, not found                |
| **role-get-list.handler.spec.ts**                  | 1     | list                            |
| **uploaded-file-get-by-id.handler.spec.ts**        | 2     | found, not found                |
| **uploaded-file-get-list.handler.spec.ts**         | 2     | paginated results, empty result |
| **user-get-by-id.handler.spec.ts**                 | 2     | found, not found                |
| **user-get-list.handler.spec.ts**                  | 1     | list                            |

## `application/services/`

| Test Suite                 | Tests | Scope                                                                                                                                                                            |
| -------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **auth.service.spec.ts**   | 13    | normalizeEmail (trim/lowercase/mixed/already), hashPassword (prefix/salts/different), comparePassword (match/mismatch/empty), generateTokens (pair/access config/refresh config) |
| **upload.service.spec.ts** | 9     | getResourceType (image/video/raw), processAndValidateFile (size OK/compress/too large/not image)                                                                                 |

---

# Infrastructure Layer (11 test suites · ~40 tests)

## `infrastructure/auth/`

| Test Suite              | Tests | Scope                                                                                                                                                                                                                                                                                                                        |
| ----------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **jwt.service.spec.ts** | 21    | sign (default/expiresIn/custom), verify (plain/with options), decode, extractTokenFromHeader (Bearer/missing/non-Bearer), extractTokenFromCookie (found/empty/undefined), verifyAuthHeader (success/missing), verifyHandshake (priority/Bearer strip/fallback/missing), verifyRequest (header first/cookie fallback/missing) |

## `infrastructure/cloudinary/`

| Test Suite                             | Tests | Scope                                                          |
| -------------------------------------- | ----- | -------------------------------------------------------------- |
| **cloudinary-storage.service.spec.ts** | 3     | extractPublicIdFromUrl (standard URL/non-Cloudinary/malformed) |

## `infrastructure/mongo/`

| Test Suite                                  | Tests | Scope                                                                                                                                                             |
| ------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **campaign-participant.repository.spec.ts** | 7     | findById, findByCampaignAndKol, findByOutputId, save (insert/update), delete                                                                                      |
| **campaign.repository.spec.ts**             | 5     | findById, findAll, findByOwnerId, findByEnterpriseId, save                                                                                                        |
| **mongo-uow.spec.ts**                       | 9     | startTransaction, commitTransaction (with/without session), rollbackTransaction (with/without session), execute (success/rollback), getSession (null/after start) |
| **user.repository.spec.ts**                 | 5     | findById, findByEmail, save (new/update), delete                                                                                                                  |

## `infrastructure/nest-logger/`

| Test Suite                      | Tests | Scope                                                                                               |
| ------------------------------- | ----- | --------------------------------------------------------------------------------------------------- |
| **nest-logger.service.spec.ts** | 9     | log, log with context, error, error with trace, warn, warn with context, debug, verbose, setContext |

## `infrastructure/rabbitmq/`

| Test Suite                        | Tests | Scope                                                                                         |
| --------------------------------- | ----- | --------------------------------------------------------------------------------------------- |
| **rabbitmq.service.spec.ts**      | 6     | emit (routing key/fallback/Error rejection/string rejection), send (not supported), isHealthy |
| **rmq-consumer.registry.spec.ts** | 5     | register (single/multiple), getHandlersForQueue (found/not found), getAllHandlers             |

## `infrastructure/websocket/`

| Test Suite                    | Tests | Scope                                     |
| ----------------------------- | ----- | ----------------------------------------- |
| **websocket.service.spec.ts** | 3     | emitToUser, broadcastToRoom, broadcastAll |

## `infrastructure/`

| Test Suite                        | Tests | Scope                                                                |
| --------------------------------- | ----- | -------------------------------------------------------------------- |
| **nestjs-mailer.service.spec.ts** | 4     | send email, send with template, missing recipient, transport failure |

---

# Presentation Layer (7 test suites · ~19 tests)

## `presentation/controllers/`

| Test Suite                                  | Tests | Scope                                                                                                                                                     |
| ------------------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **auth.controller.spec.ts**                 | 12    | sign-up (KOL/enterprise), sign-in, sign-out, refresh-token, change-password, reset-password, send-otp, verify-otp, get-profile, google-auth, unauthorized |
| **campaign-participant.controller.spec.ts** | 8     | create, get-by-id, get-list, update, soft-delete, hard-delete, restore, unauthorized                                                                      |

## `presentation/decorators/`

| Test Suite             | Tests | Scope                                                 |
| ---------------------- | ----- | ----------------------------------------------------- |
| **decorators.spec.ts** | 4     | @Public sets metadata, @Roles (multiple/single/empty) |

## `presentation/middleware/filters/`

| Test Suite                          | Tests | Scope                                                                                                                   |
| ----------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------- |
| **domain-exception.filter.spec.ts** | 7     | NotFound→404, Conflict→409, Forbidden→403, Unauthorized→401, BadRequest→400, generic Domain→400, error name + timestamp |
| **http-exception.filter.spec.ts**   | 5     | HttpException 404, non-HttpException 500, string body, string error fallback, validation errors array                   |

## `presentation/middleware/`

| Test Suite                 | Tests | Scope                                                                                                  |
| -------------------------- | ----- | ------------------------------------------------------------------------------------------------------ |
| **jwt-auth.guard.spec.ts** | 7     | allow public route, block non-public, validate strategy (user exists/not found/deleted), missing token |
| **roles.guard.spec.ts**    | 7     | matching role, non-matching role, no roles required, public route bypass, missing user, admin bypass   |

---

# Shared Layer (1 test suite · 5 tests)

| Test Suite                           | Tests | Scope                                             |
| ------------------------------------ | ----- | ------------------------------------------------- |
| **shared/utils/string.util.spec.ts** | 5     | capitalize, truncate, slugify, camelCase, isEmpty |

---

# E2E Tests (11 test suites · ~34 tests)

| Test Suite                               | Tests | Scope                                                                                                                                                                                             |
| ---------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **e2e/auth.e2e-spec.ts**                 | 8     | happy path sign-up→sign-in→profile, missing token 401, invalid token 401, invalid refresh token 401, sign-out without auth 401, wrong password 401, non-existent email 401, duplicate sign-up 409 |
| **e2e/campaign.e2e-spec.ts**             | 4     | full lifecycle (create→get→list→update→soft-delete→restore→hard-delete→verify gone), missing token 401, non-existent campaign 404 (get + update)                                                  |
| **e2e/campaign-participant.e2e-spec.ts** | 1     | create participant lifecycle                                                                                                                                                                      |
| **e2e/enterprise.e2e-spec.ts**           | 1     | create enterprise → update → get                                                                                                                                                                  |
| **e2e/kol-profile.e2e-spec.ts**          | 1     | get → list → update → soft-delete → restore → hard-delete → verify gone                                                                                                                           |
| **e2e/kpi-log.e2e-spec.ts**              | 1     | fetch paginated KPI logs                                                                                                                                                                          |
| **e2e/notification.e2e-spec.ts**         | 2     | missing token 401, full lifecycle (create→list→mark-read→soft-delete→verify hidden)                                                                                                               |
| **e2e/platform.e2e-spec.ts**             | 1     | full lifecycle (create→get→list→update→soft-delete→restore→hard-delete→verify gone)                                                                                                               |
| **e2e/role.e2e-spec.ts**                 | 2     | non-admin blocked 403, admin CRUD lifecycle                                                                                                                                                       |
| **e2e/uploaded-file.e2e-spec.ts**        | 1     | upload → get → list → soft-delete → restore → hard-delete → verify gone                                                                                                                           |
| **e2e/user.e2e-spec.ts**                 | 2     | non-admin blocked 403, admin CRUD lifecycle                                                                                                                                                       |
