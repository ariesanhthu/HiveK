# Authentication & User Domain

> **Last Updated**: 2026-07-17
> **Related Docs**: [campaign domain](../campaign/domain.md), [enterprise domain](../enterprise/domain.md)

---

## 1. Domain Overview

The **Authentication** domain is the identity and access control backbone of the HiveK platform. It manages user identities, authentication flows, authorization roles, and email/phone verification.

### Bounded Context

```
┌───────────────────────────────────────────────────────────────────┐
│                     Authentication Context                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │                     User Hierarchy                        │     │
│  │  ┌──────────────────────────────────────────┐             │     │
│  │  │              UserRoot (abstract)           │            │     │
│  │  │  email | passwordHash | refreshToken       │            │     │
│  │  │  isEmailVerified | googleId | roleId       │            │     │
│  │  └────────┬──────────┬──────────┬────────────┘            │     │
│  │           │          │          │                         │     │
│  │  ┌────────▼──┐ ┌────▼─────────┐ ┌─▼──────────┐           │     │
│  │  │ KOLUser   │ │EnterpriseUser│ │  AdminRoot │           │     │
│  │  │   Root    │ │    Root      │ │            │           │     │
│  │  └───────────┘ └──────┬───────┘ └────────────┘           │     │
│  │                       │                                    │     │
│  │               enterpriseIds[]                               │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                   │
│  ┌──────────────────────┐    ┌────────────────────────┐           │
│  │       OtpRoot        │    │      Guard Stack       │           │
│  │ email | code | type  │    │ ApiKey → JwtAuth →     │           │
│  │ expiresAt | isExpired│    │ Roles → UserVerified   │           │
│  └──────────────────────┘    └────────────────────────┘           │
└───────────────────────────────────────────────────────────────────┘
```

### Key Concepts

| Concept | Description |
|---------|-------------|
| **UserRoot** | Abstract aggregate base for all user types (KOL, Enterprise, Admin) |
| **KOLUserRoot** | User specialized for KOL/KOC role (`ERoleType.KOL`) |
| **EnterpriseUserRoot** | User specialized for Enterprise role; can link to multiple enterprises |
| **AdminRoot** | User specialized for system administrators (`ERoleType.ADMIN`) |
| **OtpRoot** | Short-lived verification code for email/identity confirmation |
| **PhoneNumberVO** | Value object enforcing international `+` format phone numbers |
| **JWT Token** | Stateless access token encoding `sub`, `email`, `role`, `type`, `isEmailVerified` |
| **Refresh Token** | Long-lived token rotated on each refresh; stored in the User aggregate |
| **Guard Stack** | Layered middleware: `ApiKeyGuard` → `JwtAuthGuard` → `RolesGuard` → `UserVerifiedGuard` |

### Relations to Other Domains

- **Enterprise**: `EnterpriseUserRoot.enterpriseIds[]` links users to enterprises
- **Campaign**: Users own campaigns; collaborators are user IDs
- **Social Page**: Users connect social pages; KOLs have linked profiles
- **KPI/Tracking**: Users own KPI logs and scheduled posts

---

## 2. Core Layer

### 2.1 Aggregate Root: `UserRoot` (Abstract)

**File**: `src/core/aggregate-roots/user.aggregate.ts`

**Type**: Abstract base class — not instantiated directly. Use `KOLUserRoot`, `EnterpriseUserRoot`, or `AdminRoot`.

#### Properties (`UserProps`)

| Property | Type | Description |
|----------|------|-------------|
| `email` | `string` | Normalized (lowercased, trimmed) email address |
| `phone` | `PhoneNumberVO` | International format phone number value object |
| `passwordHash` | `string` | Bcrypt-hashed password |
| `type` | `ERoleType` | User classification: `kol`, `enterprise`, `admin` (immutable) |
| `roleId` | `string` | FK to Role aggregate for granular permissions |
| `isEmailVerified` | `boolean` | Whether email has been verified via OTP or social auth |
| `fullName` | `string` | Display name |
| `avatar` | `string` (optional) | Avatar URL |
| `refreshToken` | `Nullable<string>` | Current valid refresh token (`null` = none) |
| `googleId` | `Nullable<string>` | Linked Google OAuth account ID |
| `deleteAt` / `deleteBy` | `Nullable<Date>` / `Nullable<string>` | Soft-delete metadata |
| `createdAt` / `updatedAt` | `Date` | Timestamps |

#### Factory Methods

```typescript
abstract static create(props): UserRoot
```
- Implemented by subclasses with type validation

```typescript
abstract static instantiate(id: string, props): UserRoot
```
- Reconstitutes from persistence

#### Domain Methods

| Method | Description | Raises Event |
|--------|-------------|-------------|
| `updateFullName(fullName)` | Updates display name | — |
| `updateRefreshToken(token)` | Rotates refresh token | — |
| `updatePassword(passwordHash)` | Updates password hash | — |
| `updatePhone(phone)` | Updates phone number | — |
| `updateGoogleId(googleId)` | Links/unlinks Google account | — |
| `softDelete(deletedBy)` | Soft-deletes user | — |
| `restore()` | Recovers soft-deleted user | — |
| `verifyEmail()` | Marks email as verified | — |

### 2.2 Aggregate: `KOLUserRoot`

**File**: `src/core/aggregate-roots/kol-user.aggregate.ts`

**Extends**: `UserRoot<KOLUserProps>` | **Type constraint**: `ERoleType.KOL`

| Extra Property | Type | Description |
|---------------|------|-------------|
| — | — | No extra properties beyond `UserProps` |

**Factory Methods**:
- `create(props)` — Validates `type === ERoleType.KOL`. Raises `UserSignedUpEvent` via `setId()`.
- `instantiate(id, props)` — Reconstitutes from persistence.

