---
description: NestJS framework rules and module wiring conventions
---

# NestJS Framework Rules

- Leverage `@nestjs/cqrs` for CommandBus and QueryBus.
- Use `createZodDto()` from `nestjs-zod` for request validation pipes.
- Wire ports and adapters using Symbol DI tokens (`@Inject(CAMPAIGN_REPOSITORY)`).
- Organize code by feature module under `src/infrastructure/modules/`.
- Use REST controllers with `@nestjs/common` decorators (`@Get`, `@Post`, `@Patch`, `@Delete`).
- Controllers exist in two tiers: admin (`src/presentation/controllers/http/admin/`) and client (`src/presentation/controllers/http/client/`).
- Use `buildVersionedRoute('client', 'resource', 1)` helper for versioned route paths.
- Use guards for auth: `JwtAuthGuard`, `RolesGuard`, `UserVerifiedGuard`, `ApiKeyGuard`, `RecaptchaGuard`.
- Use `@nestjs/swagger` for API documentation (`@ApiTags`, `@ApiOperation`, `@ApiBearerAuth`, `@ApiSecurity`).
- Use `@nestjs/passport` for OAuth strategies (Facebook, Google, Twitter, YouTube).
- Use `@nestjs/event-emitter` for internal domain events.
- Use `@nestjs/config` for environment variable configuration.
- Use `@nestjs/throttler` for rate limiting.
