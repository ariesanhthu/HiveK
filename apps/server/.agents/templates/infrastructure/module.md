---
template: module
placeholders: [DomainName, domainName, DOMAIN_NAME]
generates: src/infrastructure/modules/{{domainName}}.module.ts
---

# {{DomainName}} Feature Module Template

NestJS `@Module` wiring REST/admin controllers, command/query handlers, and Symbol DI tokens.

## Code Blueprint

```typescript
// src/infrastructure/modules/{{domainName}}.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { {{DomainName}}AdminController } from '@/presentation/controllers/http/admin/{{domainName}}.controller';
import { {{DomainName}}ClientController } from '@/presentation/controllers/http/client/{{domainName}}.controller';
import { {{DomainName}}Model, {{DomainName}}Schema } from '@/infrastructure/mongo/schemas';
import { Mongo{{DomainName}}Repository } from '@/infrastructure/mongo/repositories';
import { Mongo{{DomainName}}ReadService } from '@/infrastructure/mongo/read-services';
import { {{DOMAIN_NAME}}_REPOSITORY } from '@/core/interfaces/repositories';
import { {{DOMAIN_NAME}}_READ_SERVICE } from '@/application/interfaces/read-service';
import { {{DomainName}}CreateCommandHandler } from '@/application/commands/{{domainName}}-create/{{domainName}}-create.handler';
import { {{DomainName}}GetListQueryHandler } from '@/application/queries/{{domainName}}-get-list/{{domainName}}-get-list.handler';

const COMMAND_HANDLERS = [
  {{DomainName}}CreateCommandHandler,
];

const QUERY_HANDLERS = [
  {{DomainName}}GetListQueryHandler,
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: {{DomainName}}Model.name, schema: {{DomainName}}Schema }]),
  ],
  controllers: [{{DomainName}}AdminController, {{DomainName}}ClientController],
  providers: [
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
    { provide: {{DOMAIN_NAME}}_REPOSITORY, useClass: Mongo{{DomainName}}Repository },
    { provide: {{DOMAIN_NAME}}_READ_SERVICE, useClass: Mongo{{DomainName}}ReadService },
  ],
  exports: [{{DOMAIN_NAME}}_REPOSITORY, {{DOMAIN_NAME}}_READ_SERVICE],
})
export class {{DomainName}}Module {}
```

## Post-Generation Checklist
- [ ] Imports `CqrsModule`, `MongooseModule.forFeature()`
- [ ] REST controllers listed in `controllers` (admin + client)
- [ ] Repositories and Read Services bound via Symbol DI tokens in `providers`
- [ ] Uses `@/core/`, `@/application/`, `@/infrastructure/`, `@/presentation/` path aliases