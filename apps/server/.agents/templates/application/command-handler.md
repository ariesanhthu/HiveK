---
template: command-handler
placeholders: [DomainName, FeatureName, domainName, featureName, DOMAIN_NAME]
generates: src/application/commands/{{domainName}}-{{featureName}}/{{domainName}}-{{featureName}}.handler.ts
---

# {{FeatureName}} Command Handler Template

CQRS Write-side Command Handler. Optionally uses Unit of Work for transaction support.

## Code Blueprint

```typescript
// src/application/commands/{{domainName}}-{{featureName}}/{{domainName}}-{{featureName}}.handler.ts
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { {{FeatureName}}Command } from './{{domainName}}-{{featureName}}.command';
import { {{FeatureName}}InputDto } from './{{domainName}}-{{featureName}}.dto';
import { {{DomainName}}Dto } from '@/application/dtos';
import { {{DomainName}}Root } from '@/core/aggregate-roots';
import { {{DOMAIN_NAME}}_REPOSITORY } from '@/core/interfaces/repositories';
import type { I{{DomainName}}Repository } from '@/core/interfaces/repositories';
import { {{DomainName}}Mapper } from '@/application/mappers';

@CommandHandler({{FeatureName}}Command)
export class {{FeatureName}}CommandHandler implements ICommandHandler<{{FeatureName}}Command, {{DomainName}}Dto> {
  constructor(
    @Inject({{DOMAIN_NAME}}_REPOSITORY)
    private readonly {{domainName}}Repository: I{{DomainName}}Repository,
  ) {}

  async execute(command: {{FeatureName}}Command): Promise<{{DomainName}}Dto> {
    const { input } = command;

    // 1. Create domain aggregate (validates invariants)
    const aggregate = {{DomainName}}Root.create(input);

    // 2. Persist aggregate via repository
    await this.{{domainName}}Repository.save(aggregate);

    // 3. Map to DTO and return
    return {{DomainName}}Mapper.toDto(aggregate);
  }
}
```

## With Unit of Work (for multi-repo operations)

```typescript
import { UNIT_OF_WORK } from '@/application/interfaces';
import type { IUnitOfWork } from '@/application/interfaces';

// Inject UoW:
constructor(
  @Inject({{DOMAIN_NAME}}_REPOSITORY) private readonly repo: I{{DomainName}}Repository,
  @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
) {}

// Wrap in transaction:
await this.uow.execute(async () => {
  const aggregate = {{DomainName}}Root.create(input);
  await this.repo.save(aggregate);
  return {{DomainName}}Mapper.toDto(aggregate);
});
```

## Post-Generation Checklist
- [ ] Handler decorated with `@CommandHandler({{FeatureName}}Command)`
- [ ] Dependencies injected via Symbol tokens (`@Inject({{DOMAIN_NAME}}_REPOSITORY)`)
- [ ] Uses `@/core/`, `@/application/` path aliases
- [ ] Mapper used to convert aggregate to DTO
- [ ] Uses Unit of Work for multi-repo operations
