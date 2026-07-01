import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const PackageGetByIdSchema = z.object({
  id: z.string().min(1),
}).strict();

export class PackageGetByIdInputDto extends createZodDto(PackageGetByIdSchema) {}
