# Enterprise Domain API Endpoints

> API contracts for the **enterprise** domain.
> See [domain.md](./domain.md) for full specification, endpoint details, and guard requirements.

## Controllers

### Client Controller: `/v1/client/enterprises`
### Admin Controller: `/v1/admin/enterprises`

## Guard Stack
- Global: `ApiKeyGuard`
- Routes: `JwtAuthGuard` + `UserVerifiedGuard` + `RolesGuard(ENTERPRISE)`
- Bypass: `@Public()`, `@WebHook()`
