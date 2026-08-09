# Social Page Domain API Endpoints

> API contracts for the **social-page** domain.
> See [domain.md](./domain.md) for full specification, endpoint details, and guard requirements.

## Controllers

### Client Controller: `/v1/client/social-pages`
### OAuth Controllers: `/v1/client/auth/facebook`, `/v1/client/auth/instagram`, `/v1/client/auth/threads`

## Guard Stack
- Global: `ApiKeyGuard`
- Routes: `JwtAuthGuard` + `UserVerifiedGuard`
- OAuth callbacks: `@WebHook()` (bypasses JWT)