### 2.3 Aggregate: `EnterpriseUserRoot`

**File**: `src/core/aggregate-roots/enterprise-user.aggregate.ts`

**Extends**: `UserRoot<EnterpriseUserProps>` | **Type constraint**: `ERoleType.ENTERPRISE`

| Extra Property | Type | Description |
|---------------|------|-------------|
| `enterpriseIds` | `string[]` | Enterprise IDs the user belongs to |

**Factory Methods**:
- `create(props)` — Validates `type === ERoleType.ENTERPRISE`. Raises `UserSignedUpEvent` via `setId()`.
- `instantiate(id, props)` — Reconstitutes from persistence.

**Domain Methods**:
- `addEnterprise(enterpriseId, enterpriseName?)` — Links user to enterprise. Raises `UserAddedToEnterpriseEvent`.
- `revokeEnterprise(enterpriseId, enterpriseName?)` — Unlinks user from enterprise. Raises `UserRevokedFromEnterpriseEvent`.

### 2.4 Aggregate: `AdminRoot`

**File**: `src/core/aggregate-roots/admin.aggregate.ts`

**Extends**: `UserRoot<AdminProps>` | **Type constraint**: `ERoleType.ADMIN`

No extra properties. `create()` validates `type === ERoleType.ADMIN`.

### 2.5 Aggregate: `OtpRoot`

**File**: `src/core/aggregate-roots/otp.aggregate.ts`

#### Properties (`OtpProps`)

| Property | Type | Description |
|----------|------|-------------|
| `email` | `string` | Target email for verification |
| `code` | `string` | The OTP code (typically 6-digit numeric) |
| `type` | `EOtpType` | `create_account`, `reset_password`, `change_password` |
| `expiresAt` | `Date` | Expiration timestamp (typically 5 min from creation) |
| `createdAt` / `updatedAt` | `Date` | Timestamps |

#### Factory Methods

- `create(props, id?)` — Creates OTP with timestamps
- `instantiate(id, props)` — Reconstitutes from persistence

#### Domain Methods

| Method | Description | Raises Event |
|--------|-------------|-------------|
| `setId(id)` | Override — raises `VerificationOtpCreatedEvent` | ✅ |
| `isExpired()` | Checks if `now > expiresAt` | — |

### 2.6 Value Object: `PhoneNumberVO`

**File**: `src/core/value-objects/phone-number.value-object.ts`

| Property | Type | Description |
|----------|------|-------------|
| `value` | `string` | Phone number in international format (`+...`) |

**Invariant**: Must match `/^\\+\\d+$/` (starts with `+`, digits only).

### 2.7 Enums

#### `ERoleType` (`src/core/enums/role-type.enum.ts`)

| Member | Value | Description |
|--------|-------|-------------|
| `KOL` | `'kol'` | Content creator / Influencer |
| `ENTERPRISE` | `'enterprise'` | Brand / Advertiser |
| `ADMIN` | `'admin'` | System administrator |

#### `EOtpType` (`src/core/enums/otp-type.enum.ts`)

| Member | Value | Description |
|--------|-------|-------------|
| `CREATE_ACCOUNT` | `'create_account'` | Email verification for new sign-ups |
| `RESET_PASSWORD` | `'reset_password'` | Password reset flow |
| `CHANGE_PASSWORD` | `'change_password'` | Authenticated password change |

### 2.8 Domain Events

| Event | File | Trigger | Payload |
|-------|------|---------|---------|
| `UserSignedUpEvent` | `src/core/events/user-signed-up.domain-event.ts` | `KOLUserRoot.setId()` / `EnterpriseUserRoot.setId()` | `email`, `fullName?`, `phone?`, `type` |
| `VerificationOtpCreatedEvent` | `src/core/events/verification-otp-created.domain-event.ts` | `OtpRoot.setId()` | Full `OtpProps` |
| `UserAddedToEnterpriseEvent` | `src/core/events/user-added-to-enterprise.domain-event.ts` | `EnterpriseUserRoot.addEnterprise()` | `userId`, `userEmail`, `enterpriseId`, `enterpriseName?` |
| `UserRevokedFromEnterpriseEvent` | `src/core/events/user-revoked-from-enterprise.domain-event.ts` | `EnterpriseUserRoot.revokeEnterprise()` | `userId`, `userEmail`, `enterpriseId`, `enterpriseName?` |

### 2.9 Domain Exceptions

| Exception | File | Trigger |
|-----------|------|---------|
| `InvalidCredentialsException` | `src/core/exceptions/auth.exception.ts` | Wrong email/password during sign-in |
| `InvalidRefreshTokenException` | `src/core/exceptions/auth.exception.ts` | Expired/invalid refresh token |
| `InvalidPasswordException` | `src/core/exceptions/auth.exception.ts` | Incorrect old password during change |
| `UserDeletedException` | `src/core/exceptions/auth.exception.ts` | Deleted user attempts action |
| `InvalidUserTypeException` | `src/core/exceptions/auth.exception.ts` | Wrong type in factory method |
| `OtpRateLimitException` | `src/core/exceptions/general.exception.ts` | OTP requested < 60s ago |
| `InvalidOperationException` | `src/core/exceptions/general.exception.ts` | Expired or mismatched OTP |

---

## 3. State Machines

### 3.1 User Account Status

```
                         ┌───────────┐
                         │  ACTIVE   │
                         │ (verified)│
                         └───────────┘
                              ▲
                    verify()  │
                              │
                    ┌─────────────────┐
                    │  UNVERIFIED      │
                    │ (isEmailVerified │
                    │  = false)        │
                    └────────┬────────┘
                             │
                    softDelete()     restore()
                             ▼              ▲
                    ┌──────────────┐        │
                    │ SOFT_DELETED │────────┘
                    │ (deleteAt    │
                    │  set)        │
                    └──────────────┘
```

