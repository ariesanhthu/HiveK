import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { GrantDtoSchema, VariantSchema } from '../../dtos/package.dto';
import { EPackageType, EPackageScope } from '@/core/enums';

// UpdateVariantDto extends VariantSchema but makes fields optional + requires ID
const UpdateVariantSchema = VariantSchema.partial().extend({
  id: z.string().min(1),
});

export const PackageUpdateSchema = z.object({
  id: z.string().min(1),
  updatedBy: z.string().min(1),

  // Metadata
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum([EPackageType.PLAN, EPackageType.ADDON]).optional(),
  scope: z.enum([EPackageScope.PUBLIC, EPackageScope.PRIVATE]).optional(),

  // General Info (Optional - overwrite if present)
  features: z.array(z.string()).optional(),
  baseGrants: z.array(GrantDtoSchema).optional(),

  // Variant Management
  variants: z.array(UpdateVariantSchema).optional(),
  newVariants: z.array(VariantSchema).optional(),
  deletedVariantIds: z.array(z.string().min(1)).optional(),
}).strict();

export type UpdateVariantDto = z.infer<typeof UpdateVariantSchema>;
export class PackageUpdateInputDto extends createZodDto(PackageUpdateSchema) {}
