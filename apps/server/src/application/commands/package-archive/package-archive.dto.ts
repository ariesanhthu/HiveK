import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const PackageArchiveSchema = z.object({
  id: z.string().min(1),
  archivedBy: z.string().min(1),
}).strict();

export class PackageArchiveInputDto extends createZodDto(PackageArchiveSchema) {}