**Transitions**:
- `UNVERIFIED` → `VERIFIED`: Triggered by OTP verification (`verifyEmail()`) or Google sign-in (auto-verifies)
- Any state → `SOFT_DELETED`: `softDelete(deletedBy)` (user/admin action)
- `SOFT_DELETED` → previous state: `restore()`

**Invariant**: User `type` is **immutable** after creation.

### 3.2 OTP Lifecycle

```
                  ┌────────────┐
                  │  CREATED   │
                  │ expiresIn  │
                  │  5 min     │
                  └─────┬──────┘
                        │
             ┌──────────┼──────────┐
             │          │          │
             ▼          ▼          ▼
       ┌─────────┐ ┌─────────┐ ┌─────────┐
       │ VERIFIED│ │EXPIRED  │ │INVALID  │
       │ (match) │ │(time up)│ │(wrong)  │
       └─────────┘ └─────────┘ └─────────┘
```

| From | To | Method | Conditions |
|------|----|--------|------------|
| `CREATED` | `VERIFIED` | `verify-otp` handler | Code matches + not expired |
| `CREATED` | `EXPIRED` | (automatic) | `isExpired()` returns true |
| `CREATED` | `INVALID` | (automatic on retry) | Code mismatch |
| Any | `DELETED` | `deleteByEmailAndType()` | After success or rate-limit reset |

**Rate Limit**: Only 1 active OTP per email+type; re-request invalidates previous. Minimum 60s between requests (`OtpRateLimitException`).

---

## 4. Application Layer

### 4.1 Command Flow Architecture

```
Client Request (REST)
         │
         ▼
Controller.method()
  ├─ Zod DTO validation (nestjs-zod)
  └─ CommandBus.execute(new AuthXxxCommand(dto))
         │
         ▼
CommandHandler.execute(command)
  ├─ this.uow.execute(async () => {
  │     const user = await this.repo.findByEmail(email);
  │     user.someDomainMethod(params);
  │     await this.repo.save(user);
  │     await this.eventService.publishEvents(user);
  │   });
  └─ (within UoW, Outbox rows inserted atomically)
         │
         ▼
EventService.publishEvents()
  ├─ Maps DomainEvent → IntegrationEvent (via OutboxModel)
  └─ OutboxProcessor → RabbitMQ → downstream handlers
         │
         ▼
IntegrationEvent subscribers
  ├─ SendVerificationEmailRequestedEvent → email service
  └─ UserSignedUpEvent → downstream onboarding
```

### 4.2 Auth Commands

| Command | Handler | DTO | Description | UoW | Events |
|---------|---------|-----|-------------|-----|--------|
| `AuthSignUpCommand` | `AuthSignUpCommandHandler` | `AuthSignUpInputDto` | Creates user account + dispatches OTP | ✅ | ✅ |
| `AuthSignInCommand` | `AuthSignInCommandHandler` | `AuthSignInInputDto` | Password verification + token generation | ✗ | — |
| `AuthSignOutCommand` | `AuthSignOutCommandHandler` | — | Invalidates refresh token + disconnects WS | ✗ | — |
| `AuthGoogleSignInCommand` | `AuthGoogleSignInCommandHandler` | `AuthGoogleSignInInputDto` | Google OAuth login/register | ✅ | ✅ |
| `AuthSendOtpCommand` | `AuthSendOtpCommandHandler` | `AuthSendOtpInputDto` | Generates + persists OTP, rate-limited | ✅ | ✅ |
| `AuthVerifyOtpCommand` | `AuthVerifyOtpCommandHandler` | `AuthVerifyOtpInputDto` | Validates OTP → marks email verified | ✅ | ✅ |
| `AuthRefreshTokenCommand` | `AuthRefreshTokenCommandHandler` | `AuthRefreshTokenInputDto` | Token rotation (verify → invalidate old → issue new) | ✗ | — |
| `AuthChangePasswordCommand` | `AuthChangePasswordCommandHandler` | `AuthChangePasswordInputDto` | Verified OTP → validate old pw → hash new pw | ✅ | ✅ |
| `AuthResetPasswordCommand` | `AuthResetPasswordCommandHandler` | `AuthResetPasswordInputDto` | Verified OTP → hash new pw (no old pw needed) | ✅ | ✅ |

### 4.3 Auth Queries

| Query | Handler | DTO | Description |
|-------|---------|-----|-------------|
| `AuthGetProfileQuery` | `AuthGetProfileHandler` | — | Fetches current user's profile with populated role & avatar |

### 4.4 Application Service: `AuthService`

**File**: `src/application/services/auth.service.ts`

| Method | Description |
|--------|-------------|
| `normalizeEmail(email)` | Trims + lowercases email for consistency |
| `hashPassword(password)` | Bcrypt hash with cost factor 10 |
| `comparePassword(password, hash)` | Bcrypt comparison |
| `generateTokens(payload)` | Signs JWT access + refresh tokens with configured expiry |

### 4.5 Integration Events

| Event | File | Description |
|-------|------|-------------|
| `SendVerificationEmailRequestedEvent` | `src/application/events/send-verification-email-requested.event.ts` | Emitted after OTP creation; triggers email delivery |
| `RequestAuthUpdateSubscriptionEvent` | `src/application/events/request-auth-update-subscription.event.ts` | Emitted when enterprise subscription changes |

### 4.6 Mapper: `UserMapper`

**File**: `src/application/mappers/user.mapper.ts`

| Method | Source → Target | Notes |
|--------|----------------|-------|
| `toDto(root)` | `UserRoot<T>` → `UserDto` (discriminated union by type) | Maps `EnterpriseUserRoot.enterpriseIds` for enterprise type |
| `toListDto(roots)` | `UserRoot<T>[]` → `UserDto[]` | Batch mapping |

