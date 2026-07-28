---
template: mapper
placeholders: [DomainName, domainName]
generates: src/application/mappers/{{domainName}}.mapper.ts
---

# {{DomainName}} Mapper Template

Bidirectional mapper converting between Aggregate Roots and Application DTOs.

## Code Blueprint

```typescript
// src/application/mappers/{{domainName}}.mapper.ts
import { {{DomainName}}Root } from '@/core/aggregate-roots';
import { {{DomainName}}Dto } from '@/application/dtos';

export class {{DomainName}}Mapper {
  static toDto(aggregate: {{DomainName}}Root): {{DomainName}}Dto {
    return {
      id: aggregate.id!,
      ownerId: aggregate.ownerId,
      status: aggregate.status,
      createdAt: aggregate.createdAt.toISOString(),
      updatedAt: aggregate.updatedAt.toISOString(),
    } as {{DomainName}}Dto;
  }
}
```

## Post-Generation Checklist
- [ ] Uses `@/core/`, `@/application/` path aliases
- [ ] File in `src/application/mappers/` named `<domain>.mapper.ts`
- [ ] Date fields converted to ISO strings via `.toISOString()`