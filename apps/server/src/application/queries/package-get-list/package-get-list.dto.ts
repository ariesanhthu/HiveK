import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/application/dtos/pagination.dto';
import { EPackageScope, EVersionStatus, EPackageType } from '@/core/enums';

export const PackageFilterSchema = CursorPaginationRequestSchema.extend({
  code: z.string().optional(),
  status: z.enum(EVersionStatus).optional(),
  type: z.enum(EPackageType).optional(),
  scope: z.enum(EPackageScope).optional(),
  enterpriseId: z.string().optional(),
}).strict();

export class PackageFilterDto extends createZodDto(PackageFilterSchema) {}
export class PackageGetListInputDto extends PackageFilterDto {}