### 4.7 Read Service Interface

| Token | Interface | Methods |
|-------|-----------|---------|
| `USER_READ_SERVICE` | `IUserReadService` | `findAll(filters, projection)`, `findById(id, projection)` |

### 4.8 DI Tokens

| Token | Interface |
|-------|-----------|
| `AUTH_JWT_SERVICE` | `IAuthJwtService` |
| `USER_REPOSITORY` | `IUserRepository` |
| `OTP_REPOSITORY` | `IOtpRepository` |
| `USER_READ_SERVICE` | `IUserReadService` |

---

## 5. Infrastructure Layer

### 5.1 Mongoose Schemas

#### `UserModel` (& discriminators) — collection: `users`

**File**: `src/infrastructure/mongo/schemas/user.schema.ts`

Uses **discriminator** pattern: base `UserModel` with `AdminModel`, `EnterpriseUserModel`, `KOLUserModel` subclasses.

| Base Field | Type | Domain Property |
|------------|------|-----------------|
| `email` | `String` (unique, lowercase, trimmed) | email |
| `phone` | `String` (regex: `/^\\+?[1-9]\\d{1,14}$/`) | phone.value |
| `password_hash` | `String` | passwordHash |
| `full_name` | `String` (1-100 chars) | fullName |
| `avatar` | `ObjectId` (ref: UploadedFile, nullable) | avatar |
| `type` | `String` (discriminator key) | type |
| `role_id` | `ObjectId` (ref: Role) | roleId |
| `is_email_verified` | `Boolean` (default: false) | isEmailVerified |
| `refresh_token` | `String` (nullable) | refreshToken |
| `google_id` | `String` (nullable) | googleId |
| `delete_at` / `delete_by` | `Date` / `String` (nullable) | deleteAt / deleteBy |
| `created_at` / `updated_at` | `Date` | createdAt / updatedAt |

**EnterpriseUserModel extra field**: `enterprise_ids` (`[ObjectId]`, ref: Enterprise)

#### `OtpModel` — collection: `otps`

**File**: `src/infrastructure/mongo/schemas/otp.schema.ts`

| Field | Type | Description |
|-------|------|-------------|
| `code` | `String` (required) | OTP code |
| `email` | `String` (lowercase, trimmed) | Target email |
| `type` | `String` (enum: `EOtpType`) | OTP purpose |
| `expired_at` | `Date` (TTL index via `expires: 0`) | Auto-expires via MongoDB TTL |

### 5.2 Repositories

#### `MongoUserRepository`

**File**: `src/infrastructure/mongo/repositories/user.repository.ts`
**Implements**: `IUserRepository`

| Method | Description |
|--------|-------------|
| `findById(id)` | Fetches user by ID with discriminator |
| `findByIds(ids)` | Batch fetch by IDs |
| `findByEmail(email)` | Fetches user by normalized email |
| `findByEnterpriseId(enterpriseId)` | Users linked to an enterprise |
| `existsByRoleId(roleId)` | Check if any user has a role |
| `save(user)` | Upsert via discriminator model |
| `saveMany(users)` | Batch save |
| `delete(id)` | Hard-delete |

**Mapping**: Uses `mapToDomain()` → discriminates by `doc.type` → instantiates correct subclass (`AdminRoot`, `EnterpriseUserRoot`, `KOLUserRoot`).
`mapToPersistence()` → includes `enterprise_ids` for enterprise users.

#### `MongoOtpRepository`

**File**: `src/infrastructure/mongo/repositories/otp.repository.ts`
**Implements**: `IOtpRepository`

| Method | Description |
|--------|-------------|
| `save(otp)` | Create or upsert OTP by ID |
| `saveMany(otps)` | Bulk upsert via `bulkWrite` |
| `findValidOtp(email, code, type)` | Find non-expired OTP matching email+code+type |
| `deleteByEmailAndType(email, type)` | Clean up OTPs for email+type |
| `findRecentOtp(email, type, withinSeconds)` | Rate-limit check (`created_at > cutoff`) |

### 5.3 Read Service: `MongoUserReadService`

**File**: `src/infrastructure/mongo/read-services/user.read-service.ts`
**Implements**: `IUserReadService`

| Method | Description |
|--------|-------------|
| `findById(id)` | Single user with `role_id` + `avatar` populated |
| `findByEmail(email)` | User by email with populated relations |
| `findAll(filters)` | Cursor-paginated list with regex filters |

**Supported filters**: `email`, `phone`, `fullName`, `type`, `roleId`, `isEmailVerified`

### 5.4 Module Wiring

#### `AuthModule` (`src/infrastructure/modules/auth.module.ts`) — `@Global()`

```typescript
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({ ... }),
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthAdminController, AuthClientController, OAuthController],
  providers: [
    // 9 Command Handlers
    AuthSignInCommandHandler,
    AuthSignUpCommandHandler,
    AuthSignOutCommandHandler,
    AuthResetPasswordCommandHandler,
    AuthRefreshTokenCommandHandler,
    AuthGoogleSignInCommandHandler,
    AuthSendOtpCommandHandler,
    AuthChangePasswordCommandHandler,
    AuthVerifyOtpCommandHandler,
    // 1 Query Handler
    AuthGetProfileHandler,
    // Strategies
    GoogleStrategy, YoutubeStrategy, FacebookStrategy, TwitterStrategy,
    JwtStrategy,
    AuthService,
    { provide: AUTH_JWT_SERVICE, useClass: JwtAuthService },
    AuthUserRmqController,
  ],
  exports: [JwtStrategy, AUTH_JWT_SERVICE, AuthService],
})
export class AuthModule {}
```

