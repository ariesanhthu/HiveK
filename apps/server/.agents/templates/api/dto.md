---
template: api-dto
placeholders: [FeatureName, featureName]
generates: src/application/dtos/{{featureName}}.dto.ts
---

# Response DTO Template

Response DTO for API endpoints. Uses Zod validation via `nestjs-zod`.

## Code Blueprint

```typescript
// src/application/dtos/{{featureName}}.dto.ts
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const {{FeatureName}}DtoSchema = z.object({
  id: z.string(),
  status: z.string(),
  createdAt: z.iso.datetime(),
}).strict();

export class {{FeatureName}}Dto extends createZodDto({{FeatureName}}DtoSchema) {}
```

## Post-Generation Checklist
- [ ] File in `src/application/dtos/`
- [ ] Uses `nestjs-zod` with `createZodDto()`
- [ ] Date fields use `z.iso.datetime()` (not `z.date()`)
- [ ] Request DTOs (Input) go in command folders, Response DTOs (Dto) go in `src/application/dtos/`