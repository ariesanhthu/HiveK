---
template: command
placeholders: [FeatureName, FeatureInputDtoName, featureName]
generates: src/application/commands/{{featureName}}/{{featureName}}.command.ts
---

# {{FeatureName}} Command Template

Command payload class extending NestJS CQRS Command.

## Code Blueprint

```typescript
// src/application/commands/{{featureName}}/{{featureName}}.command.ts
import { Command } from '@nestjs/cqrs';
import type { {{FeatureInputDtoName}} } from './{{featureName}}.dto';

export class {{FeatureName}}Command extends Command<string> {
  constructor(public readonly input: {{FeatureInputDtoName}}) {
    super();
  }
}
```

## Post-Generation Checklist
- [ ] Extends `Command` from `@nestjs/cqrs`
- [ ] DTO imported from local file (command-level DTO)
- [ ] Uses `input` property for the DTO payload
- [ ] Command return type matches handler response
