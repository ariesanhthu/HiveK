---
template: mongo-repository
placeholders: [DomainName, domainName, DOMAIN_NAME]
generates: src/infrastructure/mongo/repositories/{{domainName}}.repository.ts
---

# {{DomainName}} Mongo Repository Adapter Template

Repository implementation of `I{{DomainName}}Repository` using UoW session propagation.

## Code Blueprint

```typescript
// src/infrastructure/mongo/repositories/{{domainName}}.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import type { I{{DomainName}}Repository } from '@/core/interfaces/repositories';
import { {{DomainName}}Root } from '@/core/aggregate-roots';
import { {{DomainName}}Model, {{DomainName}}Document } from '../schemas';
import type { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';

@Injectable()
export class Mongo{{DomainName}}Repository implements I{{DomainName}}Repository {
  constructor(
    @InjectModel({{DomainName}}Model.name)
    private readonly {{domainName}}Model: Model<{{DomainName}}Document>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) { }

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<{{DomainName}}Root>> {
    const doc = await this.{{domainName}}Model.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save({{domainName}}: {{DomainName}}Root): Promise<void> {
    const data = this.mapToPersistence({{domainName}});

    if (!{{domainName}}.id) {
      const created = new this.{{domainName}}Model(data);
      const saved = await created.save({ session: this.session });
      {{domainName}}.setId(saved._id.toString());
    } else {
      await this.{{domainName}}Model.findByIdAndUpdate({{domainName}}.id, data, { upsert: true }).session(this.session).exec();
    }
  }

  async delete(id: string): Promise<void> {
    await this.{{domainName}}Model.findByIdAndDelete(id).session(this.session).exec();
  }

  private mapToDomain(doc: {{DomainName}}Document): {{DomainName}}Root {
    return {{DomainName}}Root.instantiate(doc._id.toString(), {
      ownerId: doc.owner_id?.toString(),
      status: doc.status,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    });
  }

  private mapToPersistence({{domainName}}: {{DomainName}}Root) {
    return {
      owner_id: new Types.ObjectId({{domainName}}.ownerId),
      status: {{domainName}}.status,
    };
  }
}
```

## Post-Generation Checklist
- [ ] Implements `I{Name}Repository` from `@/core/interfaces/repositories/`
- [ ] Injects `UNIT_OF_WORK` for session propagation via `(this.uow as MongoUnitOfWork).getSession()`
- [ ] Uses `mapToDomain()` and `mapToPersistence()` bidirectional mapping
- [ ] Uses `instantiate(id, props)` for aggregate reconstitution
- [ ] Uses `@/core/`, `@/application/` path aliases