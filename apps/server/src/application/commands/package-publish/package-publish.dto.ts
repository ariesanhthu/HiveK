import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const PackagePublishSchema = z.object({
  id: z.string().min(1),
  publishedBy: z.string().min(1),
}).strict();

export class PackagePublishInputDto extends createZodDto(PackagePublishSchema) {}
