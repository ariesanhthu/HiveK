---
template: query
placeholders: [FeatureName, featureName]
generates: src/application/queries/{{featureName}}/{{featureName}}.query.ts
---

# {{FeatureName}} Query Template

Query payload class.

## Code Blueprint

```typescript
// src/application/queries/{{featureName}}/{{featureName}}.query.ts
import { Query } from '@nestjs/cqrs';

export interface {{FeatureName}}Filters {
  enterpriseId: string;
  search?: string;
  limit?: number;
  cursor?: string;
}

export class {{FeatureName}}Query extends Query<{{FeatureName}}Filters> {
  constructor(public readonly filters: {{FeatureName}}Filters) {
    super();
  }
}
```

## Post-Generation Checklist
- [ ] Extends `Query<Filters>` from `@nestjs/cqrs`
- [ ] Filters interface defined
- [ ] File in `src/application/queries/<feature>/`

