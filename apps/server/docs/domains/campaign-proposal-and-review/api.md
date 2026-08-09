# Campaign Proposal & Review Domain API Endpoints

> API contracts for the **campaign-proposal-and-review** domain.
> See [domain.md](./domain.md) for full domain specification, endpoint details, DTO schemas, and guard requirements.

## Controllers

### Client Controller
**Path**: `/v1/client/proposals`, `/v1/client/reviews`

### Admin Controller
**Path**: `/v1/admin/proposals`, `/v1/admin/reviews`

## Guard Stack
- Global: `ApiKeyGuard`
- Routes: `JwtAuthGuard` + `UserVerifiedGuard`
- Bypass: `@Public()`, `@WebHook()`
