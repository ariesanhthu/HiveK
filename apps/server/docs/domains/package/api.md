# Package Domain API Endpoints

> API contracts for the **package** domain.
> See [domain.md](./domain.md) for full specification, endpoint details, and guard requirements.

## Controllers

### Client Controller: `/v1/client/packages`
### Admin Controller: `/v1/admin/packages`

## Guard Stack
- Global: `ApiKeyGuard`
- Routes: `JwtAuthGuard` + `UserVerifiedGuard`
