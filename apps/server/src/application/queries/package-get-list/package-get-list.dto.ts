import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/application/dtos/pagination.dto';

export const PackageFilterSchema = CursorPaginationRequestSchema.extend({
  code: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  scope: z.string().optional(),
  enterpriseId: z.string().optional(),
}).strict();

export class PackageFilterDto extends createZodDto(PackageFilterSchema) {}
export class PackageGetListInputDto extends PackageFilterDto {}