#### `UserModule` (`src/infrastructure/modules/user.module.ts`)

```typescript
@Module({
  imports: [CqrsModule],
  controllers: [UserAdminController, UserClientController],
  providers: [
    // 7 User Command Handlers
    UserCreateCommandHandler,
    UserUpdateCommandHandler,
    UserUpdateProfileCommandHandler,
    UserSoftDeleteCommandHandler,
    UserHardDeleteCommandHandler,
    UserRestoreCommandHandler,
    UserCheckValidCommandHandler,
    // 2 Query Handlers
    UserGetByIdHandler,
    UserGetListHandler,
    // 1 Event Handler
    LinkUserAvatarHandler,
  ],
  exports: [],
})
export class UserModule {}
```

### 5.5 Auth Strategies

| Strategy | File | Purpose |
|----------|------|---------|
| `JwtStrategy` | `@infrastructure/auth` | JWT token validation from Bearer header |
| `GoogleStrategy` | `@infrastructure/auth` | Google OAuth2 token validation |
| `FacebookStrategy` | `@infrastructure/auth` | Facebook OAuth |
| `TwitterStrategy` | `@infrastructure/auth` | Twitter OAuth |
| `YoutubeStrategy` | `@infrastructure/auth` | YouTube OAuth |

---

## 6. Presentation Layer

### 6.1 REST Endpoints

#### Auth Client Controller (`AuthClientController`)
**Path**: `/v1/client/auth`
**Guard Stack**: 🔒 `JwtAuthGuard` (with `@Public()` bypasses on some endpoints)

| Method | Path | Auth | Rate Limit | Description |
|--------|------|------|------------|-------------|
| `POST` | `sign-up/kol` | 🟢 Public | 5/min | Register as KOL user |
| `POST` | `sign-up/enterprise` | 🟢 Public | 5/min | Register as Enterprise user |
| `POST` | `sign-in` | 🟢 Public | 5/min | Sign in (sets httpOnly cookies) |
| `POST` | `refresh-token` | 🟢 Public | — | Refresh access + refresh tokens |
| `POST` | `sign-out` | 🔒 Authenticated | — | Clear cookies + invalidate refresh + disconnect WS |
| `POST` | `reset-password` | 🟢 Public | — | Reset password via OTP |
| `POST` | `send-otp` | 🟢 Public | 5/min | Send OTP verification code |
| `POST` | `verify-otp` | 🟢 Public | — | Verify OTP code → mark email verified |
| `POST` | `change-password` | 🔒 Authenticated | — | Change password (requires OTP) |
| `GET` | `profile` | 🔒 Authenticated | — | Get current user's profile |
| `PATCH` | `profile` | 🔒 Authenticated | — | Update current user's profile |

#### Auth Admin Controller (`AuthAdminController`)
**Path**: `/v1/admin/auth`
**Guard Stack**: 🔒 `JwtAuthGuard` → `RolesGuard(ADMIN)`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `sign-in` | 🟢 Public | Admin sign-in (checks `type === ADMIN`) |
| `POST` | `refresh-token` | 🟢 Public | Refresh tokens |
| `POST` | `sign-out` | 🔒 Admin | Sign out + disconnect WS |
| `POST` | `reset-password` | 🟢 Public | Reset password via OTP |
| `POST` | `send-otp` | 🟢 Public | Send OTP |
| `POST` | `verify-otp` | 🟢 Public | Verify OTP |
| `POST` | `change-password` | 🔒 Admin | Change password |
| `GET` | `profile` | 🔒 Admin | Get profile |
| `PATCH` | `profile` | 🔒 Admin | Update profile |

#### OAuth Controller (`OAuthController`)
**Path**: `/v1/common/auth`
**Guard Stack**: 🟢 Public (uses `GoogleAuthGuard` internally)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `google` | Initiates Google OAuth flow (redirects to Google) |
| `GET` | `google/callback` | Google OAuth callback (sets httpOnly cookies) |

#### User Client Controller (`UserClientController`)
**Path**: `/v1/client/users`
**Guard Stack**: 🔒 `JwtAuthGuard`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | List users (cursor paginated) |
| `GET` | `/:id` | Get user by ID |

