import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const PackageGetByCodeSchema = z.object({
  code: z.string().min(1),
}).strict();

export class PackageGetByCodeInputDto extends createZodDto(PackageGetByCodeSchema) {}
