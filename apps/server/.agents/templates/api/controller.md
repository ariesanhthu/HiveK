---
template: controller
placeholders: [DomainName, domainName, FeatureName, featureName]
generates: src/presentation/controllers/http/client/{{domainName}}.controller.ts
---

# {{DomainName}} REST Controller Template

Thin NestJS REST Controller dispatching Commands/Queries via CommandBus/QueryBus.

## Code Blueprint (Client Controller)

```typescript
// src/presentation/controllers/http/client/{{domainName}}.controller.ts
import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';
import { {{FeatureName}}Command } from '@/application/commands/{{domainName}}-{{featureName}}/{{domainName}}-{{featureName}}.command';
import { {{FeatureName}}InputDto } from '@/application/commands/{{domainName}}-{{featureName}}/{{domainName}}-{{featureName}}.dto';
import { {{DomainName}}Dto } from '@/application/dtos';
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import { CurrentUser, Roles, ApiOkResponseEnvelope } from '@/presentation/decorators';

@ApiTags('CLIENT-{{domainName}}s')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard)
@Controller(buildVersionedRoute('client', '{{domainName}}s', 1))
export class {{DomainName}}ClientController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create new {{domainName}}' })
  @ApiOkResponseEnvelope({{DomainName}}Dto)
  async create(
    @CurrentUser('sub') userId: string,
    @Body() input: {{FeatureName}}InputDto
  ): Promise<{{DomainName}}Dto> {
    input.ownerId = userId;
    return this.commandBus.execute(new {{FeatureName}}Command(input));
  }
}
```

## For Admin Controller

Use tier `'admin'` instead of `'client'` in `buildVersionedRoute`:

```typescript
@Controller(buildVersionedRoute('admin', '{{domainName}}s', 1))
export class {{DomainName}}AdminController { ... }
```

## Post-Generation Checklist
- [ ] Uses REST `@nestjs/common` decorators (`@Post`, `@Get`, etc.)
- [ ] Uses `@nestjs/swagger` decorators
- [ ] Versioned route with `buildVersionedRoute(tier, resource, version)`
- [ ] Guards applied: `JwtAuthGuard`, optionally `RolesGuard` + `Roles()`
- [ ] Commands from `@application/commands/`
- [ ] DTOs from command-level dto or shared `@application/dtos/`
- [ ] Uses `@/core/`, `@/application/`, `@/presentation/` path aliases