#### User Admin Controller (`UserAdminController`)
**Path**: `/v1/admin/users`
**Guard Stack**: 🔒 `JwtAuthGuard` → `RolesGuard(ADMIN)`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/` | Create user |
| `PATCH` | `/:id` | Update user |
| `GET` | `/` | List users |
| `GET` | `/:id` | Get user by ID |
| `PATCH` | `/:id/soft-delete` | Soft-delete user |
| `DELETE` | `/:id` | Hard-delete user |
| `PATCH` | `/:id/restore` | Restore soft-deleted user |

### 6.2 Guard Stack Reference

| Guard | File | Description |
|-------|------|-------------|
| `ApiKeyGuard` | `src/presentation/middleware/guards/api-key.guard.ts` | Validates `x-api-key` header for server-to-server traffic |
| `JwtAuthGuard` | `src/presentation/middleware/guards/jwt-auth.guard.ts` | Parses JWT from `Authorization: Bearer` header; supports GraphQL + REST |
| `RolesGuard` | `src/presentation/middleware/guards/roles.guard.ts` | Checks `@Roles()` metadata against user's `type` (KOL/Enterprise/Admin) |
| `UserVerifiedGuard` | `src/presentation/middleware/guards/user-verified.guard.ts` | Blocks unverified emails from protected endpoints |
| `StateAuthGuard` | `src/presentation/middleware/guards/state-auth.guard.ts` | Extracts & verifies `state` JWT param (used in OAuth callbacks) |
| `GoogleAuthGuard` | `src/presentation/middleware/guards/google-auth.guard.ts` | Passport Google OAuth2 strategy guard |

**Decorator Bypasses**:
- `@Public()` — bypasses all guards (`JwtAuthGuard`, `RolesGuard`, `UserVerifiedGuard`)
- `@WebHook()` — bypasses JWT and API key guards (for external webhook callbacks)

---

## 7. Workflow Flows

### 7.1 Sign Up Flow

```
Client              AuthClientController         AuthSignUpHandler              UserRepository          OTP
  │                         │                         │                           │                    │
  │ POST /v1/client/auth/   │                         │                           │                    │
  │ sign-up/kol             │                         │                           │                    │
  │ { email, password,      │                         │                           │                    │
  │   phone, fullName }     │                         │                           │                    │
  │─────▶                   │                         │                           │                    │
  │                         │ Validate DTO (Zod)      │                           │                    │
  │                         │ CommandBus              │                           │                    │
  │                         │─────▶───────────────────▶                           │                    │
  │                         │                         │                           │                    │
  │                         │                         │ uow.execute()             │                    │
  │                         │                         │─────▶                     │                    │
  │                         │                         │                           │                    │
  │                         │                         │ normalizeEmail(email)     │                    │
  │                         │                         │ findByEmail()             │                    │
  │                         │                         │───────────────────────────▶│                    │
  │                         │                         │◀───────────────────────────│                    │
  │                         │                         │                           │                    │
  │                         │                         │ hashPassword(pw)           │                    │
  │                         │                         │ find default role          │                    │
  │                         │                         │                           │                    │
  │                         │                         │ KOLUserRoot.create(props)  │                    │
  │                         │                         │ ──▶ UserSignedUpEvent      │                    │
  │                         │                         │                           │                    │
  │                         │                         │ repo.save(user)            │                    │
  │                         │                         │───────────────────────────▶│                    │
  │                         │                         │                           │                    │
  │                         │                         │ AuthSendOtpCommand(email)  │                    │
  │                         │                         │─────▶ (same UoW)           │─────────▶          │
  │                         │                         │                           │                    │
  │                         │                         │ eventSvc.publishEvents()   │                    │
  │                         │                         │─────▶ Outbox               │                    │
  │                         │                         │                           │                    │
  │   { userId }            │                         │                           │                    │
  │◀────────────────────────│◀────────────────────────│◀──────────────────────────│◀───────────────────│
```

**Steps**:

1. **User submits sign-up form** — `POST /v1/client/auth/sign-up/kol` with `email`, `password`, `phone`, `fullName`
2. **Zod validation** — Email format, password min 6 chars, phone optional
3. **Handler executes within UoW** — `AuthSignUpCommandHandler.execute()`
4. **Email normalization** — Lowercased + trimmed via `AuthService.normalizeEmail()`
5. **Uniqueness check** — `userRepository.findByEmail()` — throws `UserConflictException` if exists
6. **Role resolution** — `roleReadService.findAll()` — finds default role matching the requested type
7. **Password hashing** — `AuthService.hashPassword()` with bcrypt cost factor 10
8. **Aggregate creation** — `KOLUserRoot.create()` (or `EnterpriseUserRoot`/`AdminRoot` depending on type)
9. **Persistence** — `userRepository.save(user)` — Mongoose insert with discriminator
10. **OTP dispatch** — `CommandBus.execute(new AuthSendOtpCommand())` within same UoW
11. **Event publishing** — `eventService.publishEvents(user)` — `UserSignedUpEvent` + `VerificationOtpCreatedEvent` → Outbox → RabbitMQ → email service
12. **Response** — Returns `{ userId }`

### 7.2 Sign In Flow

```
Client              AuthClientController          AuthSignInHandler              UserRepository
  │                         │                         │                           │
  │ POST /v1/client/auth/   │                         │                           │
  │ sign-in                 │                         │                           │
  │ { email, password }     │                         │                           │
  │─────▶                   │                         │                           │
  │                         │ Validate DTO            │                           │
  │                         │ CommandBus              │                           │
  │                         │─────▶───────────────────▶                           │
  │                         │                         │                           │
  │                         │                         │ normalizeEmail()          │
  │                         │                         │ findByEmail()             │
  │                         │                         │──────────────────────────▶│
  │                         │                         │◀─────────────────────────│
  │                         │                         │                           │
  │                         │                         │ comparePassword()         │
  │                         │                         │ generateTokens()          │
  │                         │                         │                           │
  │                         │                         │ user.updateRefreshToken() │
  │                         │                         │ repo.save(user)           │
  │                         │                         │──────────────────────────▶│
  │                         │                         │                           │
  │ Set-Cookie:             │                         │                           │
  │ access_token (httpOnly) │                         │                           │
  │ refresh_token (httpOnly)│                         │                           │
  │◀────────────────────────│◀────────────────────────│◀─────────────────────────│
