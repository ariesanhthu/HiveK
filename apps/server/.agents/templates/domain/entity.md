---
template: entity
placeholders: [EntityName, entityName]
generates: src/core/entities/{{entityName}}.entity.ts
---

# {{EntityName}} Entity Template

Domain entity belonging to an Aggregate Root.

## Code Blueprint

```typescript
// src/core/entities/{{entityName}}.entity.ts
import { BaseEntity } from '@/core/common/base.entity';

export interface {{EntityName}}Props {
  kolProfileId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class {{EntityName}}Entity extends BaseEntity<{{EntityName}}Props> {
  constructor(props: {{EntityName}}Props, id?: string) {
    super(props, id);
  }

  static create(props: Omit<{{EntityName}}Props, 'createdAt' | 'updatedAt'>, id?: string): {{EntityName}}Entity {
    const now = new Date();
    return new {{EntityName}}Entity({
      ...props,
      createdAt: now,
      updatedAt: now,
    }, id);
  }

  static instantiate(id: string, props: {{EntityName}}Props): {{EntityName}}Entity {
    return new {{EntityName}}Entity(props, id);
  }

  get kolProfileId(): string { return this.props.kolProfileId; }
  get status(): string { return this.props.status; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}
```

## Post-Generation Checklist
- [ ] Extends `BaseEntity<Props>`
- [ ] `constructor(props, id?)` — public (not protected)
- [ ] `create()` and `instantiate(id, props)` factory methods
- [ ] File in `src/core/entities/`