import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { EPackageType, EPackageScope } from '@/core/enums';

export const PackageCreateSchema = z
  .object({
    code: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    type: z.enum([EPackageType.PLAN, EPackageType.ADDON]),
    scope: z.enum([EPackageScope.PUBLIC, EPackageScope.PRIVATE]),
    enterpriseId: z.string().optional().nullable(),
  })
  .strict();

export class PackageCreateInputDto extends createZodDto(PackageCreateSchema) {}
