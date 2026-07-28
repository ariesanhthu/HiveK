# Auth Domain API Endpoints

> API contracts for the **auth** domain.
> See [domain.md](./domain.md) for full domain specification, DTO schemas, and endpoint details.

## Controllers

### Admin Controller (`AuthAdminController`)
**Path**: `/v1/admin/auth`

### Client Controller (`AuthClientController`)
**Path**: `/v1/client/auth`

### OAuth Controller (`OAuthController`)
**Paths**: `/v1/client/auth/google`, `/v1/client/auth/facebook`, etc.

## Guard Stack
- Global: `ApiKeyGuard`
- Per-endpoint: `JwtAuthGuard`, `RolesGuard`, `UserVerifiedGuard`
- Bypass: `@Public()`, `@WebHook()`
