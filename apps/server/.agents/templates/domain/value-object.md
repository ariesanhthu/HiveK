---
template: value-object
placeholders: [ValueObjectName, valueObjectName]
generates: src/core/value-objects/{{valueObjectName}}.vo.ts
---

# {{ValueObjectName}} Value Object Template

Immutable Value Object compared by structural equality.

## Code Blueprint

```typescript
// src/core/value-objects/{{valueObjectName}}.vo.ts
import { BaseValueObject } from '@/core/common/base.value-object';

export class {{ValueObjectName}}Vo extends BaseValueObject<number> {
  private constructor(_value: number) {
    super(_value);
  }

  static create(value: number): {{ValueObjectName}}Vo {
    if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
      throw new Error(`Invalid {{ValueObjectName}}Vo value: ${value}`);
    }
    return new {{ValueObjectName}}Vo(value);
  }

  get value(): number { return this.props; }

  equals(other: {{ValueObjectName}}Vo): boolean {
    return this.props === other.props;
  }

  toString(): string {
    return String(this.props);
  }
}
```

## Post-Generation Checklist
- [ ] Extends `BaseValueObject<Props>`
- [ ] `private constructor` for immutability
- [ ] `static create()` factory with validation
- [ ] Class suffix `Vo` (not `VO`)
- [ ] File in `src/core/value-objects/`

