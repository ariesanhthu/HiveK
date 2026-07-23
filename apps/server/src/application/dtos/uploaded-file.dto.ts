import { TargetType } from '@/core/enums/target-type.enum';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UploadedFileDtoSchema = z.object({
  id: z.string(),
  url: z.url(),
  publicId: z.string(),
  size: z.number().int().positive(),
  format: z.string(),
  title: z.string().nullable(),
  targetType: z.enum(TargetType),
  targetId: z.string(),
  targetField: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
}).strict();

export class UploadedFileDto extends createZodDto(UploadedFileDtoSchema) {}
