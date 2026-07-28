---
template: repository-interface
placeholders: [DomainName, domainName, DOMAIN_NAME]
generates: src/core/interfaces/repositories/{{domainName}}.repository.ts
---

# {{DomainName}} Repository Interface Template

Domain repository interface + Symbol Dependency Injection Token.

## Code Blueprint

```typescript
// src/core/interfaces/repositories/{{domainName}}.repository.ts
import { {{DomainName}}Root } from '@/core/aggregate-roots';
import type { Nullable } from '@/core/types/common.type';

export const {{DOMAIN_NAME}}_REPOSITORY = Symbol('{{DOMAIN_NAME}}_REPOSITORY');

export interface I{{DomainName}}Repository {
  save(aggregate: {{DomainName}}Root): Promise<void>;
  findById(id: string): Promise<Nullable<{{DomainName}}Root>>;
  delete(id: string): Promise<void>;
}
```

## Post-Generation Checklist
- [ ] Interface named `I{Name}Repository`
- [ ] File named `<name>.repository.ts` in `src/core/interfaces/repositories/`
- [ ] Symbol DI token exported in `SCREAMING_SNAKE_CASE`
- [ ] Uses `@/core/` path alias