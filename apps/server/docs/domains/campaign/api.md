# Campaign Domain API Endpoints

> API contracts for the **campaign** domain.
> See [domain.md](./domain.md) for full domain specification, endpoint details, DTO schemas, and guard requirements.

## Controllers

### Client Controller (`CampaignClientController`)
**Path**: `/v1/client/campaigns`

### Admin Controller (`CampaignAdminController`)
**Path**: `/v1/admin/campaigns`

## Guard Stack
- Global: `ApiKeyGuard`
- Routes: `JwtAuthGuard` + `UserVerifiedGuard`
- Enterprise operations: + `RolesGuard(ENTERPRISE)`
- Bypass: `@Public()`, `@WebHook()`
