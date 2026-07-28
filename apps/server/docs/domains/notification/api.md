# Notification Domain API Endpoints

> API contracts for the **notification** domain.
> See [domain.md](./domain.md) for full specification, endpoint details, and guard requirements.

## Controllers

### Client Controller: `/v1/client/notifications`
### Admin Controller: `/v1/admin/notifications`

## Guard Stack
- Global: `ApiKeyGuard`
- Routes: `JwtAuthGuard` + `UserVerifiedGuard`
