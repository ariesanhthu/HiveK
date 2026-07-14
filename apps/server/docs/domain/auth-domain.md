# Authentication Domain

This document describes the business rules, entities, and workflows for the Authentication domain within the HiveK server.

## 1. Core Concepts & Aggregates

The Authentication domain is built around three primary concepts: Identity, Authorization Roles, and Verification.

### User Aggregate (`UserRoot`)
The base aggregate representing an identity in the system.
* **KOLUserRoot**: Specialized user for Influencers/KOLs.
* **EnterpriseUserRoot**: Specialized user for Brands/Enterprises, capable of being linked to multiple enterprise entities.
* **AdminRoot**: System administrators.

**Key Invariants & Rules:**
* **Email Uniqueness**: Each user must have a unique, normalized email address.
* **Identity Stability**: Once created, a user's `type` (KOL, Enterprise, Admin) is immutable.
* **Verification State**: Users start in an unverified state (`is_email_verified: false`) and must complete OTP verification or social authentication to access protected features.
* **Soft Delete**: Users are never permanently removed from the database via standard flows; instead, they are marked with a `delete_at` timestamp.

### OTP Aggregate (`OtpRoot`)
Manages short-lived secrets for out-of-band verification.
* **Types**: `CREATE_ACCOUNT`, `RESET_PASSWORD`, `CHANGE_PASSWORD`.
* **Expiration**: Typically expires within 5 minutes.
* **Rate Limiting**: Only one active OTP of a specific type can exist per email at a time. A new request for the same type will invalidate the previous one. A rate limit check prevents requesting a new OTP of the same type within 60 seconds of the previous one.

---

## 2. Workflows

### Sign Up Flow
1. **Request**: User provides email, password, phone, and desired role type.
2. **Validation**: Email normalization and uniqueness check.
3. **Password Hashing**: Securely hashed using Bcrypt.
4. **Persistence**: The user aggregate is created and saved within a transaction.
5. **Verification Trigger**: An `AuthSendOtpCommand` is dispatched to initiate the verification process. For `CREATE_ACCOUNT` and `RESET_PASSWORD` types, this checks user existence by email (no signed-in session or active `userId` required).
6. **Integration Event**: A `UserSignedUpEvent` is emitted, which can trigger downstream onboarding processes.

### Sign In Flow
1. **Credentials**: Email and Password.
2. **Verification**: Compares provided password with the stored hash.
3. **Token Generation**: Issues a JWT access token (short-lived) and a refresh token (long-lived).
4. **Refresh Token Rotation**: The refresh token is stored in the User aggregate. Every time a new refresh token is issued, the old one is invalidated.

### Social Authentication (Google)
1. **OAuth2 Callback**: Receives user profile, `google_id`, and a `type` parameter (from query string/state) from Google.
2. **Account Linking**: 
    * If a user exists with that email but no `google_id`, the account is linked.
    * If no user exists, a new user aggregate is created based on the `type` parameter (KOL, Enterprise, etc.), defaulting to KOL if not specified.
3. **Verification Bypass**: Users authenticated via trusted social providers are marked as email-verified immediately. If an existing user was unverified when linking their Google account, they are immediately transitioned to verified (`is_email_verified: true`).

### OTP Verification Flow
1. **Verification**: Compares the provided code with the stored OTP aggregate.
2. **State Change**: On success, the User aggregate is updated to `is_email_verified: true`.
3. **Cleanup**: The OTP record is deleted immediately after successful verification to prevent reuse.

---

## 3. Technical Implementation Details

### Security Patterns
* **JWT (JSON Web Tokens)**: Used for stateless authentication. Contains `sub` (userId), `email`, `role`, `type`, and `isEmailVerified` status.
* **Password Hashing**: Bcrypt with a high cost factor.
* **Normalization**: All emails are lowercased and trimmed before any lookup or persistence to prevent "case-collision" attacks.

### Route Guards
All presentation-level controllers are secured by a layered guarding mechanism:
* **`ApiKeyGuard`**: Global guard checking for a valid `x-api-key` header to authenticate server-to-server traffic. Bypassed for Swagger docs, GraphQL playground, and routes decorated with `@WebHook()`.
* **`JwtAuthGuard`**: Applied to protected routes to parse stateless JWT tokens and establish caller credentials on `req.user`. Bypassed on routes decorated with `@Public()` or `@WebHook()`.
* **`RolesGuard`**: Restricts endpoints to specific user types (KOL, Enterprise, Admin) based on metadata set by `@Roles(...)`. Bypassed on routes decorated with `@Public()` or `@WebHook()`.
* **`UserVerifiedGuard`**: Placed on business-critical client controllers (such as Campaigns, Social Pages, and Posts) to block users who have not completed email verification. Requires `JwtAuthGuard` to execute first and verify that `req.user.isEmailVerified` is true. Bypassed on `@Public()` or `@WebHook()` routes.

### Architectural Patterns
* **CQRS**: 
    * **Commands**: Handle state-changing operations (Sign Up, Verify OTP, Change Password).
    * **Queries**: Handle data retrieval (Get Profile).
* **Unit of Work**: Ensures that user creation and initial OTP dispatch happen atomically.
* **Outbox Pattern**: Integration events (like sending an email via RabbitMQ) are saved to an outbox table within the same database transaction as the domain state change, ensuring reliable delivery.

---

## 4. Error Handling
* `UserConflictException`: Thrown when an email is already taken.
* `InvalidCredentialsException`: Thrown during Sign In if email or password is incorrect.
* `OtpRateLimitException`: Thrown if a user requests an OTP too frequently (within 60 seconds).
* `InvalidOperationException`: Thrown if an OTP is expired or incorrect.
* `ForbiddenDomainException` / `ForbiddenException`: Thrown if an unauthenticated user attempts to perform restricted profile/session actions, or if an unverified user attempts to access protected business features.
