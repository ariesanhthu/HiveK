---
template: dto
placeholders: [FeatureName, featureName]
generates: src/application/dtos/{{featureName}}.dto.ts
---

# {{FeatureName}} Shared DTO Template

Shared DTO schema validated with Zod via `nestjs-zod`. Used across commands/queries for output responses.

## Code Blueprint

```typescript
// src/application/dtos/{{featureName}}.dto.ts
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const {{FeatureName}}Schema = z.object({
  id: z.string(),
  ownerId: z.string(),
  status: z.string(),
  createdAt: z.iso.datetime(),
}).strict();

export class {{FeatureName}}Dto extends createZodDto({{FeatureName}}Schema) {}
```

## Post-Generation Checklist
- [ ] Zod schema defined with `.strict()`
- [ ] DTO class extends `createZodDto(Schema)`
- [ ] Date fields use `z.iso.datetime()` (not `z.date()`)
- [ ] File placed in `src/application/dtos/`
