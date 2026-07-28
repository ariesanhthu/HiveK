---
template: mongoose-schema
placeholders: [DomainName, domainName]
generates: src/infrastructure/mongo/schemas/{{domainName}}.schema.ts
---

# {{DomainName}} Mongoose Schema Template

Mongoose database schema with `snake_case` storage properties.

## Code Blueprint

```typescript
// src/infrastructure/mongo/schemas/{{domainName}}.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: '{{domainName}}s', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class {{DomainName}}Model {
  _id: Types.ObjectId;

  // WHY: Store properties in snake_case in database for DB convention, while mapping to camelCase in TS
  @Prop({ required: true, type: Types.ObjectId, name: 'owner_id', index: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true, default: 'draft' })
  status: string;

  @Prop({ default: null, name: 'delete_at' })
  deleteAt: Date | null;

  @Prop({ default: null, name: 'delete_by' })
  deleteBy: string | null;
}

export type {{DomainName}}Document = {{DomainName}}Model & Document;
export const {{DomainName}}Schema = SchemaFactory.createForClass({{DomainName}}Model);
```

## Post-Generation Checklist
- [ ] Collection name uses plural lowercase
- [ ] `snake_case` field names with `name:` option or Mongoose field naming
- [ ] `timestamps` with custom `created_at`/`updated_at`
- [ ] Uses `Types.ObjectId` for relation fields
- [ ] File in `src/infrastructure/mongo/schemas/`