```

**Steps**:

1. **User submits credentials** — `POST /v1/client/auth/sign-in` (rate-limited: 5/min)
2. **Handler** — `AuthSignInHandler.execute()`
3. **Email normalization + lookup** — `findByEmail()` → throws `InvalidCredentialsException` if not found
4. **Admin guard** — If `isAdmin` flag set, checks `type === ERoleType.ADMIN`
5. **Password verification** — `AuthService.comparePassword()` → throws `InvalidCredentialsException` on mismatch
6. **Token generation** — `AuthService.generateTokens()` signs JWT access (30min) + refresh (7 days) tokens
7. **Refresh token rotation** — `user.updateRefreshToken(refreshToken)` → saved to DB
8. **Response** — Returns `{ accessToken, refreshToken }` + sets httpOnly cookies

### 7.3 Google OAuth Sign-In Flow

```
Client              OAuthController          GoogleStrategy         AuthGoogleSignInHandler         UserRepo
  │                         │                    │                         │                        │
  │ GET /v1/common/auth/    │                    │                         │                        │
  │ google                  │                    │                         │                        │
  │─────▶                   │                    │                         │                        │
  │ (Redirect to Google)    │                    │                         │                        │
  │◀─────                   │                    │                         │                        │
  │                         │                    │                         │                        │
  │ GET /v1/common/auth/    │                    │                         │                        │
  │ google/callback?code=X  │                    │                         │                        │
  │─────▶                   │                    │                         │                        │
  │                         │ GoogleAuthGuard    │                         │                        │
  │                         │─────▶──────────────▶                         │                        │
  │                         │                    │ Exchange code → tokens  │                        │
  │                         │                    │ Fetch profile from      │                        │
  │                         │                    │ Google API              │                        │
  │                         │                    │─────▶                   │                        │
  │                         │                    │ (email, googleId,       │                        │
  │                         │                    │  displayName)           │                        │
  │                         │                    │◀─────                   │                        │
  │                         │                    │                         │                        │
  │                         │ (req.user set)     │                         │                        │
  │                         │─────▶──────────────▶                         │                        │
  │                         │                    │                         │                        │
  │                         │                    │ CommandBus.execute()    │                        │
  │                         │                    │─────▶───────────────────▶                        │
  │                         │                    │                         │                        │
  │                         │                    │                         │ uow.execute()          │
  │                         │                    │                         │─────▶                  │
  │                         │                    │                         │                        │
  │                         │                    │                         │ findByEmail()          │
  │                         │                    │                         │───────────────────────▶│
  │                         │                    │                         │◀───────────────────────│
  │                         │                    │                         │                        │
  │                         │                    │                         │ ★ Found? → link google  │
  │                         │                    │                         │   Not found? → create   │
  │                         │                    │                         │                        │
  │                         │                    │                         │ generateTokens()       │
  │                         │                    │                         │ repo.save()            │
  │                         │                    │                         │───────────────────────▶│
  │                         │                    │                         │                        │
  │ Set-Cookie: tokens      │                    │                         │                        │
  │◀────────────────────────│◀───────────────────│◀────────────────────────│◀───────────────────────│
```

**Steps**:

1. **User clicks "Sign in with Google"** — Redirect to `/v1/common/auth/google` → redirected to Google consent screen
2. **Google callback** — `/v1/common/auth/google/callback?code=XYZ` → `GoogleAuthGuard` validates the auth code
3. **GoogleStrategy** — Exchanges code for tokens, fetches user profile (email, googleId, displayName) from Google API
4. **Command dispatch** — `AuthGoogleSignInCommand` executes within UoW
5. **Lookup or create** — If email exists → link Google account (`updateGoogleId()`), auto-verify email. If not → create new user with `isEmailVerified: true`
6. **Token generation** — JWT access + refresh tokens signed
7. **Response** — httpOnly cookies set; tokens returned

### 7.4 OTP Verification Flow

```
Client              Controller               AuthSendOtpHandler              OtpRoot           UserRepo        EmailSvc
  │                         │                      │                         │                  │              │
  │ POST send-otp           │                      │                         │                  │              │
  │ { email, type }         │                      │                         │                  │              │
  │─────▶                   │                      │                         │                  │              │
  │                         │ CommandBus           │                         │                  │              │
  │                         │─────▶────────────────▶                         │                  │              │
  │                         │                      │                         │                  │              │
  │                         │                      │ uow.execute()           │                  │              │
  │                         │                      │─────▶                   │                  │              │
  │                         │                      │                         │                  │              │
  │                         │                      │ ★ Rate limit check      │                  │              │
  │                         │                      │   findRecentOtp(< 60s)  │                  │              │
  │                         │                      │─────────────────────────▶│─────▶            │              │
  │                         │                      │                         │                  │              │
  │                         │                      │ deleteByEmailAndType()  │                  │              │
  │                         │                      │ OtpRoot.create(code)    │                  │              │
  │                         │                      │                         │                  │              │
  │                         │                      │ repo.save(otp)          │                  │              │
  │                         │                      │ eventSvc.publishEvents()│ Outbox            │              │
  │                         │                      │─────▶                   │─────▶            │─────────────▶│
  │                         │                      │                         │ SendVerification  │              │
  │                         │                      │                         │ EmailRequested    │              │
  │                         │                      │                         │ Event             │              │
  │                         │                      │                         │                  │              │
  │ { success: true }       │                      │                         │                  │              │
  │◀────────────────────────│◀─────────────────────│◀────────────────────────│◀─────────────────│◀─────────────│
