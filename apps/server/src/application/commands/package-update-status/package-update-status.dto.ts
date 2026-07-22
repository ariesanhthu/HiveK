import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { EVersionStatus } from '@/core/enums';

export const PackageUpdateStatusSchema = z.object({
  status: z.enum([EVersionStatus.ACTIVE, EVersionStatus.ARCHIVED], {
    message: 'Status must be "active" or "archived"',
  }),
}).strict();

export class PackageUpdateStatusInputDto extends createZodDto(PackageUpdateStatusSchema) {}
