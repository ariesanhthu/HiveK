---
name: api-contract-design
description: Designs gRPC controller endpoints, DTO shapes, Zod validation schemas, and gRPC method metadata.
---

# API Contract Design Skill

## Instructions

1. Identify use case and target controller tier (admin or client).
2. Keep controllers thin: controllers extract DTO, apply guards, and dispatch CommandBus or QueryBus.
3. Validate request bodies using Zod schemas via `createZodDto()` (`nestjs-zod`).
4. Apply NestJS decorators:
   - Route: `@Controller(buildVersionedRoute('client', 'resource', 1))`
   - HTTP: `@Get()`, `@Post()`, `@Patch()`, `@Delete()`
   - Swagger: `@ApiTags()`, `@ApiOperation()`, `@ApiBearerAuth()`, `@ApiSecurity('x-api-key')`
   - Auth: `@UseGuards(JwtAuthGuard)`, `@UseGuards(RolesGuard)` + `@Roles(ERoleType.ENTERPRISE)`
   - User extraction: `@CurrentUser('sub')`
5. Refer to template `.agents/templates/api/controller.md`.
6. Document endpoint contract in `docs/domains/<domain>/api.md`.