```

---

## 8. File Map

### Core (Domain) Layer

| File | Type | Role |
|------|------|------|
| `src/core/aggregate-roots/user.aggregate.ts` | Aggregate Root | Abstract base for all user types |
| `src/core/aggregate-roots/kol-user.aggregate.ts` | Aggregate Root | KOL user (type: KOL) |
| `src/core/aggregate-roots/enterprise-user.aggregate.ts` | Aggregate Root | Enterprise user (type: ENTERPRISE) |
| `src/core/aggregate-roots/admin.aggregate.ts` | Aggregate Root | Admin user (type: ADMIN) |
| `src/core/aggregate-roots/otp.aggregate.ts` | Aggregate Root | OTP verification code |
| `src/core/value-objects/phone-number.value-object.ts` | Value Object | International phone number |
| `src/core/enums/role-type.enum.ts` | Enum | User roles: KOL, ENTERPRISE, ADMIN |
| `src/core/enums/otp-type.enum.ts` | Enum | OTP types: create_account, reset_password, change_password |
| `src/core/events/user-signed-up.domain-event.ts` | Domain Event | Raised on user creation |
| `src/core/events/verification-otp-created.domain-event.ts` | Domain Event | Raised on OTP generation |
| `src/core/events/user-added-to-enterprise.domain-event.ts` | Domain Event | Raised when user links to enterprise |
| `src/core/events/user-revoked-from-enterprise.domain-event.ts` | Domain Event | Raised when user unlinks from enterprise |
| `src/core/exceptions/auth.exception.ts` | Exception | Auth-specific errors |
| `src/core/interfaces/repositories/user.repository.ts` | Port | User repository interface |
| `src/core/interfaces/repositories/otp.repository.ts` | Port | OTP repository interface |

### Application Layer

| File | Type | Role |
|------|------|------|
| `src/application/commands/auth-sign-up/` | Command | User registration |
| `src/application/commands/auth-sign-in/` | Command | Password-based sign-in |
| `src/application/commands/auth-sign-out/` | Command | Session invalidation |
| `src/application/commands/auth-google-sign-in/` | Command | Google OAuth sign-in |
| `src/application/commands/auth-send-otp/` | Command | OTP generation + dispatch |
| `src/application/commands/auth-verify-otp/` | Command | OTP validation + email verification |
| `src/application/commands/auth-refresh-token/` | Command | Token rotation |
| `src/application/commands/auth-change-password/` | Command | Password change (requires OTP) |
| `src/application/commands/auth-reset-password/` | Command | Password reset (via email OTP) |
| `src/application/queries/auth-get-profile/` | Query | Current user profile |
| `src/application/services/auth.service.ts` | Service | Email normalization, bcrypt, JWT signing |
| `src/application/mappers/user.mapper.ts` | Mapper | Aggregate → discriminated DTO |
| `src/application/dtos/user.dto.ts` | DTO | Discriminated union DTOs |
| `src/application/events/send-verification-email-requested.event.ts` | Integration Event | Triggers email delivery after OTP creation |
| `src/application/events/request-auth-update-subscription.event.ts` | Integration Event | Enterprise subscription change notification |

### Infrastructure Layer

| File | Type | Role |
|------|------|------|
| `src/infrastructure/mongo/schemas/user.schema.ts` | Schema | User Mongoose schema + discriminators |
| `src/infrastructure/mongo/schemas/otp.schema.ts` | Schema | OTP Mongoose schema |
| `src/infrastructure/mongo/repositories/user.repository.ts` | Repository | User persistence |
| `src/infrastructure/mongo/repositories/otp.repository.ts` | Repository | OTP persistence |
| `src/infrastructure/mongo/read-services/user.read-service.ts` | Read Service | User read queries |
| `src/infrastructure/modules/auth.module.ts` | Module | Auth module (global) |
| `src/infrastructure/modules/user.module.ts` | Module | User CRUD module |

### Presentation Layer

| File | Type | Role |
|------|------|------|
| `src/presentation/controllers/http/client/auth.controller.ts` | Controller | Client auth endpoints |
| `src/presentation/controllers/http/admin/auth.controller.ts` | Controller | Admin auth endpoints |
| `src/presentation/controllers/http/oauth.controller.ts` | Controller | Google OAuth endpoints |
| `src/presentation/controllers/http/client/user.controller.ts` | Controller | Client user read endpoints |
| `src/presentation/controllers/http/admin/user.controller.ts` | Controller | Admin user CRUD endpoints |
| `src/presentation/middleware/guards/jwt-auth.guard.ts` | Guard | JWT authentication |
| `src/presentation/middleware/guards/roles.guard.ts` | Guard | Role-based authorization |
| `src/presentation/middleware/guards/user-verified.guard.ts` | Guard | Email verification check |
| `src/presentation/middleware/guards/state-auth.guard.ts` | Guard | OAuth state JWT verification |
| `src/presentation/middleware/guards/api-key.guard.ts` | Guard | API key validation |
| `src/presentation/middleware/guards/google-auth.guard.ts` | Guard | Google OAuth strategy |

---

## 9. Key Invariants (Non-Negotiable Business Rules)

1. **Email uniqueness**: Each user must have a unique, normalized (lowercased + trimmed) email. `UserConflictException` on duplicate.
2. **User type immutability**: Once created, a user's `type` (KOL, ENTERPRISE, ADMIN) can never change.
3. **Email verification required**: Users start `isEmailVerified = false`. They must verify via OTP or social auth before accessing protected features (`UserVerifiedGuard`).
4. **Refresh token rotation**: Each token refresh invalidates the previous refresh token. Stored tokens are compared server-side.
5. **OTP rate limiting**: Maximum 1 OTP of each type per email per 60 seconds. Previous OTP of same type is invalidated on re-request.
6. **OTP expiry**: OTPs expire after 5 minutes (`expired_at` field, MongoDB TTL index auto-cleans).
7. **OTP one-time use**: After successful verification, OTP is immediately deleted to prevent replay.
8. **Password strength**: Passwords must be ≥ 6 characters; stored as bcrypt hash (cost factor 10).
9. **Soft-delete only**: Users are never hard-deleted via standard flows; they receive `delete_at`/`delete_by` timestamps.
10. **Google sign-in auto-verifies**: Google-authenticated users bypass OTP verification — `isEmailVerified` is set to `true` immediately.
11. **Phone number format**: Must match international format (`+84123456789` — starts with `+`, digits only).

---

## Cross-Domain References

- **Enterprise**: `EnterpriseUserRoot.enterpriseIds[]` — user-enterprise membership link
- **Role**: `UserRoot.roleId` — granular permissions via `Role` aggregate
- **KolProfile**: KOL users have linked KOL profiles for platform connections
- **Campaign**: Users own campaigns and collaborate via `collaboratorIds`
- **ScheduledPost**: Users create and manage scheduled content
- **Billing/Subscription**: Users (Enterprise) have subscription plans linked
- **UploadedFile**: User avatars reference the uploaded files domain