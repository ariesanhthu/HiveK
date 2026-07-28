---
template: read-service
placeholders: [DomainName, domainName, DOMAIN_NAME]
generates: src/application/interfaces/read-service/{{domainName}}.read-service.interface.ts
---

# {{DomainName}} Read Service Interface Template

Read service interface for CQRS query projections (bypasses aggregates, returns DTOs).

## Code Blueprint

```typescript
// src/application/interfaces/read-service/{{domainName}}.read-service.interface.ts
import type { Nullable } from '@/core/types/common.type';
import { {{DomainName}}Dto } from '@/application/dtos';

export const {{DOMAIN_NAME}}_READ_SERVICE = Symbol('{{DOMAIN_NAME}}_READ_SERVICE');

export interface I{{DomainName}}ReadService {
  findList(filters: Record<string, unknown>): Promise<{{DomainName}}Dto[]>;
  findById(id: string): Promise<Nullable<{{DomainName}}Dto>>;
}
```

## Post-Generation Checklist
- [ ] Interface named `I{Name}ReadService`
- [ ] File named `<name>.read-service.interface.ts`
- [ ] Symbol DI token exported in `SCREAMING_SNAKE_CASE`
- [ ] Returns DTOs (not aggregates)
- [ ] Located in `src/application/interfaces/read-service/`