# Uploaded File Domain API Endpoints

> API contracts for the **uploaded-file** domain.
> See [domain.md](./domain.md) for full specification, endpoint details, and guard requirements.

## Controllers

### Client Controller: `/v1/client/uploaded-files`
### Admin Controller: `/v1/admin/uploaded-files`

## Guard Stack
- Global: `ApiKeyGuard`
- Routes: `JwtAuthGuard` + `UserVerifiedGuard`
