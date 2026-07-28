---
template: query-handler
placeholders: [DomainName, FeatureName, domainName, featureName, DOMAIN_NAME]
generates: src/application/queries/{{domainName}}-{{featureName}}/{{domainName}}-{{featureName}}.handler.ts
---

# {{FeatureName}} Query Handler Template

CQRS Read-side Query Handler calling Read Service directly without aggregates.

## Code Blueprint

```typescript
// src/application/queries/{{domainName}}-{{featureName}}/{{domainName}}-{{featureName}}.handler.ts
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { {{FeatureName}}Query } from './{{domainName}}-{{featureName}}.query';
import { {{DOMAIN_NAME}}_READ_SERVICE } from '@/application/interfaces/read-service';
import type { I{{DomainName}}ReadService } from '@/application/interfaces/read-service';

@QueryHandler({{FeatureName}}Query)
export class {{FeatureName}}QueryHandler implements IQueryHandler<{{FeatureName}}Query> {
  constructor(
    @Inject({{DOMAIN_NAME}}_READ_SERVICE) private readonly readService: I{{DomainName}}ReadService,
  ) {}

  async execute(query: {{FeatureName}}Query): Promise<{{DomainName}}Dto[]> {
    return this.readService.findList(query.filters);
  }
}
```

## Post-Generation Checklist
- [ ] Uses `I{Name}ReadService` (not repository port)
- [ ] No Unit of Work or EventService injection
- [ ] Uses `@/application/` path alias
- [ ] Handler named `{Feature}QueryHandler`
